'use client';

import { useState, useEffect } from 'react';
import { MainLayout, Button, Card, CardHeader, CardContent } from '@/components';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface CoachProfile {
    id: string;
    userId: string;
    licenseNumber?: string;
    certifications: string[];
    experience: number;
    specialties: string[];
    biography?: string;
    hourlyRate: number;
    currency: string;
    languages: string[];
    averageRating: number;
    totalReviews: number;
    totalLessons: number;
    isVerified: boolean;
    isActive: boolean;
    availableHours: Record<string, string[]>;
    user?: {
        email: string;
        phone?: string;
        profile?: {
            firstName: string;
            lastName: string;
            avatarUrl?: string;
            bio?: string;
        };
    };
}

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
    monday: '星期一',
    tuesday: '星期二',
    wednesday: '星期三',
    thursday: '星期四',
    friday: '星期五',
    saturday: '星期六',
    sunday: '星期日',
};

const SPECIALTY_LABELS: Record<string, string> = {
    beginner: '初學者教學',
    intermediate: '中級教學',
    advanced: '高級教學',
    junior: '青少年教學',
};

export default function CoachProfilePage() {
    const [profile, setProfile] = useState<CoachProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated || user?.role !== 'coach') {
            toast.error('請以教練身份登入');
            router.push('/login');
            return;
        }
        fetchProfile();
    }, [isAuthenticated, user, router]);

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get<{ coach: CoachProfile }>('/coaches/my-profile');
            setProfile(response.coach);
        } catch (error: any) {
            toast.error(error.response?.data?.message || '載入個人檔案失敗');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="space-y-6">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!profile) {
        return (
            <MainLayout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-gray-500 mb-4">尚未建立教練檔案</p>
                            <Button onClick={() => router.push('/coaches/dashboard')}>返回控制台</Button>
                        </CardContent>
                    </Card>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">個人檔案</h1>
                    <div className="flex space-x-3">
                        <Button variant="outline" onClick={() => router.push('/coaches/dashboard')}>
                            返回控制台
                        </Button>
                        <Button onClick={() => router.push('/coaches/profile/edit')}>
                            編輯檔案
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Personal Information */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">個人資訊</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start space-x-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                    {profile.user?.profile?.avatarUrl ? (
                                        <img
                                            src={profile.user.profile.avatarUrl}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">姓名</label>
                                        <p className="text-gray-900">
                                            {profile.user?.profile?.firstName} {profile.user?.profile?.lastName}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">電子郵件</label>
                                        <p className="text-gray-900">{profile.user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">電話</label>
                                        <p className="text-gray-900">{profile.user?.phone || '未提供'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">認證狀態</label>
                                        <p className="flex items-center">
                                            {profile.isVerified ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    已認證
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    待認證
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Information */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">專業資訊</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">教練證號</label>
                                    <p className="text-gray-900">{profile.licenseNumber || '未提供'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">教學經驗</label>
                                    <p className="text-gray-900">{profile.experience} 年</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">時薪</label>
                                    <p className="text-gray-900">
                                        {profile.currency} ${profile.hourlyRate.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">教學語言</label>
                                    <p className="text-gray-900">
                                        {profile.languages.length > 0 ? profile.languages.join(', ') : '未提供'}
                                    </p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">專長領域</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {profile.specialties.map((specialty) => (
                                            <span
                                                key={specialty}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800"
                                            >
                                                {SPECIALTY_LABELS[specialty] || specialty}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">認證資格</label>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {profile.certifications.length > 0 ? (
                                            profile.certifications.map((cert, idx) => (
                                                <span
                                                    key={idx}
                                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {cert}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-900">無</p>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-500">個人簡介</label>
                                    <p className="text-gray-900 whitespace-pre-wrap mt-1">
                                        {profile.biography || '未提供'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">教學統計</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-3xl font-bold text-emerald-600">{profile.averageRating.toFixed(1)}</p>
                                    <p className="text-sm text-gray-500 mt-1">平均評分</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-3xl font-bold text-blue-600">{profile.totalReviews}</p>
                                    <p className="text-sm text-gray-500 mt-1">評價數量</p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-3xl font-bold text-purple-600">{profile.totalLessons}</p>
                                    <p className="text-sm text-gray-500 mt-1">完成課程</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Available Hours */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">可用時間</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {DAYS_OF_WEEK.map((day) => {
                                    const slots = profile.availableHours[day] || [];
                                    return (
                                        <div key={day} className="flex items-start border-b border-gray-100 pb-3 last:border-0">
                                            <div className="w-24 flex-shrink-0">
                                                <label className="text-sm font-medium text-gray-700">{DAY_LABELS[day]}</label>
                                            </div>
                                            <div className="flex-1">
                                                {slots.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {slots.map((slot, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            >
                                                                {slot}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-400">不可用</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
