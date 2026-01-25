'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Trash2, Edit2, Zap } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FactCardProps {
    title: string;
    subtitle?: string;
    status: 'indexed' | 'pending';
    type: 'team' | 'geo' | 'menu' | 'policy';
    onEdit?: () => void;
    onDelete?: () => void;
}

export function FactCard({ title, subtitle, status, type, onEdit, onDelete }: FactCardProps) {
    return (
        <Card className="group relative overflow-hidden backdrop-blur-sm bg-white/50 border-0 shadow-sm hover:shadow-md transition-all duration-300">
            {/* Memory Indicator Pulse */}
            {status === 'indexed' && (
                <div className="absolute right-3 top-3 h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                </div>
            )}

            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="opacity-50 text-[10px] uppercase tracking-wider">
                        {type}
                    </Badge>
                    <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32 bg-white backdrop-blur-md border shadow-lg z-50">
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onSelect={() => {
                                    console.log("Edit clicked");
                                    onEdit?.();
                                }}
                            >
                                <Edit2 className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onSelect={() => {
                                    console.log("Delete clicked");
                                    onDelete?.();
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <h3 className="font-semibold text-gray-900 tracking-tight leading-snug break-words">
                    {title}
                </h3>
                {subtitle && (
                    <p className="text-sm text-gray-500 mt-1 break-words">
                        {subtitle}
                    </p>
                )}

                {/* Progressive Disclosure: Only visible on hover/active */}
                <div className="mt-4 pt-3 border-t border-gray-100/50 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
                    <span className="text-xs text-muted-foreground flex items-center">
                        <Zap className="h-3 w-3 mr-1 text-yellow-500" /> High Influence
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={onEdit}>
                        Refine
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
