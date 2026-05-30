import { getReviews } from '@/app/actions/reviews';
import { getReviewStats } from '@/app/actions/analytics';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
    const [reviews, stats] = await Promise.all([
        getReviews(),
        getReviewStats(),
    ]);

    return <DashboardClient initialReviews={reviews} initialStats={stats} />;
}
