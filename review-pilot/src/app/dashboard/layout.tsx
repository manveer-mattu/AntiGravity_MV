import { Button } from '@/components/ui/button';
import { SubscribeButton } from '@/components/subscribe-button';
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar (Server Component — no interactive state) */}
            <aside className="w-64 bg-card border-r hidden md:block p-6 flex flex-col fixed h-full z-10">
                <h1 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-2">
                    ReviewPilot.ai
                </h1>
                <nav className="space-y-2 flex-1">
                    <Button variant="secondary" className="w-full justify-start">
                        Dashboard
                    </Button>
                    <Link href="/settings">
                        <Button variant="ghost" className="w-full justify-start">
                            Settings
                        </Button>
                    </Link>
                </nav>
                <div className="pt-4">
                    <SubscribeButton />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 md:ml-64">
                {children}
            </main>
        </div>
    );
}
