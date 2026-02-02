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
    entities?: string[];
}

const TOPICS_LIST = ['Food', 'Service', 'Price', 'Ambiance', 'Cleanliness', 'Staff', 'Speed', 'Parking', 'Music', 'Drinks'];
const NAMES_LIST = ['Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter', 'Quinn', 'Ryan', 'Sophia', 'Thomas', 'James', 'Lucas', 'Ethan', 'Alexander', 'Isabella', 'Ava', 'Mia', 'Charlotte', 'Amelia', 'Harper'];

// Expanded Comment Templates for Variety
const POSITIVE_FOOD = [
    'The pasta was absolutely divine!', 'Best pizza I have had in years.', 'The truffle fries are a must-try.', 'Incredible extensive menu.', 'Dessert was the highlight of the night.', 'Fresh ingredients and great presentation.', 'Flavor explosion in every bite!'
];
const POSITIVE_SERVICE = [
    'The staff went above and beyond.', 'Our server was so attentive and kind.', 'Received a warm welcome upon entering.', 'Service was quick despite the busy rush.', 'Everyone had a smile on their face.', 'Felt treated like royalty.'
];
const POSITIVE_AMBIANCE = [
    'Love the cozy vibe here.', 'Perfect lighting for a date night.', 'Great music playlist!', 'The decor is stunning.', 'Very clean and organized.', 'A truly relaxing atmosphere.'
];

const NEUTRAL_MIXED = [
    'Food was good but the service was slow.', 'Decent place, but a bit pricey for the portion size.', 'Nice atmosphere, but the music was too loud.', 'It was okay, nothing to write home about.', 'Standard experience, met expectations.', 'Good for a quick bite, but not a special occasion.', 'The main course was great, but appetizers were cold.'
];

const NEGATIVE_ISSUES = [
    'Waited over 45 minutes for our table.', 'The food arrived cold and tasteless.', 'Rude staff member at the front desk.', 'Way too expensive for the quality.', 'Tables were sticky and dirty.', 'Order was completely wrong.', 'Impossible to find parking nearby.', 'Never coming back, terrible experience.'
];

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function generateMockReviews(count: number): GoogleReview[] {
    const reviews: GoogleReview[] = [];
    const now = Date.now();

    for (let i = 0; i < count; i++) {
        const rand = Math.random();

        let sentiment: Sentiment;
        let rating: number;
        let content: string;

        if (rand > 0.35) {
            // 65% Positive
            sentiment = 'positive';
            rating = 4 + (Math.random() > 0.7 ? 1 : 0); // Mostly 4s and 5s
            // Mix of food, service, ambiance (mostly food)
            const type = Math.random();
            if (type < 0.5) content = getRandomElement(POSITIVE_FOOD);
            else if (type < 0.8) content = getRandomElement(POSITIVE_SERVICE);
            else content = getRandomElement(POSITIVE_AMBIANCE);

            // Add some generic praise occasionally
            if (Math.random() > 0.8) content += " Highly recommended!";

        } else if (rand > 0.15) {
            // 20% Neutral
            sentiment = 'neutral';
            rating = 3;
            content = getRandomElement(NEUTRAL_MIXED);
        } else {
            // 15% Negative
            sentiment = 'negative';
            rating = 1 + (Math.random() > 0.5 ? 1 : 0); // 1 or 2
            content = getRandomElement(NEGATIVE_ISSUES);
        }

        // Random date within last 6 months (approx 180 days)
        const daysAgo = Math.floor(Math.random() * 180);
        // Add some time randomness within the day
        const timeOffset = Math.floor(Math.random() * 1000 * 60 * 60 * 12);
        const postedAt = new Date(now - (1000 * 60 * 60 * 24 * daysAgo) - timeOffset).toISOString();

        // Random topics (1 to 3)
        const numTopics = 1 + Math.floor(Math.random() * 3);
        const reviewTopics = [];
        for (let j = 0; j < numTopics; j++) {
            reviewTopics.push(getRandomElement(TOPICS_LIST));
        }

        reviews.push({
            id: `gen-${i}`,
            reviewerName: `${getRandomElement(NAMES_LIST)} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`,
            starRating: rating,
            content: content,
            status: Math.random() > 0.7 ? 'replied' : (Math.random() > 0.5 ? 'draft' : 'pending'), // Mix of statuses
            postedAt,
            sentiment,
            topics: Array.from(new Set(reviewTopics)) // Unique topics
        });
    }

    // Sort by date desc
    return reviews.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
}

// Generate 200 reviews
const MOCK_REVIEWS: GoogleReview[] = generateMockReviews(200);

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
