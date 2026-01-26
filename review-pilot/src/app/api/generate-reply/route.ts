import { generateReviewReply } from "@/lib/ai-client";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const { reviewerName, starRating, content, brandVoiceOverride } = await request.json();

        if (!content || !starRating) {
            return NextResponse.json(
                { error: "Missing review content or rating" },
                { status: 400 }
            );
        }

        // Fetch settings (Mock User Flow for MVP)
        // Ideally this comes from auth, but for the "Generate" button on dashboard we use the single mock user
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const adminClient = createClient(supabaseUrl, serviceKey);

        // Find mock user business
        // We can optimize this by caching or just querying business directly if we knew ID, 
        // but finding by user email is consistent with our other logic
        let businessContext = "";
        let knowledgeBase: any = null;
        let brandVoice: any = null;
        let safetySettings: any = { crisis_keywords: [] };

        // Quick fetch - query businesses directly for the mock user if we can find them, 
        // or just getAll for MVP since there's likely only 1 or few.
        // Better: List users to find mock ID, then fetch business.
        const { data: { users } } = await adminClient.auth.admin.listUsers();
        const mockUser = users.find(u => u.email === 'mock@reviewpilot.ai');

        if (mockUser) {
            const { data: business } = await adminClient
                .from('businesses')
                .select('business_context, knowledge_base, brand_voice, safety_settings')
                .eq('user_id', mockUser.id)
                .single();

            console.log('🔍 DEBUG: Fetched business data:', JSON.stringify(business, null, 2));

            if (business) {
                if (business.business_context) businessContext = business.business_context;
                knowledgeBase = business.knowledge_base;
                // Use override if provided, otherwise fall back to DB
                brandVoice = brandVoiceOverride || business.brand_voice;
                safetySettings = business.safety_settings || { crisis_keywords: [] };

                console.log('🔍 DEBUG: Knowledge Base passed to AI:', JSON.stringify(knowledgeBase, null, 2));
            }
        }

        // SAFETY GATE: Crisis Keyword Detection (GEO Philosophy)
        if (safetySettings.crisis_keywords && safetySettings.crisis_keywords.length > 0) {
            const contentLower = content.toLowerCase();
            const hasCrisisKeyword = safetySettings.crisis_keywords.some((keyword: string) =>
                contentLower.includes(keyword.toLowerCase())
            );

            if (hasCrisisKeyword) {
                return NextResponse.json({
                    error: "CRISIS_DETECTED",
                    message: "This review contains sensitive keywords and requires manual review.",
                    requiresHumanReview: true
                }, { status: 403 });
            }
        }

        const { reply, isFallback } = await generateReviewReply(
            reviewerName,
            starRating,
            content,
            businessContext,
            knowledgeBase,
            brandVoice
        );

        return NextResponse.json({ reply, isFallback });
    } catch (error) {
        console.error("Error in /api/generate-reply:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
