'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { MainLayout, Button, Input, Card, CardContent } from '@/components';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/lib/api-client';
import toast from 'react-hot-toast';

interface ProfileFormData {
    firstName: string;
    lastName: string;
    bio?: string;
    ntrpLevel?: number;
    playingStyle?: string;
    preferredHand?: string;
    playingFrequency?: string;
    preferredTimes?: string[];
    maxTravelDistance?: number;
    profilePrivacy?: string;
    frequentCourts?: {
        courtId: string;
        courtName: string;
        day: string;
        startTime: string;
        endTime: string;
    }[];
}

export default function ProfileEditPage() {
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const { user, isAuthenticated, updateUser } = useAuthStore();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<ProfileFormData>({
        defaultValues: {
            firstName: user?.profile?.firstName || '',
            lastName: user?.profile?.lastName || '',
            bio: user?.profile?.bio || '',
            ntrpLevel: user?.profile?.ntrpLevel || 3.0,
            playingStyle: user?.profile?.playingStyle || '',
            preferredHand: user?.profile?.preferredHand || 'right',
            playingFrequency: user?.profile?.playingFrequency || '',
            preferredTimes: [],
            maxTravelDistance: user?.profile?.maxTravelDistance || 10,
            profilePrivacy: user?.profile?.profilePrivacy || 'public',
            frequentCourts: user?.profile?.frequentCourts || [],
        },
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        if (user?.profile?.avatarUrl) {
            setAvatarPreview(user.profile.avatarUrl);
        }

        // Set preferredTimes from user profile
        if (user?.profile?.preferredTimes) {
            const times = Array.isArray(user.profile.preferredTimes)
                ? user.profile.preferredTimes
                : typeof user.profile.preferredTimes === 'string'
                    ? JSON.parse(user.profile.preferredTimes)
                    : [];
            setValue('preferredTimes', times);
        }
    }, [isAuthenticated, router, user, setValue]);

    const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('圖片大小不能超過 5MB');
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        setLoading(true);
        try {
            let avatarUrl = user?.profile?.avatarUrl;

            // Upload avatar if selected
            if (avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);

                const uploadResponse = await apiClient.post<{ url: string }>(
                    '/upload/avatar',
                    formData
                );
                avatarUrl = uploadResponse.url;
            }

            // Update profile
            const response = await apiClient.put<any>('/users/profile', {
                ...data,
                avatarUrl,
            });

            // Update user in store
            if (user && user.profile) {
                updateUser({
                    ...user,
                    profile: {
                        ...user.profile,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        bio: data.bio || user.profile.bio,
                        ntrpLevel: data.ntrpLevel || user.profile.ntrpLevel,
                        playingStyle: data.playingStyle || user.profile.playingStyle,
                        preferredHand: data.preferredHand || user.profile.preferredHand,
                        playingFrequency: data.playingFrequency || user.profile.playingFrequency,
                        maxTravelDistance: data.maxTravelDistance || user.profile.maxTravelDistance,
                        profilePrivacy: data.profilePrivacy || user.profile.profilePrivacy,
                        avatarUrl: avatarUrl || user.profile.avatarUrl,
                        preferredTimes: data.preferredTimes ? JSON.stringify(data.preferredTimes) : user.profile.preferredTimes,
                    },
                });
            }

            toast.success('個人資料更新成功！');
            router.push('/profile');
        } catch (error: any) {
            toast.error(error.response?.data?.message || '更新失敗');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return null;
    }

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">編輯個人資料</h1>
                    <p className="mt-1 text-sm text-gray-600">
                        更新您的個人資訊和偏好設定
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Avatar Upload */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">頭像</h3>
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt="頭像預覽"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <svg
                                                className="w-12 h-12 text-gray-400"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="sr-only"
                                        id="avatar-upload"
                                    />
                                    <label
                                        htmlFor="avatar-upload"
                                        className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        上傳頭像
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">
                                        支援 JPG、PNG 格式，最大 5MB
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Basic Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">基本資訊</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Input
                                    label="名字"
                                    {...register('firstName', { required: '請輸入名字' })}
                                    error={errors.firstName?.message}
                                />

                                <Input
                                    label="姓氏"
                                    {...register('lastName', { required: '請輸入姓氏' })}
                                    error={errors.lastName?.message}
                                />

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        個人簡介
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="介紹一下您的網球經歷和風格..."
                                        {...register('bio')}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tennis Info */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">網球資訊</h3>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <Input
                                    label="NTRP 等級"
                                    type="number"
                                    step="0.5"
                                    min="1"
                                    max="7"
                                    {...register('ntrpLevel', { valueAsNumber: true })}
                                    error={errors.ntrpLevel?.message}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        打球風格
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        {...register('playingStyle')}
                                    >
                                        <option value="">請選擇</option>
                                        <option value="aggressive">攻擊型</option>
                                        <option value="defensive">防守型</option>
                                        <option value="all-court">全能型</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        慣用手
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        {...register('preferredHand')}
                                    >
                                        <option value="right">右手</option>
                                        <option value="left">左手</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        打球頻率
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        {...register('playingFrequency')}
                                    >
                                        <option value="">請選擇</option>
                                        <option value="casual">休閒</option>
                                        <option value="regular">定期</option>
                                        <option value="competitive">競技</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preferences */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">偏好設定</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        偏好時段
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value="weekday"
                                                className="mr-2 rounded text-emerald-600"
                                                {...register('preferredTimes')}
                                            />
                                            平日
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value="weekend"
                                                className="mr-2 rounded text-emerald-600"
                                                {...register('preferredTimes')}
                                            />
                                            假日
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value="morning"
                                                className="mr-2 rounded text-emerald-600"
                                                {...register('preferredTimes')}
                                            />
                                            早上 (6:00-12:00)
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value="afternoon"
                                                className="mr-2 rounded text-emerald-600"
                                                {...register('preferredTimes')}
                                            />
                                            下午 (12:00-18:00)
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                value="evening"
                                                className="mr-2 rounded text-emerald-600"
                                                {...register('preferredTimes')}
                                            />
                                            晚上 (18:00-22:00)
                                        </label>
                                    </div>
                                </div>

                                <Input
                                    label="最大移動距離 (km)"
                                    type="number"
                                    min="1"
                                    max="100"
                                    {...register('maxTravelDistance', { valueAsNumber: true })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        隱私設定
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        {...register('profilePrivacy')}
                                    >
                                        <option value="public">公開</option>
                                        <option value="friends">僅好友</option>
                                        <option value="private">私密</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>



                    {/* Frequent Venues */}
                    <Card>
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold mb-4">常去場地</h3>
                            <FrequentCourtsEditor
                                courts={watch('frequentCourts') || []}
                                onChange={(courts) => setValue('frequentCourts', courts)}
                            />
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/profile')}
                        >
                            取消
                        </Button>
                        <Button type="submit" loading={loading}>
                            儲存變更
                        </Button>
                    </div>
                </form>
            </div >
        </MainLayout >
    );
}

