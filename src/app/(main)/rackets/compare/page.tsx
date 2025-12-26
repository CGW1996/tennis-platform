'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout, Button, Card, CardHeader, CardContent } from '@/components';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Racket } from '@/types/racket';

function RacketComparePageContent() {
  const [comparisonRackets, setComparisonRackets] = useState<Racket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Racket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadComparisonData();
  }, []);

  const loadComparisonData = async () => {
    try {
      // Check if user has a comparison list
      let comparisonIds: string[] = [];

      if (isAuthenticated) {
        const response = await apiClient.get<{ racket_ids: string[] }>('/api/v1/rackets/comparison');
        comparisonIds = response.racket_ids;
      }

      // Add racket from URL parameter if provided
      const addRacketId = searchParams.get('add');
      if (addRacketId && !comparisonIds.includes(addRacketId)) {
        comparisonIds.push(addRacketId);
      }

      if (comparisonIds.length > 0) {
        const racketsResponse = await apiClient.post<{ rackets: Racket[] }>('/api/v1/rackets/batch', {
          racket_ids: comparisonIds
        });
        setComparisonRackets(racketsResponse.rackets);
      }
    } catch (error: any) {
      console.error('載入比較清單失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchRackets = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await apiClient.post<{ rackets: Racket[] }>('rackets/search', {
        query: searchQuery,
        limit: 10
      });
      setSearchResults(response.rackets.filter(r =>
        !comparisonRackets.some(cr => cr.id === r.id)
      ));
    } catch (error: any) {
      toast.error('搜尋失敗');
    } finally {
      setSearching(false);
    }
  };

  const addToComparison = async (racket: Racket) => {
    if (comparisonRackets.length >= 4) {
      toast.error('最多只能比較4支球拍');
      return;
    }

    setComparisonRackets(prev => [...prev, racket]);
    setSearchResults(prev => prev.filter(r => r.id !== racket.id));

    if (isAuthenticated) {
      try {
        await apiClient.post('/rackets/comparison/add', { racket_id: racket.id });
      } catch (error) {
        console.error('保存比較清單失敗:', error);
      }
    }

    toast.success(`已加入 ${racket.name} 到比較清單`);
  };

  const removeFromComparison = async (racketId: string) => {
    setComparisonRackets(prev => prev.filter(r => r.id !== racketId));

    if (isAuthenticated) {
      try {
        await apiClient.delete(`/rackets/comparison/remove/${racketId}`);
      } catch (error) {
        console.error('移除比較清單失敗:', error);
      }
    }

    toast.success('已從比較清單移除');
  };

  const clearComparison = async () => {
    setComparisonRackets([]);

    if (isAuthenticated) {
      try {
        await apiClient.delete('/api/v1/rackets/comparison/clear');
      } catch (error) {
        console.error('清空比較清單失敗:', error);
      }
    }

    toast.success('已清空比較清單');
  };

  const getCategoryText = (category: string) => {
    const categoryMap = {
      'power': '力量型',
      'control': '控制型',
      'tweener': '全面型',
      'comfort': '舒適型',
    };
    return categoryMap[category as keyof typeof categoryMap] || category;
  };

  const getSkillLevelText = (level: string) => {
    const levelMap = {
      'beginner': '初學者',
      'intermediate': '中級',
      'advanced': '高級',
      'professional': '專業級',
    };
    return levelMap[level as keyof typeof levelMap] || level;
  };

  const getComparisonValue = (racket1: Racket, racket2: Racket, field: keyof Racket) => {
    const val1 = racket1[field] as number;
    const val2 = racket2[field] as number;

    if (val1 > val2) return 'higher';
    if (val1 < val2) return 'lower';
    return 'equal';
  };

  const comparisonFields = [
    { key: 'price', label: '價格', unit: 'NT$', format: (val: number) => val.toLocaleString() },
    { key: 'weight', label: '重量', unit: 'g' },
    { key: 'headSize', label: '拍面大小', unit: 'sq.in' },
    { key: 'balancePoint', label: '平衡點', unit: 'mm' },
    { key: 'stiffness', label: '硬度', unit: '/10' },
    { key: 'swingWeight', label: '揮拍重量', unit: '' },
    { key: 'powerLevel', label: '力量', unit: '/10' },
    { key: 'controlLevel', label: '控制', unit: '/10' },
    { key: 'comfortLevel', label: '舒適度', unit: '/10' },
    { key: 'maneuverLevel', label: '操控性', unit: '/10' },
    { key: 'stabilityLevel', label: '穩定性', unit: '/10' },
    { key: 'rating', label: '評分', unit: '/5' },
  ];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">球拍比較</h1>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.location.href = '/rackets'}>
              返回球拍列表
            </Button>
            {comparisonRackets.length > 0 && (
              <Button variant="outline" onClick={clearComparison}>
                清空比較
              </Button>
            )}
          </div>
        </div>

        {/* Add Racket Section */}
        {comparisonRackets.length < 4 && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">新增球拍到比較清單</h2>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <input
                  type="text"
                  placeholder="搜尋球拍名稱、品牌或型號..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchRackets()}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
                <Button onClick={searchRackets} loading={searching}>
                  搜尋
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {searchResults.map((racket) => (
                    <div
                      key={racket.id}
                      className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => addToComparison(racket)}
                    >
                      <div className="aspect-square w-full h-24 overflow-hidden rounded bg-gray-100 mb-2">
                        {racket.images && racket.images.length > 0 ? (
                          <img
                            src={racket.images[0]}
                            alt={racket.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428l-7.071 7.071-7.071-7.071a2.828 2.828 0 010-4l7.071-7.071 7.071 7.071a2.828 2.828 0 010 4z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm line-clamp-1">{racket.name}</h4>
                      <p className="text-xs text-gray-600">{racket.brand}</p>
                      <p className="text-sm font-bold text-emerald-600 mt-1">
                        NT$ {racket.msrp.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Comparison Table */}
        {comparisonRackets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>尚未選擇要比較的球拍</div>
                <p className="text-gray-500 mt-2">使用上方搜尋功能新增球拍到比較清單</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 w-32">比較項目</th>
                      {comparisonRackets.map((racket) => (
                        <th key={racket.id} className="text-center p-4 min-w-[200px]">
                          <div className="space-y-3">
                            <div className="aspect-square w-20 h-20 mx-auto overflow-hidden rounded bg-gray-100">
                              {racket.images && racket.images.length > 0 ? (
                                <img
                                  src={racket.images[0]}
                                  alt={racket.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428l-7.071 7.071-7.071-7.071a2.828 2.828 0 010-4l7.071-7.071 7.071 7.071a2.828 2.828 0 010 4z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-sm line-clamp-2">{racket.name}</h3>
                              <p className="text-xs text-gray-600">{racket.brand} {racket.model}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.location.href = `/rackets/${racket.id}`}
                              >
                                詳情
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromComparison(racket.id)}
                              >
                                移除
                              </Button>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Basic Info */}
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700">類型</td>
                      {comparisonRackets.map((racket) => (
                        <td key={racket.id} className="p-4 text-center">
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs">
                            {getCategoryText(racket.category)}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700">適用水平</td>
                      {comparisonRackets.map((racket) => (
                        <td key={racket.id} className="p-4 text-center">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                            {getSkillLevelText(racket.skillLevel)}
                          </span>
                        </td>
                      ))}
                    </tr>

                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-medium text-gray-700">穿線模式</td>
                      {comparisonRackets.map((racket) => (
                        <td key={racket.id} className="p-4 text-center">{racket.stringPattern}</td>
                      ))}
                    </tr>

                    {/* Numeric Comparisons */}
                    {comparisonFields.map((field) => (
                      <tr key={field.key} className="border-b border-gray-100">
                        <td className="p-4 font-medium text-gray-700">{field.label}</td>
                        {comparisonRackets.map((racket, index) => {
                          const value = racket[field.key as keyof Racket] as number;
                          const formattedValue = field.format ? field.format(value) : value;

                          // Color coding for better/worse values
                          let textColor = 'text-gray-900';
                          if (comparisonRackets.length > 1) {
                            const otherRackets = comparisonRackets.filter((_, i) => i !== index);
                            const avgOtherValue = otherRackets.reduce((sum, r) =>
                              sum + (r[field.key as keyof Racket] as number), 0) / otherRackets.length;

                            if (field.key === 'price') {
                              // Lower price is better
                              if (value < avgOtherValue * 0.9) textColor = 'text-green-600 font-semibold';
                              else if (value > avgOtherValue * 1.1) textColor = 'text-red-600 font-semibold';
                            } else if (['powerLevel', 'controlLevel', 'comfortLevel', 'maneuverLevel', 'stabilityLevel', 'rating'].includes(field.key)) {
                              // Higher is better for performance metrics
                              if (value > avgOtherValue * 1.1) textColor = 'text-green-600 font-semibold';
                              else if (value < avgOtherValue * 0.9) textColor = 'text-red-600 font-semibold';
                            }
                          }

                          return (
                            <td key={racket.id} className={`p-4 text-center ${textColor}`}>
                              {formattedValue}{field.unit}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {comparisonRackets.length > 1 && (
          <Card className="mt-6">
            <CardHeader>
              <h2 className="text-lg font-semibold">比較總結</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-green-700 mb-2">性價比最高</h3>
                  {(() => {
                    const bestValue = comparisonRackets.reduce((best, current) => {
                      const currentScore = (current.powerLevel + current.controlLevel + current.comfortLevel + current.rating * 2) / current.msrp * 10000;
                      const bestScore = (best.powerLevel + best.controlLevel + best.comfortLevel + best.rating * 2) / best.msrp * 10000;
                      return currentScore > bestScore ? current : best;
                    });
                    return (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                          <img src={bestValue.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{bestValue.name}</p>
                          <p className="text-sm text-gray-600">NT$ {bestValue.msrp.toLocaleString()}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div>
                  <h3 className="font-medium text-blue-700 mb-2">最高評分</h3>
                  {(() => {
                    const highest = comparisonRackets.reduce((prev, current) =>
                      current.rating > prev.rating ? current : prev
                    );
                    return (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded overflow-hidden bg-gray-100">
                          <img src={highest.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-medium">{highest.name}</p>
                          <p className="text-sm text-gray-600">{highest.rating}/5 星 ({highest.ratingCount} 評價)</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

export default function RacketComparePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RacketComparePageContent />
    </Suspense>
  );
}