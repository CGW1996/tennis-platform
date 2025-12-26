export interface Court {
    id: string;
    name: string;
    description?: string;
    address: string;
    latitude: number;
    longitude: number;
    pricePerHour: number;
    currency: string;
    courtType: string;
    facilities: string[];
    images: string[];
    operatingHours: Record<string, string>;
    contactPhone?: string;
    contactEmail?: string;
    website?: string;
    averageRating: number;
    totalReviews: number;
    isActive: boolean;
    ownerId?: string;
    createdAt: string;
    updatedAt: string;
    reviews?: any[]; // Keep as any[] or specific type if available, avoiding circular dependency for now
    distance?: number;
}

export interface SearchFilters {
    priceRange: [number, number];
    courtType: string;
    facilities: string[];
    sortBy: 'distance' | 'price' | 'rating';
}
