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
    availableHours: Record<string, string[]>;
    user?: {
        email: string;
        phone?: string;
        profile?: {
            firstName: string;
            lastName: string;
            avatarUrl?: string;
        };
    };
}

interface FormData {
    licenseNumber: string;
    certifications: string[];
    experience: number;
    specialties: string[];
    biography: string;
    hourlyRate: number;
    currency: string;
    languages: string[];
    availableHours: Record<string, string[]>;
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

const SPECIALTIES = [
    { value: 'beginner', label: '初學者教學' },
    { value: 'intermediate', label: '中級教學' },
    { value: 'advanced', label: '高級教學' },
    { value: 'junior', label: '青少年教學' },
];

const CERTIFICATIONS = [
    'PTR 職業網球教練認證',
    'USPTA 美國職業網球教練協會',
    'ITF 國際網球總會教練認證',
    'CTCA 中華民國網球協會教練證',
    'RPT 註冊職業網球教練',
];

const LANGUAGES = ['中文', '英文', '日文', '韓文', '西班牙文', '法文'];

const CURRENCIES = [
    { value: 'TWD', label: 'TWD (新台幣)' },
    { value: 'USD', label: 'USD (美元)' },
    { value: 'EUR', label: 'EUR (歐元)' },
];

export default function CoachProfileEditPage() {
    const [profile, setProfile] = useState<CoachProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    const [formData, setFormData] = useState<FormData>({
        licenseNumber: '',
        certifications: [],
        experience: 0,
        specialties: [],
        biography: '',
        hourlyRate: 0,
        currency: 'TWD',
        languages: [],
        availableHours: {},
    });

    // State for adding new time slots
    const [newSlots, setNewSlots] = useState<Record<string, { start: string; end: string }>>({});

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
            setFormData({
                licenseNumber: response.coach.licenseNumber || '',
                certifications: response.coach.certifications || [],
                experience: response.coach.experience || 0,
                specialties: response.coach.specialties || [],
                biography: response.coach.biography || '',
                hourlyRate: response.coach.hourlyRate || 0,
                currency: response.coach.currency || 'TWD',
                languages: response.coach.languages || [],
                availableHours: response.coach.availableHours || {},
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || '載入個人檔案失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (formData.specialties.length === 0) {
            toast.error('請至少選擇一個專長領域');
            return;
        }

        if (formData.hourlyRate <= 0) {
            toast.error('時薪必須大於 0');
            return;
        }

        if (formData.experience < 0 || formData.experience > 50) {
            toast.error('教學經驗必須在 0-50 年之間');
            return;
        }

        setSaving(true);
        try {
            await apiClient.put(`/coaches/${profile?.id}`, formData);
            toast.success('個人檔案更新成功');
            router.push('/coaches/profile');
        } catch (error: any) {
            toast.error(error.response?.data?.message || '更新失敗');
        } finally {
            setSaving(false);
        }
    };

    const toggleArrayItem = (array: string[], item: string) => {
        return array.includes(item)
            ? array.filter((i) => i !== item)
            : [...array, item];
    };

    const addTimeSlot = (day: string) => {
        const slot = newSlots[day];
        if (!slot || !slot.start || !slot.end) {
            toast.error('請輸入開始和結束時間');
            return;
        }

        const timeSlot = `${slot.start}-${slot.end}`;
        const daySlots = formData.availableHours[day] || [];

        setFormData({
            ...formData,
            availableHours: {
                ...formData.availableHours,
                [day]: [...daySlots, timeSlot],
            },
        });

        setNewSlots({
            ...newSlots,
            [day]: { start: '', end: '' },
        });
    };

    const removeTimeSlot = (day: string, index: number) => {
        const daySlots = formData.availableHours[day] || [];
        const newDaySlots = daySlots.filter((_, i) => i !== index);

        setFormData({
            ...formData,
            availableHours: {
                ...formData.availableHours,
                [day]: newDaySlots,
            },
        });
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="h-96 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">編輯個人檔案</h1>
                    <Button variant="outline" onClick={() => router.push('/coaches/profile')}>
                        取消
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">基本資訊</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        教練證號
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="選填"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        教學經驗 (年) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={formData.experience}
                                        onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        時薪 <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        貨幣 <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.currency}
                                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        required
                                    >
                                        {CURRENCIES.map((curr) => (
                                            <option key={curr.value} value={curr.value}>
                                                {curr.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Specialties */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">專長領域 <span className="text-red-500">*</span></h2>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {SPECIALTIES.map((specialty) => (
                                    <label
                                        key={specialty.value}
                                        className={`flex items-center px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${formData.specialties.includes(specialty.value)
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.specialties.includes(specialty.value)}
                                            onChange={() =>
                                                setFormData({
                                                    ...formData,
                                                    specialties: toggleArrayItem(formData.specialties, specialty.value),
                                                })
                                            }
                                            className="mr-2"
                                        />
                                        {specialty.label}
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Certifications */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">認證資格</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {CERTIFICATIONS.map((cert) => (
                                    <label key={cert} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.certifications.includes(cert)}
                                            onChange={() =>
                                                setFormData({
                                                    ...formData,
                                                    certifications: toggleArrayItem(formData.certifications, cert),
                                                })
                                            }
                                            className="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                        />
                                        <span className="text-sm text-gray-700">{cert}</span>
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Languages */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">教學語言</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-3">
                                {LANGUAGES.map((lang) => (
                                    <label
                                        key={lang}
                                        className={`flex items-center px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${formData.languages.includes(lang)
                                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.languages.includes(lang)}
                                            onChange={() =>
                                                setFormData({
                                                    ...formData,
                                                    languages: toggleArrayItem(formData.languages, lang),
                                                })
                                            }
                                            className="mr-2"
                                        />
                                        {lang}
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Biography */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">個人簡介</h2>
                        </CardHeader>
                        <CardContent>
                            <textarea
                                value={formData.biography}
                                onChange={(e) => setFormData({ ...formData, biography: e.target.value })}
                                rows={6}
                                maxLength={1000}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="介紹您的教學理念、經歷、專長等..."
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                {formData.biography.length} / 1000 字
                            </p>
                        </CardContent>
                    </Card>

                    {/* Available Hours */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">可用時間</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {DAYS_OF_WEEK.map((day) => {
                                    const slots = formData.availableHours[day] || [];
                                    const newSlot = newSlots[day] || { start: '', end: '' };

                                    return (
                                        <div key={day} className="border-b border-gray-100 pb-4 last:border-0">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {DAY_LABELS[day]}
                                            </label>

                                            {/* Existing slots */}
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {slots.map((slot, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    >
                                                        {slot}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTimeSlot(day, idx)}
                                                            className="ml-2 text-emerald-600 hover:text-emerald-800"
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add new slot */}
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="time"
                                                    value={newSlot.start}
                                                    onChange={(e) =>
                                                        setNewSlots({
                                                            ...newSlots,
                                                            [day]: { ...newSlot, start: e.target.value },
                                                        })
                                                    }
                                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                                <span className="text-gray-500">至</span>
                                                <input
                                                    type="time"
                                                    value={newSlot.end}
                                                    onChange={(e) =>
                                                        setNewSlots({
                                                            ...newSlots,
                                                            [day]: { ...newSlot, end: e.target.value },
                                                        })
                                                    }
                                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                />
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={() => addTimeSlot(day)}
                                                    variant="outline"
                                                >
                                                    新增
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/coaches/profile')}
                            disabled={saving}
                        >
                            取消
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? '儲存中...' : '儲存變更'}
                        </Button>
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
