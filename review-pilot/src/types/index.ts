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
    playbook?: {
        trigger: string;
        response: string;
    }[];
};
