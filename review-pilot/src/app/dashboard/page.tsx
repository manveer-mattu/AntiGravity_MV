'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getReviews } from '@/app/actions/reviews';
import { GoogleReview } from '@/lib/google-business-mock';
import { Star, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { SubscribeButton } from '@/components/subscribe-button';
import Link from 'next/link';

import { ReviewCard } from '@/components/review-card';
import { SentimentTrend } from '@/components/dashboard/charts/sentiment-trend';
import { RatingDistribution } from '@/components/dashboard/charts/rating-distribution';
import { TopicSentiment } from '@/components/dashboard/charts/topic-sentiment';

// Temporary cast until server action is fully typed with new fields
// In a real app, we'd update the action return type.
type ExtendedReview = GoogleReview & {
    sentiment?: 'positive' | 'neutral' | 'negative';
    topics?: string[];
};

export default function Dashboard() {
    const [reviews, setReviews] = useState<ExtendedReview[]>([]);
    const [stats, setStats] = useState<any[]>([]); // Using any for now to speed up dev
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'inbox' | 'drafts' | 'published'>('inbox');
    const [recentlyDrafted, setRecentlyDrafted] = useState<string[]>([]);

    useEffect(() => {
        Promise.all([
            getReviews(),
            import('@/app/actions/analytics').then(mod => mod.getReviewStats())
        ]).then(([reviewsData, statsData]) => {
            setReviews(reviewsData as ExtendedReview[]);
            setStats(statsData);
            setLoading(false);
        });
    }, []);

    const pendingCount = reviews.filter((r) => r.status === 'pending' || !r.status).length;
    const draftCount = reviews.filter((r) => r.status === 'draft').length;
    const avgRating =
        reviews.reduce((acc, r) => acc + r.starRating, 0) / reviews.length || 0;

    // Calculate simple sentiment score (Positive % - Negative %)
    const sentimentScore = reviews.length > 0 ? Math.round(
        ((reviews.filter(r => r.sentiment === 'positive').length -
            reviews.filter(r => r.sentiment === 'negative').length) / reviews.length) * 100
    ) : 0;

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

    const handleTabChange = (tab: 'inbox' | 'drafts' | 'published') => {
        setActiveTab(tab);
        setRecentlyDrafted([]);
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar (Simplified for MVP) */}
            <aside className="w-64 bg-card border-r hidden md:block p-6 flex flex-col fixed h-full z-10">
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
            <main className="flex-1 p-8 md:ml-64">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Review intelligence and automated replies.
                    </p>
                </header>

                {/* BI Section */}
                {!loading && (
                    <div className="space-y-6 mb-10">
                        {/* Key Metrics Row */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{reviews.length}</div>
                                    <p className="text-xs text-muted-foreground">in last 30 days</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {reviews.filter(r => r.starRating === 5).length} five-star reviews
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Sentiment Score</CardTitle>
                                    <TrendingUp className={cn("h-4 w-4", sentimentScore >= 0 ? "text-green-500" : "text-red-500")} />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{sentimentScore > 0 ? '+' : ''}{sentimentScore}</div>
                                    <p className="text-xs text-muted-foreground">Net Sentiment Score</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{pendingCount}</div>
                                    <p className="text-xs text-muted-foreground">Reviews awaiting reply</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Charts Grid */}
                        <div className="grid gap-4 md:grid-cols-4">
                            <SentimentTrend stats={stats} />
                            <div className="col-span-4 md:col-span-2 grid gap-4">
                                <RatingDistribution reviews={reviews} />
                            </div>
                            <div className="col-span-4 md:col-span-2 grid gap-4">
                                <TopicSentiment reviews={reviews} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b pb-2">
                    <button
                        onClick={() => handleTabChange('inbox')}
                        className={cn("px-4 py-2 font-medium text-sm transition-colors",
                            activeTab === 'inbox' ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
                    >
                        Inbox ({pendingCount})
                    </button>
                    <button
                        onClick={() => handleTabChange('drafts')}
                        className={cn("px-4 py-2 font-medium text-sm transition-colors",
                            activeTab === 'drafts' ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
                    >
                        Drafts ({draftCount})
                    </button>
                    <button
                        onClick={() => handleTabChange('published')}
                        className={cn("px-4 py-2 font-medium text-sm transition-colors",
                            activeTab === 'published' ? "border-b-2 border-primary text-primary" : "text-muted-foreground hover:text-foreground")}
                    >
                        Published
                    </button>
                </div>

                {/* Reviews List */}
                <div className="space-y-4 pb-12">
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
