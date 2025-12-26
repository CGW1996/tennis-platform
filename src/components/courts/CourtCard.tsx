import { Card, CardContent } from '@/components';
import { Court } from '@/types/court';
import { SURFACE_TYPE_MAP } from '@/constants/courts';

interface CourtCardProps {
    court: Court;
    onClick: (court: Court) => void;
    isSelected: boolean;
}

export function CourtCard({ court, onClick, isSelected }: CourtCardProps) {
    return (
        <Card
            className={`cursor-pointer transition-shadow hover:shadow-md ${isSelected ? 'ring-2 ring-emerald-500' : ''
                }`}
            onClick={() => onClick(court)}
        >
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {court.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{court.address}</p>

                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{SURFACE_TYPE_MAP[court.courtType] || court.courtType}</span>
                            <span>•</span>
                            <span>${court.pricePerHour}/小時</span>
                            {court.distance && (
                                <>
                                    <span>•</span>
                                    <span>{court.distance.toFixed(1)}km</span>
                                </>
                            )}
                        </div>

                        <div className="flex items-center mt-2">
                            <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg
                                        key={i}
                                        className={`h-4 w-4 ${i < court.averageRating ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                                <span className="ml-1 text-sm text-gray-600">
                                    {court.averageRating} ({court.totalReviews ?? 0})
                                </span>
                            </div>
                        </div>

                        {court.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {court.facilities.slice(0, 3).map((facility) => (
                                    <span
                                        key={facility}
                                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                    >
                                        {facility}
                                    </span>
                                ))}
                                {court.facilities.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                        +{court.facilities.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {court.images.length > 0 && (
                        <div className="ml-4">
                            <img
                                src={court.images[0]}
                                alt={court.name}
                                className="w-20 h-20 object-cover rounded-lg"
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
