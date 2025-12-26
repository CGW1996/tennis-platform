import { useState } from 'react';
import axios from 'axios';
import {
  MatchingCriteria,
  FindMatchesResponse,
  RandomMatchesResponse,
  CardActionResponse,
  CardInteractionHistoryResponse,
  MatchNotificationsResponse,
  ReputationResponse,
  StatisticsResponse,
  CardAction,
} from '@/types/matching';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

// 創建 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器 - 添加認證 token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 響應攔截器 - 處理錯誤
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 過期，清除本地存儲並重定向到登入頁
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useMatchingApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 尋找配對
  const findMatches = async (criteria: MatchingCriteria): Promise<FindMatchesResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<FindMatchesResponse>('/api/v1/matching/find', criteria);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '尋找配對失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 獲取隨機配對（抽卡功能）
  const getRandomMatches = async (count: number = 5): Promise<RandomMatchesResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<RandomMatchesResponse>(`/matching/random?count=${count}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '獲取隨機配對失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 處理抽卡動作
  const processCardAction = async (
    targetUserId: string,
    action: CardAction
  ): Promise<CardActionResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post<CardActionResponse>('/api/v1/matching/card-action', {
        targetUserId,
        action,
      });
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '處理抽卡動作失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 獲取抽卡互動歷史
  const getCardInteractionHistory = async (
    page: number = 1,
    limit: number = 20,
    action?: CardAction
  ): Promise<CardInteractionHistoryResponse> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (action) {
        params.append('action', action);
      }
      
      const response = await api.get<CardInteractionHistoryResponse>(
        `/matching/card-history?${params.toString()}`
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '獲取互動歷史失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 獲取配對通知
  const getMatchNotifications = async (
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<MatchNotificationsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        unread_only: unreadOnly.toString(),
      });
      
      const response = await api.get<MatchNotificationsResponse>(
        `/matching/notifications?${params.toString()}`
      );
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '獲取通知失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 標記通知為已讀
  const markNotificationAsRead = async (notificationId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/matching/notifications/${notificationId}/read`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '標記通知失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 獲取信譽分數
  const getReputationScore = async (): Promise<ReputationResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ReputationResponse>('/api/v1/matching/reputation');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '獲取信譽分數失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 獲取配對統計
  const getMatchingStatistics = async (): Promise<StatisticsResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<StatisticsResponse>('/api/v1/matching/statistics');
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '獲取統計資料失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 獲取配對歷史
  const getMatchingHistory = async (
    page: number = 1,
    limit: number = 10
  ): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await api.get(`/matching/history?${params.toString()}`);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '獲取配對歷史失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 創建配對
  const createMatch = async (data: {
    participantIds: string[];
    matchType: string;
    courtId?: string;
    scheduledAt?: string;
  }): Promise<any> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/matching/create', data);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || '創建配對失敗';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    findMatches,
    getRandomMatches,
    processCardAction,
    getCardInteractionHistory,
    getMatchNotifications,
    markNotificationAsRead,
    getReputationScore,
    getMatchingStatistics,
    getMatchingHistory,
    createMatch,
  };
};