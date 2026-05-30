"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SubscribeButton() {
    return (
        <Link href="/checkout" className="w-full block">
            <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg"
            >
                Upgrade to Pro ($29/mo)
            </Button>
        </Link>
    );
}
