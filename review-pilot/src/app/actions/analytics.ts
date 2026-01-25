'use server';

import { createClient } from '@supabase/supabase-js';

export type DailySentimentStat = {
    date: string;
    netSentiment: number;
    total: number;
    fullDate: string; // ISO string for sorting/parsing
};

export async function getReviewStats(days: number = 30): Promise<DailySentimentStat[]> {
    // 1. Setup Admin Client (Dev Mode: still using Admin for quick access to mock data if needed)
    // Note: In production you would use createClient() from @/lib/supabase/server and scope to user.
    // For this dev specific optimization, we will stick to the existing pattern but optimize the query.
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 2. Mock User & Business Lookup (Consistent with getReviews)
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const mockUser = users.find(u => u.email === 'mock@reviewpilot.ai');

    if (!mockUser) {
        console.error("Mock user not found for analytics");
        return generateEmptyStats(days);
    }

    const { data: business } = await supabase
        .from('businesses')
        .select('id')
        .eq('user_id', mockUser.id)
        .single();

    if (!business) {
        return generateEmptyStats(days);
    }

    // 3. Calculate Date Range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 4. Fetch Reviews efficiently (Use DB to filter by date)
    // Supabase JS doesn't support complex aggregation easily without RPC.
    // So we will fetch ONLY the columns we need (posted_at, star_rating/sentiment) 
    // instead of the full review body (content, reply, etc)
    const { data: reviews, error } = await supabase
        .from('reviews')
        .select('posted_at, star_rating')
        .eq('business_id', business.id)
        .gte('posted_at', startDate.toISOString())
        .order('posted_at', { ascending: true });

    if (error) {
        console.error("Error fetching analytics:", error);
        return generateEmptyStats(days);
    }

    // 5. Aggregate in Node.js (Much faster than client side, and less data over wire)
    // Initialize map with empty days
    const statsMap = new Map<string, DailySentimentStat>();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        statsMap.set(dateStr, {
            date: dateStr,
            netSentiment: 0,
            total: 0,
            fullDate: date.toISOString()
        });
    }

    reviews?.forEach((r: any) => {
        const date = new Date(r.posted_at);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        if (statsMap.has(dateStr)) {
            const stat = statsMap.get(dateStr)!;
            stat.total++;

            // Infer sentiment from star rating if 'sentiment' column doesn't exist or isn't populated
            // (Assuming 4-5 is positive, 1-2 negative, 3 neutral)
            if (r.star_rating >= 4) stat.netSentiment += 1;
            else if (r.star_rating <= 2) stat.netSentiment -= 1;
        }
    });

    return Array.from(statsMap.values());
}

function generateEmptyStats(days: number): DailySentimentStat[] {
    const stats: DailySentimentStat[] = [];
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        stats.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            netSentiment: 0,
            total: 0,
            fullDate: date.toISOString()
        });
    }
    return stats;
}
