'use client';

import { useState, useMemo } from 'react';
import { CardContent } from '@/components/ui/card';
import { Star, TrendingUp, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GoogleReview } from '@/lib/google-business-mock';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { format, startOfMonth, parseISO, compareAsc } from 'date-fns';

interface AverageRatingTileProps {
    reviews: GoogleReview[];
    avgRating: number;
}

export function AverageRatingTile({ reviews, avgRating }: AverageRatingTileProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Calculate rating distribution
    const distribution = useMemo(() => {
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const rating = Math.round(r.starRating);
            if (rating >= 1 && rating <= 5) {
                counts[rating as keyof typeof counts]++;
            }
        });
        const total = reviews.length || 1;
        return Object.entries(counts)
            .sort((a, b) => Number(b[0]) - Number(a[0]))
            .map(([stars, count]) => ({
                stars: Number(stars),
                count,
                percentage: (count / total) * 100
            }));
    }, [reviews]);

    // Calculate monthly trend data
    const trendData = useMemo(() => {
        const monthlyGroups: Record<string, { sum: number; count: number; date: Date }> = {};

        reviews.forEach(r => {
            if (!r.postedAt) return;
            const date = parseISO(r.postedAt);
            const key = format(startOfMonth(date), 'yyyy-MM');

            if (!monthlyGroups[key]) {
                monthlyGroups[key] = { sum: 0, count: 0, date: startOfMonth(date) };
            }
            monthlyGroups[key].sum += r.starRating;
            monthlyGroups[key].count += 1;
        });

        return Object.values(monthlyGroups)
            .sort((a, b) => compareAsc(a.date, b.date))
            .map(item => ({
                date: format(item.date, 'MMM'),
                rating: item.sum / item.count,
                fullDate: format(item.date, 'MMMM yyyy')
            }));
    }, [reviews]);

    return (
        <div className={cn("relative h-full w-full", isExpanded ? "z-50" : "z-0")}>
            {/* 1. Placeholder in the grid (keeps layout stable when expanded) */}
            <div className={cn("absolute inset-0", isExpanded && "opacity-0")} />

            {/* 2. The Active Tile (Layout Animated) */}
            <motion.div
                className={cn(
                    isExpanded
                        ? "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-10 pointer-events-none"
                        : "absolute inset-0 z-10"
                )}
            >
                {/* Backdrop overlay (only when expanded) */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            className="absolute inset-0 bg-black/5 pointer-events-auto transition-all duration-500"
                            onClick={() => setIsExpanded(false)}
                        />
                    )}
                </AnimatePresence>

                {/* The Card Itself */}
                <motion.div
                    layoutId="average-rating-card"
                    onClick={() => !isExpanded && setIsExpanded(true)}
                    className={cn(
                        "relative bg-white overflow-hidden pointer-events-auto",
                        isExpanded
                            ? "w-full max-w-lg rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[90vh]"
                            : "w-full h-full rounded-xl border border-slate-100 shadow-sm hover:shadow-md cursor-pointer bg-gradient-to-br from-amber-50/50 to-white"
                    )}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                    <CardContent className={cn("p-6 h-full flex flex-col", isExpanded ? "gap-4" : "gap-2")}>

                        {/* Header Section */}
                        <div className="flex flex-row items-center justify-between shrink-0">
                            <motion.h3 layoutId="title" className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                                Average Rating
                            </motion.h3>
                            {isExpanded && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                                    className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            )}
                        </div>

                        {/* Main Stats Row */}
                        <div className={cn("flex", isExpanded ? "items-end justify-between gap-4" : "flex-col items-start")}>

                            {/* Big Number & Star */}
                            <motion.div layoutId="grid-view-rating" className="flex items-end gap-3 z-10 shrink-0">
                                <div className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 tabular-nums leading-none">
                                    {avgRating.toFixed(1)}
                                </div>
                                <div className="flex flex-col mb-1">
                                    <div className="flex text-amber-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("h-4 w-4", i < Math.round(avgRating) ? "fill-current" : "text-slate-200 fill-slate-200")} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium mt-0.5">Overall Score</span>
                                </div>
                            </motion.div>

                            {/* Expanded Content: Trend Chart */}
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="hidden sm:flex flex-col items-end w-48 h-24 mb-1"
                                >
                                    <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 mb-1 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                        <TrendingUp className="h-3 w-3" />
                                        <span>6-Month Trend</span>
                                    </div>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={trendData}>
                                            <defs>
                                                <linearGradient id="colorRatingMini" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Area
                                                type="monotone"
                                                dataKey="rating"
                                                stroke="#f59e0b"
                                                strokeWidth={2}
                                                fillOpacity={1}
                                                fill="url(#colorRatingMini)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}
                        </div>

                        {/* Review Count & Decor */}
                        <motion.div layout className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                {reviews.length} reviews
                            </span>
                            {!isExpanded && (
                                <span className="text-xs text-slate-400">Total volume</span>
                            )}
                        </motion.div>

                        {/* Histogram Section - Expanded Only */}
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: 0.15 }}
                                    className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4"
                                >
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rating Distribution</h4>
                                    <div className="space-y-2">
                                        {distribution.map((item, index) => (
                                            <motion.div
                                                key={item.stars}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.1 + (index * 0.03) }}
                                                className="flex items-center gap-3 h-6"
                                            >
                                                <div className="flex items-center gap-1 w-8 text-xs font-semibold text-slate-600">
                                                    <span>{item.stars}</span>
                                                    <Star className="h-3 w-3 fill-slate-300 text-slate-300" />
                                                </div>

                                                <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.percentage}%` }}
                                                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                                                        className={cn(
                                                            "h-full rounded-full shadow-sm",
                                                            item.stars >= 4 ? "bg-gradient-to-r from-emerald-400 to-green-500" :
                                                                item.stars === 3 ? "bg-gradient-to-r from-yellow-400 to-amber-500" :
                                                                    "bg-gradient-to-r from-orange-400 to-red-500"
                                                        )}
                                                    />
                                                </div>

                                                <div className="w-16 text-[10px] text-right tabular-nums flex justify-end gap-1">
                                                    <span className="font-medium text-slate-600">{item.count}</span>
                                                    <span className="text-slate-400">({Math.round(item.percentage)}%)</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Background Decor (Grid View) */}
                        {!isExpanded && (
                            <Star className="absolute -bottom-6 -right-6 h-32 w-32 text-amber-500/5 rotate-12 pointer-events-none" />
                        )}
                    </CardContent>
                </motion.div>
            </motion.div>
        </div>
    );
}
