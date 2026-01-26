'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface EditFactSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => void;
    type: 'team' | 'geo' | 'policy' | 'about';
    initialData: any;
}

export function EditFactSheet({ isOpen, onClose, onSave, type, initialData }: EditFactSheetProps) {
    const [formData, setFormData] = useState(initialData || {});

    // Reset form when opening
    useEffect(() => {
        setFormData(initialData || {});
    }, [initialData, isOpen]);

    const handleChange = (field: string, value: any) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const getTitle = () => {
        switch (type) {
            case 'team': return 'Team Member';
            case 'geo': return 'AI Discovery Target';
            case 'policy': return 'Policy';
            case 'about': return 'Business Context';
            default: return 'Item';
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit {getTitle()}</DialogTitle>
                    <DialogDescription>
                        Make changes to your brand knowledge here.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {type === 'about' && (
                        <div className="space-y-2">
                            <Label>Business Description</Label>
                            <Textarea
                                value={formData.about || ''}
                                onChange={(e) => handleChange('about', e.target.value)}
                                placeholder="e.g. We are an upscale Italian restaurant specializing in authentic Neapolitan pizza and handmade pasta."
                                className="min-h-[120px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Tell the AI exactly what you do. This is the "Ground Truth" for all other answers.
                            </p>
                        </div>
                    )}

                    {type === 'team' && (
                        <>
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={formData.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                    value={formData.role || ''}
                                    onChange={(e) => handleChange('role', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Context / Bio (Important for AI)</Label>
                                <Textarea
                                    value={formData.context || ''}
                                    onChange={(e) => handleChange('context', e.target.value)}
                                    placeholder="e.g. 10 years experience, specializes in vegan dishes..."
                                />
                            </div>
                        </>
                    )}

                    {type === 'geo' && (
                        <>
                            <div className="space-y-2">
                                <Label>Phrase to Rank For</Label>
                                <Input
                                    value={formData.keyword || ''}
                                    onChange={(e) => handleChange('keyword', e.target.value)}
                                    placeholder="e.g. Best Pizza in Brooklyn"
                                />
                                <p className="text-xs text-muted-foreground">The exact phrase typical customers search for.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Why? / Proof Point</Label>
                                <Input
                                    value={formData.usageExample || ''}
                                    onChange={(e) => handleChange('usageExample', e.target.value)}
                                    placeholder="e.g. Winner of 2024 Pizza Cup, family owned since 1990"
                                />
                                <p className="text-xs text-muted-foreground">Give the AI a reason to claim this. Awards, stats, or local history work best.</p>
                            </div>
                        </>
                    )}

                    {type === 'policy' && (
                        <div className="space-y-2">
                            <Label>Policy or Info</Label>
                            <Textarea
                                value={formData.content || ''}
                                // Mapping: for policy, we usually store just a string in the array, 
                                // providing an object interface wrapper might be needed in parent.
                                // But here we assume object structure.
                                onChange={(e) => handleChange('content', e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
