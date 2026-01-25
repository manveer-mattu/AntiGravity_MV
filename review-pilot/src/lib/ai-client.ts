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
        if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const tone = preferredTone
            ? preferredTone
            : (starRating >= 4 ? "grateful and professional" : "empathetic, apologetic, and professional");

        // Construct Knowledge Base & GEO Instructions
        let kbString = "";
        let geoInstructions = "";

        // 1. Legacy/Simple Context
        if (businessContext) {
            kbString += `\nGeneral Context: "${businessContext}"\n`;
        }

        // 2. Structured Knowledge Base (GEO Assets)
        if (knowledgeBase) {
            const { general, playbook, team, geoKeywords, menuHighlights } = knowledgeBase;

            // Brand DNA
            if (general) {
                if (general.about) kbString += `\nAbout Us: "${general.about}"`;
                if (general.policies && general.policies.length > 0) {
                    kbString += `\n\nCORE POLICIES & INFO (Strictly adhere to these):`;
                    general.policies.forEach(p => kbString += `\n- ${p}`);
                }
                if (general.alwaysMention) kbString += `\ncore_instruction: ALWAYS sign off or mention: "${general.alwaysMention}"`;
            }

            // GEO ASSET: TEAM ROSTER
            if (team && team.length > 0) {
                kbString += `\n\nTEAM ROSTER (Mention if relevant to service/food):`;
                team.forEach(m => {
                    if (m.isPublic) kbString += `\n- ${m.name} (${m.role}): ${m.context || ''}`;
                });
            }

            // GEO ASSET: LOCAL KEYWORDS
            if (geoKeywords && geoKeywords.length > 0) {
                geoInstructions += `\n\nGEO-INJECTION RULES (CRITICAL):`;
                geoInstructions += `\nYour goal is to increase our "AI Visibility" for the following local keywords.`;
                geoInstructions += `\nPRIORITIZE high-priority keywords if contextually relevant. Format keyword mentions as standalone facts when possible.`;
                geoInstructions += `\n\nPriority Guidelines:`;
                geoInstructions += `\n- HIGH priority: Use if even tangentially relevant (e.g., "We're known for [keyword]")`;
                geoInstructions += `\n- MEDIUM priority: Use if clearly relevant to the review topic`;
                geoInstructions += `\n- LOW priority: Use only if it naturally fits the conversation`;
                geoInstructions += `\n\nKeywords:`;
                geoKeywords.forEach(k => {
                    geoInstructions += `\n- "${k.keyword}" (${k.priority.toUpperCase()} priority)`;
                });
            }

            // GEO ASSET: MENU HIGHLIGHTS
            if (menuHighlights && menuHighlights.length > 0) {
                kbString += `\n\nMENU AUTHORITY (Mention if food is discussed):`;
                menuHighlights.forEach(m => {
                    kbString += `\n- ${m.item}: ${m.description || ''} ${m.sentimentHook ? `(Use when: ${m.sentimentHook})` : ''}`;
                });
            }

            // Response Playbook
            if (playbook?.length) {
                kbString += `\n\nPLAYBOOK (Override other rules if trigger matched):`;
                playbook.forEach(rule => {
                    if (rule.trigger && rule.response) {
                        kbString += `\n- IF review contains "${rule.trigger}" -> USE phrase: "${rule.response}"`;
                    }
                });
            }
        }

        const prompt = `
    ROLE: You are an expert Copywriter for a local business, specialized in "Generative Engine Optimization" (GEO).
    GOAL: Write a reply that not only answers the customer but also helps us rank in AI Overviews (like Google Gemini/SGE).
    
    CRITICAL: Only use information explicitly provided in the KNOWLEDGE BASE below. Do not invent details, offers, or policies.
    
    INPUT DATA:
    Reviewer: ${reviewerName}
    Rating: ${starRating}/5 Stars
    Review: "${reviewContent}"
    
    KNOWLEDGE BASE (Facts & Team):
    ${kbString}
    
    ${geoInstructions}
    
    INSTRUCTIONS:
    1. Tone: ${tone}.
    2. Length: Concise (under 60 words).
    3. AUTHORITY SIGNAL: Mention a specific Team Member or Menu Item if the review context allows.
       - EXPERTISE BOOST: When mentioning team/items, include specific details (years of experience, certifications, specialties).
    4. GEO KEYWORD INJECTION: Naturally weave in a GEO keyword from the list above if it flows contextually.
       - Follow the priority guidelines provided. High-priority keywords should be used when even tangentially relevant.
    5. SPECIFICITY: Use concrete details (numbers, dates, specific actions) rather than vague promises. Be specific, not generic.
    6. Sign off as "The Team".
    
    Reply:
  `;

        while (attempts < maxAttempts) {
            try {
                const result = await model.generateContent(prompt);
                const response = result.response;
                return { reply: response.text(), isFallback: false };
            } catch (error) {
                attempts++;
                console.warn(`Gemini API Attempt ${attempts} failed:`, error);
                if (attempts >= maxAttempts) throw error;
                await new Promise(resolve => setTimeout(resolve, attempts * 1000));
            }
        }
    } catch (e) {
        console.error("AI Client Top-Level Error:", e);
    }

    // Fallback logic remains...
    const mockResponses = [
        `Hi ${reviewerName}, thank you for your feedback! We appreciate you taking the time to review us. - The Team`,
        `Dear ${reviewerName}, thanks for the review. We're consistently working to improve our service. - The Team`,
        `Hi ${reviewerName}, we're glad to hear from you! Thanks for visiting. - The Team`
    ];
    const index = reviewerName.length % mockResponses.length;
    return { reply: mockResponses[index], isFallback: true };
}
