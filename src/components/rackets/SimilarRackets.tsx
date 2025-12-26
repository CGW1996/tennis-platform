import { Racket } from '@/types/racket';
import { Card, CardContent } from '@/components';

interface SimilarRacketsProps {
    rackets: Racket[];
}

export default function SimilarRackets({ rackets }: SimilarRacketsProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">相似產品</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rackets.map((similarRacket) => (
                    <Card
                        key={similarRacket.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => window.location.href = `/rackets/${similarRacket.id}`}
                    >
                        <div className="aspect-square overflow-hidden">
                            <img
                                src={similarRacket.images[0] || '/placeholder-racket.png'}
                                alt={similarRacket.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <CardContent className="p-4">
                            <h4 className="font-semibold mb-1">{similarRacket.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{similarRacket.brand}</p>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-emerald-600">
                                    NT$ {similarRacket.msrp.toLocaleString()}
                                </span>
                                <div className="flex items-center">
                                    <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="ml-1 text-sm">{similarRacket.rating}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
