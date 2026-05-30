'use client';

import { useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeCheck, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string);

export default function CheckoutPage() {
    const fetchClientSecret = useCallback(() => {
        return fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                returnUrl: `${window.location.origin}/checkout/return`,
            }),
        })
            .then((res) => res.json())
            .then((data) => data.clientSecret);
    }, []);

    const options = { fetchClientSecret };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center p-2 bg-indigo-100 rounded-full mb-4">
                        <Sparkles className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                        Upgrade to ReviewPilot <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Pro</span>
                    </h1>
                    <p className="mt-4 max-w-2xl text-xl text-slate-500 mx-auto">
                        Automate your Google Review replies with AI, build customer trust, and save hours every week.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Value Proposition Column */}
                    <div className="order-2 lg:order-1 space-y-6">
                        <Card className="border-none shadow-xl bg-white overflow-hidden" style={{ borderTop: "4px solid #4f46e5" }}>
                            <CardHeader className="pb-4 bg-gradient-to-b from-indigo-50/50 to-white">
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <BadgeCheck className="text-indigo-600 h-6 w-6" />
                                    What's included in Pro?
                                </CardTitle>
                                <CardDescription className="text-base">Everything you need to manage your reputation on autopilot.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Unlimited AI Replies</h3>
                                            <p className="text-slate-500 text-sm">Automatically generate and post replies to all incoming reviews.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Custom Brand Voice & DNA</h3>
                                            <p className="text-slate-500 text-sm">Train the AI on your specific business context, team, and policies.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Advanced Analytics Dashboard</h3>
                                            <p className="text-slate-500 text-sm">Track sentiment, rating distribution, and topic trends over time.</p>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                                <svg fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">Safety Gates</h3>
                                            <p className="text-slate-500 text-sm">Hold negative or sensitive reviews for manual approval.</p>
                                        </div>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <div className="flex items-center gap-4 text-sm text-slate-500 justify-center">
                            <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Secure Payment</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Zap className="h-4 w-4" /> Instant Activation</span>
                            <span>•</span>
                            <span>Cancel Anytime</span>
                        </div>
                        
                        <div className="text-center">
                            <Link href="/settings">
                                <Button variant="ghost" className="text-slate-500 hover:text-slate-900">
                                    Return to Settings
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Checkout Column */}
                    <div className="order-1 lg:order-2">
                        <Card className="border-none shadow-2xl bg-white overflow-hidden relative">
                            {/* Decorative background blur */}
                            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-violet-500/10 blur-2xl pointer-events-none"></div>
                            
                            <CardContent className="p-1 sm:p-4 min-h-[500px]">
                                <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
                                    <EmbeddedCheckout className="w-full" />
                                </EmbeddedCheckoutProvider>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
