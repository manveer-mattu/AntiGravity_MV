"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function SubscribeButton() {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    returnUrl: window.location.href,
                }),
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Failed to start checkout", error);
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg"
        >
            {loading ? "Redirecting..." : "Upgrade to Pro ($29/mo)"}
        </Button>
    );
}
