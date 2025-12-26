'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MainLayout, Button, Input, Card, CardContent } from '@/components';
import { matchingPreferencesSchema, type MatchingPreferencesForm } from '@/lib/validations';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { PartnerListView } from '@/components/partners/PartnerListView';
import { TAIWAN_CITIES } from '@/constants/locations';
import { MatchingUser } from '@/types/matching';


interface SwipeCardProps {
  user: MatchingUser;
  onSwipe: (userId: string, action: 'like' | 'pass') => void;
  isAnimating: boolean;
}

export default function MatchingPage() {
  const [users, setUsers] = useState<MatchingUser[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [matches, setMatches] = useState<MatchingUser[]>([]);
  const [viewMode, setViewMode] = useState<'swipe' | 'list'>('list');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter Group States
  const [selectedDays, setSelectedDays] = useState<('weekday' | 'weekend')[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<('morning' | 'afternoon' | 'evening')[]>([]);

  const { user: currentUser } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm<MatchingPreferencesForm>({
    resolver: zodResolver(matchingPreferencesSchema),
    defaultValues: {
      ntrp_range: {
        min: (currentUser?.profile?.ntrpLevel || 3) - 1,
        max: (currentUser?.profile?.ntrpLevel || 3) + 1,
      },
      max_distance: 10,
      play_type: ['rally'],
      availability: [],
      gender: 'any',
      location: {
        city: '',
        district: ''
      }
    },
  });

  const selectedCity = watch('location.city');

  const fetchMatchingUsers = async (preferences?: MatchingPreferencesForm) => {
    setLoading(true);
    try {
      // Default params if no preferences provided
      const defaultParams = {
        // defaults handled by backend or empty object
      };

      const params = preferences || defaultParams;

      const response = await apiClient.post<{ matches: MatchingUser[] }>('/matching/find', params);
      setUsers(response.matches);
      setCurrentIndex(0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId: string, action: 'like' | 'pass') => {
    if (viewMode === 'swipe') {
      setIsAnimating(true);
    } else {
      setActionLoading(userId);
    }

    try {
      const backendAction = action === 'pass' ? 'skip' : action;

      const response = await apiClient.post<{ result?: { matched?: boolean; user?: MatchingUser } }>(
        '/api/v1/matching/card-action',
        { targetUserId: userId, action: backendAction }
      );

      if (response.result?.matched && response.result?.user) {
        setMatches(prev => [...prev, response.result?.user!]);
        toast.success(`🎉 與 ${response.result.user.name} 配對成功！`);
      }

      if (viewMode === 'list') {
        // In list view, remove the user from the list
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success(action === 'like' ? '已發送配對請求' : '已跳過該用戶');
      }

    } catch (error: any) {
      toast.error(error.response?.data?.message || '操作失敗');
    } finally {
      if (viewMode === 'list') {
        setActionLoading(null);
      }
    }

    if (viewMode === 'swipe') {
      // Move to next user after animation
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Wrapper for SwipeCard
  const handleSwipe = (userId: string, action: 'like' | 'pass') => {
    handleAction(userId, action);
  };

  const onSubmit = async (data: MatchingPreferencesForm) => {
    // Construct availability from selectedDays and selectedTimes
    const availability: { type: 'weekday' | 'weekend'; time: 'morning' | 'afternoon' | 'evening' }[] = [];
    selectedDays.forEach(day => {
      selectedTimes.forEach(time => {
        availability.push({ type: day, time: time });
      });
    });

    // Update the form data with constructed availability
    const finalData = { ...data, availability };

    // Update local form state for consistency (optional but good practice)
    setValue('availability', availability);

    try {
      toast.success('篩選條件已更新');
      fetchMatchingUsers(finalData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失敗');
    }
  };

  // Handle Day/Time Selection Toggles
  const toggleDay = (day: 'weekday' | 'weekend') => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: 'morning' | 'afternoon' | 'evening') => {
    setSelectedTimes(prev =>
      prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
    );
  };

  useEffect(() => {
    fetchMatchingUsers();
  }, []);

  const currentUser_display = users[currentIndex];
  const hasMoreUsers = currentIndex < users.length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">尋找球友</h1>
            <p className="text-gray-600 mt-1">
              {viewMode === 'swipe' ? '滑動來發現新的網球夥伴' : '瀏覽推薦的網球夥伴'}
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'swipe' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setViewMode('swipe')}
              >
                滑動模式
              </button>
              <button
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setViewMode('list')}
              >
                列表模式
              </button>
            </div>

            {matches.length > 0 && (
              <Button
                onClick={() => window.location.href = '/chat'}
              >
                配對列表 ({matches.length})
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar (Filters) */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">篩選條件</h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                  {/* Gender Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">性別</label>
                    <div className="flex flex-wrap gap-2">
                      {['any', 'male', 'female'].map((g) => (
                        <label key={g} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            value={g}
                            {...register('gender')}
                            className="text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">
                            {g === 'any' ? '不限' : g === 'male' ? '男' : '女'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* NTRP Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NTRP 等級範圍
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        step="0.5"
                        min="1"
                        max="7"
                        placeholder="最低"
                        {...register('ntrp_range.min', { valueAsNumber: true })}
                        className="text-sm"
                      />
                      <Input
                        type="number"
                        step="0.5"
                        min="1"
                        max="7"
                        placeholder="最高"
                        {...register('ntrp_range.max', { valueAsNumber: true })}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      地區
                    </label>
                    <div className="space-y-2">
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        {...register('location.city')}
                        onChange={(e) => {
                          register('location.city').onChange(e);
                          setValue('location.district', '');
                        }}
                      >
                        <option value="">選擇縣市</option>
                        {Object.keys(TAIWAN_CITIES).map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        {...register('location.district')}
                        disabled={!selectedCity}
                      >
                        <option value="">選擇區域</option>
                        {selectedCity && TAIWAN_CITIES[selectedCity]?.map(dist => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Availability - Grouped */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      偏好時段
                    </label>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">日期類型</span>
                        <div className="flex gap-2">
                          {['weekday', 'weekend'].map((day) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleDay(day as 'weekday' | 'weekend')}
                              className={`px-3 py-1 rounded text-sm border ${selectedDays.includes(day as any)
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              {day === 'weekday' ? '平日' : '假日'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 block mb-1">時段</span>
                        <div className="flex flex-wrap gap-2">
                          {['morning', 'afternoon', 'evening'].map((time) => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => toggleTime(time as 'morning' | 'afternoon' | 'evening')}
                              className={`px-3 py-1 rounded text-sm border ${selectedTimes.includes(time as any)
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                              {time === 'morning' ? '早' : time === 'afternoon' ? '午' : '晚'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Play Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      尋找類型
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {[
                        { val: 'rally', label: '拉球' },
                        { val: 'singles', label: '單打' },
                        { val: 'doubles', label: '雙打' }
                      ].map(type => (
                        <label key={type.val} className="flex items-center">
                          <input
                            type="checkbox"
                            value={type.val}
                            className="mr-2 rounded text-emerald-600 focus:ring-emerald-500"
                            {...register('play_type')}
                          />
                          <span className="text-sm text-gray-700">{type.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    套用篩選
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Sidebar Stats (Moved from right side in old layout) */}
            {viewMode === 'swipe' && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">今日統計</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">查看過的用戶</span>
                      <span className="font-medium">{currentIndex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">配對成功</span>
                      <span className="font-medium text-emerald-600">{matches.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {viewMode === 'list' ? (
              <div className="min-h-[600px]">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">載入中...</p>
                  </div>
                ) : (
                  <PartnerListView
                    users={users}
                    onAction={handleAction}
                    actionLoading={actionLoading}
                  />
                )}
              </div>
            ) : (
              /* Swipe View */
              <div className="relative min-h-[600px] flex flex-col items-center">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                    <p className="text-gray-500 mt-4">載入中...</p>
                  </div>
                ) : !hasMoreUsers ? (
                  <div className="text-center pt-20">
                    <div className="text-6xl mb-4">🎾</div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">沒有更多用戶了</h3>
                    <p className="text-gray-600 mb-4">試試調整左側篩選條件來發現更多球友</p>
                    <Button onClick={() => fetchMatchingUsers(getValues())}>
                      重新載入
                    </Button>
                  </div>
                ) : currentUser_display ? (
                  <>
                    <div className="w-full max-w-sm">
                      <SwipeCard
                        user={currentUser_display}
                        onSwipe={handleSwipe}
                        isAnimating={isAnimating}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-8 mt-8">
                      <button
                        className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 shadow-md"
                        onClick={() => handleSwipe(currentUser_display.id, 'pass')}
                        disabled={isAnimating}
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>

                      <button
                        className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 shadow-md"
                        onClick={() => handleSwipe(currentUser_display.id, 'like')}
                        disabled={isAnimating}
                      >
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Swipe Card Component
function SwipeCard({ user, onSwipe, isAnimating }: SwipeCardProps) {
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const getPlayingStyleText = (style?: string) => {
    switch (style) {
      case 'aggressive': return '攻擊型';
      case 'defensive': return '防守型';
      case 'all-around': return '全能型';
      default: return '未設定';
    }
  };

  return (
    <div className="relative w-full h-full">
      <Card
        className={`transform transition-transform duration-300 ${isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          } cursor-grab active:cursor-grabbing shadow-xl bg-white`}
      >
        <CardContent className="p-0">
          {/* User Image */}
          <div className="h-96 w-full relative overflow-hidden rounded-t-lg">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            )}

            {/* Overlay Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent text-white p-4">
              <h3 className="text-xl font-bold mb-1">{user.name}, {user.age}</h3>
              <div className="flex items-center space-x-4 text-sm">
                <span>NTRP {user.ntrpLevel}</span>
                {user.distance && (
                  <>
                    <span>•</span>
                    <span>{user.distance.toFixed(1)}km</span>
                  </>
                )}
              </div>
            </div>

            {/* Match Score */}
            <div className="absolute top-4 right-4 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
              {Math.round(user.matchScore)}% 匹配
            </div>
          </div>

          {/* User Details */}
          <div className="p-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">打球風格</span>
                <span className="font-medium">{getPlayingStyleText(user.playingStyle)}</span>
              </div>

              {user.location && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">所在地</span>
                  <span className="font-medium text-sm">{user.location.address}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-600">最後上線</span>
                <span className="font-medium text-sm text-green-600">
                  {new Date(user.lastActive).toLocaleDateString('zh-TW')}
                </span>
              </div>
            </div>

            {user.bio && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm leading-relaxed">{user.bio}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Swipe Indicators */}
      {isDragging && (
        <>
          <div className={`absolute top-1/2 left-4 transform -translate-y-1/2 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium ${dragPosition.x < -50 ? 'opacity-100' : 'opacity-50'
            }`}>
            PASS
          </div>
          <div className={`absolute top-1/2 right-4 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded text-sm font-medium ${dragPosition.x > 50 ? 'opacity-100' : 'opacity-50'
            }`}>
            LIKE
          </div>
        </>
      )}
    </div>
  );
}