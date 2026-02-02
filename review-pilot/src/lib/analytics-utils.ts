import { GoogleReview } from "./google-business-mock";

export interface SentimentPoint {
    date: string;
    score: number; // 0-100 or -1 to 1 based on normalization
    count: number;
}

export interface ImpactDriver {
    topic: string;
    avgRating: number;
    impactScore: number; // deviation from overall average
    volume: number;
    sentiment: 'positive' | 'negative';
}

export interface EntityMention {
    entity: string;
    count: number;
    avgRating: number;
    sentiment: 'positive' | 'neutral' | 'negative';
}

/**
 * Calculates the sentiment trend over the last n days.
 * Returns a time-series array suitable for sparklines.
 */
export function getSentimentTrend(reviews: GoogleReview[], days: number = 14): SentimentPoint[] {
    const now = new Date();
    const trendMap = new Map<string, { totalScore: number; count: number }>();

    // Initialize map with empty days
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        trendMap.set(dateKey, { totalScore: 0, count: 0 });
    }

    reviews.forEach(review => {
        const reviewDate = new Date(review.postedAt).toISOString().split('T')[0];
        if (trendMap.has(reviewDate)) {
            const entry = trendMap.get(reviewDate)!;
            // Normalize score: 0-100 based on AI sentiment or Star Rating
            let score = 50;

            if (review.sentiment) {
                if (review.sentiment === 'positive') score = 100;
                else if (review.sentiment === 'negative') score = 0;
                else score = 50;

                entry.totalScore += score;
                entry.count += 1;
            }
            // No fallback to starRating - purely AI driven now
        }
    });

    return Array.from(trendMap.entries()).map(([date, data]) => ({
        date,
        score: data.count > 0 ? Math.round(data.totalScore / data.count) : 50, // Default to neutral if no data
        count: data.count
    }));
}

/**
 * Identifies topics that drive rating deviation.
 * Impact Score = (Topic Avg Rating - Overall Avg Rating) * Log(Volume)
 */
export function getImpactDrivers(reviews: GoogleReview[]): ImpactDriver[] {
    if (reviews.length === 0) return [];

    const overallAvg = reviews.reduce((acc, r) => acc + r.starRating, 0) / reviews.length;
    const topicStats = new Map<string, { totalRating: number; count: number }>();

    reviews.forEach(review => {
        review.topics?.forEach(topic => {
            const current = topicStats.get(topic) || { totalRating: 0, count: 0 };
            topicStats.set(topic, {
                totalRating: current.totalRating + review.starRating,
                count: current.count + 1
            });
        });
    });

    const drivers: ImpactDriver[] = [];
    topicStats.forEach((stats, topic) => {
        if (stats.count < 3) return; // Ignore low volume noise
        const avg = stats.totalRating / stats.count;
        const diff = avg - overallAvg;
        // Impact score weights deviation by volume (log scale to dampen massive volume)
        const impact = diff * Math.log10(stats.count + 1);

        drivers.push({
            topic,
            avgRating: avg,
            impactScore: impact,
            volume: stats.count,
            sentiment: diff >= 0 ? 'positive' : 'negative'
        });
    });

    // Sort by absolute impact
    return drivers.sort((a, b) => Math.abs(b.impactScore) - Math.abs(a.impactScore));
}

/**
 * Extracts specific entities (people, dishes) from review content.
 * Uses simple heuristic for capitalized words + common staff names from mock.
 */
export function getTopEntities(reviews: GoogleReview[]): EntityMention[] {
    const KNOWN_ENTITIES = ['Antonio', 'Maria', 'Marco', 'Sarah', 'John', 'Pizza', 'Pasta', 'Steak', 'Risotto', 'Tiramisu', 'Wine'];
    const entityStats = new Map<string, { totalRating: number; count: number }>();

    reviews.forEach(review => {
        const uniqueEntitiesInReview = new Set<string>();

        // 1. Prioritize AI-extracted entities if available
        if (review.entities && review.entities.length > 0) {
            review.entities.forEach(e => uniqueEntitiesInReview.add(e));
        }
        // No fallback to Heuristics/Whitelist - purely AI driven now

        uniqueEntitiesInReview.forEach(entity => {
            const current = entityStats.get(entity) || { totalRating: 0, count: 0 };
            entityStats.set(entity, {
                totalRating: current.totalRating + review.starRating,
                count: current.count + 1
            });
        });
    });

    return Array.from(entityStats.entries())
        .map(([entity, stats]) => {
            const avg = stats.totalRating / stats.count;
            return {
                entity,
                count: stats.count,
                avgRating: avg,
                sentiment: (avg >= 4 ? 'positive' : avg <= 2 ? 'negative' : 'neutral') as 'positive' | 'neutral' | 'negative'
            };
        })
        .filter(e => e.count >= 1) // Allow 1 mention if it's from AI (high confidence)
        .sort((a, b) => b.count - a.count); // Most mentioned
}
