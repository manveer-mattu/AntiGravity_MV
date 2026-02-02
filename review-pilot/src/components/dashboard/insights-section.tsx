import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, AlertTriangle, Megaphone, ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { getSentimentTrend, getImpactDrivers, getTopEntities } from "@/lib/analytics-utils";

import { GoogleReview } from "@/lib/google-business-mock";

interface ExtendedReview extends GoogleReview {
    sentiment?: 'positive' | 'neutral' | 'negative';
    topics?: string[];
}

interface InsightsSectionProps {
    reviews: ExtendedReview[];
}

export function InsightsSection({ reviews }: InsightsSectionProps) {
    const sentimentTrend = getSentimentTrend(reviews);
    const impactDrivers = getImpactDrivers(reviews);
    const topEntities = getTopEntities(reviews);

    // Calculate velocity (last 3 days vs previous 3 days)
    const currentVelocity = sentimentTrend.slice(-3).reduce((acc, p) => acc + p.score, 0) / 3;
    const previousVelocity = sentimentTrend.slice(-6, -3).reduce((acc, p) => acc + p.score, 0) / 3;
    const velocityDiff = currentVelocity - previousVelocity;

    const topNegativeDriver = impactDrivers.find(d => d.sentiment === 'negative');
    const topPositiveDriver = impactDrivers.find(d => d.sentiment === 'positive');

    const topStaff = topEntities.length > 0 ? topEntities[0] : null;

    return (
        <section className="space-y-4 mb-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold tracking-tight text-slate-800 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                    AI Action Center
                </h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {/* Insight 1: Sentiment Velocity */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="relative overflow-hidden h-full border-none shadow-md bg-gradient-to-br from-indigo-50 to-white hover:shadow-lg transition-all duration-300 group">
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-indigo-900 flex items-center justify-between">
                                Sentiment Velocity
                                <TrendingUp className={cn("h-4 w-4", velocityDiff >= 0 ? "text-emerald-600" : "text-amber-600 rotate-180")} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-3">
                            <div>
                                <div className="text-2xl font-bold text-slate-800 flex items-baseline gap-2">
                                    {Math.round(currentVelocity)}%
                                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full bg-white/50 border", velocityDiff >= 0 ? "text-emerald-700 border-emerald-200" : "text-amber-700 border-amber-200")}>
                                        {velocityDiff > 0 ? '+' : ''}{Math.round(velocityDiff)}%
                                    </span>
                                </div>
                                <div className="h-8 w-full mt-2 flex items-end gap-1">
                                    {sentimentTrend.map((point, i) => (
                                        <div
                                            key={i}
                                            className="flex-1 bg-indigo-500/20 rounded-t-sm hover:bg-indigo-500/40 transition-colors relative group/bar"
                                            style={{ height: `${point.score}%` }}
                                        >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/bar:block text-[10px] bg-slate-800 text-white px-1 rounded whitespace-nowrap z-20">
                                                {point.date.split('-').slice(1).join('/')}: {point.score}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    14-day tracking. {velocityDiff >= 0 ? "Momentum is positive." : "Momentum is slowing down."}
                                </p>
                            </div>
                        </CardContent>
                        {/* Decorative Background */}
                        <div className="absolute right-0 top-0 h-32 w-32 bg-indigo-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
                    </Card>
                </motion.div>

                {/* Insight 2: Key Impact Drivers */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="relative overflow-hidden h-full border-none shadow-md bg-gradient-to-br from-amber-50 to-white hover:shadow-lg transition-all duration-300 group">
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-amber-900 flex items-center justify-between">
                                Impact Drivers
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-4">
                            {topNegativeDriver && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-lg">👇</div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-800">{topNegativeDriver.topic}</div>
                                            <div className="text-xs text-slate-500"> dragging rating down</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-red-600">
                                        {topNegativeDriver.impactScore.toFixed(1)} impact
                                    </div>
                                </div>
                            )}

                            {topPositiveDriver && (
                                <div className="flex items-center justify-between pt-2 border-t border-amber-100/50">
                                    <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-lg">☝️</div>
                                        <div>
                                            <div className="text-sm font-semibold text-slate-800">{topPositiveDriver.topic}</div>
                                            <div className="text-xs text-slate-500"> boosting your score</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-emerald-600">
                                        +{topPositiveDriver.impactScore.toFixed(1)} impact
                                    </div>
                                </div>
                            )}

                            {!topNegativeDriver && !topPositiveDriver && (
                                <div className="text-sm text-slate-500 italic">Not enough data to calculate impact drivers yet.</div>
                            )}
                        </CardContent>
                        <div className="absolute right-0 bottom-0 h-24 w-24 bg-amber-500/10 blur-2xl rounded-full -mr-6 -mb-6" />
                    </Card>
                </motion.div>

                {/* Insight 3: Staff Spotlight */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card className="relative overflow-hidden h-full border-none shadow-md bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-all duration-300 group">
                        <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-sm font-medium text-purple-900 flex items-center justify-between">
                                Spotlight Mention
                                <Megaphone className="h-4 w-4 text-purple-600" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-3">
                            {topStaff ? (
                                <div>
                                    <div className="text-2xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                                        "{topStaff.entity}"
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">
                                        is a star! Mentioned positively in <span className="font-medium text-slate-700">{topStaff.count}</span> recent reviews.
                                    </p>
                                    <div className="pt-2">
                                        <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white border-none shadow-md shadow-purple-200 text-xs h-8">
                                            Recognize {topStaff.entity}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-slate-500 italic pt-2">
                                    No specific staff or items trending in recent reviews.
                                </div>
                            )}
                        </CardContent>
                        <div className="absolute right-0 top-0 h-32 w-32 bg-purple-500/5 blur-3xl rounded-full -mr-10 -mt-10" />
                    </Card>
                </motion.div>
            </div>
        </section>
    );
}
