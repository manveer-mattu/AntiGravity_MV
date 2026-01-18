'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchMockReviews, GoogleReview } from '@/lib/google-business-mock';
import { Star, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

import { SubscribeButton } from '@/components/subscribe-button';
import Link from 'next/link';

export default function Dashboard() {
    const [reviews, setReviews] = useState<GoogleReview[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMockReviews().then((data) => {
            setReviews(data);
            setLoading(false);
        });
    }, []);

    const pendingCount = reviews.filter((r) => r.status === 'pending').length;
    const avgRating =
        reviews.reduce((acc, r) => acc + r.starRating, 0) / reviews.length || 0;

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar (Simplified for MVP) */}
            <aside className="w-64 bg-card border-r hidden md:block p-6 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-2">
                    ReviewPilot.ai
                </h1>
                <nav className="space-y-2 flex-1">
                    <Button variant="secondary" className="w-full justify-start">
                        Dashboard
                    </Button>
                    <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start">
                            Settings
                        </Button>
                    </Link>
                </nav>
                <div className="pt-4">
                    <SubscribeButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Manage your reputation and auto-reply to reviews.
                    </p>
                </header>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Reviews
                            </CardTitle>
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingCount}</div>
                            <p className="text-xs text-muted-foreground">
                                Action required
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Average Rating
                            </CardTitle>
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                            <p className="text-xs text-muted-foreground">
                                Based on {reviews.length} reviews
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Recent Reviews</h3>
                    {loading ? (
                        <div className="text-muted-foreground">Loading reviews...</div>
                    ) : (
                        reviews.map((review) => (
                            <ReviewCard key={review.id} review={review} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}

function ReviewCard({ review }: { review: GoogleReview }) {
    const [generatedReply, setGeneratedReply] = useState<string | null>(review.replyContent || null);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
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
            }
        } catch (error) {
            console.error("Failed to generate", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
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
                    <span className="text-xs text-muted-foreground">
                        {new Date(review.postedAt).toLocaleDateString()}
                    </span>
                </div>

                <p className="text-sm text-gray-700 mb-4">{review.content}</p>

                {generatedReply ? (
                    <div className="bg-muted p-4 rounded-md text-sm border-l-4 border-l-primary/50">
                        <span className="font-semibold block mb-1 text-primary">Drafted Response:</span>
                        <p className="italic text-gray-600 mb-3">{generatedReply}</p>
                        <div className="flex gap-2">
                            <Button size="sm">Post Reply</Button>
                            <Button size="sm" variant="outline" onClick={() => setGeneratedReply(null)}>Discard</Button>
                        </div>
                    </div>
                ) : (
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? "Drafting..." : "Generate AI Reply"}
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
