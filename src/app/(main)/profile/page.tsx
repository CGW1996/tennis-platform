'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout, Button, Card, CardContent } from '@/components';
import { useAuthStore } from '@/stores';

export default function ProfilePage() {
    const [loading, setLoading] = useState(true);
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setLoading(false);
    }, [isAuthenticated, router]);

    if (loading) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (!user) {
        return null;
    }

    console.log(user);

    const playingStyleMap: Record<string, string> = {
        'aggressive': '攻擊型',
        'defensive': '防守型',
        'all-court': '全能型',
        'all-around': '全能型',
    };

    const playingFrequencyMap: Record<string, string> = {
        'casual': '休閒',
        'regular': '定期',
        'competitive': '競技',
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">個人資料</h1>
                    <div className="flex space-x-2">
                        {user.role === 'coach' && (
                            <Button
                                onClick={() => router.push('/coaches/profile/edit')}
                                variant="outline"
                            >
                                編輯教練資料
                            </Button>
                        )}
                        <Button onClick={() => router.push('/profile/edit')}>
                            編輯個人資料
                        </Button>
                    </div>
                </div>

                {/* Profile Card */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="flex items-start space-x-6">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
                                    {user.profile?.avatarUrl ? (
                                        <img
                                            src={user.profile.avatarUrl}
                                            alt={user.name || '用戶'}
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
                            </div>

                            {/* User Info */}
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    {user.profile?.firstName && user.profile?.lastName
                                        ? `${user.profile.firstName} ${user.profile.lastName}`
                                        : user.email}
                                </h2>
                                <p className="text-gray-600 mb-4">{user.email}</p>

                                {user.profile?.bio && (
                                    <p className="text-gray-700 mb-4">{user.profile.bio}</p>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {user.profile?.ntrpLevel && (
                                        <div>
                                            <span className="text-sm text-gray-500">NTRP 等級</span>
                                            <p className="font-semibold text-gray-900">{user.profile.ntrpLevel}</p>
                                        </div>
                                    )}

                                    {user.profile?.playingStyle && (
                                        <div>
                                            <span className="text-sm text-gray-500">打球風格</span>
                                            <p className="font-semibold text-gray-900">
                                                {playingStyleMap[user.profile.playingStyle] || user.profile.playingStyle}
                                            </p>
                                        </div>
                                    )}

                                    {user.profile?.preferredHand && (
                                        <div>
                                            <span className="text-sm text-gray-500">慣用手</span>
                                            <p className="font-semibold text-gray-900">
                                                {user.profile.preferredHand === 'right' ? '右手' : '左手'}
                                            </p>
                                        </div>
                                    )}

                                    {user.profile?.playingFrequency && (
                                        <div>
                                            <span className="text-sm text-gray-500">打球頻率</span>
                                            <p className="font-semibold text-gray-900">
                                                {playingFrequencyMap[user.profile.playingFrequency] || user.profile.playingFrequency}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Account Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">帳號資訊</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-500">Email</span>
                                    <p className="text-gray-900">{user.email}</p>
                                </div>
                                {user.phone && (
                                    <div>
                                        <span className="text-sm text-gray-500">電話</span>
                                        <p className="text-gray-900">{user.phone}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-sm text-gray-500">Email 驗證狀態</span>
                                    <p className="text-gray-900">
                                        {user.emailVerified ? (
                                            <span className="text-green-600">✓ 已驗證</span>
                                        ) : (
                                            <span className="text-yellow-600">未驗證</span>
                                        )}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-500">加入時間</span>
                                    <p className="text-gray-900">
                                        {new Date(user.createdAt).toLocaleDateString('zh-TW')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">偏好設定</h3>
                            <div className="space-y-3">
                                {user.profile?.preferredTimes && (
                                    <div>
                                        <span className="text-sm text-gray-500">偏好時段</span>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {(Array.isArray(user.profile.preferredTimes)
                                                ? user.profile.preferredTimes
                                                : typeof user.profile.preferredTimes === 'string'
                                                    ? JSON.parse(user.profile.preferredTimes)
                                                    : []
                                            ).map((time: string) => {
                                                const timeMap: Record<string, string> = {
                                                    'morning': '早上',
                                                    'afternoon': '下午',
                                                    'evening': '晚上',
                                                    'weekday': '平日',
                                                    'weekend': '假日'
                                                };
                                                return (
                                                    <span key={time} className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-sm">
                                                        {timeMap[time] || time}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {user.profile?.maxTravelDistance && (
                                    <div>
                                        <span className="text-sm text-gray-500">最大移動距離</span>
                                        <p className="text-gray-900">{user.profile.maxTravelDistance} km</p>
                                    </div>
                                )}

                                <div>
                                    <span className="text-sm text-gray-500">隱私設定</span>
                                    <p className="text-gray-900">
                                        {user.profile?.profilePrivacy === 'public' ? '公開' :
                                            user.profile?.profilePrivacy === 'private' ? '私密' : '好友'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Frequent Venues */}
                {user.profile?.frequentCourts && user.profile.frequentCourts.length > 0 && (
                    <Card className="mt-6">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">常去場地</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {user.profile.frequentCourts.map((court, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200">
                                                <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">{court.courtName}</h4>
                                            <p className="text-sm text-gray-500">
                                                {court.day} • {court.startTime} - {court.endTime}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Actions */}
                <Card className="mt-6">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">快速功能</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/partners')}
                            >
                                尋找球友
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/courts')}
                            >
                                預訂場地
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push('/coaches')}
                            >
                                找教練
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
