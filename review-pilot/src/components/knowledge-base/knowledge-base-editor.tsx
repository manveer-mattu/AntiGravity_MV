'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Plus, Trash2, Info } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { KnowledgeBase } from '@/types';

interface KnowledgeBaseEditorProps {
    initialData: KnowledgeBase;
    onChange: (data: KnowledgeBase) => void;
}

export function KnowledgeBaseEditor({ initialData, onChange }: KnowledgeBaseEditorProps) {
    const [data, setData] = useState<KnowledgeBase>(initialData || { general: {}, playbook: [] });

    const handleUpdate = (newData: KnowledgeBase) => {
        setData(newData);
        onChange(newData);
    };

    // Helper to add item to a general category
    const addGeneralItem = (category: keyof NonNullable<KnowledgeBase['general']>) => {
        const currentItems = data.general?.[category] as string[] || [];
        const newGeneral = {
            ...data.general,
            [category]: [...currentItems, '']
        };
        handleUpdate({ ...data, general: newGeneral });
    };

    // Helper to update item in a general category
    const updateGeneralItem = (category: keyof NonNullable<KnowledgeBase['general']>, index: number, value: string) => {
        const currentItems = [...(data.general?.[category] as string[] || [])];
        currentItems[index] = value;
        const newGeneral = {
            ...data.general,
            [category]: currentItems
        };
        handleUpdate({ ...data, general: newGeneral });
    };

    // Helper to remove item
    const removeGeneralItem = (category: keyof NonNullable<KnowledgeBase['general']>, index: number) => {
        const currentItems = [...(data.general?.[category] as string[] || [])];
        currentItems.splice(index, 1);
        const newGeneral = {
            ...data.general,
            [category]: currentItems
        };
        handleUpdate({ ...data, general: newGeneral });
    };

    // Playbook Helpers
    const addPlaybookItem = () => {
        const currentPlaybook = data.playbook || [];
        handleUpdate({
            ...data,
            playbook: [...currentPlaybook, { trigger: '', response: '' }]
        });
    };

    const updatePlaybookItem = (index: number, field: 'trigger' | 'response', value: string) => {
        const currentPlaybook = [...(data.playbook || [])];
        currentPlaybook[index] = { ...currentPlaybook[index], [field]: value };
        handleUpdate({ ...data, playbook: currentPlaybook });
    };

    const removePlaybookItem = (index: number) => {
        const currentPlaybook = [...(data.playbook || [])];
        currentPlaybook.splice(index, 1);
        handleUpdate({ ...data, playbook: currentPlaybook });
    };

    return (
        <div className="space-y-4">
            <input type="hidden" name="knowledgeBase" value={JSON.stringify(data)} />

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General Info</TabsTrigger>
                    <TabsTrigger value="playbook">Response Playbook</TabsTrigger>
                </TabsList>

                {/* GENERAL INFO TAB */}
                <TabsContent value="general" className="space-y-4 mt-4">
                    <div className="bg-muted/50 p-4 rounded-md border text-sm text-muted-foreground mb-4">
                        <p>Add factual details about your business. The AI uses these to answer customer questions accurately.</p>
                    </div>

                    {/* About Section */}
                    <div className="space-y-2">
                        <Label>General Business Information</Label>
                        <Textarea
                            placeholder="Briefly describe your business (e.g. A family-owned Italian restaurant in downtown Chicago...)"
                            value={data.general?.about || ''}
                            onChange={(e) => handleUpdate({
                                ...data,
                                general: { ...data.general, about: e.target.value }
                            })}
                        />
                    </div>

                    {/* Always Mention Section */}
                    <div className="space-y-2">
                        <Label>Mandatory Inclusions (Mentioned in every reply)</Label>
                        <Input
                            placeholder="e.g. Sign off with 'Stay cool!'"
                            value={data.general?.alwaysMention || ''}
                            onChange={(e) => handleUpdate({
                                ...data,
                                general: { ...data.general, alwaysMention: e.target.value }
                            })}
                        />
                        <p className="text-xs text-muted-foreground">This content will be prioritized in every response.</p>
                    </div>

                    <Accordion type="single" collapsible defaultValue="hours" className="w-full">

                        {/* Hours Section */}
                        <AccordionItem value="hours">
                            <AccordionTrigger>Hours & Availability</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                                {(data.general?.hours || []).map((item, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={item}
                                            onChange={(e) => updateGeneralItem('hours', idx, e.target.value)}
                                            placeholder="e.g. Open Mon-Fri 9am-5pm"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeGeneralItem('hours', idx)} type="button">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addGeneralItem('hours')} type="button" className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" /> Add Hours Info
                                </Button>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Services Section */}
                        <AccordionItem value="services">
                            <AccordionTrigger>Services & Amenities</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                                {(data.general?.services || []).map((item, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={item}
                                            onChange={(e) => updateGeneralItem('services', idx, e.target.value)}
                                            placeholder="e.g. Free Wi-Fi available"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeGeneralItem('services', idx)} type="button">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addGeneralItem('services')} type="button" className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" /> Add Service Info
                                </Button>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Policies Section */}
                        <AccordionItem value="policies">
                            <AccordionTrigger>Policies & Contact</AccordionTrigger>
                            <AccordionContent className="space-y-3 pt-2">
                                {(data.general?.policies || []).map((item, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            value={item}
                                            onChange={(e) => updateGeneralItem('policies', idx, e.target.value)}
                                            placeholder="e.g. Reservations required for large groups"
                                        />
                                        <Button variant="ghost" size="icon" onClick={() => removeGeneralItem('policies', idx)} type="button">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => addGeneralItem('policies')} type="button" className="mt-2">
                                    <Plus className="h-4 w-4 mr-2" /> Add Policy Info
                                </Button>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Migration/Legacy Handling */}
                    {data.general?.legacy && (
                        <div className="mt-6 border-t pt-4">
                            <Label className="text-muted-foreground">Legacy Notes (Unsorted)</Label>
                            <Textarea
                                value={data.general.legacy}
                                onChange={(e) => handleUpdate({ ...data, general: { ...data.general, legacy: e.target.value } })}
                                className="mt-2 text-muted-foreground"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Move these into categories above for better results.</p>
                        </div>
                    )}
                </TabsContent>

                {/* PLAYBOOK TAB */}
                <TabsContent value="playbook" className="space-y-4 mt-4">
                    <div className="bg-muted/50 p-4 rounded-md border text-sm text-muted-foreground mb-4">
                        <p>Teach the AI how to respond to specific topics. Set a trigger word/phrase and the desired response.</p>
                    </div>

                    <div className="space-y-4">
                        {(data.playbook || []).map((item, idx) => (
                            <Card key={idx}>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label>If review mentions...</Label>
                                            <Input
                                                value={item.trigger}
                                                onChange={(e) => updatePlaybookItem(idx, 'trigger', e.target.value)}
                                                placeholder="e.g. price, expensive, cost"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Then reply with...</Label>
                                            <Textarea
                                                value={item.response}
                                                onChange={(e) => updatePlaybookItem(idx, 'response', e.target.value)}
                                                placeholder="e.g. We use premium, locally sourced ingredients to ensure the best quality."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <Button variant="ghost" size="sm" onClick={() => removePlaybookItem(idx)} type="button" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4 mr-2" /> Remove Rule
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Button variant="outline" onClick={addPlaybookItem} type="button" className="w-full">
                        <Plus className="h-4 w-4 mr-2" /> Add New Rule
                    </Button>
                </TabsContent>
            </Tabs>
        </div>
    );
}
