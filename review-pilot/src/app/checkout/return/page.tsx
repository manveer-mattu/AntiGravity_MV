'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutReturnPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        if (!sessionId) {
            setStatus('error');
            return;
        }

        // Ideally we would fetch the session status from our backend here
        // to verify the payment was successful. For now, we assume success if sessionId exists.
        // A real implementation would hit an API like /api/checkout-session?session_id=${sessionId}
        setStatus('success');
    }, [sessionId]);

    return (
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
            <Card className="max-w-md w-full border-none shadow-2xl relative overflow-hidden text-center p-6">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-green-500/10 blur-2xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none"></div>
                
                {status === 'loading' && (
                    <div className="py-12 flex flex-col items-center justify-center">
                        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
                        <h2 className="text-xl font-semibold">Verifying payment...</h2>
                    </div>
                )}
                
                {status === 'success' && (
                    <>
                        <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome to Pro!</h1>
                        <p className="text-slate-500 mb-8">
                            Your subscription was successful. You now have access to unlimited AI replies and advanced analytics.
                        </p>
                        <Link href="/dashboard" className="inline-block w-full">
                            <Button className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 h-12 text-lg font-medium shadow-lg group">
                                <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                                Go to Dashboard
                            </Button>
                        </Link>
                    </>
                )}
                
                {status === 'error' && (
                    <>
                        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Something went wrong</h1>
                        <p className="text-slate-500 mb-8">
                            We couldn't verify your session. Please try again or contact support.
                        </p>
                        <Link href="/checkout" className="inline-block w-full">
                            <Button variant="outline" className="w-full h-12 text-lg">
                                Return to Checkout
                            </Button>
                        </Link>
                    </>
                )}
            </Card>
        </div>
    );
}
