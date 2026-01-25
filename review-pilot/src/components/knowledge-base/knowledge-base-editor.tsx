'use client';

import { useState } from 'react';
import { KnowledgeBase } from '@/types';
import { FactCard } from './fact-card';
import { SmartIngestor } from './smart-ingestor';
import { SimulationPreview } from './simulation-preview';
import { GeoHealthWidget } from './geo-health';
import { Users, MapPin, Shield } from 'lucide-react';

interface KnowledgeBaseEditorProps {
    initialData: KnowledgeBase;
    onChange: (data: KnowledgeBase) => void;
}

export function KnowledgeBaseEditor({ initialData, onChange }: KnowledgeBaseEditorProps) {
    // Initialize with mock data if no initial data
    const [data, setData] = useState<KnowledgeBase>(() => {
        if (!initialData || Object.keys(initialData).length === 0) {
            // Return mock data with proper IDs
            return {
                team: [{
                    id: 'mock-team-1',
                    name: 'Chef Marco',
                    role: 'Head Chef',
                    context: '15 years exp. Specialized in handmade pasta.',
                    isPublic: true
                }],
                geoKeywords: [
                    {
                        id: 'mock-geo-1',
                        keyword: 'Best Coffee Shoreditch',
                        priority: 'high' as const
                    },
                    {
                        id: 'mock-geo-2',
                        keyword: 'Free Wi-Fi Cafe',
                        priority: 'medium' as const
                    }
                ],
                general: {
                    policies: ['Pet Friendly - Dogs allowed on patio only.']
                }
            };
        }
        return initialData;
    });

    // Mock handler for adding new facts from Ingestor
    const handleAddFact = (fact: { type: string; title?: string; subtitle?: string; status: string }) => {
        // In a real implementation, we would update the specific array in 'data' based on fact.type
        // For MVP demo, we'll just log or simplistic state update if needed
        console.log("Added fact:", fact);

        // Example: Add to team if type is team
        if (fact.type === 'team') {
            const newTeam = [...(data.team || []), {
                id: Date.now().toString(),
                name: 'New Member',
                role: 'Staff',
                context: fact.subtitle,
                isPublic: true
            }];
            const newData = { ...data, team: newTeam };
            setData(newData);
            onChange(newData);
        }
        if (fact.type === 'geo') {
            const newGeo = [...(data.geoKeywords || []), {
                id: Date.now().toString(),
                keyword: fact.title || '',
                priority: 'high' as const // explicit cast for TS
            }];
            const newData = { ...data, geoKeywords: newGeo };
            setData(newData);
            onChange(newData);
        }
        if (fact.type === 'policy') {
            const newGeneral = {
                ...data.general,
                policies: [...(data.general?.policies || []), fact.subtitle || '']
            };
            const newData = { ...data, general: newGeneral };
            setData(newData);
            onChange(newData);
        }
    };

    const handleDeleteTeam = (id: string) => {
        const newTeam = data.team?.filter(m => m.id !== id);
        const newData = { ...data, team: newTeam };
        setData(newData);
        onChange(newData);
    };

    const handleDeleteGeo = (id: string) => {
        const newGeo = data.geoKeywords?.filter(k => k.id !== id);
        const newData = { ...data, geoKeywords: newGeo };
        setData(newData);
        onChange(newData);
    };

    const handleDeletePolicy = (index: number, isService: boolean) => {
        const newGeneral = { ...data.general };
        if (isService) {
            newGeneral.services = data.general?.services?.filter((_, i) => i !== index);
        } else {
            newGeneral.policies = data.general?.policies?.filter((_, i) => i !== index);
        }
        const newData = { ...data, general: newGeneral };
        setData(newData);
        onChange(newData);
    };

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">

            {/* Main Content Area (Left) */}
            <div className="flex-1 space-y-8 overflow-y-auto pr-2">

                {/* Header Section */}
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Brand DNA</h2>
                        <p className="text-muted-foreground mt-1">Manage the facts that power your AI&apos;s local authority.</p>
                    </div>
                    <SmartIngestor onAddFact={handleAddFact} />
                </div>

                {/* Dashboard Widgets Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                        <GeoHealthWidget />
                    </div>
                    {/* Placeholder for other stats */}
                </div>

                {/* Fact Grid Sections */}
                <div className="space-y-6">

                    {/* Team Section */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            <Users className="h-4 w-4" /> Our Team
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.team?.map((member) => (
                                <FactCard
                                    key={member.id}
                                    type="team"
                                    title={member.name}
                                    subtitle={`${member.role} - ${member.context}`}
                                    status="indexed"
                                    onDelete={() => handleDeleteTeam(member.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* GEO Section */}
                    <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            <MapPin className="h-4 w-4" /> GEO Keywords
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.geoKeywords?.map((geo) => (
                                <FactCard
                                    key={geo.id}
                                    type="geo"
                                    title={geo.keyword}
                                    subtitle={`${geo.priority} Priority`}
                                    status="indexed"
                                    onDelete={() => handleDeleteGeo(geo.id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Policies Section (Legacy Data) */}
                    <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            <Shield className="h-4 w-4" /> Policies & Core Info
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.general?.services?.map((svc, i) => (
                                <FactCard
                                    key={`svc-${i}`}
                                    type="policy"
                                    title="Service"
                                    subtitle={svc}
                                    status="indexed"
                                    onDelete={() => handleDeletePolicy(i, true)}
                                />
                            ))}
                            {data.general?.policies?.map((policy, i) => (
                                <FactCard
                                    key={`pol-${i}`}
                                    type="policy"
                                    title="Policy"
                                    subtitle={policy}
                                    status="indexed"
                                    onDelete={() => handleDeletePolicy(i, false)}
                                />
                            ))}
                        </div>
                    </div>

                </div>
            </div>

            {/* Split Screen Simulation (Right) */}
            <div className="w-[350px] shrink-0 hidden lg:block sticky top-0 h-full">
                <SimulationPreview />
            </div>

        </div>
    );
}
