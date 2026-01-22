import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
    try {
        const { reviewId, replyContent, status } = await request.json();

        if (!reviewId || !replyContent) {
            return NextResponse.json(
                { error: "Missing reviewId or replyContent" },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const adminClient = createClient(supabaseUrl, serviceKey);

        const { data, error } = await adminClient
            .from('reviews')
            .update({
                reply_content: replyContent,
                status: status || 'draft'
            })
            .eq('id', reviewId)
            .select()
            .single();

        if (error) {
            console.error("Supabase Update Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, review: data });
    } catch (error) {
        console.error("Error in /api/save-reply:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: String(error) },
            { status: 500 }
        );
    }
}
