import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function generateReviewReply(
    reviewerName: string,
    starRating: number,
    reviewContent: string
): Promise<string> {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const tone = starRating >= 4 ? "grateful and professional" : "empathetic, apologetic, and professional";

    const prompt = `
    You are an expert customer service manager for a local business.
    Draft a distinct, brand-safe response to a Google Review.
    
    Reviewer: ${reviewerName}
    Rating: ${starRating}/5 Stars
    Review: "${reviewContent}"
    
    Instructions:
    - Tone: ${tone}
    - Keep it concise (under 50 words).
    - Address the specific points raised in the review.
    - Do not use placeholders like "[Business Name]".
    - Sign off as "The Team".
    
    Response:
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw error; // Re-throw to be handled by the route
    }
}
