import { DailySentimentStat } from '@/app/actions/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface SentimentTrendProps {
    stats: DailySentimentStat[];
}

export function SentimentTrend({ stats }: SentimentTrendProps) {
    // Data is now pre-aggregated on the server
    const data = stats;

    return (
        <Card className="col-span-4 shadow-sm border-0 bg-white/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Health & Volume Pulse</CardTitle>
                <CardDescription>Net Sentiment overlaid on Review Volume</CardDescription>
            </CardHeader>
            <CardContent className="pl-0">
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="sentimentGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#3b82f6" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                                <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#e2e8f0" stopOpacity={0.8} />
                                    <stop offset="100%" stopColor="#f1f5f9" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                            <XAxis
                                dataKey="date"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                minTickGap={30}
                                tick={{ fill: '#94a3b8' }}
                            />

                            {/* Left Axis: Net Sentiment */}
                            <YAxis
                                yAxisId="left"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#94a3b8' }}
                                tickFormatter={(value) => value > 0 ? `+${value}` : `${value}`}
                            />

                            {/* Right Axis: Volume */}
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#cbd5e1' }}
                            />

                            <Tooltip
                                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }}
                                content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="rounded-lg border bg-white/90 p-3 shadow-lg backdrop-blur-md ring-1 ring-black/5">
                                                <p className="mb-2 text-sm font-medium text-gray-900">{label}</p>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-gray-500">Net Score:</span>
                                                    <span className="font-bold text-gray-900">{payload[1].value}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                                                    <span className="text-gray-500">Volume:</span>
                                                    <span className="font-bold text-gray-900">{payload[0].value} reviews</span>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />

                            <ReferenceLine y={0} yAxisId="left" stroke="#e2e8f0" strokeDasharray="3 3" />

                            {/* Volume Bars (Background) */}
                            <Bar
                                yAxisId="right"
                                dataKey="total"
                                fill="url(#volumeGradient)"
                                barSize={24}
                                radius={[4, 4, 0, 0]}
                            />

                            {/* Sentiment Line (Foreground) */}
                            <Line
                                yAxisId="left"
                                type="monotone"
                                dataKey="netSentiment"
                                stroke="url(#sentimentGradient)"
                                strokeWidth={3}
                                dot={false}
                                activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
