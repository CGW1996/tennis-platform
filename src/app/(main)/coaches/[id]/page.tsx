'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MainLayout, Button, Card, CardHeader, CardContent } from '@/components';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { CoachDetail } from '@/types/coach';
import { getCertificationText, getSpecialtyText, getDayText } from '@/constants/coaches';
import ConsultationModal from '@/components/coaches/ConsultationModal';
import { useChatApi } from '@/hooks/useChatApi';

interface Coach {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  certification_level: string;
  experience_years: number;
  specialties: string[];
  hourly_rate: number;
  location: string;
  rating: number;
  rating_count: number;
  bio: string;
  languages: string[];
  available_times: {
    [day: string]: { start: string; end: string }[];
  };
  certifications: string[];
  total_lessons: number;
  is_verified: boolean;
}

interface Review {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  content: string;
  created_at: string;
}

export default function CoachDetailPage() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'schedule'>('overview');
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, token } = useAuthStore();
  const coachId = params.id as string;

  const { chatRooms, createChatRoom, sendMessage } = useChatApi({ accessToken: token || undefined });

  useEffect(() => {
    fetchCoachDetails();
    fetchReviews();
  }, [coachId]);

  const fetchCoachDetails = async () => {
    try {
      const response = await apiClient.get<CoachDetail>(`/coaches/${coachId}`);

      // Map API response to Coach interface for UI
      const mappedCoach: Coach = {
        id: response.id,
        user_id: response.userId,
        name: `${response.user.profile.firstName} ${response.user.profile.lastName}`,
        avatar_url: response.user.profile.avatarUrl || undefined,
        certification_level: response.certifications[0] || '',
        experience_years: response.experience,
        specialties: response.specialties,
        hourly_rate: response.hourlyRate,
        location: '台北市', // Placeholder as backend doesn't return city name yet
        rating: response.averageRating,
        rating_count: response.totalReviews,
        bio: response.biography,
        languages: response.languages,
        available_times: Object.entries(response.availableHours || {}).reduce((acc, [day, times]) => {
          acc[day] = times.map(time => {
            const parts = time.split('-');
            return { start: parts[0] || '', end: parts[1] || '' };
          });
          return acc;
        }, {} as Coach['available_times']),
        certifications: response.certifications,
        total_lessons: response.totalLessons,
        is_verified: response.isVerified,
      };

      setCoach(mappedCoach);
    } catch (error: any) {
      toast.error(error.response?.data?.message || '載入教練資料失敗');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await apiClient.get<{ reviews: Review[] }>(`/coach-reviews/${coachId}`);
      if ('reviews' in response) {
        setReviews(response.reviews);
      } else if (Array.isArray(response)) {
        setReviews(response);
      } else {
        console.warn('Unexpected reviews response structure:', response);
        setReviews([]);
      }
    } catch (error: any) {
      console.error('載入評價失敗:', error);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('請先登入才能預約課程');
      router.push('/login');
      return;
    }
    router.push(`/coaches/${coachId}/book`);
  };

  const getOrCreateChatRoom = async () => {
    if (!coach || !user) return null;

    try {
      // 尋找現有的聊天室
      const existingRoom = chatRooms.find(room =>
        room.type === 'direct' &&
        room.participants.some(p => p.userId === coach.user_id) &&
        room.participants.some(p => p.userId === user.id)
      );

      if (existingRoom) {
        return existingRoom;
      }

      // 創建新聊天室
      const newRoom = await createChatRoom({
        type: 'direct',
        participantIds: [coach.user_id]
      });

      return newRoom;
    } catch (error) {
      console.error('Failed to get or create chat room:', error);
      toast.error('無法建立聊天室，請稍後再試');
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!isAuthenticated) {
      toast.error('請先登入才能發送訊息');
      router.push('/login');
      return;
    }

    if (!coach) return;

    setIsProcessing(true);
    const room = await getOrCreateChatRoom();
    setIsProcessing(false);

    if (room) {
      router.push(`/chat?roomId=${room.id}`);
    }
  };

  const handleConsultationSubmit = async (data: any) => {
    if (!isAuthenticated) {
      toast.error('請先登入才能諮詢');
      router.push('/login');
      return;
    }

    if (!coach) return;

    setIsProcessing(true);
    const room = await getOrCreateChatRoom();

    if (room) {
      try {
        const messageContent = `
【課程諮詢表單】
• 網球經驗：${data.experience}
• 學習動機：${data.motivation}
• 年齡：${data.age}
• 學生人數：${data.studentCount}
• 性別指定：${data.genderPreference === 'male' ? '男教練' : data.genderPreference === 'female' ? '女教練' : '不拘'}
• 器材需求：${data.needEquipment ? '需要' : '不需要'}
• 上課時長：${data.duration}
• 上課頻率：${data.frequency}
• 方便時間：${data.preferredTime}
• 偏好地點：${data.location}
• 服務地區：${data.area}
• 聯絡Email：${data.email}
• 備註：${data.notes || '無'}
        `.trim();

        await sendMessage({
          chatRoomId: room.id,
          content: messageContent,
          messageType: 'text'
        });

        toast.success('諮詢已發送');
        setIsConsultationOpen(false);
        router.push(`/chat?roomId=${room.id}`);
      } catch (error) {
        console.error('Failed to send consultation:', error);
        toast.error('發送失敗，請稍後再試');
      }
    }
    setIsProcessing(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!coach) {
    return (
      <MainLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">找不到該教練</div>
            <Button variant="outline" onClick={() => router.push('/coaches')}>
              返回教練列表
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            <div className="flex-shrink-0">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {coach.avatar_url ? (
                  <img
                    src={coach.avatar_url}
                    alt={coach.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 w-full text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{coach.name}</h1>
                  <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-600 mb-2">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">
                      {getCertificationText(coach.certification_level)}
                    </span>
                    <span>{coach.experience_years} 年經驗</span>
                  </div>

                  <div className="flex items-center justify-center md:justify-start mb-3">
                    <div className="flex items-center mr-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < coach.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="ml-2 text-gray-600">
                        {coach.rating} ({coach.rating_count} 評價)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {coach.location}
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                      </svg>
                      {coach.languages.join(', ')}
                    </div>
                  </div>
                </div>

                <div className="text-center md:text-right mt-4 md:mt-0">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    ${coach.hourly_rate}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">每小時</div>
                  <div className="flex flex-col space-y-2">
                    <Button onClick={handleBooking} size="lg" className="w-full">
                      預約課程
                    </Button>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsConsultationOpen(true)}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        課程諮詢
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleSendMessage}
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        傳遞訊息
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto">
              {[
                { key: 'overview', label: '教練簡介' },
                { key: 'reviews', label: '學員評價' },
                { key: 'schedule', label: '課程時間' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.key
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">教練簡介</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{coach.bio}</p>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">教學專長</h3>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map((specialty) => (
                      <span
                        key={specialty}
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm"
                      >
                        {getSpecialtyText(specialty)}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">教練認證</h3>
                  <div className="flex flex-wrap gap-2">
                    {coach.certifications.map((cert, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Total Lessons */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">教學紀錄</h3>
                  <div className="flex items-center space-x-4 text-gray-700">
                    <div>
                      <span className="text-2xl font-bold text-emerald-600">{coach.total_lessons}</span>
                      <span className="ml-2 text-sm">堂課</span>
                    </div>
                    {coach.is_verified && (
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        已驗證
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">學員評價</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-yellow-500">{coach.rating}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${i < coach.rating ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-gray-600">({coach.rating_count} 評價)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                          {review.user_avatar ? (
                            <img
                              src={review.user_avatar}
                              alt={review.user_name}
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

                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{review.user_name}</h4>
                            <div className="flex">
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
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('zh-TW')}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {reviews.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      尚無學員評價
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'schedule' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">可預約時間</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(coach.available_times)
                    .sort((a, b) => {
                      const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                      return dayOrder.indexOf(a[0]) - dayOrder.indexOf(b[0]);
                    })
                    .map(([day, times]) => (
                      <Card key={day}>
                        <CardHeader key={`${day}-header`}>
                          <h4 className="font-medium">{getDayText(day)}</h4>
                        </CardHeader>
                        <CardContent key={`${day}-content`}>
                          {times.length > 0 ? (
                            <div className="space-y-2">
                              {times.map((time, index) => (
                                <div key={index} className="text-sm text-gray-600">
                                  {time.start} - {time.end}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">不開放</div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    💡 實際可預約時間可能因教練排程變動而有所不同，建議預約前先與教練確認。
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Consultation Modal */}
        <ConsultationModal
          isOpen={isConsultationOpen}
          onClose={() => setIsConsultationOpen(false)}
          onSubmit={handleConsultationSubmit}
          coachName={coach.name}
        />
      </div>
    </MainLayout>
  );
}