import { SubscribeButton } from '@/components/subscribe-button';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId = user?.id;
    let dbClient = supabase;

    // FALLBACK for Dev Mode: Find the real Mock User ID if not authenticated
    if (!userId) {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
            const { createClient: createAdminClient } = await import('@supabase/supabase-js');
            const adminClient = createAdminClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY
            );

            const { data: { users } } = await adminClient.auth.admin.listUsers();
            const mockUser = users?.find(u => u.email === 'mock@reviewpilot.ai');
            if (mockUser) {
                userId = mockUser.id;
                dbClient = adminClient as any; // Cast to any or compatible type if needed, usually compatible
            }
        }
    }

    // Default fallback if all else fails (likely won't match anything in DB)
    if (!userId) userId = '00000000-0000-0000-0000-000000000000';

    // Fetch existing settings
    let initialData = null;
    if (userId) {
        const { data } = await dbClient
            .from('businesses')
            .select('business_name, auto_reply_threshold, ai_tone, business_context')
            .eq('user_id', userId)
            .single();

        if (data) {
            initialData = {
                businessName: data.business_name,
                autoReplyThreshold: data.auto_reply_threshold,
                aiTone: data.ai_tone,
                businessContext: data.business_context
            };
        }
    }

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar (Simplified for MVP) */}
            <aside className="w-64 bg-card border-r hidden md:block p-6 flex flex-col">
                <h1 className="text-xl font-bold tracking-tight mb-8 flex items-center gap-2">
                    ReviewPilot.ai
                </h1>
                <nav className="space-y-2 flex-1">
                    <Link href="/dashboard">
                        <Button variant="ghost" className="w-full justify-start">
                            Dashboard
                        </Button>
                    </Link>
                    <Button variant="secondary" className="w-full justify-start">
                        Settings
                    </Button>
                </nav>
                <div className="pt-4">
                    <SubscribeButton />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="mb-8 flex items-center gap-4">
                    <Link href="/dashboard" className="md:hidden">
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                        <p className="text-muted-foreground">
                            Configure your business profile and preferences.
                        </p>
                    </div>
                </header>

                <SettingsForm initialData={initialData} />
            </main>
        </div>
    );
}
