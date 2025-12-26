'use client';

import { useState, useEffect } from 'react';
import { MainLayout, Button, Input, Card, CardContent } from '@/components';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Coach, ApiCoach, SearchFilters } from '@/types/coach';
import { getSpecialtyText } from '@/constants/coaches';
import { CoachCard } from '@/components/coaches/CoachCard';

export default function CoachesPage() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [500, 3000],
    specialties: [],
    certification: '',
    experience: 0,
    sortBy: 'rating',
  });

  const { user } = useAuthStore();

  const searchCoaches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (user?.location?.address) params.append('location', user.location.address);
      params.append('price_min', filters.priceRange[0].toString());
      params.append('price_max', filters.priceRange[1].toString());
      if (filters.specialties.length > 0) {
        filters.specialties.forEach(specialty => params.append('specialties', specialty));
      }
      if (filters.certification) params.append('certification', filters.certification);
      if (filters.experience > 0) params.append('min_experience', filters.experience.toString());
      params.append('sort_by', filters.sortBy);

      const response = await apiClient.get<{ coaches: ApiCoach[] }>(`/coaches?${params.toString()}`);

      const mappedCoaches: Coach[] = response.coaches.map((apiCoach) => ({
        id: apiCoach.id,
        name: `${apiCoach.user.profile.firstName} ${apiCoach.user.profile.lastName}`,
        avatar_url: apiCoach.user.profile.avatarUrl || undefined,
        certification_level: apiCoach.certifications[0] || '',
        experience_years: apiCoach.experience,
        specialties: apiCoach.specialties,
        hourly_rate: apiCoach.hourlyRate,
        location: '台北市', // Placeholder as backend doesn't return city name yet
        rating: apiCoach.averageRating,
        rating_count: apiCoach.totalReviews,
        bio: apiCoach.biography,
        languages: apiCoach.languages,
        available_times: Object.entries(apiCoach.availableHours || {}).reduce((acc, [day, times]) => {
          acc[day] = times.map(time => {
            const parts = time.split('-');
            return { start: parts[0] || '', end: parts[1] || '' };
          });
          return acc;
        }, {} as Coach['available_times']),
        distance: undefined
      }));

      setCoaches(mappedCoaches);
    } catch (error: any) {
      console.error('Search error:', error);
      toast.error(error.response?.data?.message || '搜尋失敗');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchCoaches();
  }, [filters]);

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="搜尋教練名稱或地區..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={searchCoaches} loading={loading}>
              搜尋教練
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                價格範圍 (NT$/小時)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="100"
                  value={filters.priceRange[0]}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                  }))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 min-w-[80px]">
                  ${filters.priceRange[0]}-${filters.priceRange[1]}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                證照
              </label>
              <select
                value={filters.certification}
                onChange={(e) => setFilters(prev => ({ ...prev, certification: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">不限</option>
                <option value="ptca">PTCA</option>
                <option value="uspta">USPTA</option>
                <option value="pti">PTI</option>
                <option value="itf">ITF</option>
                <option value="national">國家級</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                最少經驗年數
              </label>
              <select
                value={filters.experience}
                onChange={(e) => setFilters(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="0">不限</option>
                <option value="1">1年以上</option>
                <option value="3">3年以上</option>
                <option value="5">5年以上</option>
                <option value="10">10年以上</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                排序方式
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  sortBy: e.target.value as 'distance' | 'price' | 'rating' | 'experience'
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="rating">評分排序</option>
                <option value="price">價格排序</option>
                <option value="distance">距離排序</option>
                <option value="experience">經驗排序</option>
              </select>
            </div>
          </div>

          {/* Specialty Filters */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              專長領域
            </label>
            <div className="flex flex-wrap gap-2">
              {['beginner', 'intermediate', 'advanced', 'junior', 'senior', 'singles', 'doubles', 'serve', 'volleys', 'strategy'].map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => {
                    setFilters(prev => ({
                      ...prev,
                      specialties: prev.specialties.includes(specialty)
                        ? prev.specialties.filter(s => s !== specialty)
                        : [...prev.specialties, specialty]
                    }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${filters.specialties.includes(specialty)
                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {getSpecialtyText(specialty)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            找到 {coaches.length} 位教練
          </h2>
        </div>

        {/* Coach List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : coaches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg mb-2">沒有找到符合條件的教練</div>
              <p className="text-gray-500">請嘗試調整搜尋條件</p>
            </div>
          ) : (
            coaches.map((coach) => (
              <CoachCard
                key={coach.id}
                coach={coach}
              />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}