'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SimulationPreview() {
    const [isGenerating, setIsGenerating] = useState(false);

    // Mock simulation state
    const [simulation] = useState({
        review: "I heard you serve gluten-free pizza now? Is it any good?",
        reply: "Hi there! Yes, we definitely do. Our GF crust is handmade daily by Chef Marco. We'd love for you to try it!"
    });

    const handleSimulate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            // In a real app, this would call the API with the current KB state
        }, 1200);
    };

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
                        &quot;{simulation.review}&quot;
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
                            {simulation.reply}
                        </div>

                        {/* Highlight "Chef Marco" as an injected entity */}
                        <div className="absolute -right-2 -top-2 bg-white shadow-sm border rounded-full px-2 py-0.5 text-[10px] font-bold text-green-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCircle2 className="h-3 w-3" /> Entity Match
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 p-3 rounded text-xs text-blue-700">
                    <span className="font-bold">Insight:</span> The AI successfully injected &quot;Chef Marco&quot; (Team Entity) to boost authority.
                </div>
            </CardContent>
        </Card>
    );
}
