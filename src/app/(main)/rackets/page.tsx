'use client';

import { useState, useEffect } from 'react';
import { MainLayout, Button, Input, Card, CardContent } from '@/components';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Racket, SearchFilters } from '@/types/racket';
import { BRAND_OPTIONS } from '@/constants/rackets';
import { RacketCard } from '@/components/rackets/RacketCard';

export default function RacketsPage() {
  const [rackets, setRackets] = useState<Racket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    brand: '',
    category: '',
    skill_level: '',
    priceRange: [0, 50000],
    weightRange: [250, 350],
    headSizeRange: [90, 120],
    sortBy: 'popularity',
  });

  const { user } = useAuthStore();

  useEffect(() => {
    searchRackets();
  }, [filters]);

  const searchRackets = async () => {
    setLoading(true);
    try {
      const params = {
        query: searchQuery,
        brand: filters.brand,
        category: filters.category,
        skill_level: filters.skill_level,
        price_range: {
          min: filters.priceRange[0],
          max: filters.priceRange[1],
        },
        weight_range: {
          min: filters.weightRange[0],
          max: filters.weightRange[1],
        },
        head_size_range: {
          min: filters.headSizeRange[0],
          max: filters.headSizeRange[1],
        },
        sort_by: filters.sortBy,
      };

      const response = await apiClient.get<{ rackets: Racket[] }>('rackets');
      setRackets(response.rackets);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '搜尋失敗');
    } finally {
      setLoading(false);
    }
  };



  const getRecommendedRackets = async () => {
    if (!user) {
      toast.error('請先登入以獲得個人化推薦');
      return;
    }

    try {
      const response = await apiClient.get<{ rackets: Racket[] }>('/api/v1/rackets/recommendations');
      setRackets(response.rackets);
      toast.success('已載入個人化推薦');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '獲取推薦失敗');
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">網球拍資訊</h1>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={getRecommendedRackets}>
              個人化推薦
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/rackets/compare'}
            >
              球拍比較
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="搜尋球拍名稱、品牌或型號..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={searchRackets} loading={loading}>
              搜尋
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? '隱藏篩選' : '篩選條件'}
            </Button>
          </div>

          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">品牌</label>
                  <select
                    value={filters.brand}
                    onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">全部品牌</option>
                    {BRAND_OPTIONS.map((brand) => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">類型</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">全部類型</option>
                    <option value="power">力量型</option>
                    <option value="control">控制型</option>
                    <option value="tweener">全面型</option>
                    <option value="comfort">舒適型</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">適用水平</label>
                  <select
                    value={filters.skill_level}
                    onChange={(e) => setFilters(prev => ({ ...prev, skill_level: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">全部水平</option>
                    <option value="beginner">初學者</option>
                    <option value="intermediate">中級</option>
                    <option value="advanced">高級</option>
                    <option value="professional">專業級</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    價格範圍 (NT$)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="1000"
                      value={filters.priceRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        priceRange: [parseInt(e.target.value), prev.priceRange[1]]
                      }))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-600 min-w-[60px]">
                      ${filters.priceRange[0] / 1000}K-${filters.priceRange[1] / 1000}K
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    重量 (g)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="250"
                      max="350"
                      step="5"
                      value={filters.weightRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        weightRange: [parseInt(e.target.value), prev.weightRange[1]]
                      }))}
                      className="flex-1"
                    />
                    <span className="text-xs text-gray-600 min-w-[60px]">
                      {filters.weightRange[0]}-{filters.weightRange[1]}g
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">排序方式</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value as 'popularity' | 'price' | 'rating' | 'weight' | 'name'
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="popularity">熱門程度</option>
                    <option value="rating">評分排序</option>
                    <option value="price">價格排序</option>
                    <option value="weight">重量排序</option>
                    <option value="name">名稱排序</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilters({
                      brand: '',
                      category: '',
                      skill_level: '',
                      priceRange: [0, 50000],
                      weightRange: [250, 350],
                      headSizeRange: [90, 120],
                      sortBy: 'popularity',
                    });
                    setSearchQuery('');
                  }}
                >
                  重置篩選
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            找到 {rackets.length} 支球拍
          </h2>
        </div>

        {/* Racket Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <div className="aspect-square bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))
          ) : rackets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg mb-2">沒有找到符合條件的球拍</div>
              <p className="text-gray-500">請嘗試調整搜尋條件</p>
            </div>
          ) : (
            rackets.map((racket) => (
              <RacketCard key={racket.id} racket={racket} />
            ))
          )}
        </div>
      </div>
    </MainLayout>
  );
}
