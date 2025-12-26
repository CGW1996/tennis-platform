export interface Racket {
    id: string;
    name: string;
    brand: string;
    model: string;
    year: number;
    msrp: number;
    weight: number;
    headSize: number;
    stringPattern: string;
    balancePoint: number;
    stiffness: number;
    swingWeight: number;
    powerLevel: number;
    controlLevel: number;
    comfortLevel: number;
    maneuverLevel: number;
    stabilityLevel: number;
    description: string;
    images: string[];
    category: 'power' | 'control' | 'tweener' | 'comfort';
    skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
    popularity: number;
    rating: number;
    ratingCount: number;
    specifications?: {
        [key: string]: string | number;
    };
    pros_cons?: {
        pros: string[];
        cons: string[];
    };
}

export interface SearchFilters {
    brand: string;
    category: string;
    skill_level: string;
    priceRange: [number, number];
    weightRange: [number, number];
    headSizeRange: [number, number];
    sortBy: 'popularity' | 'price' | 'rating' | 'weight' | 'name';
}

export interface Review {
    id: string;
    user_name: string;
    user_avatar?: string;
    rating: number;
    content: string;
    pros: string[];
    cons: string[];
    recommended_for: string[];
    created_at: string;
    helpful_count: number;
    verified_purchase: boolean;
}
