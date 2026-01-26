import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BrandVoice } from '@/types';
import { Loader2, Play, MessageSquareQuote, User, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

// Hardcoded Quality Control Scenarios
const SCENARIOS = {
    positive: {
        reviewer: "Sarah M.",
        rating: 5,
        content: "Absolutely loved the atmosphere! The pizza was fresh and the service was super friendly. Will definitely be coming back with friends."
    },
    negative: {
        reviewer: "Mike T.",
        rating: 1,
        content: "Waited 45 minutes for a table even though we had a reservation. Food was cold when it finally arrived. Not acceptable."
    },
    mixed: {
        reviewer: "Alex K.",
        rating: 3,
        content: "The food is great as always, but the music was way too loud. Hard to have a conversation. Please turn it down next time!"
    }
};

interface BrandDNAPreviewProps {
    brandVoice: BrandVoice;
}

export function BrandDNAPreview({ brandVoice }: BrandDNAPreviewProps) {
    const [scenario, setScenario] = useState<keyof typeof SCENARIOS>('positive');
    const [generatedReply, setGeneratedReply] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setGeneratedReply(null);

        try {
            const currentScenario = SCENARIOS[scenario];

            const response = await fetch('/api/generate-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewerName: currentScenario.reviewer,
                    starRating: currentScenario.rating,
                    content: currentScenario.content,
                    brandVoiceOverride: brandVoice // Pass current slider state
                })
            });

            if (!response.ok) throw new Error('Failed to generate preview');

            const data = await response.json();
            setGeneratedReply(data.reply);
        } catch (error) {
            console.error(error);
            setGeneratedReply("Error: Could not generate preview. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="border-indigo-100 bg-slate-50/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                    <Play className="h-5 w-5 text-indigo-600 fill-indigo-600" />
                    Live Simulator
                </CardTitle>
                <CardDescription>
                    Test your voice settings in real-time against standard scenarios.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">

                {/* Scenario Selector */}
                <div className="flex items-center gap-4">
                    <Select
                        value={scenario}
                        onValueChange={(v) => setScenario(v as keyof typeof SCENARIOS)}
                    >
                        <SelectTrigger className="w-[200px] bg-white">
                            <SelectValue placeholder="Select Scenario" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="positive">Positivity Test (5★)</SelectItem>
                            <SelectItem value="mixed">Nuance Test (3★)</SelectItem>
                            <SelectItem value="negative">Empathy Test (1★)</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Writing...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="mr-2 h-4 w-4" />
                                Test Voice
                            </>
                        )}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* The Review (Input) */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="h-4 w-4 text-slate-500" />
                                </div>
                                <span className="font-semibold text-sm">{SCENARIOS[scenario].reviewer}</span>
                            </div>
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className={cn(
                                            "h-3 w-3",
                                            i < SCENARIOS[scenario].rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"
                                        )}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 italic">"{SCENARIOS[scenario].content}"</p>
                    </div>

                    {/* The Reply (Output) */}
                    <div className={cn(
                        "p-4 rounded-lg border shadow-sm transition-all duration-300",
                        generatedReply ? "bg-indigo-50 border-indigo-200" : "bg-slate-100 border-dashed border-slate-300 flex items-center justify-center"
                    )}>
                        {generatedReply ? (
                            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex items-center gap-2 text-indigo-700 font-medium text-xs uppercase tracking-wider">
                                    <MessageSquareQuote className="h-3 w-3" />
                                    AI Response
                                </div>
                                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                                    {generatedReply}
                                </p>
                            </div>
                        ) : (
                            <span className="text-slate-400 text-sm italic">
                                Click "Test Voice" to generate a preview...
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
            <path d="M20 3v4" />
            <path d="M22 5h-4" />
            <path d="M4 17v2" />
            <path d="M5 18H3" />
        </svg>
    )
}
