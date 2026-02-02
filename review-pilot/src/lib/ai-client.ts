import { GoogleGenerativeAI } from "@google/generative-ai";
import { KnowledgeBase, BrandVoice } from "@/types";

export async function generateReviewReply(
    reviewerName: string,
    starRating: number,
    reviewContent: string,
    businessContext?: string,
    knowledgeBase?: KnowledgeBase,
    brandVoice?: BrandVoice
): Promise<{ reply: string, isFallback: boolean }> {
    // Retry logic
    let attempts = 0;
    const maxAttempts = 3;

    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        // Tone configuration from Brand Voice (GEO Philosophy)
        let dnaInstructions = "";
        let toneDescription = "";

        if (brandVoice && brandVoice.pillars) {
            const { pillars, voiceSettings, bannedVocabulary } = brandVoice;

            // 1. Map Pillars to Instructions
            // 1. Map Pillars to Instructions (EXTREME WEIGHTS)
            const formalityInstr =
                pillars.formality <= 3 ? "CRITICAL: Use casual text-speak/slang (lol, thx, u). Write like a close friend. Lowercase allowed." :
                    pillars.formality >= 8 ? "CRITICAL: Use highly formal, academic, or old-fashioned English. No contractions. 'It is', 'We are'." :
                        "Use neutral, clear, standard business English.";

            const personalityInstr =
                pillars.personality <= 3 ? "CRITICAL: Be robotic, dry, and fact-focused. No emotion." :
                    pillars.personality >= 8 ? "CRITICAL: Be extremely witty, crack a joke, or be playful/sassy." :
                        "Warm, welcoming, uses the customer's name once.";

            // Build enthusiasm instruction based on emoji policy
            let enthusiasmInstr;
            if (pillars.enthusiasm <= 3) {
                enthusiasmInstr = "CRITICAL: Zero exclamation marks. Use periods only. Be calm/deadpan.";
            } else if (pillars.enthusiasm >= 8) {
                // Check if emojis should be included based on policy
                const shouldIncludeEmojis = !voiceSettings || voiceSettings.emojiPolicy !== 'none';
                enthusiasmInstr = shouldIncludeEmojis
                    ? "CRITICAL: Use multiple exclamation marks!!! Use emojis (🎉, 🔥, 🍕) in EVERY sentence. High energy!"
                    : "CRITICAL: Use multiple exclamation marks!!! High energy words ('Thrilled!', 'Amazing!', 'Love it!').";
            } else {
                enthusiasmInstr = "1-2 exclamation marks. Use words like 'Happy' or 'Great'.";
            }

            const authorityInstr =
                pillars.authority <= 3 ? "CRITICAL: Be extremely humble/servile. Apologize or thank profusely. You are 'at their service'." :
                    pillars.authority >= 8 ? "CRITICAL: Speak with absolute authority. Educate the customer. You know best." :
                        "Confidence tone. Assure the customer of quality.";

            toneDescription = `Formality: ${pillars.formality}/10, Personality: ${pillars.personality}/10, Enthusiasm: ${pillars.enthusiasm}/10`;

            // 2. Build DNA Block
            dnaInstructions += `\n    BRAND DNA DIRECTIVES (STRICT):`;
            dnaInstructions += `\n    - FORMALITY: ${formalityInstr}`;
            dnaInstructions += `\n    - PERSONALITY: ${personalityInstr}`;
            dnaInstructions += `\n    - ENTHUSIASM: ${enthusiasmInstr}`;
            dnaInstructions += `\n    - AUTHORITY: ${authorityInstr}`;

            // 3. Voice Settings
            if (voiceSettings) {
                if (voiceSettings.perspective) {
                    if (voiceSettings.perspective === 'first') dnaInstructions += `\n    - PERSPECTIVE: CRITICAL: You are ONE person. Use "I", "Me", "My". Do NOT use "We".`;
                    if (voiceSettings.perspective === 'collective') dnaInstructions += `\n    - PERSPECTIVE: CRITICAL: You are a TEAM. Use "We", "Us", "Our".`;
                    if (voiceSettings.perspective === 'third') dnaInstructions += `\n    - PERSPECTIVE: CRITICAL: Use third-person or brand name (e.g. "The Management").`;
                }
                if (voiceSettings.emojiPolicy === 'none') dnaInstructions += `\n    - EMOJI POLICY: CRITICAL OVERRIDE: Do NOT use emojis, even if Enthusiasm is high.`;
                if (voiceSettings.emojiPolicy === 'expressive') dnaInstructions += `\n    - EMOJI POLICY: CRITICAL: Use 2-3 emojis sprinkled WITHIN sentences throughout the text, not just at the end. Use specific food/context emojis (🍕, 🍷).`;
                if (voiceSettings.signOffStyle === 'personal') dnaInstructions += `\n    - SIGN-OFF: Use a personal warm closing.`;
            }

            // 4. Banned Vocabulary
            if (bannedVocabulary && bannedVocabulary.length > 0) {
                dnaInstructions += `\n    - NEGATIVE CONSTRAINTS (NEVER USE): ${bannedVocabulary.map((w: string) => `"${w}"`).join(', ')}.`;
            }
        } else {
            // Fallback if no brand voice configured
            toneDescription = starRating >= 4 ? "grateful and professional" : "empathetic, apologetic, and professional";
        }

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
                    if (m.isPublic) {
                        let teamDesc = `\n- ${m.name} (${m.role})`;

                        // Build E-E-A-T details from structured fields
                        const eeDetails: string[] = [];
                        if (m.yearsOfExperience) {
                            eeDetails.push(`${m.yearsOfExperience} years of experience`);
                        }
                        if (m.certifications && m.certifications.length > 0) {
                            eeDetails.push(`certified in: ${m.certifications.join(', ')}`);
                        }
                        if (m.specialties && m.specialties.length > 0) {
                            eeDetails.push(`specializes in: ${m.specialties.join(', ')}`);
                        }

                        // Add structured E-E-A-T details
                        if (eeDetails.length > 0) {
                            teamDesc += ` — ${eeDetails.join('; ')}`;
                        }

                        // Fallback to freeform context if no structured data
                        if (eeDetails.length === 0 && m.context) {
                            teamDesc += `: ${m.context}`;
                        }

                        kbString += teamDesc;
                    }
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
                    let keywordLine = `\n- "${k.keyword}" (${k.priority.toUpperCase()} priority)`;
                    // Add usage example if provided
                    if (k.usageExample) {
                        keywordLine += ` — Example: ${k.usageExample}`;
                    }
                    geoInstructions += keywordLine;
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
    ROLE: You are an expert Copywriter for a local business.
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
    1. Tone: ${toneDescription}
    ${dnaInstructions}
    2. Length: Concise (under 60 words).
    3. AUTHORITY SIGNAL: You have access to the full team roster. ONLY mention a specific person if the review content directly aligns with their role (e.g. mention Chef only if food is specifically praised).
       - Do NOT force a name drop in generic reviews (e.g. "Great place").
       - EXPERTISE BOOST: When mentioning team/items, include specific details (years of experience, certifications, specialties).
    4. GEO KEYWORD INJECTION: Naturally weave in a GEO keyword from the list above if it flows contextually.
       - Follow the priority guidelines provided. High-priority keywords should be used when even tangentially relevant.
    5. SPECIFICITY: Use concrete details (numbers, dates, specific actions) rather than vague promises. Be specific, not generic.
    6. Sign off as "The Team".
    7. CRITICAL: Do NOT mention "Generative Engine Optimization", "GEO", "AI Overviews", or "Google Gemini/SGE" in the reply. These are internal goals only.
    
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


export async function extractKnowledgeFromText(text: string): Promise<{
    type: 'team' | 'geo' | 'policy';
    title: string;
    subtitle: string;
    extractedContext: string;
}> {
    try {
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) throw new Error("API key missing");

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


        const prompt = `
    ROLE: Structured Data Extractor
    GOAL: Parse the user's input text into a structured JSON object for a business Knowledge Base.
    
    INPUT TEXT: "${text}"
    
    INSTRUCTIONS:
    1. CLASSIFY 'type':
       - "team": If input is about a person (Chef, Manager, Server), their role, or experience.
       - "geo": If input is about location, neighborhood, landmarks, or "best [x] in [y]".
       - "policy": If input is about rules, hours, services, parking, music, or amenities.
    
    2. EXTRACT fields based on type:
       
       FOR "team": 
       - title: The person's Name ONLY (e.g. "Antonio", "Marco"). Do NOT include title/honorific here.
       - subtitle: The inferred Role (e.g. "Chef", "Head Chef", "Manager"). Infer from context or honorific.
       - extractedContext: The specific details (e.g. "has 10 years experience", "specializes in pasta").
    
       FOR "geo":
       - title: Short Keyword (e.g. "Best Pizza in Brooklyn")
       - subtitle: Priority (High/Med/Low)
       - extractedContext: full text
    
       FOR "policy":
       - title: Topic (e.g. "Pet Policy")
       - subtitle: Summary
       - extractedContext: full text
    
    3. JSON OUTPUT ONLY. No markdown.
    {
      "type": "team" | "geo" | "policy",
      "title": "string",
      "subtitle": "string",
      "extractedContext": "string"
    }
    `;

        const result = await model.generateContent(prompt);
        const textResponse = result.response.text();

        console.log("Only-AI Raw Response:", textResponse); // Debug logging

        const cleanJson = textResponse.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
        return JSON.parse(cleanJson);

    } catch (error) {
        console.warn("AI Extraction Failed, using fallback heuristics:", error);

        // Smarter Fallback Logic (Heuristics)
        const lowerText = text.toLowerCase();

        // Team Heuristics
        if (lowerText.includes('chef') || lowerText.includes('manager') || lowerText.includes('owner') || lowerText.includes('server') || lowerText.includes('staff') || lowerText.includes('cook')) {

            // Try to extract Name and Role from "Chef [Name]" pattern
            const words = text.split(' ');
            let name = "New Member";
            let role = "Staff Member";

            if (lowerText.includes('chef')) {
                role = "Chef";
                // If text starts with "Chef Name", extract Name
                const chefIndex = words.findIndex(w => w.toLowerCase() === 'chef');
                if (chefIndex !== -1 && words[chefIndex + 1]) {
                    name = words[chefIndex + 1].replace(/[^a-zA-Z]/g, ''); // Simple cleanup
                }
            } else if (lowerText.includes('manager')) {
                role = "Manager";
            }

            return {
                type: 'team',
                title: name,
                subtitle: role,
                extractedContext: text // Keep full text as context
            };
        }

        // ... rest of fallbacks
        // GEO Heuristics
        if (lowerText.includes('best') || lowerText.includes('near') || lowerText.includes('located') || lowerText.includes(' in ')) {
            return {
                type: 'geo',
                title: text.slice(0, 30) + '...',
                subtitle: 'High Priority',
                extractedContext: "We are known for: " + text
            };
        }

        // Default to Policy
        return {
            type: 'policy',
            title: 'New Info',
            subtitle: text.slice(0, 50),
            extractedContext: text
        };
    }
}
