'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GoogleReview } from '@/lib/google-business-mock';
import { getReviews } from '@/app/actions/reviews';
import { Star, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { SubscribeButton } from '@/components/subscribe-button';
import Link from 'next/link';

import { ReviewCard } from '@/components/review-card';

export default function Dashboard() {
    const [reviews, setReviews] = useState<GoogleReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'inbox' | 'drafts' | 'published'>('inbox');
    const [recentlyDrafted, setRecentlyDrafted] = useState<string[]>([]);

    useEffect(() => {
        getReviews().then((data) => {
            setReviews(data);
            setLoading(false);
        });
    }, []);

    // Clear recently drafted when switching tabs
    useEffect(() => {
        setRecentlyDrafted([]);
    }, [activeTab]);

    const pendingCount = reviews.filter((r) => r.status === 'pending' || !r.status).length;
    const draftCount = reviews.filter((r) => r.status === 'draft').length;
    const avgRating =
        reviews.reduce((acc, r) => acc + r.starRating, 0) / reviews.length || 0;

    const filteredReviews = reviews.filter(r => {
        if (activeTab === 'inbox') {
            // Show pending items OR items that were just drafted in this session (so they don't disappear)
            return r.status === 'pending' || !r.status || (r.status === 'draft' && recentlyDrafted.includes(r.id));
        }
        if (activeTab === 'drafts') return r.status === 'draft';
        if (activeTab === 'published') return r.status === 'replied';
        return true;
    });

    const handleStatusChange = (reviewId: string, newStatus: 'pending' | 'draft' | 'replied', replyContent?: string, isFallback?: boolean) => {
        setReviews(prev => prev.map(r => {
            if (r.id === reviewId) {
                return {
                    ...r,
                    status: newStatus,
                    replyContent: replyContent || r.replyContent,
                    isFallback: isFallback !== undefined ? isFallback : r.isFallback
                };
            }
            return r;
        }));

        if (newStatus === 'draft') {
            setRecentlyDrafted(prev => [...prev, reviewId]);
        }
    };

    const handleDismiss = (reviewId: string) => {
        // Remove from recentlyDrafted to hide it from inbox view
        setRecentlyDrafted(prev => prev.filter(id => id !== reviewId));
    };

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
                <div className="flex flex-wrap gap-4 mb-8">
                    <Card className="flex-1 min-w-[200px] max-w-[260px]">
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
                    <Card className="flex-1 min-w-[200px] max-w-[260px]">
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

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b pb-2">
                    <button
                        onClick={() => setActiveTab('inbox')}
                        className={cn("px-4 py-2 font-medium text-sm transition-colors",
                            activeTab === 'inbox' ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
                    >
                        Inbox ({pendingCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('drafts')}
                        className={cn("px-4 py-2 font-medium text-sm transition-colors",
                            activeTab === 'drafts' ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
                    >
                        Drafts ({draftCount})
                    </button>
                    <button
                        onClick={() => setActiveTab('published')}
                        className={cn("px-4 py-2 font-medium text-sm transition-colors",
                            activeTab === 'published' ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
                    >
                        Published
                    </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-muted-foreground">Loading reviews...</div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-white rounded-lg border border-dashed">
                            {activeTab === 'inbox' ? 'No pending reviews! 🎉' :
                                activeTab === 'drafts' ? 'No drafts waiting properly.' :
                                    'No reviews published yet.'}
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredReviews.map((review) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ReviewCard
                                        review={review}
                                        onStatusChange={(newStatus, replyContent, isFallback) => handleStatusChange(review.id, newStatus, replyContent, isFallback)}
                                        onDismiss={() => handleDismiss(review.id)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </main>
        </div>
    );
}
