'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MainLayout, Button, Card, CardContent } from '@/components';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Racket, Review } from '@/types/racket';
import {
  RacketGallery,
  RacketInfo,
  RacketOverview,
  RacketSpecs,
  RacketReviews,
  SimilarRackets
} from '@/components/rackets';

export default function RacketDetailPage() {
  const [racket, setRacket] = useState<Racket | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarRackets, setSimilarRackets] = useState<Racket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews' | 'comparisons'>('overview');

  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const racketId = params.id as string;

  useEffect(() => {
    fetchRacketDetails();
    fetchReviews();
  }, [racketId]);

  const fetchRacketDetails = async () => {
    try {
      const response = await apiClient.get<Racket>(`/rackets/${racketId}`);
      setRacket(response);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '載入球拍資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get<{ reviews: Review[] }>(`/rackets/${racketId}/reviews`);
      setReviews(response.reviews);
    } catch (error: any) {
      console.error('載入評價失敗:', error);
    }
  };

  const addToComparison = async () => {
    if (!isAuthenticated) {
      toast.error('請先登入以使用比較功能');
      return;
    }

    try {
      await apiClient.post('/rackets/comparison/add', { racket_id: racketId });
      toast.success('已加入比較清單');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '加入比較失敗');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!racket) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">找不到該球拍</div>
            <Button variant="outline" onClick={() => window.location.href = '/rackets'}>
              返回球拍列表
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Images */}
          <RacketGallery racket={racket} />

          {/* Product Info */}
          <RacketInfo racket={racket} onAddToComparison={addToComparison} />
        </div>

        {/* Tabs */}
        <Card>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {[
                { key: 'overview', label: '概述' },
                { key: 'specs', label: '詳細規格' },
                { key: 'reviews', label: '用戶評價' },
                { key: 'comparisons', label: '相似產品' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-3 px-6 border-b-2 font-medium text-sm ${activeTab === tab.key
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <CardContent className="p-6">
            {activeTab === 'overview' && <RacketOverview racket={racket} />}
            {activeTab === 'specs' && <RacketSpecs racket={racket} />}
            {activeTab === 'reviews' && <RacketReviews reviews={reviews} />}
            {activeTab === 'comparisons' && <SimilarRackets rackets={similarRackets} />}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}