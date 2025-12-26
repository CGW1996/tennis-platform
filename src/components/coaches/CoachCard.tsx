import { Card, CardContent, Button } from '@/components';
import { Coach } from '@/types/coach';
import { getCertificationText, getSpecialtyText } from '@/constants/coaches';

interface CoachCardProps {
    coach: Coach;
}

export function CoachCard({ coach }: CoachCardProps) {
    return (
        <Card className="cursor-pointer transition-shadow hover:shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
                            {coach.avatar_url ? (
                                <img
                                    src={coach.avatar_url}
                                    alt={coach.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Coach Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{coach.name}</h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                                    <span>{getCertificationText(coach.certification_level)}</span>
                                    <span>•</span>
                                    <span>{coach.experience_years} 年經驗</span>
                                    {coach.distance && (
                                        <>
                                            <span>•</span>
                                            <span>{coach.distance.toFixed(1)}km</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-emerald-600">
                                    ${coach.hourly_rate}/小時
                                </div>
                                <div className="flex items-center">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <svg
                                            key={i}
                                            className={`h-4 w-4 ${i < coach.rating ? 'text-yellow-400' : 'text-gray-300'
                                                }`}
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                    <span className="ml-1 text-sm text-gray-600">
                                        {coach.rating} ({coach.rating_count})
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{coach.bio}</p>

                        {/* Specialties */}
                        <div className="flex flex-wrap gap-1 mb-3">
                            {coach.specialties.slice(0, 4).map((specialty) => (
                                <span
                                    key={specialty}
                                    className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs rounded-full"
                                >
                                    {getSpecialtyText(specialty)}
                                </span>
                            ))}
                            {coach.specialties.length > 4 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    +{coach.specialties.length - 4}
                                </span>
                            )}
                        </div>

                        {/* Languages */}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                            </svg>
                            <span>{coach.languages.join(', ')}</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{coach.location}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/coaches/${coach.id}`}
                                className="flex-1"
                            >
                                查看詳情
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => window.location.href = `/coaches/${coach.id}/book`}
                                className="flex-1"
                            >
                                預約課程
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
