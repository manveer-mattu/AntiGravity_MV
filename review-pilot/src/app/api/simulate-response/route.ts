import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { KnowledgeBase } from "@/types";

export async function POST(request: Request) {
    try {
        const { customerQuery } = await request.json();

        if (!customerQuery) {
            return NextResponse.json(
                { error: "Missing customer query" },
                { status: 400 }
            );
        }

        // Fetch knowledge base from Supabase (same pattern as generate-reply)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const adminClient = createClient(supabaseUrl, serviceKey);

        let knowledgeBase: KnowledgeBase | null = null;

        // Find mock user and their business
        const { data: { users } } = await adminClient.auth.admin.listUsers();
        const mockUser = users.find(u => u.email === 'mock@reviewpilot.ai');

        if (mockUser) {
            const { data: business } = await adminClient
                .from('businesses')
                .select('knowledge_base')
                .eq('user_id', mockUser.id)
                .single();

            if (business?.knowledge_base) {
                knowledgeBase = business.knowledge_base as KnowledgeBase;
            }
        }

        // Generate AI response using Gemini
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        // Build knowledge base context
        let kbContext = "";
        const entitiesUsed: string[] = [];

        if (knowledgeBase) {
            const { general, team, geoKeywords } = knowledgeBase;

            if (general?.policies?.length) {
                kbContext += "\n\nPOLICIES:";
                general.policies.forEach(p => kbContext += `\n- ${p}`);
            }

            if (team?.length) {
                kbContext += "\n\nTEAM:";
                team.forEach(m => {
                    if (m.isPublic) {
                        kbContext += `\n- ${m.name} (${m.role}): ${m.context || ''}`;
                    }
                });
            }

            if (geoKeywords?.length) {
                kbContext += "\n\nLOCAL KEYWORDS (use naturally if relevant):";
                geoKeywords.forEach(k => kbContext += `\n- "${k.keyword}" (${k.priority} priority)`);
            }
        }

        const prompt = `
ROLE: You are a helpful customer service AI for a local business.
GOAL: Answer the customer's question using the business knowledge provided.

CUSTOMER QUESTION: "${customerQuery}"

BUSINESS KNOWLEDGE:
${kbContext || "No specific business knowledge provided."}

INSTRUCTIONS:
1. Be friendly and conversational
2. Keep response concise (under 50 words)
3. Use specific team member names, policies, or location keywords when relevant
4. Be helpful and accurate
5. Sign off as "— The Team"

Response:
`;

        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Simple entity detection (check if any team names or keywords appear in response)
        if (knowledgeBase) {
            knowledgeBase.team?.forEach(m => {
                if (response.includes(m.name)) {
                    entitiesUsed.push(`Team: ${m.name}`);
                }
            });

            knowledgeBase.geoKeywords?.forEach(k => {
                // Check if keyword or parts of it appear
                const keywords = k.keyword.toLowerCase().split(' ');
                if (keywords.some(word => response.toLowerCase().includes(word))) {
                    entitiesUsed.push(`GEO: ${k.keyword}`);
                }
            });
        }

        return NextResponse.json({
            response,
            entitiesUsed,
            isFallback: false
        });

    } catch (error) {
        console.error("Error in /api/simulate-response:", error);

        // Fallback response
        return NextResponse.json({
            response: "Thanks for your question! We'd love to help you. Please feel free to visit us or reach out directly. — The Team",
            entitiesUsed: [],
            isFallback: true
        });
    }
}
