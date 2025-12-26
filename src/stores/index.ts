import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  phone?: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
  profile?: {
    userId: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    ntrpLevel?: number | null;
    playingStyle?: string | null;
    preferredHand?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    locationPrivacy: boolean;
    bio?: string | null;
    birthDate?: string | null;
    gender?: string | null;
    playingFrequency?: string | null;
    preferredTimes?: string | null;
    maxTravelDistance?: number | null;
    profilePrivacy: string;
    frequentCourts?: { courtId: string; courtName: string; day: string; startTime: string; endTime: string }[] | null;
    createdAt: string;
    updatedAt: string;
  } | null;

  // Computed properties for backward compatibility
  name?: string;
  role?: 'user' | 'coach' | 'admin';
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  updateTokens: (token: string, refreshToken?: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user: User, token: string, refreshToken?: string) => {
        console.log('Storing auth token in localStorage:', token);
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
        }

        // Add computed properties for backward compatibility
        const enhancedUser = {
          ...user,
          name: user.profile ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim() : user.email,
          ntrpLevel: user.profile?.ntrpLevel || undefined,
          avatarUrl: user.profile?.avatarUrl || undefined,
          location: user.profile?.latitude && user.profile?.longitude ? {
            latitude: user.profile.latitude,
            longitude: user.profile.longitude,
            address: '' // We might need to get this from somewhere else
          } : undefined,
        };

        set({
          user: enhancedUser,
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
        }
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      updateUser: (updates: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateTokens: (token: string, refreshToken?: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', token);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
        }
        set((state) => ({
          token,
          refreshToken: refreshToken || state.refreshToken,
        }));
      },

      setLoading: (loading: boolean) =>
        set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// UI State Store
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: number;
  }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: false,
      theme: 'light',
      notifications: [],

      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      setSidebarOpen: (open: boolean) =>
        set({ sidebarOpen: open }),

      setTheme: (theme: 'light' | 'dark') =>
        set({ theme }),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
            },
          ],
        })),

      removeNotification: (id: string) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () =>
        set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
      }),
    }
  )
);