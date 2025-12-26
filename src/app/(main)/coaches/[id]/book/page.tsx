'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MainLayout, Button, Input, Card, CardHeader, CardContent } from '@/components';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

const bookingSchema = z.object({
  date: z.string().min(1, '請選擇日期'),
  start_time: z.string().min(1, '請選擇開始時間'),
  duration: z.number().min(1, '請選擇課程時長'),
  lesson_type: z.string().min(1, '請選擇課程類型'),
  skill_level: z.string().min(1, '請選擇技能等級'),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface Coach {
  id: string;
  name: string;
  avatar_url?: string;
  hourly_rate: number;
  available_times: {
    [day: string]: { start: string; end: string }[];
  };
}

interface TimeSlot {
  date: string;
  start_time: string;
  end_time: string;
  available: boolean;
}

export default function BookCoachPage() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const params = useParams();
  const { user, isAuthenticated } = useAuthStore();
  const coachId = params.id as string;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
  });

  const watchedDate = watch('date');
  const watchedDuration = watch('duration');

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('請先登入才能預約課程');
      window.location.href = '/login';
      return;
    }
    fetchCoachInfo();
  }, [coachId, isAuthenticated]);

  useEffect(() => {
    if (watchedDate) {
      fetchAvailableSlots(watchedDate);
    }
  }, [watchedDate]);

  const fetchCoachInfo = async () => {
    try {
      const response = await apiClient.get<{ coach: Coach }>(`/coaches/${coachId}`);
      setCoach(response.coach);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '載入教練資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async (date: string) => {
    try {
      const response = await apiClient.get<{ slots: TimeSlot[] }>(`/coaches/${coachId}/availability`, {
        params: { date }
      });
      setAvailableSlots(response.slots);
    } catch (error: any) {
      console.error('載入可預約時段失敗:', error);
    }
  };

  const calculateTotalPrice = () => {
    if (!coach || !watchedDuration) return 0;
    return coach.hourly_rate * (watchedDuration / 60);
  };

  const onSubmit = async (data: BookingForm) => {
    if (!coach) return;

    setSubmitting(true);
    try {
      const bookingData = {
        coach_id: coachId,
        date: data.date,
        start_time: data.start_time,
        duration: data.duration,
        lesson_type: data.lesson_type,
        skill_level: data.skill_level,
        notes: data.notes,
        total_price: calculateTotalPrice(),
      };

      await apiClient.post('/api/v1/bookings', bookingData);
      toast.success('預約成功！');
      window.location.href = '/dashboard/bookings';
    } catch (error: any) {
      toast.error(error.response?.data?.message || '預約失敗');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate next 14 days for date selection
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('zh-TW', {
          weekday: 'short',
          month: 'numeric',
          day: 'numeric'
        })
      });
    }
    return dates;
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!coach) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">找不到該教練</div>
            <Button variant="outline" onClick={() => window.location.href = '/coaches'}>
              返回教練列表
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => window.location.href = `/coaches/${coachId}`}
            className="mb-4"
          >
            ← 返回教練資料
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">預約課程</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold">課程預約</h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      選擇日期
                    </label>
                    <select
                      {...register('date')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">請選擇日期</option>
                      {getAvailableDates().map((date) => (
                        <option key={date.value} value={date.value}>
                          {date.label}
                        </option>
                      ))}
                    </select>
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>

                  {/* Time Selection */}
                  {watchedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        選擇時間
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {availableSlots.map((slot) => (
                          <button
                            key={`${slot.start_time}-${slot.end_time}`}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => setValue('start_time', slot.start_time)}
                            className={`p-2 rounded-lg border text-sm transition-colors ${slot.available
                                ? 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
                                : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                          >
                            {slot.start_time} - {slot.end_time}
                          </button>
                        ))}
                      </div>
                      {errors.start_time && (
                        <p className="text-red-500 text-sm mt-1">{errors.start_time.message}</p>
                      )}
                    </div>
                  )}

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      課程時長
                    </label>
                    <select
                      {...register('duration', { valueAsNumber: true })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">請選擇時長</option>
                      <option value={60}>1小時</option>
                      <option value={90}>1.5小時</option>
                      <option value={120}>2小時</option>
                    </select>
                    {errors.duration && (
                      <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
                    )}
                  </div>

                  {/* Lesson Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      課程類型
                    </label>
                    <select
                      {...register('lesson_type')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">請選擇類型</option>
                      <option value="private">一對一私人課程</option>
                      <option value="semi-private">一對二課程</option>
                      <option value="group">團體課程</option>
                      <option value="assessment">技能評估</option>
                    </select>
                    {errors.lesson_type && (
                      <p className="text-red-500 text-sm mt-1">{errors.lesson_type.message}</p>
                    )}
                  </div>

                  {/* Skill Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      技能等級
                    </label>
                    <select
                      {...register('skill_level')}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">請選擇等級</option>
                      <option value="beginner">初學者</option>
                      <option value="intermediate">中級</option>
                      <option value="advanced">高級</option>
                      <option value="professional">專業級</option>
                    </select>
                    {errors.skill_level && (
                      <p className="text-red-500 text-sm mt-1">{errors.skill_level.message}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      備註 (可選)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="請告訴教練您的特殊需求或期望..."
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.location.href = `/coaches/${coachId}`}
                      className="flex-1"
                    >
                      取消
                    </Button>
                    <Button
                      type="submit"
                      loading={submitting}
                      className="flex-1"
                    >
                      確認預約
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <h3 className="text-lg font-semibold">預約摘要</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Coach Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                    {coach.avatar_url ? (
                      <img
                        src={coach.avatar_url}
                        alt={coach.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{coach.name}</h4>
                    <p className="text-sm text-gray-500">網球教練</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>時薪：</span>
                      <span className="font-medium">NT$ {coach.hourly_rate}</span>
                    </div>
                    {watchedDuration && (
                      <div className="flex justify-between">
                        <span>時長：</span>
                        <span className="font-medium">{watchedDuration / 60} 小時</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>總計：</span>
                    <span className="text-emerald-600">NT$ {calculateTotalPrice()}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                  <div className="font-medium mb-1">預約須知：</div>
                  <ul className="space-y-1 text-xs">
                    <li>• 預約確認後將發送通知至您的信箱</li>
                    <li>• 課程開始前24小時可免費取消</li>
                    <li>• 請準時出席，遲到將影響課程時間</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}