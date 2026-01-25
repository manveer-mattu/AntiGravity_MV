'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { GoogleReview } from '@/lib/google-business-mock';

interface TopicSentimentProps {
    reviews: GoogleReview[];
}

export function TopicSentiment({ reviews }: TopicSentimentProps) {
    const data = useMemo(() => {
        const topicMap = new Map<string, { topic: string; positive: number; negative: number; total: number }>();

        reviews.forEach(review => {
            review.topics?.forEach(topic => {
                if (!topicMap.has(topic)) {
                    topicMap.set(topic, { topic, positive: 0, negative: 0, total: 0 });
                }
                const stats = topicMap.get(topic)!;
                stats.total++;
                if (review.sentiment === 'positive') stats.positive++;
                else if (review.sentiment === 'negative') stats.negative++;
                // Neutral doesn't contribute to colored bars in this specific view, or could be a third bar.
                // For "Health", Pos vs Neg is most important.
            });
        });

        // Filter out low volume topics and sort by total mentions
        return Array.from(topicMap.values())
            .filter(t => t.total > 1) // Only show topics with >1 mention
            .sort((a, b) => b.total - a.total)
            .slice(0, 5); // Top 5 topics
    }, [reviews]);

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Topic Insight</CardTitle>
                <CardDescription>Sentiment driver breakdown</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="topic"
                                type="category"
                                width={80}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px' }}
                                cursor={{ fill: 'transparent' }}
                            />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="positive" name="Positive" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} barSize={20} />
                            <Bar dataKey="negative" name="Negative" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
