'use server';

import { createClient } from '@supabase/supabase-js';
import { GoogleReview } from '@/lib/google-business-mock';

// Define the shape if not perfectly matching GoogleReview, but it should be close.
// We will return GoogleReview[] to match the frontend expectation.

export async function getReviews(): Promise<GoogleReview[]> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const adminClient = createClient(supabaseUrl, serviceKey);

    // 1. Get Mock User
    const { data: { users } } = await adminClient.auth.admin.listUsers();
    const mockUser = users.find(u => u.email === 'mock@reviewpilot.ai');

    if (!mockUser) {
        console.error("Mock user not found");
        return [];
    }

    // 2. Get Business
    const { data: business } = await adminClient
        .from('businesses')
        .select('id')
        .eq('user_id', mockUser.id)
        .single();

    if (!business) {
        console.error("Business not found for mock user");
        return [];
    }

    // 3. Get Reviews
    const { data: reviews, error } = await adminClient
        .from('reviews')
        .select('*')
        .eq('business_id', business.id)
        .order('posted_at', { ascending: false });

    if (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }

    // 4. Seed if empty
    if (!reviews || reviews.length === 0) {
        console.log("No reviews found, seeding...");

        const MOCK_REVIEWS_TO_SEED = [
            {
                reviewer_name: 'Alice Johnson',
                star_rating: 5,
                content: 'Absolutely loved the service! The team was professional and quick.',
                status: 'pending',
                posted_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            },
            {
                reviewer_name: 'Mark Smith',
                star_rating: 2,
                content: 'Waited for 30 minutes and no one showed up. Very disappointed.',
                status: 'pending',
                posted_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            },
            {
                reviewer_name: 'Tom Wilson',
                star_rating: 3,
                content: 'Food was good but service was slow.',
                reply_content: 'Hi Tom, sorry about the wait. We are training new staff.',
                status: 'draft',
                posted_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
            },
            {
                reviewer_name: 'Sarah Davis',
                star_rating: 4,
                content: 'Great experience overall, but parking was a bit of a hassle.',
                reply_content: 'Hi Sarah, glad you had a great experience! We are working on improving our parking situation. Hope to see you again soon!',
                status: 'replied',
                posted_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
            }
        ];

        const reviewsToInsert = MOCK_REVIEWS_TO_SEED.map(r => ({
            ...r,
            business_id: business.id
        }));

        const { data: insertedData, error: insertError } = await adminClient
            .from('reviews')
            .insert(reviewsToInsert)
            .select();

        if (insertError) {
            console.error("Error seeding reviews:", insertError);
            return [];
        }

        return (insertedData || []).map(mapDbReviewToFrontend);
    }

    return reviews.map(mapDbReviewToFrontend);
}

function mapDbReviewToFrontend(dbReview: any): GoogleReview {
    return {
        id: dbReview.id,
        reviewerName: dbReview.reviewer_name,
        starRating: dbReview.star_rating,
        content: dbReview.content,
        replyContent: dbReview.reply_content || undefined,
        status: dbReview.status as any,
        postedAt: dbReview.posted_at
    };
}
