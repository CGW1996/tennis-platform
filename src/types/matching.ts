import { User } from './user';

export interface MatchingUser {
  id: string;
  name: string;
  avatarUrl?: string;
  age: number;
  ntrpLevel: number;
  playingStyle?: string;
  bio?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  distance?: number;
  matchScore: number;
  lastActive: string;
  gender?: string;
  playingFrequency?: string;
  preferredTimes?: string[];
}


// 配對條件
export interface MatchingCriteria {
  ntrpLevel?: number;
  maxDistance?: number;
  // preferredTimes is deprecated in favor of availability
  preferredTimes?: string[];
  playingFrequency?: 'casual' | 'regular' | 'competitive';
  ageRange?: {
    min: number;
    max: number;
  };
  gender?: 'male' | 'female' | 'any';
  minReputationScore?: number;
  limit?: number;
  // New fields
  location?: {
    city: string;
    district?: string;
  };
  playType?: ('rally' | 'singles' | 'doubles')[];
  availability?: {
    type: 'weekday' | 'weekend';
    time: 'morning' | 'afternoon' | 'evening';
  }[];
}

// 配對因子
export interface MatchingFactors {
  skillLevel: number;        // 技術等級匹配度 (0-1)
  distance: number;          // 距離匹配度 (0-1)
  timeCompatibility: number; // 時間相容性 (0-1)
  playingStyle: number;      // 打球風格匹配度 (0-1)
  age: number;               // 年齡匹配度 (0-1)
  reputation: number;        // 信譽匹配度 (0-1)
}

// 配對結果
export interface MatchingResult {
  userId: string;
  score: number;
  factors: MatchingFactors;
  user: MatchingUser;
}

// 抽卡動作類型
export type CardAction = 'like' | 'dislike' | 'skip';

// 抽卡配對結果
export interface CardMatchResult {
  isMatch: boolean;
  matchId?: string;
  chatRoomId?: string;
  message: string;
}

// 抽卡互動記錄
export interface CardInteraction {
  id: string;
  userId: string;
  targetUserId: string;
  action: CardAction;
  isMatch: boolean;
  matchId?: string;
  createdAt: string;
  updatedAt: string;
  targetUser?: User;
}

// 配對通知
export interface MatchNotification {
  id: string;
  userId: string;
  type: 'match_success' | 'match_request' | 'match_cancelled';
  title: string;
  message: string;
  data?: string; // JSON 格式的額外數據
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

// 信譽分數
export interface ReputationScore {
  id: string;
  userId: string;
  attendanceRate: number;    // 出席率 (0-100)
  punctualityScore: number;  // 準時度 (0-100)
  skillAccuracy: number;     // 技術等級準確度 (0-100)
  behaviorRating: number;    // 行為評分 (1-5)
  totalMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  overallScore: number;      // 綜合分數 (0-100)
  updatedAt: string;
}

// 配對統計
export interface MatchingStatistics {
  totalMatches: number;
  completedMatches: number;
  cancelledMatches: number;
  reputationScore: number;
  successRate: number;
}

// MatchResponse for the simplified endpoint
export interface FindMatchesResponse {
  matches: MatchingUser[];
  total: number;
}

export interface RandomMatchesResponse {
  matches: MatchingResult[];
  total: number;
}

export interface CardActionResponse {
  result: CardMatchResult;
}

export interface CardInteractionHistoryResponse {
  interactions: CardInteraction[];
  page: number;
  limit: number;
  total: number;
}

export interface MatchNotificationsResponse {
  notifications: MatchNotification[];
  page: number;
  limit: number;
  total: number;
}

export interface ReputationResponse {
  reputation: ReputationScore;
}

export interface StatisticsResponse {
  statistics: MatchingStatistics;
}