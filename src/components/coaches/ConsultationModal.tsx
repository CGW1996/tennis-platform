'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components';

interface ConsultationData {
    experience: string;
    motivation: string;
    age: number;
    studentCount: number;
    genderPreference: string;
    needEquipment: boolean;
    duration: string;
    frequency: string;
    preferredTime: string;
    location: string;
    notes: string;
    area: string;
    email: string;
}

interface ConsultationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ConsultationData) => void;
    coachName: string;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    coachName,
}) => {
    const [formData, setFormData] = useState<ConsultationData>({
        experience: 'no_experience',
        motivation: '',
        age: 0,
        studentCount: 1,
        genderPreference: 'none',
        needEquipment: false,
        duration: '1h',
        frequency: 'weekly',
        preferredTime: '',
        location: '',
        notes: '',
        area: '',
        email: '',
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? Number(value) : value
        }));
    };

    const handleCheckboxChange = (name: string, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRadioChange = (name: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            />

            {/* Modal Content */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-900">
                        向 {coachName} 諮詢課程
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500 transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Experience */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">您有學習網球的經驗嗎？</label>
                        <div className="flex flex-wrap gap-4">
                            {['no_experience:無經驗', 'less_than_1_year:1年以下', '1_to_3_years:1-3年', 'more_than_3_years:3年以上'].map((option) => {
                                const [value, label] = option.split(':');
                                return (
                                    <label key={value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="experience"
                                            value={value}
                                            checked={formData.experience === value}
                                            onChange={(e) => handleRadioChange('experience', e.target.value)}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{label}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    {/* Motivation */}
                    <div>
                        <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-1">您的學習動機與目標為？</label>
                        <textarea
                            id="motivation"
                            name="motivation"
                            rows={3}
                            value={formData.motivation}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="例如：想培養運動習慣、精進球技參加比賽..."
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Age */}
                        <div>
                            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">您的年齡是？</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                min="0"
                                value={formData.age || ''}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>

                        {/* Student Count */}
                        <div>
                            <label htmlFor="studentCount" className="block text-sm font-medium text-gray-700 mb-1">學生的人數有幾人？</label>
                            <input
                                type="number"
                                id="studentCount"
                                name="studentCount"
                                min="1"
                                value={formData.studentCount}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Gender Preference */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">需要指定教練的性別嗎？</label>
                            <div className="space-y-2">
                                {[
                                    { value: 'none', label: '不拘' },
                                    { value: 'male', label: '男教練' },
                                    { value: 'female', label: '女教練' },
                                ].map((option) => (
                                    <label key={option.value} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="genderPreference"
                                            value={option.value}
                                            checked={formData.genderPreference === option.value}
                                            onChange={(e) => handleRadioChange('genderPreference', e.target.value)}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Equipment Needed */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">需要教練提供網球用具嗎？</label>
                            <div className="space-y-2">
                                {[
                                    { value: true, label: '需要' },
                                    { value: false, label: '不需要（自備）' },
                                ].map((option) => (
                                    <label key={String(option.value)} className="flex items-center">
                                        <input
                                            type="radio"
                                            name="needEquipment"
                                            checked={formData.needEquipment === option.value}
                                            onChange={() => handleRadioChange('needEquipment', option.value)}
                                            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Duration */}
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">希望每次上課時間多長？</label>
                            <select
                                id="duration"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            >
                                <option value="1h">1 小時</option>
                                <option value="1.5h">1.5 小時</option>
                                <option value="2h">2 小時</option>
                                <option value="other">其他</option>
                            </select>
                        </div>

                        {/* Frequency */}
                        <div>
                            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">希望多久上一次課？</label>
                            <select
                                id="frequency"
                                name="frequency"
                                value={formData.frequency}
                                onChange={handleChange}
                                className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            >
                                <option value="weekly">每週固定</option>
                                <option value="biweekly">隔週固定</option>
                                <option value="irregular">不固定</option>
                                <option value="intensive">短期密集</option>
                            </select>
                        </div>
                    </div>

                    {/* Preferred Time */}
                    <div>
                        <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700 mb-1">什麼時間方便上課？</label>
                        <input
                            type="text"
                            id="preferredTime"
                            name="preferredTime"
                            value={formData.preferredTime}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="例如：平日晚上、週末下午"
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">希望在哪裡上課？</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="例如：大安運動中心、自家社區球場"
                        />
                    </div>

                    {/* Service Area */}
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">您需要服務的地區為何？</label>
                        <input
                            type="text"
                            id="area"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="例如：台北市大安區"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">使用哪個Email收取報價？</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="your@email.com"
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">還有什麼需要注意的地方嗎？</label>
                        <textarea
                            id="notes"
                            name="notes"
                            rows={3}
                            value={formData.notes}
                            onChange={handleChange}
                            className="shadow-sm focus:ring-emerald-500 focus:border-emerald-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                            placeholder="例如：有舊傷需要注意..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button variant="outline" onClick={onClose} type="button">
                            取消
                        </Button>
                        <Button type="submit">
                            發送諮詢
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default ConsultationModal;
