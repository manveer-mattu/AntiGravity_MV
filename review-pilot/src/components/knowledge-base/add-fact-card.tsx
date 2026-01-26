'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface AddFactCardProps {
    label: string;
    onClick: () => void;
}

export function AddFactCard({ label, onClick }: AddFactCardProps) {
    return (
        <Card
            className="group relative overflow-hidden bg-gray-50/50 border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-300 cursor-pointer flex items-center justify-center h-full min-h-[140px]"
            onClick={onClick}
        >
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-indigo-700 transition-colors">
                    {label}
                </span>
            </CardContent>
        </Card>
    );
}
