export type ReviewStatus = 'pending' | 'replied';

export interface GoogleReview {
    id: string;
    reviewerName: string;
    starRating: number;
    content: string;
    replyContent?: string;
    status: ReviewStatus;
    postedAt: string;
}

const MOCK_REVIEWS: GoogleReview[] = [
    {
        id: '1',
        reviewerName: 'Alice Johnson',
        starRating: 5,
        content: 'Absolutely loved the service! The team was professional and quick.',
        status: 'pending',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    {
        id: '2',
        reviewerName: 'Mark Smith',
        starRating: 2,
        content: 'Waited for 30 minutes and no one showed up. Very disappointed.',
        status: 'pending',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    },
    {
        id: '3',
        reviewerName: 'Sarah Davis',
        starRating: 4,
        content: 'Great experience overall, but parking was a bit of a hassle.',
        replyContent: 'Hi Sarah, glad you had a great experience! We are working on improving our parking situation. Hope to see you again soon!',
        status: 'replied',
        postedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    },
];

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
