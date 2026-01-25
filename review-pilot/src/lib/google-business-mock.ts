export type ReviewStatus = 'pending' | 'draft' | 'replied';

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface GoogleReview {
    id: string;
    reviewerName: string;
    starRating: number;
    content: string;
    replyContent?: string;
    status: ReviewStatus;
    postedAt: string;
    isFallback?: boolean;
    sentiment?: Sentiment;
    topics?: string[];
}

const TOPICS_LIST = ['Food', 'Service', 'Price', 'Ambiance', 'Cleanliness', 'Staff', 'Speed', 'Parking', 'Music', 'Drinks'];
const NAMES_LIST = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Ryan', 'Sophia', 'Thomas'];
const COMMENTS_POSITIVE = [
    'Absolutely loved it!', 'Great service and amazing food.', 'Will definitely come back.', 'The staff was so helpful.', 'Best experience in a long time.', 'Highly recommended!', 'Five stars for sure.', 'A hidden gem.', 'Delicious meals and great atmosphere.', 'Everything was perfect.'
];
const COMMENTS_NEUTRAL = [
    'It was okay.', 'Food was good but service was slow.', 'Decent place but a bit pricey.', 'Nothing special.', 'Average experience.', 'Good but could be better.', 'Not bad, not great.', 'Okay for a quick bite.', 'Standard quality.', 'Mixed feelings about this place.'
];
const COMMENTS_NEGATIVE = [
    'Terrible service.', 'Food was cold.', 'Rude staff.', 'Way too expensive for what you get.', 'Dirty tables.', 'Waited forever.', 'Never coming back.', 'Disappointing experience.', 'Avoid this place.', 'Total waste of money.'
];

function generateMockReviews(count: number): GoogleReview[] {
    const reviews: GoogleReview[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const isPositive = Math.random() > 0.4; // 60% positive bias
        const isNeutral = !isPositive && Math.random() > 0.5;

        let sentiment: Sentiment = 'positive';
        let rating = 5;
        let pool = COMMENTS_POSITIVE;

        if (isNeutral) {
            sentiment = 'neutral';
            rating = 3 + Math.floor(Math.random() * 1); // 3 or 4
            pool = COMMENTS_NEUTRAL;
        } else if (!isPositive) {
            sentiment = 'negative';
            rating = 1 + Math.floor(Math.random() * 2); // 1 or 2
            pool = COMMENTS_NEGATIVE;
        } else {
            // Positive
            rating = 4 + Math.floor(Math.random() * 2); // 4 or 5
        }

        // Random date within last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const postedAt = new Date(now - 1000 * 60 * 60 * 24 * daysAgo).toISOString();

        // Random topics (1 to 3)
        const numTopics = 1 + Math.floor(Math.random() * 3);
        const reviewTopics = [];
        for (let j = 0; j < numTopics; j++) {
            reviewTopics.push(TOPICS_LIST[Math.floor(Math.random() * TOPICS_LIST.length)]);
        }

        reviews.push({
            id: `gen-${i}`,
            reviewerName: `${NAMES_LIST[Math.floor(Math.random() * NAMES_LIST.length)]} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
            starRating: rating,
            content: pool[Math.floor(Math.random() * pool.length)],
            status: Math.random() > 0.8 ? 'pending' : 'replied',
            postedAt,
            sentiment,
            topics: Array.from(new Set(reviewTopics)) // Unique topics
        });
    }

    // Sort by date desc
    return reviews.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

// Generate ~100 reviews
const MOCK_REVIEWS: GoogleReview[] = generateMockReviews(100);

export async function fetchMockReviews(): Promise<GoogleReview[]> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));
    return MOCK_REVIEWS;
}

export async function postMockReply(reviewId: string, replyText: string): Promise<void> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log(`[MOCK] Replied to review ${reviewId} with: ${replyText}`);
}
