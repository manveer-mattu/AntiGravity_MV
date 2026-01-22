import { generateReviewReply } from "@/lib/ai-client";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const { reviewerName, starRating, content } = await request.json();

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
        let preferredTone: string | undefined = undefined;

        // Quick fetch - query businesses directly for the mock user if we can find them, 
        // or just getAll for MVP since there's likely only 1 or few.
        // Better: List users to find mock ID, then fetch business.
        const { data: { users } } = await adminClient.auth.admin.listUsers();
        const mockUser = users.find(u => u.email === 'mock@reviewpilot.ai');

        if (mockUser) {
            const { data: business } = await adminClient
                .from('businesses')
                .select('business_context, ai_tone, knowledge_base')
                .eq('user_id', mockUser.id)
                .single();

            if (business) {
                if (business.business_context) businessContext = business.business_context;
                if (business.ai_tone) preferredTone = business.ai_tone;
                // Add validation to ensure it matches the type if needed, but JSONB usually comes as any
                var knowledgeBase = business.knowledge_base;
            }
        }

        const { reply, isFallback } = await generateReviewReply(
            reviewerName,
            starRating,
            content,
            businessContext,
            preferredTone,
            knowledgeBase
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
