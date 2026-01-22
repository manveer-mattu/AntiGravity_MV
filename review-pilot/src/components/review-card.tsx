'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GoogleReview } from '@/lib/google-business-mock'; // We might need to move this type or import it
import { Textarea } from '@/components/ui/textarea'; // Assuming we have this, or use standard textarea

// Interim type definition if not exported or to avoid circular deps if mock file is heavy
// Ideally we move types to types.ts
interface ReviewCardProps {
    review: GoogleReview;
    onStatusChange?: (status: 'pending' | 'draft' | 'replied', replyContent?: string, isFallback?: boolean) => void;
}

export function ReviewCard({ review, onStatusChange }: ReviewCardProps) {
    const [generatedReply, setGeneratedReply] = useState<string | null>(review.replyContent || null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState(review.status || 'pending');
    const [isEditing, setIsEditing] = useState(false);
    const [draftText, setDraftText] = useState(review.replyContent || '');
    const [isFallback, setIsFallback] = useState(review.isFallback || false);
    const [isDiscarding, setIsDiscarding] = useState(false);

    // Sync state with props if they change externally (e.g. filtered list updates)
    useEffect(() => {
        setStatus(review.status || 'pending');
        if (review.replyContent) {
            setGeneratedReply(review.replyContent);
            setDraftText(review.replyContent);
        }
        if (review.isFallback !== undefined) {
            setIsFallback(review.isFallback);
        }
    }, [review.status, review.replyContent, review.isFallback]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        setIsDiscarding(false);
        try {
            const response = await fetch('/api/generate-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reviewerName: review.reviewerName,
                    starRating: review.starRating,
                    content: review.content
                })
            });

            const data = await response.json();
            if (data.reply) {
                setGeneratedReply(data.reply);
                setDraftText(data.reply);
                setIsFallback(data.isFallback || false);
                setStatus('draft');

                // Save as draft immediately
                await fetch('/api/save-reply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        reviewId: review.id,
                        replyContent: data.reply,
                        status: 'draft'
                    })
                });

                if (onStatusChange) onStatusChange('draft', data.reply, data.isFallback);
            }
        } catch (error) {
            console.error("Failed to generate", error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePost = async () => {
        // Call backend to publish
        await fetch('/api/save-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reviewId: review.id,
                replyContent: draftText,
                status: 'replied'
            })
        });

        setStatus('replied');
        setGeneratedReply(draftText);
        setIsEditing(false);
        if (onStatusChange) onStatusChange('replied', draftText);
    };

    return (
        <Card className="mb-4">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="font-semibold">{review.reviewerName}</div>
                        <div className="flex items-center gap-1 mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className={cn(
                                        "h-4 w-4",
                                        i < review.starRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground">
                            {new Date(review.postedAt).toLocaleDateString()}
                        </span>
                        <div className={cn(
                            "text-xs px-2 py-0.5 rounded-full capitalize",
                            status === 'replied' ? "bg-green-100 text-green-700" :
                                status === 'draft' ? "bg-amber-100 text-amber-700" :
                                    "bg-gray-100 text-gray-700"
                        )}>
                            {status}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-700 mb-4">{review.content}</p>

                {/* DRAFT STATE or REPLIED STATE */}
                <AnimatePresence mode="wait">
                    {status === 'draft' || status === 'replied' ? (
                        <motion.div
                            key="reply-box"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className={cn(
                                "p-4 rounded-md text-sm border-l-4",
                                status === 'replied' ? "bg-green-50 border-l-green-500" : "bg-primary/5 border-l-primary/50"
                            )}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-primary/80">
                                        {status === 'replied' ? 'Published Response:' : 'Draft Response:'}
                                    </span>
                                    {isFallback && (
                                        <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium border border-orange-200">
                                            Template Mode (AI Busy)
                                        </span>
                                    )}
                                </div>
                                {status === 'draft' && !isEditing && (
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>Edit</Button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className="space-y-3">
                                    <Textarea
                                        value={draftText}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDraftText(e.target.value)}
                                        className="bg-white"
                                    />
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={async () => {
                                            setIsEditing(false);
                                            await fetch('/api/save-reply', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    reviewId: review.id,
                                                    replyContent: draftText,
                                                    status: 'draft'
                                                })
                                            });
                                            if (onStatusChange) onStatusChange('draft', draftText);
                                        }}>Save Draft</Button>
                                        <Button size="sm" onClick={handlePost}>Approve & Post</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <p className="italic text-gray-600 space-y-2 whitespace-pre-wrap">{draftText || generatedReply}</p>
                                    {status === 'draft' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={handlePost}>Approve & Post</Button>
                                            <Button size="sm" variant="outline" onClick={async () => {
                                                setIsDiscarding(true);
                                                setStatus('pending');
                                                setGeneratedReply(null);
                                                // Reset in DB
                                                await fetch('/api/save-reply', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        reviewId: review.id,
                                                        replyContent: null,
                                                        status: 'pending'
                                                    })
                                                });
                                                if (onStatusChange) onStatusChange('pending', '');
                                            }}>Discard</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        // PENDING STATE
                        <motion.div
                            key="generate-button"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Button onClick={handleGenerate} disabled={isGenerating}>
                                {isGenerating ? "Drafting..." : "Generate AI Reply"}
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}
