// GEO Platform Types
export type BrandVoice = {
    tone_score: number; // 1-10
    description?: string;
};

export type SafetySettings = {
    crisis_keywords: string[];
};

export type KnowledgeBase = {
    general?: {
        about?: string;
        alwaysMention?: string;
        geo_targets?: string[]; // GEO keywords for 5-star review injection
        hours?: string[];
        services?: string[];
        policies?: string[];
        promotions?: string[];
        custom?: { label: string; items: string[] }[];
        legacy?: string;
    };
    team?: {
        id: string;
        name: string;
        role: string;
        context?: string; // Legacy freeform field - still useful for edge cases

        // E-E-A-T Enhancement Fields (Phase 1)
        yearsOfExperience?: number; // e.g., 15 (years in their profession)
        certifications?: string[]; // e.g., ["Michelin Star Training", "ServSafe Certified"]
        specialties?: string[]; // e.g., ["Handmade Pasta", "Italian Cuisine", "Vegan Options"]

        isPublic: boolean;
    }[];
    geoKeywords?: {
        id: string;
        keyword: string; // e.g. "Best coffee in Shoreditch"
        priority: 'high' | 'medium' | 'low';

        // GEO Enhancement Field (Phase 1)
        usageExample?: string; // e.g., "We're known for [keyword]" or "Visit us for [keyword]"
    }[];
    menuHighlights?: {
        id: string;
        item: string;
        description?: string;
        sentimentHook?: string; // e.g. "Mention this when people praise the food"
    }[];
    voice?: {
        tone: string; // e.g. "Local Hero", "Professional"
        styleGuide?: string;
    };
    playbook?: {
        trigger: string;
        response: string;
    }[];
};
