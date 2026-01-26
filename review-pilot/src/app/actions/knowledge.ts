'use server';

import { extractKnowledgeFromText } from '@/lib/ai-client';

export async function ingestKnowledge(text: string) {
    try {
        const result = await extractKnowledgeFromText(text);
        return { success: true, data: result };
    } catch (error) {
        console.error("Ingestion Error:", error);
        // Fallback to heuristic structure
        return {
            success: false,
            data: {
                type: 'policy',
                title: 'New Info',
                subtitle: text.slice(0, 50),
                extractedContext: text
            }
        };
    }
}
