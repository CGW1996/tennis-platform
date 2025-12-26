'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { MainLayout, Card, CardContent } from '@/components';
import { courtSearchSchema, type CourtSearchForm as CourtSearchFormType } from '@/lib/validations';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { Court, SearchFilters } from '@/types/court';
import { CourtSearchForm } from '@/components/courts/CourtSearchForm';
import { CourtFilters } from '@/components/courts/CourtFilters';
import { CourtList } from '@/components/courts/CourtList';

// Dynamic import for map component to avoid SSR issues
const MapView = dynamic(
  () => import('@/components/courts/MapView'),
  { ssr: false }
);

export default function CourtsPage() {
  const router = useRouter();
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    priceRange: [0, 2000],
    courtType: '',
    facilities: [],
    sortBy: 'distance',
  });

  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CourtSearchFormType>({
    resolver: zodResolver(courtSearchSchema),
  });

  const searchCourts = async (data?: CourtSearchFormType) => {
    setLoading(true);
    try {
      const searchParams = {
        ...data,
        location: data?.location || user?.location,
        radius: data?.radius || 10,
        price_range: {
          min: filters.priceRange[0],
          max: filters.priceRange[1],
        },
        facilities: filters.facilities,
        courtType: filters.courtType || undefined,
      };

      // Fix: Handle different response structures
      const response = await apiClient.get<{ courts: Court[] }>('/courts');
      setCourts(response.courts);
    } catch (error: any) {
      console.error('Search courts error:', error);
      toast.error(error.response?.data?.message || '搜尋失敗');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCourts = useMemo(() => {
    let filtered = courts.filter((court) => {
      // Safe checks for properties
      const price = Number(court.pricePerHour) || 0;
      const surface = court.courtType || '';
      const courtFacilities = Array.isArray(court.facilities) ? court.facilities : [];

      const withinPriceRange = price >= filters.priceRange[0] &&
        price <= filters.priceRange[1];

      const matchesSurface = !filters.courtType || surface === filters.courtType;

      const hasFacilities = filters.facilities.length === 0 ||
        filters.facilities.every(f => courtFacilities.includes(f));

      if (!withinPriceRange || !matchesSurface || !hasFacilities) {
        console.log(`Court ${court.name} filtered out:`, {
          withinPriceRange,
          matchesSurface,
          hasFacilities,
          price,
          surface,
          courtFacilities
        });
      }

      return withinPriceRange && matchesSurface && hasFacilities;
    });

    // Sort courts
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'distance':
          return (a.distance || 0) - (b.distance || 0);
        case 'price':
          return (Number(a.pricePerHour) || 0) - (Number(b.pricePerHour) || 0);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [courts, filters]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('location', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success('位置取得成功');
        },
        () => {
          toast.error('無法取得位置');
        }
      );
    } else {
      toast.error('瀏覽器不支援定位功能');
    }
  };

  useEffect(() => {
    searchCourts();
  }, []);

  const handleCourtSelect = (court: Court) => {
    if (viewMode === 'list') {
      router.push(`/courts/${court.id}`);
    } else {
      setSelectedCourt(court);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CourtSearchForm
          register={register}
          onSearch={handleSubmit(searchCourts)}
          onLocationClick={getCurrentLocation}
          loading={loading}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <CourtFilters
          register={register}
          errors={errors}
          filters={filters}
          onFilterChange={setFilters}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <CourtList
            courts={filteredAndSortedCourts}
            loading={loading}
            selectedCourt={selectedCourt}
            onSelectCourt={handleCourtSelect}
            viewMode={viewMode}
          />

          {viewMode === 'map' && (
            <div className="lg:w-1/2">
              <div className="sticky top-4">
                <Card className="h-[600px]">
                  <CardContent className="p-0 h-full">
                    <MapView
                      courts={filteredAndSortedCourts}
                      selectedCourt={selectedCourt}
                      onCourtSelect={(court: Court) => setSelectedCourt(court)}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}