import { useState, useEffect } from 'react';
import { KnowledgeBase } from '@/types';
import { FactCard } from './fact-card';
import { GeoHealthWidget } from './geo-health';
import { Users, MapPin, Shield } from 'lucide-react';

import { EditFactSheet } from './edit-fact-sheet';
import { AddFactCard } from './add-fact-card';

interface KnowledgeBaseEditorProps {
    initialData: KnowledgeBase;
    onChange: (data: KnowledgeBase) => void;
}

export function KnowledgeBaseEditor({ initialData, onChange }: KnowledgeBaseEditorProps) {
    // Editing state
    const [editingItem, setEditingItem] = useState<{ type: 'team' | 'geo' | 'policy' | 'about', id: string | number, data: any } | null>(null);

    // Initialize with empty defaults if no initial data
    const [data, setData] = useState<KnowledgeBase>(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            return initialData;
        }
        return {
            team: [],
            geoKeywords: [],
            general: {
                policies: []
            },
            menuHighlights: [],
            playbook: []
        };
    });

    // Validated 1-way sync: Update local state when prop changes
    useEffect(() => {
        if (initialData) {
            setData(initialData);
        }
    }, [initialData]);


    const handleSaveEdit = (updatedData: any) => {
        if (!editingItem) return;

        // CREATE MODE
        if (editingItem.id === 'new') {
            if (editingItem.type === 'team') {
                const newTeamMember = {
                    id: Date.now().toString(),
                    name: updatedData.name || 'New Member',
                    role: updatedData.role || 'Staff',
                    context: updatedData.context,
                    yearsOfExperience: updatedData.yearsOfExperience, // Note: Edit sheet needs to support this if valuable, simpler for now
                    isPublic: true,
                    ...updatedData // Spread any other fields
                };
                const newTeam = [...(data.team || []), newTeamMember];
                const newData = { ...data, team: newTeam };
                setData(newData);
                onChange(newData);
            } else if (editingItem.type === 'geo') {
                const newGeo = {
                    id: Date.now().toString(),
                    keyword: updatedData.keyword || 'Keyword',
                    priority: updatedData.priority || 'high',
                    usageExample: updatedData.usageExample,
                    ...updatedData
                };
                const newKeywords = [...(data.geoKeywords || []), newGeo];
                const newData = { ...data, geoKeywords: newKeywords };
                setData(newData);
                onChange(newData);
            } else if (editingItem.type === 'policy') {
                const newPolicies = [...(data.general?.policies || []), updatedData.content || ''];
                const newGeneral = { ...data.general, policies: newPolicies };
                const newData = { ...data, general: newGeneral };
                setData(newData);
                onChange(newData);
            }
        }
        // EDIT MODE
        else {
            if (editingItem.type === 'team') {
                const newTeam = data.team?.map(m => m.id === editingItem.id ? { ...m, ...updatedData } : m);
                const newData = { ...data, team: newTeam };
                setData(newData);
                onChange(newData);
            } else if (editingItem.type === 'geo') {
                const newGeo = data.geoKeywords?.map(k => k.id === editingItem.id ? { ...k, ...updatedData } : k);
                const newData = { ...data, geoKeywords: newGeo };
                setData(newData);
                onChange(newData);
            } else if (editingItem.type === 'policy') {
                // Policy is just an array of strings currently in 'general.policies'
                // But we might be editing one index
                const index = editingItem.id as number;
                const newPolicies = [...(data.general?.policies || [])];
                newPolicies[index] = updatedData.content;

                const newGeneral = { ...data.general, policies: newPolicies };
                const newData = { ...data, general: newGeneral };
                setData(newData);
                onChange(newData);
            } else if (editingItem.type === 'about') {
                const newGeneral = { ...data.general, about: updatedData.about };
                const newData = { ...data, general: newGeneral };
                setData(newData);
                onChange(newData);
            }
        }
        setEditingItem(null);
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
        <div className="flex gap-6">

            {/* Main Content Area (Left) */}
            <div className="flex-1 space-y-8 pr-2">

                {/* Dashboard Widgets Row */}

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
                            {data.team?.map((member) => {
                                // Build E-E-A-T display subtitle
                                const details: string[] = [member.role];
                                if (member.yearsOfExperience) {
                                    details.push(`${member.yearsOfExperience} yrs exp`);
                                }
                                if (member.specialties && member.specialties.length > 0) {
                                    details.push(member.specialties.slice(0, 2).join(', '));
                                }
                                // Add freeform context for AI-ingested facts
                                if (member.context) {
                                    details.push(member.context);
                                }
                                const subtitle = details.join(' • ');

                                return (
                                    <FactCard
                                        key={member.id}
                                        type="team"
                                        title={member.name}
                                        subtitle={subtitle}
                                        status="indexed"
                                        onEdit={() => setEditingItem({ type: 'team', id: member.id, data: member })}
                                        onDelete={() => handleDeleteTeam(member.id)}
                                    />
                                );
                            })}

                            {/* Manual Add Card - Team */}
                            <AddFactCard
                                label="Add Team Member"
                                onClick={() => setEditingItem({ type: 'team', id: 'new', data: { name: '', role: '', context: '' } })}
                            />
                        </div>
                    </div>

                    {/* GEO Section */}
                    <div className="space-y-3 pt-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            <MapPin className="h-4 w-4" /> AI Discovery Targets
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {data.geoKeywords?.map((geo) => {
                                const subtitle = geo.usageExample
                                    ? `${geo.priority} • ${geo.usageExample}`
                                    : `${geo.priority} priority`;

                                return (
                                    <FactCard
                                        key={geo.id}
                                        type="geo"
                                        title={geo.keyword}
                                        subtitle={subtitle}
                                        status="indexed"
                                        onEdit={() => setEditingItem({ type: 'geo', id: geo.id, data: geo })}
                                        onDelete={() => handleDeleteGeo(geo.id)}
                                    />
                                );
                            })}

                            {/* Manual Add Card - GEO */}
                            <AddFactCard
                                label="Add Target Phrase"
                                onClick={() => setEditingItem({ type: 'geo', id: 'new', data: { keyword: '', usageExample: '' } })}
                            />
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
                                    onEdit={() => setEditingItem({ type: 'policy', id: i, data: { content: svc } })}
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
                                    onEdit={() => setEditingItem({ type: 'policy', id: i, data: { content: policy } })}
                                    onDelete={() => handleDeletePolicy(i, false)}
                                />
                            ))}
                            {/* Manual Add Card - Policy */}
                            <AddFactCard
                                label="Add Policy"
                                onClick={() => setEditingItem({ type: 'policy', id: 'new', data: { content: '' } })}
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* Edit Dialog */}
            {editingItem && (
                <EditFactSheet
                    isOpen={!!editingItem}
                    onClose={() => setEditingItem(null)}
                    onSave={handleSaveEdit}
                    type={editingItem.type}
                    initialData={editingItem.data}
                />
            )}

        </div>
    );
}
