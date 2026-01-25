'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Globe, Type, MapPin, Loader2, Shield } from 'lucide-react';
import { useState } from 'react';

interface SmartIngestorProps {
    onAddFact: (fact: { type: string; title?: string; subtitle?: string; status: string }) => void;
}

export function SmartIngestor({ onAddFact }: SmartIngestorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('text');

    // Form states
    const [textFact, setTextFact] = useState('');
    const [url, setUrl] = useState('');
    const [geoKeyword, setGeoKeyword] = useState('');

    const handleSubmit = async () => {
        setIsLoading(true);
        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 800));

        // Intelligent Classification Logic
        if (activeTab === 'text') {
            const lowerText = textFact.toLowerCase();
            let type = 'team'; // Default
            let title = 'Team Member';
            let subtitle = textFact;

            // Heuristic Parsing
            if (lowerText.includes('chef') || lowerText.includes('cook') || lowerText.includes('kitchen') || lowerText.includes('manager')) {
                type = 'team';
                title = 'Staff Asset';
            } else if (lowerText.includes('best') || lowerText.includes('near') || lowerText.includes('in ')) {
                type = 'geo';
                title = textFact.split(' ').slice(0, 3).join(' ') + '...';
                subtitle = 'High Priority Keyword';
            } else if (lowerText.includes('policy') || lowerText.includes('music') || lowerText.includes('parking') || lowerText.includes('wifi') || lowerText.includes('hours') || lowerText.includes('open')) {
                type = 'policy';
                title = 'Core Info';
            }

            onAddFact({ type, title, subtitle, status: 'indexed' });
        }
        else if (activeTab === 'geo') {
            onAddFact({ type: 'geo', title: geoKeyword, subtitle: 'High Priority Keyword', status: 'indexed' });
        }
        else if (activeTab === 'policy') {
            onAddFact({ type: 'policy', title: 'New Policy', subtitle: textFact, status: 'indexed' });
        }

        setIsLoading(false);
        setIsOpen(false);
        setTextFact('');
        setGeoKeyword('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                    <Plus className="mr-2 h-4 w-4" /> Add Knowledge
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] backdrop-blur-xl bg-white/95 border-gray-100">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold tracking-tight">Smart Ingestor</DialogTitle>
                    <DialogDescription>
                        Feed the engine. The AI will analyze and index this data instantly.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="text" className="gap-2"><Type className="h-4 w-4" /> Quick Text</TabsTrigger>
                        <TabsTrigger value="url" className="gap-2"><Globe className="h-4 w-4" /> URL Scan</TabsTrigger>
                        <TabsTrigger value="geo" className="gap-2"><MapPin className="h-4 w-4" /> GEO Target</TabsTrigger>
                        <TabsTrigger value="policy" className="gap-2"><Shield className="h-4 w-4" /> Policy/Info</TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">What should the AI know?</label>
                            <Textarea
                                placeholder="e.g. Chef Marco has lead our kitchen since 2012 and specializes in handmade pasta."
                                className="min-h-[100px] bg-white"
                                value={textFact}
                                onChange={(e) => setTextFact(e.target.value)}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Website or Article URL</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="https://"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">We&apos;ll scrape this page and suggest facts to add.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="geo" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Target Keyword or Neighborhood</label>
                            <Input
                                placeholder="e.g. Best Pizza in Brooklyn"
                                value={geoKeyword}
                                onChange={(e) => setGeoKeyword(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">The AI will attempt to weave this naturally into replies.</p>
                        </div>
                    </TabsContent>

                    <TabsContent value="policy" className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Operational Policy or Core Info</label>
                            <Textarea
                                placeholder="e.g. We only play 80s disco music."
                                className="min-h-[100px] bg-white"
                                value={textFact}
                                onChange={(e) => setTextFact(e.target.value)}
                            />
                        </div>
                    </TabsContent>

                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSubmit} disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Indexing...
                                </>
                            ) : (
                                'Add to Brain'
                            )}
                        </Button>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