function FrequentCourtsEditor({
    courts,
    onChange
}: {
    courts: { courtId: string; courtName: string; day: string; startTime: string; endTime: string }[];
    onChange: (courts: any[]) => void;
}) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCourt, setNewCourt] = useState({
        courtId: '',
        courtName: '',
        day: '平日',
        startTime: '18:00',
        endTime: '20:00'
    });

    const handleAdd = () => {
        if (!newCourt.courtName) return;
        onChange([...courts, { ...newCourt, courtId: `temp-${Date.now()}` }]);
        setNewCourt({ courtId: '', courtName: '', day: '平日', startTime: '18:00', endTime: '20:00' });
        setIsAdding(false);
    };

    const handleRemove = (index: number) => {
        onChange(courts.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-4">
            {courts.map((court, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium text-gray-900">{court.courtName}</p>
                        <p className="text-sm text-gray-500">{court.day} {court.startTime}-{court.endTime}</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="text-red-500 hover:text-red-700"
                    >
                        刪除
                    </button>
                </div>
            ))}

            {isAdding ? (
                <div className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <Input
                        label="場地名稱"
                        value={newCourt.courtName}
                        onChange={(e) => setNewCourt({ ...newCourt, courtName: e.target.value })}
                        placeholder="例如：台北網球中心"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        <select
                            value={newCourt.day}
                            onChange={(e) => setNewCourt({ ...newCourt, day: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1"
                        >
                            <option value="平日">平日</option>
                            <option value="假日">假日</option>
                            <option value="Monday">週一</option>
                            <option value="Tuesday">週二</option>
                            <option value="Wednesday">週三</option>
                            <option value="Thursday">週四</option>
                            <option value="Friday">週五</option>
                            <option value="Saturday">週六</option>
                            <option value="Sunday">週日</option>
                        </select>
                        <input
                            type="time"
                            value={newCourt.startTime}
                            onChange={(e) => setNewCourt({ ...newCourt, startTime: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1"
                        />
                        <input
                            type="time"
                            value={newCourt.endTime}
                            onChange={(e) => setNewCourt({ ...newCourt, endTime: e.target.value })}
                            className="border border-gray-300 rounded px-2 py-1"
                        />
                    </div>
                    <div className="flex space-x-2">
                        <Button size="sm" onClick={handleAdd}>確認</Button>
                        <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>取消</Button>
                    </div>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsAdding(true)}
                >
                    + 新增常去場地
                </Button>
            )}
        </div>
    );
}
