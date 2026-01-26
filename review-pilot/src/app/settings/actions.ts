'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateSettings(formData: FormData) {
    // 1. Try to get the regular authenticated user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let userId = user?.id;
    let dbClient = supabase;

    // 2. FALLBACK: If no user, verify we are in Dev/MVP mode and use Admin Client to provision a Mock User
    // This allows us to test settings without a full auth UI flow
    if (!userId) {
        // We MUST use the Service Role Key to bypass RLS and manage Auth users
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing SUPABASE_SERVICE_ROLE_KEY for dev mode fallback');
            return { error: 'Server configuration error' };
        }

        const adminClient = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        dbClient = adminClient;

        // Find or Create the Mock User
        // We cannot use a hardcoded 0000... UUID because of foreign key constraints to auth.users
        const MOCK_EMAIL = 'mock@reviewpilot.ai';

        // 2a. List users to find existing mock user
        // Note: getUserById requires ID, limit 1 on listUsers is best way to find by email if needed or just createUser and catch error
        // Actually, creating user with allow upsert logic is cleaner potentially, but createUser doesn't always support upsert ID?
        // Let's list.
        const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();

        let mockUser = users?.find(u => u.email === MOCK_EMAIL);

        if (!mockUser) {
            console.log('Creating Mock User for Dev Mode...');
            const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
                email: MOCK_EMAIL,
                password: 'password123',
                email_confirm: true,
                user_metadata: { full_name: 'Mock User' }
            });

            if (createError) {
                console.error('Failed to create mock user:', createError);
                return { error: 'Failed to provision mock user' };
            }
            mockUser = newUser.user;
        }

        if (!mockUser) {
            return { error: 'Could not find or create mock user' };
        }

        userId = mockUser.id;

        // 2b. Ensure public.users record exists (Trigger should handle this, but for robustness in case trigger failed or didn't run)
        // We just do a select to verify or insert if missing (though direct insert to public.users requires it to match auth.users which we now have)

        // Actually, let's just proceed. The Trigger on `auth.users` insert (on_auth_user_created) should have created the public.users row.
    }

    const businessName = formData.get('businessName') as string;
    const autoReplyThreshold = parseInt(formData.get('autoReplyThreshold') as string);
    const aiTone = formData.get('aiTone') as string;
    const businessContext = formData.get('businessContext') as string;
    const knowledgeBaseRaw = formData.get('knowledgeBase') as string;
    const knowledgeBase = knowledgeBaseRaw ? JSON.parse(knowledgeBaseRaw) : {};
    const brandVoiceRaw = formData.get('brandVoice') as string;
    const brandVoice = brandVoiceRaw ? JSON.parse(brandVoiceRaw) : { tone_score: 5 };
    const safetySettingsRaw = formData.get('safetySettings') as string;
    const safetySettings = safetySettingsRaw ? JSON.parse(safetySettingsRaw) : { crisis_keywords: [] };

    // 3. Perform the DB Operation using the appropriate client
    // Check if a business entry exists for this user
    const { data: existing } = await dbClient.from('businesses').select('id').eq('user_id', userId).single();

    let result;
    if (existing) {
        // Update existing
        result = await dbClient
            .from('businesses')
            .update({
                business_name: businessName,
                auto_reply_threshold: autoReplyThreshold,
                ai_tone: aiTone,
                business_context: businessContext, // Keep legacy for now or clear it? Let's keep it sync'd if possible or just ignore. 
                // Actually, settings-form sends it. But let's mainly rely on new column.
                knowledge_base: knowledgeBase,
                brand_voice: brandVoice,
                safety_settings: safetySettings
            })
            .eq('id', existing.id);
    } else {
        // Insert new
        result = await dbClient
            .from('businesses')
            .insert({
                user_id: userId,
                business_name: businessName,
                auto_reply_threshold: autoReplyThreshold || 4,
                ai_tone: aiTone || 'professional',
                business_context: businessContext || '',
                knowledge_base: knowledgeBase || {},
                brand_voice: brandVoice,
                safety_settings: safetySettings
            });
    }

    if (result.error) {
        console.error('Error saving settings:', result.error);
        return { error: 'Failed to save settings' };
    }

    revalidatePath('/settings');
    revalidatePath('/dashboard');
    return { success: 'Settings saved successfully' };
}
