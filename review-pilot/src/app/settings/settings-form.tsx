'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateSettings } from './actions';
import { useState, useTransition } from 'react';
import { KnowledgeBaseEditor } from '@/components/knowledge-base/knowledge-base-editor';
import { KnowledgeBase, BrandVoice, SafetySettings } from '@/types';
import { Slider } from '@/components/ui/slider';
import { Building2, Sparkles, Fingerprint } from 'lucide-react';
import { SmartIngestor } from '@/components/knowledge-base/smart-ingestor';

// Types for the initial data passed from the server
interface SettingsFormProps {
    initialData: {
        businessName: string;
        autoReplyThreshold: number;
        aiTone: string;
        businessContext: string | null;
        knowledgeBase: KnowledgeBase | null;
        brandVoice: BrandVoice | null;
        safetySettings: SafetySettings | null;
    } | null;
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [threshold, setThreshold] = useState(initialData?.autoReplyThreshold || 4);
    const [businessName, setBusinessName] = useState(initialData?.businessName || 'Acme Corp');
    const [aiTone, setAiTone] = useState(initialData?.aiTone || 'professional');

    // Initialize Knowledge Base from new column OR migrate legacy string
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase>(() => {
        console.log('🔍 SettingsForm: Initializing knowledge base with:', initialData?.knowledgeBase);
        if (initialData?.knowledgeBase && Object.keys(initialData.knowledgeBase).length > 0) {
            return initialData.knowledgeBase;
        }
        // Migration: If we have legacy text but no new JSON, put it in 'legacy'
        if (initialData?.businessContext) {
            return { general: { legacy: initialData.businessContext, about: initialData.businessContext }, playbook: [] };
        }
        return { general: {}, playbook: [] };
    });

    // Brand Voice state
    const [brandVoice, setBrandVoice] = useState<BrandVoice>(() => {
        return initialData?.brandVoice || { tone_score: 5 };
    });

    // Safety Settings state
    const [safetySettings, setSafetySettings] = useState<SafetySettings>(() => {
        return initialData?.safetySettings || { crisis_keywords: [] };
    });
    const [newCrisisKeyword, setNewCrisisKeyword] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        console.log('🔍 SettingsForm: Submitting with knowledge base:', knowledgeBase);

        // Append controlled state values
        formData.set('autoReplyThreshold', threshold.toString());
        formData.set('businessName', businessName);
        formData.set('aiTone', aiTone);
        // Serialize Knowledge Base
        formData.set('knowledgeBase', JSON.stringify(knowledgeBase));
        formData.set('brandVoice', JSON.stringify(brandVoice));
        formData.set('safetySettings', JSON.stringify(safetySettings));

        console.log('🔍 SettingsForm: FormData knowledgeBase:', formData.get('knowledgeBase'));

