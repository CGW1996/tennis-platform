'use native';

import { MatchingUser } from '@/types/matching';
import { Button, Card, CardContent } from '@/components';
import { formatDistance, formatGender, formatPlayingFrequency, formatPlayingStyle, formatPreferredTimes } from '@/utils/formatters';

interface PartnerListViewProps {
    users: MatchingUser[];
    onAction: (userId: string, action: 'like' | 'pass') => void;
    actionLoading?: string | null;
}

export function PartnerListView({ users, onAction, actionLoading }: PartnerListViewProps) {
    if (users.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg shadow">
                <div className="text-4xl mb-4">🎾</div>
                <h3 className="text-lg font-medium text-gray-900">沒有符合條件的球友</h3>
                <p className="text-gray-500 mt-2">試試調整篩選條件來發現更多人</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {users.map((user) => (
                <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 ring-2 ring-emerald-50">
                                    {user.avatarUrl ? (
                                        <img
                                            src={user.avatarUrl}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-500">
                                            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 truncate">
                                            {user.name}
                                        </h3>
                                        <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-xs font-medium border border-emerald-100">
                                                NTRP {user.ntrpLevel}
                                            </span>
                                            {user.distance && (
                                                <span className="flex items-center">
                                                    <svg className="w-4 h-4 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {formatDistance(user.distance)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                            {Math.round(user.matchScore)}% 匹配
                                        </span>
                                    </div>
                                </div>

                                {user.bio && (
                                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                                        {user.bio}
                                    </p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                                    {user.location?.address && (
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                            📍 {user.location.address}
                                        </span>
                                    )}
                                    {user.gender && (
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                            {formatGender(user.gender)}
                                        </span>
                                    )}
                                    {user.playingStyle && (
                                        <span className="bg-gray-100 px-2 py-1 rounded">
                                            🎾 {formatPlayingStyle(user.playingStyle)}
                                        </span>
                                    )}
                                    {user.playingFrequency && (
                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded">
                                            📅 {formatPlayingFrequency(user.playingFrequency)}
                                        </span>
                                    )}
                                    {user.preferredTimes && user.preferredTimes.length > 0 && (
                                        <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded max-w-full truncate" title={user.preferredTimes.join(', ')}>
                                            ⏰ {formatPreferredTimes(user.preferredTimes)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                {/* <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 sm:w-24 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                    onClick={() => onAction(user.id, 'pass')}
                                    disabled={actionLoading === user.id}
                                >
                                    跳過
                                </Button> */}
                                <Button
                                    size="sm"
                                    className="flex-1 sm:w-24 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow"
                                    onClick={() => onAction(user.id, 'like')}
                                    disabled={actionLoading === user.id}
                                >
                                    {actionLoading === user.id ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : '認識'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
