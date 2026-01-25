export type KnowledgeBase = {
    general?: {
        about?: string;
        alwaysMention?: string;
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
        context?: string; // e.g. "Head Chef since 2012"
        isPublic: boolean;
    }[];
    geoKeywords?: {
        id: string;
        keyword: string; // e.g. "Best coffee in Shoreditch"
        priority: 'high' | 'medium' | 'low';
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
