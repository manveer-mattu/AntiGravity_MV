'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, TrendingUp } from 'lucide-react';

export function GeoHealthWidget() {
    return (
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-0 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />

            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-indigo-900 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    GEO Strategy Health
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600">Local Authority Score</span>
                            <span className="font-bold text-indigo-700">84/100</span>
                        </div>
                        <Progress value={84} className="h-1.5 bg-indigo-100" />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <div className="flex-1 bg-white/60 p-2 rounded border border-indigo-100/50">
                            <p className="text-[10px] text-gray-500 uppercase font-semibold">Top Keyword</p>
                            <p className="text-xs font-medium text-indigo-900 break-words">&quot;Best Coffee Shoreditch&quot;</p>
                        </div>
                        <div className="flex-1 bg-white/60 p-2 rounded border border-indigo-100/50">
                            <p className="text-[10px] text-gray-500 uppercase font-semibold">AI Pick Rate</p>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                <p className="text-xs font-medium text-indigo-900">+12%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
