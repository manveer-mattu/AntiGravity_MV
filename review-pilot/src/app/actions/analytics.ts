'use server';

import { createClient } from '@supabase/supabase-js';
import { fetchMockReviews } from '@/lib/google-business-mock';

export type DailySentimentStat = {
    date: string;
    netSentiment: number;
    total: number;
    fullDate: string; // ISO string for sorting/parsing
};

export async function getReviewStats(days: number = 30): Promise<DailySentimentStat[]> {
    const useMock = true; // Force mock usage to match review list

    if (useMock) {
        const reviews = await fetchMockReviews();

        // Filter by date range
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const cutoff = startDate.getTime();

        const filteredReviews = reviews.filter(r => new Date(r.postedAt).getTime() >= cutoff);

        // Aggregate
        const statsMap = new Map<string, DailySentimentStat>();

        // Initialize empty days
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

        filteredReviews.forEach(r => {
            const date = new Date(r.postedAt);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

            if (statsMap.has(dateStr)) {
                const stat = statsMap.get(dateStr)!;
                stat.total++;

                // Calculate sentiment
                if (r.sentiment === 'positive') stat.netSentiment += 1;
                else if (r.sentiment === 'negative') stat.netSentiment -= 1;
                else {
                    // Fallback to star rating if sentiment is missing
                    if (r.starRating >= 4) stat.netSentiment += 1;
                    else if (r.starRating <= 2) stat.netSentiment -= 1;
                }
            }
        });

        return Array.from(statsMap.values());
    }

    // --- Legacy/Production Supabase Logic below ---

    // 1. Setup Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // 2. Mock User & Business Lookup
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const mockUser = users.find(u => u.email === 'mock@reviewpilot.ai');

    if (!mockUser) {
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

    // 4. Fetch Reviews efficiently
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

    // 5. Aggregate
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
