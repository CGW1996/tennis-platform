import { Card, CardContent, Button } from '@/components';
import { Racket } from '@/types/racket';
import { getCategoryText } from '@/constants/rackets';

interface RacketCardProps {
    racket: Racket;
}

export function RacketCard({ racket }: RacketCardProps) {
    return (
        <Card
            className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
            onClick={() => window.location.href = `/rackets/${racket.id}`}
        >
            <div className="aspect-square overflow-hidden bg-gray-50">
                {racket.images && racket.images.length > 0 ? (
                    <img
                        src={racket.images[0]}
                        alt={racket.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428l-7.071 7.071-7.071-7.071a2.828 2.828 0 010-4l7.071-7.071 7.071 7.071a2.828 2.828 0 010 4z" />
                        </svg>
                    </div>
                )}
            </div>

            <CardContent className="p-4">
                <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{racket.name}</h3>
                    <p className="text-sm text-gray-600">{racket.brand} {racket.model}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span>{getCategoryText(racket.category)}</span>
                    <span>{racket.weight}g</span>
                </div>

                <div className="flex items-center mb-2">
                    <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                                key={i}
                                className={`h-3 w-3 ${i < racket.rating ? 'text-yellow-400' : 'text-gray-300'
                                    }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                        ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-600">
                        {racket.rating} ({racket.ratingCount})
                    </span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-emerald-600">
                        NT$ {racket.msrp.toLocaleString()}
                    </span>
                    <Button size="sm" variant="outline">
                        查看詳情
                    </Button>
                </div>
            </CardContent>
        </Card >
    );
}
