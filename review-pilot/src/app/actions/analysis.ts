'use server';

import { GoogleReview } from '@/lib/google-business-mock';
import { analyzeSentiment } from '@/lib/ai-client';

export async function enrichReviewsWithAI(reviews: GoogleReview[]): Promise<GoogleReview[]> {
    // Limit to latest 10 to save tokens/time for this demo
    const reviewsToAnalyze = reviews.slice(0, 10);
    const remainingReviews = reviews.slice(10);

    const enrichedResults = await Promise.all(
        reviewsToAnalyze.map(async (review) => {
            // Optimization: Skip if we already have sentiment data (optional, but good for real app)
            // For demo, we force re-analysis to show the "State of the Art" difference
            const analysis = await analyzeSentiment(review.content);

            return {
                ...review,
                sentiment: analysis.sentiment,
                topics: analysis.topics, // Replace topics entirely (AI only)
                entities: analysis.entities
            };
        })
    );

    return [...enrichedResults, ...remainingReviews];
}
