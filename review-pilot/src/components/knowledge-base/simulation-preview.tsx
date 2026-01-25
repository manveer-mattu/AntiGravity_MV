'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { KnowledgeBase } from '@/types';

// Different customer query types to cycle through
const CUSTOMER_QUERIES = [
    "I heard you serve gluten-free options now? Is it any good?",
    "Do you have wifi for remote work?",
    "Can I bring my dog?",
    "Where are you located? I'm searching for the best spots in the area.",
    "What are your hours during the holidays?",
];

interface SimulationPreviewProps {
    knowledgeBase?: KnowledgeBase;
}

export function SimulationPreview({ knowledgeBase }: SimulationPreviewProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [currentQueryIndex, setCurrentQueryIndex] = useState(0);
    const [response, setResponse] = useState<string | null>(null);
    const [entitiesUsed, setEntitiesUsed] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const currentQuery = CUSTOMER_QUERIES[currentQueryIndex];

    const handleSimulate = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const res = await fetch('/api/simulate-response', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerQuery: currentQuery }),
            });

            if (!res.ok) {
                throw new Error('Failed to generate response');
            }

            const data = await res.json();
            setResponse(data.response);
            setEntitiesUsed(data.entitiesUsed || []);

            // Cycle to next query
            setCurrentQueryIndex((prev) => (prev + 1) % CUSTOMER_QUERIES.length);
        } catch (err) {
            console.error('Simulation error:', err);
            setError('Failed to generate response. Using fallback.');
            setResponse("Thanks for your question! We'd love to help you. Please feel free to visit us or reach out directly. — The Team");
            setEntitiesUsed([]);
        } finally {
            setIsGenerating(false);
        }
    };

    // Generate initial response message
    const displayResponse = response || "Click the refresh button to generate an AI response using your knowledge base!";
    const hasEntities = entitiesUsed.length > 0;

    return (
        <Card className="h-full border-l rounded-none border-t-0 border-b-0 border-r-0 bg-gray-50/50 shadow-none">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Live Simulation</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Active
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Customer Trigger</p>
                    <div className="bg-white p-3 rounded-lg border shadow-sm text-sm text-gray-700">
                        &quot;{currentQuery}&quot;
                    </div>
                </div>

                <div className="flex justify-center">
                    <div className="h-8 w-0.5 bg-gray-200" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">AI Engine Response</p>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={handleSimulate}
                            disabled={isGenerating}
                        >
                            <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100 text-sm text-gray-800 relative group">
                        <div className={`transition-opacity duration-300 ${isGenerating ? 'opacity-50' : 'opacity-100'}`}>
                            {displayResponse}
                        </div>

                        {hasEntities && (
                            <div className="absolute -right-2 -top-2 bg-white shadow-sm border rounded-full px-2 py-0.5 text-[10px] font-bold text-green-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CheckCircle2 className="h-3 w-3" /> Entity Match
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="bg-amber-50 p-3 rounded text-xs text-amber-700 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {hasEntities && (
                    <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                        <span className="font-bold">Insight:</span> The AI successfully used: {entitiesUsed.join(', ')}
                    </div>
                )}

                {!hasEntities && response && !error && (
                    <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
                        <span className="font-bold">Insight:</span> Generic response. Add more knowledge base entities for richer AI responses.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
