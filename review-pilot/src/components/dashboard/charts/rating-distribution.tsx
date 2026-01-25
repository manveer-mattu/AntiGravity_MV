'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GoogleReview } from '@/lib/google-business-mock';

interface RatingDistributionProps {
    reviews: GoogleReview[];
}

export function RatingDistribution({ reviews }: RatingDistributionProps) {
    const data = useMemo(() => {
        const distribution = [
            { rating: '5 Stars', count: 0, color: '#22c55e' },
            { rating: '4 Stars', count: 0, color: '#84cc16' },
            { rating: '3 Stars', count: 0, color: '#eab308' },
            { rating: '2 Stars', count: 0, color: '#f97316' },
            { rating: '1 Star', count: 0, color: '#ef4444' },
        ];

        reviews.forEach(review => {
            if (review.starRating >= 1 && review.starRating <= 5) {
                // Determine index based on 5 - rating (5->0, 4->1, etc.)
                const index = 5 - review.starRating;
                if (distribution[index]) {
                    distribution[index].count++;
                }
            }
        });

        // For horizontal chart, it often looks better 5 stars at top.
        // Our current array is [5, 4, 3, 2, 1], which will render top-down in Recharts if layout="vertical".
        return distribution;
    }, [reviews]);

    return (
        <Card className="col-span-2">
            <CardHeader>
                <CardTitle>Rating Breakdown</CardTitle>
                <CardDescription>Distribution of star ratings</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="rating"
                                type="category"
                                width={50}
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => value.replace(' Stars', '').replace(' Star', '★')}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px' }}
                            />
                            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#f1f5f9', radius: 4 }}>
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
