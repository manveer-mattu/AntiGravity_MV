import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BrandVoice } from '@/types';
import { Info, Sparkles, X, Brain, Zap, Smile, MessageSquare, ShieldBan, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BrandDNAPreview } from './brand-dna-preview';

interface BrandDNAConfigProps {
    value: BrandVoice;
    onChange: (value: BrandVoice) => void;
}

export function BrandDNAConfig({ value, onChange }: BrandDNAConfigProps) {
    // Helper to update pillars
    const updatePillar = (key: keyof BrandVoice['pillars'], val: number) => {
        onChange({
            ...value,
            pillars: { ...value.pillars, [key]: val }
        });
    };

    // Helper to update voice settings
    const updateSetting = (key: keyof BrandVoice['voiceSettings'], val: any) => {
        onChange({
            ...value,
            voiceSettings: { ...value.voiceSettings, [key]: val }
        });
    };

    // Banned Vocab state
    const [newBannedWord, setNewBannedWord] = useState('');

    const addBannedWord = () => {
        if (!newBannedWord.trim()) return;
        if (value.bannedVocabulary?.includes(newBannedWord.trim())) return;

        onChange({
            ...value,
            bannedVocabulary: [...(value.bannedVocabulary || []), newBannedWord.trim()]
        });
        setNewBannedWord('');
    };

    const removeBannedWord = (word: string) => {
        onChange({
            ...value,
            bannedVocabulary: value.bannedVocabulary?.filter(w => w !== word) || []
        });
    };

    const getIntensityLabel = (val: number, low: string, mid: string, high: string) => {
        if (val <= 3) return low;
        if (val >= 8) return high;
        return mid;
    };

    // Return Hex colors for inline styling
    const getIntensityColorHex = (val: number) => {
        if (val <= 3) return "#3b82f6"; // blue-500
        if (val >= 8) return "#9333ea"; // purple-600
        return "#64748b"; // slate-500 (gray)
    };

    return (
        <div className="space-y-8">

            {/* Live Preview Section */}
            <BrandDNAPreview brandVoice={value} />

            <div className="h-px bg-border" />

            {/* The 4 Pillars Equalizer */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Settings2 className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <Label className="text-lg font-semibold text-foreground">The 4 Pillars</Label>
                        <p className="text-sm text-muted-foreground">Adjust the sliders to fine-tune your brand's unique voice signature.</p>
                    </div>
                </div>

                <Card className="border-indigo-100 bg-gradient-to-b from-white to-slate-50/50">
                    <CardContent className="p-6 space-y-6">
                        {/* Personality */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Smile className="h-4 w-4" /> Personality
                                </span>
                                <span
                                    className="text-sm font-bold px-3 py-1 rounded-full text-white transition-colors"
                                    style={{ backgroundColor: getIntensityColorHex(value.pillars?.personality || 5) }}
                                >
                                    {getIntensityLabel(value.pillars?.personality || 5, "Serious & Direct", "Balanced", "Witty & Playful")}
                                </span>
                            </div>
                            <Slider
                                value={[value.pillars?.personality || 5]}
                                onValueChange={([v]) => updatePillar('personality', v)}
                                min={1} max={10} step={1}
                                overrideColor={getIntensityColorHex(value.pillars?.personality || 5)}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Dry / Factual</span>
                                <span>Charismatic / Humorous</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Formality */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Brain className="h-4 w-4" /> Formality
                                </span>
                                <span
                                    className="text-sm font-bold px-3 py-1 rounded-full text-white transition-colors"
                                    style={{ backgroundColor: getIntensityColorHex(value.pillars?.formality || 5) }}
                                >
                                    {getIntensityLabel(value.pillars?.formality || 5, "Casual & Slang", "Neutral", "Sophisticated")}
                                </span>
                            </div>
                            <Slider
                                value={[value.pillars?.formality || 5]}
                                onValueChange={([v]) => updatePillar('formality', v)}
                                min={1} max={10} step={1}
                                overrideColor={getIntensityColorHex(value.pillars?.formality || 5)}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>"Hey there!"</span>
                                <span>"We hereby acknowledge..."</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Enthusiasm */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Zap className="h-4 w-4" /> Enthusiasm
                                </span>
                                <span
                                    className="text-sm font-bold px-3 py-1 rounded-full text-white transition-colors"
                                    style={{ backgroundColor: getIntensityColorHex(value.pillars?.enthusiasm || 5) }}
                                >
                                    {getIntensityLabel(value.pillars?.enthusiasm || 5, "Calm & Understated", "Appreciative", "High Energy!!!")}
                                </span>
                            </div>
                            <Slider
                                value={[value.pillars?.enthusiasm || 5]}
                                onValueChange={([v]) => updatePillar('enthusiasm', v)}
                                min={1} max={10} step={1}
                                overrideColor={getIntensityColorHex(value.pillars?.enthusiasm || 5)}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Zero Exclamations</span>
                                <span>Emojis Everywhere</span>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Authority */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" /> Authority
                                </span>
                                <span
                                    className="text-sm font-bold px-3 py-1 rounded-full text-white transition-colors"
                                    style={{ backgroundColor: getIntensityColorHex(value.pillars?.authority || 5) }}
                                >
                                    {getIntensityLabel(value.pillars?.authority || 5, "Humble & Grateful", "Confident", "Expert Advisory")}
                                </span>
                            </div>
                            <Slider
                                value={[value.pillars?.authority || 5]}
                                onValueChange={([v]) => updatePillar('authority', v)}
                                min={1} max={10} step={1}
                                overrideColor={getIntensityColorHex(value.pillars?.authority || 5)}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>The Customer is King</span>
                                <span>We Know Best</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className=" h-px bg-border" />

            {/* Voice Settings Toggles */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                        <Label className="text-lg font-semibold">Voice Controls</Label>
                        <p className="text-sm text-muted-foreground">Granular controls for specific response elements.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Emoji Policy */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow border-purple-100">
                        <CardContent className="p-4 space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2 text-purple-900">
                                <Smile className="h-4 w-4" /> Emoji Policy
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {['none', 'professional', 'expressive'].map((option) => {
                                    const isSelected = value.voiceSettings?.emojiPolicy === option;
                                    return (
                                        <div
                                            key={option}
                                            className="cursor-pointer capitalize px-4 py-2 transition-all text-sm font-medium border shadow-sm rounded-full transform hover:scale-105"
                                            style={{
                                                backgroundColor: isSelected ? '#9333ea' : '#ffffff', // purple-600 : white
                                                color: isSelected ? '#ffffff' : '#334155', // white : slate-700
                                                borderColor: isSelected ? '#9333ea' : '#e2e8f0',
                                                boxShadow: isSelected ? '0 4px 6px -1px rgba(147, 51, 234, 0.3)' : 'none'
                                            }}
                                            onClick={() => updateSetting('emojiPolicy', option)}
                                        >
                                            {option}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Perspective */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow border-purple-100">
                        <CardContent className="p-4 space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2 text-purple-900">
                                <Info className="h-4 w-4" /> Perspective
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {['first', 'collective', 'third'].map((option) => {
                                    const isSelected = value.voiceSettings?.perspective === option;
                                    return (
                                        <div
                                            key={option}
                                            className="cursor-pointer capitalize px-4 py-2 transition-all text-sm font-medium border shadow-sm rounded-full transform hover:scale-105"
                                            style={{
                                                backgroundColor: isSelected ? '#9333ea' : '#ffffff',
                                                color: isSelected ? '#ffffff' : '#334155',
                                                borderColor: isSelected ? '#9333ea' : '#e2e8f0',
                                                boxShadow: isSelected ? '0 4px 6px -1px rgba(147, 51, 234, 0.3)' : 'none'
                                            }}
                                            onClick={() => updateSetting('perspective', option)}
                                        >
                                            {option === 'first' ? 'I (Me)' : option === 'collective' ? 'We (Us)' : 'The Team'}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* GEO Intensity */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow border-purple-100">
                        <CardContent className="p-4 space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2 text-purple-900">
                                <Brain className="h-4 w-4" /> GEO Intensity
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {['off', 'subtle', 'aggressive'].map((option) => {
                                    const isSelected = value.voiceSettings?.geoIntensity === option;
                                    return (
                                        <div
                                            key={option}
                                            className="cursor-pointer capitalize px-4 py-2 transition-all text-sm font-medium border shadow-sm rounded-full transform hover:scale-105"
                                            style={{
                                                backgroundColor: isSelected ? '#9333ea' : '#ffffff',
                                                color: isSelected ? '#ffffff' : '#334155',
                                                borderColor: isSelected ? '#9333ea' : '#e2e8f0',
                                                boxShadow: isSelected ? '0 4px 6px -1px rgba(147, 51, 234, 0.3)' : 'none'
                                            }}
                                            onClick={() => updateSetting('geoIntensity', option)}
                                        >
                                            {option}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sign-off Style */}
                    <Card className="shadow-sm hover:shadow-md transition-shadow border-purple-100">
                        <CardContent className="p-4 space-y-3">
                            <Label className="text-sm font-medium flex items-center gap-2 text-purple-900">
                                <Sparkles className="h-4 w-4" /> Sign-off Style
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {['standard', 'cta', 'personal'].map((option) => {
                                    const isSelected = value.voiceSettings?.signOffStyle === option;
                                    return (
                                        <div
                                            key={option}
                                            className="cursor-pointer capitalize px-4 py-2 transition-all text-sm font-medium border shadow-sm rounded-full transform hover:scale-105"
                                            style={{
                                                backgroundColor: isSelected ? '#9333ea' : '#ffffff',
                                                color: isSelected ? '#ffffff' : '#334155',
                                                borderColor: isSelected ? '#9333ea' : '#e2e8f0',
                                                boxShadow: isSelected ? '0 4px 6px -1px rgba(147, 51, 234, 0.3)' : 'none'
                                            }}
                                            onClick={() => updateSetting('signOffStyle', option)}
                                        >
                                            {option}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="h-px bg-border" />

            {/* Banned Vocabulary */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <ShieldBan className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <Label className="text-lg font-semibold text-red-950">Negative Knowledge Base</Label>
                        <p className="text-sm text-slate-500">Prevent "AI Slop" by banning specific generic phrases.</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Input
                        placeholder="e.g. inconvenience"
                        value={newBannedWord}
                        onChange={(e) => setNewBannedWord(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addBannedWord())}
                    />
                    <Button type="button" variant="secondary" onClick={addBannedWord}>Block</Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {value.bannedVocabulary?.map((word, i) => (
                        <div key={i} className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm">
                            <span>{word}</span>
                            <X
                                className="h-3 w-3 cursor-pointer hover:text-red-900"
                                onClick={() => removeBannedWord(word)}
                            />
                        </div>
                    ))}
                    {(!value.bannedVocabulary || value.bannedVocabulary.length === 0) && (
                        <span className="text-sm text-muted-foreground italic">No banned words set.</span>
                    )}
                </div>
            </div>
        </div>
    );
}
