import { GoogleGenerativeAI } from "@google/generative-ai";
import { KnowledgeBase } from "@/types";

export async function generateReviewReply(
    reviewerName: string,
    starRating: number,
    reviewContent: string,
    businessContext?: string, // Keep for backward compatibility or simple string injection
    preferredTone?: string,
    knowledgeBase?: KnowledgeBase
): Promise<{ reply: string, isFallback: boolean }> {
    // Retry logic
    let attempts = 0;
    const maxAttempts = 3;

    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        // Validation moved inside try to ensure safe fallback if even this fails (though unlikely)
        if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");

        // Testing Fallback UI: Uncomment to test
        // throw new Error("Simulated Error for Verification"); 

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const tone = preferredTone
            ? preferredTone
            : (starRating >= 4 ? "grateful and professional" : "empathetic, apologetic, and professional");

        // Construct Knowledge Base String
        let kbString = "";

        // 1. Legacy/Simple Context
        if (businessContext) {
            kbString += `\nGeneral Context: "${businessContext}"\n`;
        }

        // 2. Structured Knowledge Base
        if (knowledgeBase) {
            const { general, playbook } = knowledgeBase;

            // General Info
            if (general) {
                if (general.about) kbString += `\nAbout the Business:\n"${general.about}"`;
                if (general.hours?.length) kbString += `\nHours & Availability:\n- ${general.hours.join('\n- ')}`;
                if (general.services?.length) kbString += `\nServices & Amenities:\n- ${general.services.join('\n- ')}`;
                if (general.policies?.length) kbString += `\nPolicies:\n- ${general.policies.join('\n- ')}`;
                if (general.promotions?.length) kbString += `\nactive Promotions:\n- ${general.promotions.join('\n- ')}`;
                if (general.legacy) kbString += `\nAdditional Notes:\n${general.legacy}`;
            }

            // Playbook (High Priority Instructions)
            if (playbook?.length) {
                kbString += `\n\nRESPONSE PLAYBOOK (High Priority - Follow these rules if applicable):`;
                playbook.forEach(rule => {
                    if (rule.trigger && rule.response) {
                        kbString += `\n- IF review mentions "${rule.trigger}", THEN include: "${rule.response}"`;
                    }
                });
            }
        }

        // Add Mandatory Instruction
        let mandatoryInstruction = "";
        if (knowledgeBase?.general?.alwaysMention) {
            mandatoryInstruction = `- ALWAYS include the following: "${knowledgeBase.general.alwaysMention}"`;
        }

        const prompt = `
    You are an expert customer service manager for a local business.
    Draft a distinct, brand-safe response to a Google Review.
    
    Reviewer: ${reviewerName}
    Rating: ${starRating}/5 Stars
    Review: "${reviewContent}"
    
    BUSINESS KNOWLEDGE BASE:
    ${kbString ? kbString : "No specific business details provided."}
    
    Instructions:
    - Tone: ${tone}
    - Keep it concise (under 50 words).
    - Address the specific points raised in the review.
    - Do not use placeholders like "[Business Name]".
    - Sign off as "The Team".
    ${mandatoryInstruction}
    - USE the "Response Playbook" instructions above if the review triggers them.
    
    Response:
  `;

        while (attempts < maxAttempts) {
            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                return { reply: response.text(), isFallback: false };
            } catch (error) {
                attempts++;
                console.warn(`Gemini API Attempt ${attempts} failed:`, error);
                if (attempts >= maxAttempts) throw error; // trigger outer catch
                // Wait before retry (1s, 2s)
                await new Promise(resolve => setTimeout(resolve, attempts * 1000));
            }
        }
    } catch (e) {
        console.error("AI Client Top-Level Error:", e);
    }

    // Fallback Mock Response to prevent UX failure
    const mockResponses = [
        `Hi ${reviewerName}, thank you for your feedback! We appreciate you taking the time to review us. - The Team`,
        `Dear ${reviewerName}, thanks for the review. We're consistently working to improve our service. - The Team`,
        `Hi ${reviewerName}, we're glad to hear from you! Thanks for visiting. - The Team`
    ];
    // Deterministic mock based on name length to be somewhat consistent
    const index = reviewerName.length % mockResponses.length;
    return { reply: mockResponses[index], isFallback: true };
}
