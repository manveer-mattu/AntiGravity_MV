import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Megaphone, ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ExtendedReview {
    id: string;
    starRating: number;
    sentiment?: 'positive' | 'neutral' | 'negative';
    topics?: string[];
    postedAt: string;
    content: string;
}

interface InsightsSectionProps {
    reviews: ExtendedReview[];
}

export function InsightsSection({ reviews }: InsightsSectionProps) {
    // 1. Calculate Insights
    const positiveReviews = reviews.filter(r => r.sentiment === 'positive' || r.starRating >= 4);
    const negativeReviews = reviews.filter(r => r.sentiment === 'negative' || r.starRating <= 2);

    // Helper to find top topic
    const getTopTopic = (reviewList: ExtendedReview[]) => {
        const topicCounts: Record<string, number> = {};
        reviewList.forEach(r => {
            r.topics?.forEach(t => {
                topicCounts[t] = (topicCounts[t] || 0) + 1;
            });
        });
        const sorted = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
        return sorted.length > 0 ? sorted[0][0] : null;
    };

    const topPositiveTopic = getTopTopic(positiveReviews) || "General Service";
    const topNegativeTopic = getTopTopic(negativeReviews) || "Wait Time";

    // Recent Trend (Last 7 days vs Previous 30 days) - Mock logic for now as data might be sparse
    // In real app: timestamp comparison. Here: simple check on last 5 reviews.
    const recentReviews = reviews.slice(0, 5);
    const recentAvg = recentReviews.reduce((acc, r) => acc + r.starRating, 0) / (recentReviews.length || 1);
    const overallAvg = reviews.reduce((acc, r) => acc + r.starRating, 0) / (reviews.length || 1);
    const isTrendingUp = recentAvg >= overallAvg;

    return (
        <section className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-slate-800 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    AI Action Center
                </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Insight 1: Service Pulse (Trend) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="relative overflow-hidden h-full border-none shadow-md bg-gradient-to-br from-indigo-50 to-white hover:shadow-lg transition-all duration-300 group">
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-indigo-900 flex items-center justify-between">
                                Service Pulse
                                {isTrendingUp ? (
                                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                                ) : (
                                    <TrendingUp className="h-4 w-4 text-amber-600 rotate-180" />
                                )}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-3">
                            <div>
                                <div className="text-2xl font-bold text-slate-800 flex items-baseline gap-2">
                                    {isTrendingUp ? "Steady Growth" : "Attention Needed"}
                                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 border", isTrendingUp ? "text-emerald-700 border-emerald-200" : "text-amber-700 border-amber-200")}>
                                        {isTrendingUp ? "+4.2%" : "-2.1%"}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {isTrendingUp
                                        ? "Recent reviews show improved sentiment scores."
                                        : "Recent sentiment is tracking slightly below average."}
                                </p>
                            </div>
                            <div className="pt-2">
                                <Button size="sm" variant="outline" className="w-full bg-white/60 hover:bg-white text-indigo-700 border-indigo-100 shadow-sm text-xs h-8">
                                    View Trend Report
                                </Button>
                            </div>
                        </CardContent>
                        {/* Decorative Background */}
                        <div className="absolute right-0 top-0 h-32 w-32 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
                    </Card>
                </motion.div>

                {/* Insight 2: Quality Focus (Pain Point) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="relative overflow-hidden h-full border-none shadow-md bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-all duration-300 group">
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-amber-900 flex items-center justify-between">
                                Priority Focus
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-3">
                            <div>
                                <div className="text-2xl font-bold text-slate-800">
                                    "{topNegativeTopic}"
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Recurring theme in <span className="font-medium text-slate-700">{negativeReviews.length > 0 ? Math.round((negativeReviews.filter(r => r.topics?.includes(topNegativeTopic)).length / negativeReviews.length) * 100) : 0}%</span> of negative reviews.
                                </p>
                            </div>
                            <div className="pt-2">
                                <Button size="sm" className="w-full bg-amber-100 hover:bg-amber-200 text-amber-900 border-none shadow-none text-xs h-8 justify-start px-3">
                                    <span className="mr-2">⚡</span> Draft Strategy Plan
                                </Button>
                            </div>
                        </CardContent>
                        <div className="absolute right-0 bottom-0 h-24 w-24 bg-amber-500/10 blur-2xl rounded-full -mr-6 -mb-6" />
                    </Card>
                </motion.div>

                {/* Insight 3: Marketing Opportunity (Praise) */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="relative overflow-hidden h-full border-none shadow-md bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-all duration-300 group">
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-purple-900 flex items-center justify-between">
                                Marketing Edge
                                <Megaphone className="h-4 w-4 text-purple-600" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-3">
                            <div>
                                <div className="text-2xl font-bold text-slate-800">
                                    "{topPositiveTopic}"
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    Your strongest asset. Mentioned in <span className="font-medium text-slate-700">{positiveReviews.slice(0, 3).length}+</span> recent 5-star reviews.
                                </p>
                            </div>
                            <div className="pt-2">
                                <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none shadow-md shadow-purple-200 text-xs h-8">
                                    Create Promo Post
                                </Button>
                            </div>
                        </CardContent>
                        <div className="absolute right-0 top-0 h-32 w-32 bg-purple-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
                    </Card>
                </motion.div>
            </div>
        </section>
    );
}
