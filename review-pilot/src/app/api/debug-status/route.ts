import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    try {
        const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Check if this is loaded

        if (!sbUrl || !sbKey) {
            return NextResponse.json({ error: "Missing Env Vars", sbUrl: !!sbUrl, sbKey: !!sbKey });
        }

        const adminClient = createClient(sbUrl, sbKey);

        // 1. Check Users
        const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();

        // 2. Check Businesses Schema (by trying to select context)
        // We'll try to fetch ANY business
        const { data: businessData, error: businessError } = await adminClient
            .from('businesses')
            .select('id, business_name, business_context')
            .limit(1);

        return NextResponse.json({
            status: "ok",
            env: {
                hasUrl: !!sbUrl,
                hasServiceKey: !!sbKey
            },
            users: {
                count: usersData?.users.length,
                emails: usersData?.users.map(u => u.email),
                error: usersError
            },
            business: {
                data: businessData,
                error: businessError
            }
        });

    } catch (e) {
        return NextResponse.json({ error: "Crash", details: String(e) }, { status: 500 });
    }
}
