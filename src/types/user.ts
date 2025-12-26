// 用戶基本資訊
export interface User {
  id: string;
  email: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: UserProfile;
}

// 用戶檔案
export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  ntrpLevel?: number;
  playingStyle?: 'aggressive' | 'defensive' | 'all-court';
  preferredHand?: 'right' | 'left' | 'both';
  latitude?: number;
  longitude?: number;
  location?: string;
  bio?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  playingFrequency?: 'casual' | 'regular' | 'competitive';
  preferredTimes?: string[];
  maxTravelDistance?: number;
  locationPrivacy?: boolean;
  profilePrivacy?: 'public' | 'friends' | 'private';
  frequentCourts?: FrequentCourt[];
  createdAt: string;
  updatedAt: string;
}

export interface FrequentCourt {
  courtId: string;
  courtName: string;
  day: string;
  startTime: string;
  endTime: string;
}

// OAuth 帳號
export interface OAuthAccount {
  id: string;
  userId: string;
  provider: string;
  providerId: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

// NTRP 等級資訊
export interface NTRPLevel {
  level: number;
  name: string;
  description: string;
  characteristics: string[];
}

// 用戶偏好設定
export interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    matchRequests: boolean;
    messages: boolean;
    bookingReminders: boolean;
  };
  privacy: {
    showLocation: boolean;
    showAge: boolean;
    showPhone: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
  };
  matching: {
    maxDistance: number;
    ageRange: {
      min: number;
      max: number;
    };
    genderPreference: 'male' | 'female' | 'any';
    skillLevelRange: {
      min: number;
      max: number;
    };
  };
}

// API 響應類型
export interface UserResponse {
  user: User;
}

export interface ProfileResponse {
  profile: UserProfile;
}

export interface NTRPLevelsResponse {
  levels: NTRPLevel[];
}

// 表單類型
export interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ProfileForm {
  firstName: string;
  lastName: string;
  bio?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  ntrpLevel?: number;
  playingStyle?: 'aggressive' | 'defensive' | 'all-court';
  preferredHand?: 'right' | 'left' | 'both';
  playingFrequency?: 'casual' | 'regular' | 'competitive';
  preferredTimes?: string[];
  maxTravelDistance?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  frequentCourts?: FrequentCourt[];
}

export interface PreferencesForm {
  notifications: {
    email: boolean;
    push: boolean;
    matchRequests: boolean;
    messages: boolean;
    bookingReminders: boolean;
  };
  privacy: {
    showLocation: boolean;
    showAge: boolean;
    showPhone: boolean;
    profileVisibility: 'public' | 'friends' | 'private';
  };
  matching: {
    maxDistance: number;
    ageRange: {
      min: number;
      max: number;
    };
    genderPreference: 'male' | 'female' | 'any';
    skillLevelRange: {
      min: number;
      max: number;
    };
  };
}