        startTransition(async () => {
            const result = await updateSettings(formData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else if (result.success) {
                setMessage({ type: 'success', text: result.success });
                setTimeout(() => setMessage(null), 3000);
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {/* Business Profile */}
            <Card className="shadow overflow-hidden" style={{ borderTop: "4px solid #4f46e5" }}>
                <CardHeader className="pb-6" style={{ background: "linear-gradient(to bottom, #e0e7ff, transparent)" }}>
                    <CardTitle className="flex items-center gap-2 text-indigo-950">
                        <Building2 className="h-5 w-5 text-indigo-700" />
                        Business Profile
                    </CardTitle>
                    <CardDescription>How your business appears in replies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <label htmlFor="businessName" className="text-sm font-medium">Business Name</label>
                        <Input
                            id="businessName"
                            name="businessName"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="businessDescription" className="text-sm font-medium">About the Business</label>
                        <Textarea
                            id="businessDescription"
                            placeholder="e.g. We are an upscale Italian restaurant specializing in authentic Neapolitan pizza."
                            value={knowledgeBase.general?.about || ''}
                            onChange={(e) => setKnowledgeBase(prev => ({
                                ...prev,
                                general: {
                                    ...prev.general,
                                    about: e.target.value
                                }
                            }))}
                            className="min-h-[100px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            This is the "Ground Truth" for the AI. Be specific about what you sell and who you serve.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* AI Preferences */}
            <Card className="shadow overflow-hidden" style={{ borderTop: "4px solid #9333ea" }}>
                <CardHeader className="pb-6" style={{ background: "linear-gradient(to bottom, #f3e8ff, transparent)" }}>
                    <CardTitle className="flex items-center gap-2 text-purple-950">
                        <Sparkles className="h-5 w-5 text-purple-700" />
                        AI Preferences
                    </CardTitle>
                    <CardDescription>Customize how the AI talks to your customers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Auto-Reply Threshold</label>
                        <p className="text-xs text-muted-foreground">Automatically reply to reviews with this rating or higher.</p>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((stars) => (
                                <Button
                                    key={stars}
                                    type="button"
                                    variant={threshold === stars ? "default" : "outline"}
                                    size="sm"
                                    className="w-12"
                                    onClick={() => setThreshold(stars)}
                                >
                                    {stars}+
                                </Button>
                            ))}
                        </div>
                        <input type="hidden" name="autoReplyThreshold" value={threshold} />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="aiTone" className="text-sm font-medium">AI Tone</label>
                        <select
                            id="aiTone"
                            name="aiTone"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={aiTone}
                            onChange={(e) => setAiTone(e.target.value)}
                        >
                            <option value="professional">Professional</option>
                            <option value="friendly">Friendly</option>
                            <option value="grateful">Grateful</option>
                            <option value="empathetic">Empathetic</option>
                            <option value="funny">Funny</option>
                        </select>
                    </div>

                    {/* Brand Voice Slider */}
                    <div className="space-y-3 pt-2">
                        <label className="text-sm font-medium">Brand Voice Intensity (GEO)</label>
                        <div className="flex items-center gap-4">
                            <Slider
                                value={[brandVoice.tone_score]}
                                onValueChange={(value) => setBrandVoice({ ...brandVoice, tone_score: value[0] })}
                                min={1}
                                max={10}
                                step={1}
                                className="flex-1"
                            />
                            <span className="text-2xl font-bold w-12 text-center">{brandVoice.tone_score}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {brandVoice.tone_score <= 3 && "Formal, professional, minimal emojis"}
                            {brandVoice.tone_score > 3 && brandVoice.tone_score <= 7 && "Warm, helpful, community-focused"}
                            {brandVoice.tone_score > 7 && "Witty, bold, casual, expressive"}
                        </p>
                    </div>

                    {/* Safety Keywords */}
                    <div className="space-y-3 pt-2">
                        <label className="text-sm font-medium">Crisis Keywords (Safety Gate)</label>
                        <p className="text-xs text-muted-foreground">Reviews containing these keywords will require manual approval.</p>
                        <div className="flex gap-2">
                            <Input
                                placeholder="e.g., lawsuit, injury, sick"
                                value={newCrisisKeyword}
                                onChange={(e) => setNewCrisisKeyword(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (newCrisisKeyword.trim()) {
                                            setSafetySettings({
                                                crisis_keywords: [...safetySettings.crisis_keywords, newCrisisKeyword.trim()]
                                            });
                                            setNewCrisisKeyword('');
                                        }
                                    }
                                }}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    if (newCrisisKeyword.trim()) {
                                        setSafetySettings({
                                            crisis_keywords: [...safetySettings.crisis_keywords, newCrisisKeyword.trim()]
                                        });
                                        setNewCrisisKeyword('');
                                    }
                                }}
                            >
                                Add
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {safetySettings.crisis_keywords.map((keyword, idx) => (
                                <div key={idx} className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                    {keyword}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSafetySettings({
                                                crisis_keywords: safetySettings.crisis_keywords.filter((_, i) => i !== idx)
                                            });
                                        }}
                                        className="hover:text-red-900"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Brand DNA Section */}
            <Card className="shadow overflow-hidden" style={{ borderTop: "4px solid #2563eb" }}>
                <CardHeader className="pb-6 flex flex-row items-center justify-between" style={{ background: "linear-gradient(to bottom, #dbeafe, transparent)" }}>
                    <div>
                        <CardTitle className="flex items-center gap-2 text-blue-950">
                            <Fingerprint className="h-5 w-5 text-blue-700" />
                            Brand DNA
                        </CardTitle>
                        <CardDescription>Teach the AI about your business so it can write accurate replies.</CardDescription>
                    </div>
                    <SmartIngestor onAddFact={(fact) => {
                        console.log("Added fact:", fact);
                        const data = knowledgeBase;
                        let newData = { ...data };

                        if (fact.type === 'team') {
                            const newTeam = [...(data.team || []), {
                                id: Date.now().toString(),
                                name: fact.title || 'New Member',
                                role: fact.subtitle || 'Staff',
                                context: fact.extractedContext || fact.subtitle,
                                isPublic: true
                            }];
                            newData = { ...data, team: newTeam };
                        }
                        if (fact.type === 'geo') {
                            const newGeo = [...(data.geoKeywords || []), {
                                id: Date.now().toString(),
                                keyword: fact.title || '',
                                priority: 'high' as const,
                                usageExample: fact.extractedContext || ("We're known for " + fact.title)
                            }];
                            newData = { ...data, geoKeywords: newGeo };
                        }
                        if (fact.type === 'policy') {
                            const newGeneral = {
                                ...data.general,
                                policies: [...(data.general?.policies || []), fact.extractedContext || fact.subtitle || '']
                            };
                            newData = { ...data, general: newGeneral };
                        }
                        setKnowledgeBase(newData);
                    }} />
                </CardHeader>
                <CardContent className="pt-6">
                    <KnowledgeBaseEditor
                        initialData={knowledgeBase}
                        onChange={(newKB) => {
                            console.log('🔍 SettingsForm: Knowledge base changed to:', newKB);
                            setKnowledgeBase(newKB);
                        }}
                    />
                </CardContent>
            </Card>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-0 -mx-8 -mb-8 p-4 bg-background/80 backdrop-blur border-t border-gray-200 flex items-center justify-end gap-4">
                {message && (
                    <span className={`text-sm font-medium ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {message.text}
                    </span>
                )}
                <Button type="submit" disabled={isPending} size="lg">
                    {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}
