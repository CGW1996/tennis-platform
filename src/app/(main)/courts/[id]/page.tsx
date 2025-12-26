'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Court } from '@/types/court';
import { MainLayout, Button, Input, Card, CardHeader, CardContent } from '@/components';
import { bookingFormSchema, type BookingForm } from '@/lib/validations';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';


interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  images?: string[];
}

interface TimeSlot {
  start_time: string;
  end_time: string;
  available: boolean;
  price: number;
}

export default function CourtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [court, setCourt] = useState<Court | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      court_id: id,
      date: new Date(),
    },
  });

  const fetchCourtDetails = async () => {
    try {
      const response = await apiClient.get<Court>(`/courts/${id}`);
      console.log(response);
      setCourt(response);
    } catch (error: any) {
      toast.error('載入場地資訊失敗');
      router.push('/courts');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (date: string) => {
    try {
      const response = await apiClient.get<{ slots: TimeSlot[] }>(
        `/courts/${id}/availability?date=${date}`
      );
      setTimeSlots(response.slots);
    } catch (error: any) {
      toast.error('載入時間段失敗');
    }
  };

  const handleBooking = async (data: BookingForm) => {
    if (!isAuthenticated) {
      toast.error('請先登入');
      router.push('/login');
      return;
    }

    setBookingLoading(true);
    try {
      await apiClient.post('/api/v1/bookings', data);
      toast.success('預訂成功！');
      setShowBookingModal(false);
      if (selectedDate) {
        fetchTimeSlots(selectedDate); // Refresh availability
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || '預訂失敗');
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    fetchCourtDetails();
  }, [id]);

  useEffect(() => {
    if (court && selectedDate) {
      fetchTimeSlots(selectedDate);
    }
  }, [selectedDate, court]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!court) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">場地不存在</h1>
            <Button onClick={() => router.push('/courts')}>
              返回場地列表
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const surfaceTypeMap = {
    hard: '硬地',
    clay: '紅土',
    grass: '草地',
    synthetic: '人工草皮',
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{court.name}</h1>
              <p className="text-gray-600 mb-2">{court.address}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{surfaceTypeMap[court.courtType as keyof typeof surfaceTypeMap] || court.courtType}</span>
                <span>•</span>
                <span>${court.pricePerHour}/小時</span>
                <span>•</span>
                <div className="flex items-center">
                  <span className="text-yellow-500">★</span>
                  <span className="ml-1">{court.averageRating} ({court.totalReviews} 評價)</span>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowBookingModal(true)}
              size="lg"
            >
              立即預訂
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {court.images.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video relative">
                    <img
                      src={court.images[selectedImageIndex]}
                      alt={`${court.name} - 圖片 ${selectedImageIndex + 1}`}
                      className="w-full h-full object-cover rounded-t-lg"
                    />

                    {court.images.length > 1 && (
                      <>
                        <button
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          onClick={() => setSelectedImageIndex(prev =>
                            prev === 0 ? court.images.length - 1 : prev - 1
                          )}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>

                        <button
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70"
                          onClick={() => setSelectedImageIndex(prev =>
                            prev === court.images.length - 1 ? 0 : prev + 1
                          )}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>

                  {court.images.length > 1 && (
                    <div className="p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {court.images.map((image, index) => (
                          <button
                            key={index}
                            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${index === selectedImageIndex ? 'border-emerald-500' : 'border-transparent'
                              }`}
                            onClick={() => setSelectedImageIndex(index)}
                          >
                            <img
                              src={image}
                              alt={`縮圖 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Description */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">場地介紹</h2>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 whitespace-pre-line">
                  {court.description || '暫無詳細介紹'}
                </p>
              </CardContent>
            </Card>

            {/* Facilities */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">設施服務</h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {court.facilities.map((facility) => (
                    <div key={facility} className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">用戶評價</h2>
              </CardHeader>
              <CardContent>
                {(!court.reviews || court.reviews.length === 0) ? (
                  <p className="text-gray-500">暫無評價</p>
                ) : (
                  <div className="space-y-6">
                    {court.reviews?.map((review: Review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            {review.user_avatar ? (
                              <img
                                src={review.user_avatar}
                                alt={review.user_name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-600 font-medium">
                                  {review.user_name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{review.user_name}</h4>
                              <time className="text-sm text-gray-500">
                                {new Date(review.created_at).toLocaleDateString('zh-TW')}
                              </time>
                            </div>

                            <div className="flex items-center mb-2">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>

                            <h5 className="font-medium text-gray-900 mb-1">{review.title}</h5>
                            <p className="text-gray-600 text-sm">{review.content}</p>

                            {review.images && review.images.length > 0 && (
                              <div className="flex space-x-2 mt-3">
                                {review.images.map((image, index) => (
                                  <img
                                    key={index}
                                    src={image}
                                    alt={`評價圖片 ${index + 1}`}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Section */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">場地社群</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Coaches */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">駐場教練</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-emerald-500 cursor-pointer transition-colors" onClick={() => router.push('/coaches')}>
                          <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
                          <div>
                            <p className="font-medium">王大明 教練</p>
                            <p className="text-sm text-gray-500">專業網球教學 10 年經驗</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Clubs */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">常駐社團</h3>
                    <div className="space-y-3">
                      {[1].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors" onClick={() => router.push('/clubs')}>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 font-bold">
                              TC
                            </div>
                            <div>
                              <p className="font-medium">台北網球俱樂部</p>
                              <p className="text-sm text-gray-500">每週六日固定團練</p>
                            </div>
                          </div>
                          <span className="text-xs font-medium bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                            招募中
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Frequent Players */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">常來球友</h3>
                    <div className="flex -space-x-2 overflow-hidden">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-gray-200" title={`User ${i}`}></div>
                      ))}
                      <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-gray-100 text-xs font-medium text-gray-500">
                        +12
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      還有 12 位球友將此設為常去場地
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">聯絡資訊</h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-600">{court.contactPhone}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-600">{court.contactEmail}</span>
                </div>

                {court.website && (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9-9a9 9 0 00-9 9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    <a
                      href={court.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700"
                    >
                      官方網站
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">營業時間</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(court.operatingHours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between">
                      <span className="text-gray-600">{day}</span>
                      <span className="text-gray-900">
                        {hours || '休息'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Booking */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">快速預訂</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      選擇日期
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      可用時段
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {timeSlots.length === 0 ? (
                        <p className="text-gray-500 text-sm">載入中...</p>
                      ) : (
                        timeSlots.map((slot) => (
                          <button
                            key={`${slot.start_time}-${slot.end_time}`}
                            disabled={!slot.available}
                            className={`w-full text-left px-3 py-2 rounded text-sm border transition-colors ${slot.available
                              ? 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              }`}
                            onClick={() => {
                              if (slot.available) {
                                setValue('start_time', slot.start_time);
                                setValue('end_time', slot.end_time);
                                setShowBookingModal(true);
                              }
                            }}
                          >
                            <div className="flex justify-between">
                              <span>{slot.start_time} - {slot.end_time}</span>
                              <span>${slot.price}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {
        showBookingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">確認預訂</h3>

              <form onSubmit={handleSubmit(handleBooking)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    日期
                  </label>
                  <input
                    type="date"
                    {...register('date', { valueAsDate: true })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      開始時間
                    </label>
                    <input
                      type="time"
                      {...register('start_time')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {errors.start_time && (
                      <p className="text-red-600 text-sm mt-1">{errors.start_time.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      結束時間
                    </label>
                    <input
                      type="time"
                      {...register('end_time')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                    {errors.end_time && (
                      <p className="text-red-600 text-sm mt-1">{errors.end_time.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備註 (選填)
                  </label>
                  <textarea
                    rows={3}
                    {...register('notes')}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="有什麼特殊需求嗎？"
                  />
                  {errors.notes && (
                    <p className="text-red-600 text-sm mt-1">{errors.notes.message}</p>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowBookingModal(false)}
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    loading={bookingLoading}
                  >
                    確認預訂
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
    </MainLayout>

  );
}