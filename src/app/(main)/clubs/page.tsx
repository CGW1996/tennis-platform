'use client';

import { MainLayout, Button, Card, CardContent } from '@/components';
import { Club } from '@/types/club';
import { useState } from 'react';

// Mock Data
const MOCK_CLUBS: Club[] = [
    {
        id: '1',
        name: '台北網球俱樂部',
        description: '我們是一個熱愛網球的社群，每週固定在台北各地球場聚會。歡迎所有程度的球友加入！',
        location: '台北市',
        member_count: 156,
        level_requirement: 'NTRP 2.0+',
        join_status: 'open',
        tags: ['週末聚會', '新手友善', '定期比賽'],
        cover_image_url: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2942&auto=format&fit=crop',
        next_event_date: '2025-12-10',
    },
    {
        id: '2',
        name: '內湖夜打團',
        description: '平日晚上在內湖網球中心，主要以雙打比賽為主。適合下班後想流汗的朋友。',
        location: '內湖區',
        member_count: 89,
        level_requirement: 'NTRP 3.0+',
        join_status: 'invite_only',
        tags: ['平日晚場', '雙打', '競技'],
        cover_image_url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?q=80&w=2940&auto=format&fit=crop',
    },
    {
        id: '3',
        name: '天母女子網球社',
        description: '專為女性球友打造的網球社團，輕鬆愉快的打球氛圍，不定期舉辦下午茶聚會。',
        location: '士林區',
        member_count: 45,
        level_requirement: '不限',
        join_status: 'open',
        tags: ['女子網球', '休閒', '社交'],
        cover_image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=2940&auto=format&fit=crop',
        next_event_date: '2025-12-12',
    },
    {
        id: '4',
        name: '高手過招區',
        description: '集合各地網球好手，高強度的單打與雙打對抗。入會需經過測試。',
        location: '新北市',
        member_count: 32,
        level_requirement: 'NTRP 4.0+',
        join_status: 'closed',
        tags: ['高手', '單打', '嚴格審核'],
        cover_image_url: 'https://images.unsplash.com/photo-1530915920853-77783c938087?q=80&w=2938&auto=format&fit=crop',
    },
    {
        id: '5',
        name: '早鳥網球團',
        description: '每日清晨 6:00-8:00，開啟活力的一天！',
        location: '大安區',
        member_count: 67,
        level_requirement: 'NTRP 2.5+',
        join_status: 'open',
        tags: ['晨練', '健康', '早餐局'],
        cover_image_url: 'https://images.unsplash.com/photo-1519638831568-d9897f54ed69?q=80&w=2940&auto=format&fit=crop',
    },
    {
        id: '6',
        name: '週末親子網球',
        description: '歡迎家長帶小朋友一起來學球、玩球，培養運動習慣。',
        location: '板橋區',
        member_count: 120,
        level_requirement: '不限',
        join_status: 'open',
        tags: ['親子', '家庭', '兒童教學'],
        cover_image_url: 'https://images.unsplash.com/photo-1576610616656-d3ee5a5ca71e?q=80&w=2936&auto=format&fit=crop',
        next_event_date: '2025-12-13',
    },
];

export default function ClubsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [clubs, setClubs] = useState<Club[]>(MOCK_CLUBS);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        const filtered = MOCK_CLUBS.filter(club =>
            club.name.toLowerCase().includes(term.toLowerCase()) ||
            club.location.toLowerCase().includes(term.toLowerCase()) ||
            club.tags.some(tag => tag.toLowerCase().includes(term.toLowerCase()))
        );
        setClubs(filtered);
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">網球社團</h1>
                    <p className="mt-2 text-gray-600">加入感興趣的社團，認識更多志同道合的球友！</p>
                </div>

                {/* Search & Filter */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                            placeholder="搜尋社團名稱、地點或標籤..."
                            value={searchTerm}
                            onChange={handleSearch}
                        />
                    </div>
                </div>

                {/* Clubs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clubs.map((club) => (
                        <Card key={club.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full">
                            {/* Club Image */}
                            <div className="h-48 w-full relative">
                                <img
                                    src={club.cover_image_url || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2942&auto=format&fit=crop'}
                                    alt={club.name}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 right-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${club.join_status === 'open' ? 'bg-emerald-500' :
                                            club.join_status === 'invite_only' ? 'bg-blue-500' : 'bg-gray-500'
                                        }`}>
                                        {club.join_status === 'open' ? '開放加入' :
                                            club.join_status === 'invite_only' ? '需邀請' : '已額滿'}
                                    </span>
                                </div>
                            </div>

                            <CardContent className="p-6 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{club.name}</h3>
                                </div>

                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {club.location}
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                                    {club.description}
                                </p>

                                <div className="space-y-4">
                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 py-3 border-t border-b border-gray-100">
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold text-gray-900">{club.member_count}</span>
                                            <span className="text-xs">成員</span>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200"></div>
                                        <div className="flex flex-col items-center">
                                            <span className="font-semibold text-gray-900">{club.level_requirement}</span>
                                            <span className="text-xs">程度要求</span>
                                        </div>
                                        {club.next_event_date && (
                                            <>
                                                <div className="w-px h-8 bg-gray-200"></div>
                                                <div className="flex flex-col items-center">
                                                    <span className="font-semibold text-emerald-600">
                                                        {new Date(club.next_event_date).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
                                                    </span>
                                                    <span className="text-xs">下次聚會</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {club.tags.map(tag => (
                                            <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <Button className="w-full mt-4" disabled={club.join_status === 'closed'}>
                                        {club.join_status === 'closed' ? '暫不開放' : '查看詳情'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {clubs.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a7 7 0 0114 0m-14 0a7 7 0 017-7m0 0a7 7 0 017 7" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">沒有找到相關社團</h3>
                        <p className="mt-1 text-sm text-gray-500">試試看其他的關鍵字？</p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
