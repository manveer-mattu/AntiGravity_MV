'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateSettings } from './actions';
import { useState, useTransition } from 'react';
import { KnowledgeBaseEditor } from '@/components/knowledge-base/knowledge-base-editor';
import { KnowledgeBase } from '@/types';

// Types for the initial data passed from the server
interface SettingsFormProps {
    initialData: {
        businessName: string;
        autoReplyThreshold: number;
        aiTone: string;
        businessContext: string | null;
        knowledgeBase: KnowledgeBase | null;
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
        if (initialData?.knowledgeBase && Object.keys(initialData.knowledgeBase).length > 0) {
            return initialData.knowledgeBase;
        }
        // Migration: If we have legacy text but no new JSON, put it in 'legacy'
        if (initialData?.businessContext) {
            return { general: { legacy: initialData.businessContext }, playbook: [] };
        }
        return { general: {}, playbook: [] };
    });

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Append controlled state values
        formData.set('autoReplyThreshold', threshold.toString());
        formData.set('businessName', businessName);
        formData.set('aiTone', aiTone);
        // Serialize Knowledge Base
        formData.set('knowledgeBase', JSON.stringify(knowledgeBase));

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
            <Card>
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>How your business appears in replies.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
            </Card>

            {/* AI Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>AI Preferences</CardTitle>
                    <CardDescription>Customize how the AI talks to your customers.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
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

                    <div className="space-y-2 pt-2">
                        <div className="flex flex-col gap-1 mb-2">
                            <label className="text-sm font-medium">Business Knowledge Base</label>
                            <p className="text-xs text-muted-foreground">
                                Teach the AI about your business so it can write accurate replies.
                            </p>
                        </div>

                        <KnowledgeBaseEditor
                            initialData={knowledgeBase}
                            onChange={setKnowledgeBase}
                        />
                    </div>

                    <div className="space-y-2 pt-4 flex items-center gap-4 border-t mt-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                        {message && (
                            <span className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </span>
                        )}
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
