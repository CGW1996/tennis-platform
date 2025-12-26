export interface Coach {
    id: string;
    name: string;
    avatar_url?: string;
    certification_level: string;
    experience_years: number;
    specialties: string[];
    hourly_rate: number;
    location: string;
    rating: number;
    rating_count: number;
    bio: string;
    languages: string[];
    available_times: {
        [day: string]: { start: string; end: string }[];
    };
    distance?: number;
}

export interface ApiCoach {
    id: string;
    userId: string;
    licenseNumber: string;
    certifications: string[];
    experience: number;
    specialties: string[];
    biography: string;
    hourlyRate: number;
    currency: string;
    languages: string[];
    averageRating: number;
    totalReviews: number;
    totalLessons: number;
    isVerified: boolean;
    isActive: boolean;
    availableHours: {
        [key: string]: string[];
    };
    user: {
        id: string;
        email: string;
        profile: {
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            latitude: number;
            longitude: number;
        };
    };
}

export interface SearchFilters {
    priceRange: [number, number];
    specialties: string[];
    certification: string;
    experience: number;
    sortBy: 'distance' | 'price' | 'rating' | 'experience';
}

export interface CoachDetail {
    id: string;
    userId: string;
    licenseNumber: string;
    certifications: string[];
    experience: number;
    specialties: string[];
    biography: string;
    hourlyRate: number;
    currency: string;
    languages: string[];
    averageRating: number;
    totalReviews: number;
    totalLessons: number;
    isVerified: boolean;
    isActive: boolean;
    availableHours: {
        [key: string]: string[];
    };
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
        phone: string | null;
        emailVerified: boolean;
        phoneVerified: boolean;
        isActive: boolean;
        lastLoginAt: string | null;
        createdAt: string;
        updatedAt: string;
        profile: {
            userId: string;
            firstName: string;
            lastName: string;
            avatarUrl: string | null;
            ntrpLevel: number;
            playingStyle: string;
            preferredHand: string;
            latitude: number;
            longitude: number;
            locationPrivacy: boolean;
            bio: string;
            birthDate: string | null;
            gender: string;
            playingFrequency: string;
            preferredTimes: string[];
            maxTravelDistance: number;
            profilePrivacy: string;
            createdAt: string;
            updatedAt: string;
        };
    };
}
