import { generateReviewReply } from "@/lib/ai-response";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { reviewerName, starRating, content } = await request.json();

        if (!content || !starRating) {
            return NextResponse.json(
                { error: "Missing review content or rating" },
                { status: 400 }
            );
        }

        const reply = await generateReviewReply(reviewerName, starRating, content);

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Error in /api/generate-reply:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
