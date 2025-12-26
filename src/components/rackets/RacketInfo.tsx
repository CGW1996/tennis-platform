import { Racket } from '@/types/racket';
import { Button } from '@/components';
import { getCategoryText, getSkillLevelText } from '@/constants/rackets';
import PerformanceRadar from './PerformanceRadar';

interface RacketInfoProps {
    racket: Racket;
    onAddToComparison: () => void;
}

export default function RacketInfo({ racket, onAddToComparison }: RacketInfoProps) {
    return (
        <div>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{racket.name}</h1>
                    <p className="text-lg text-gray-600">{racket.brand} {racket.model} ({racket.year})</p>
                </div>
                <div className="text-right">
                    <div className="text-3xl font-bold text-emerald-600">
                        NT$ {racket.msrp.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                    {getCategoryText(racket.category)}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {getSkillLevelText(racket.skillLevel)}
                </span>
            </div>

            <div className="flex items-center mb-4">
                <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                            key={i}
                            className={`h-5 w-5 ${i < racket.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <span className="ml-2 text-gray-600">
                    {racket.rating} ({racket.ratingCount} 評價)
                </span>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{racket.description}</p>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">重量</div>
                    <div className="font-semibold">{racket.weight}g</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">拍面大小</div>
                    <div className="font-semibold">{racket.headSize} sq.in</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">穿線模式</div>
                    <div className="font-semibold">{racket.stringPattern}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-500">硬度</div>
                    <div className="font-semibold">{racket.stiffness}/10</div>
                </div>
            </div>

            {/* Performance Chart */}
            <PerformanceRadar racket={racket} />

            {/* Action Buttons */}
            <div className="flex space-x-3 mt-6">
                <Button onClick={onAddToComparison} variant="outline" className="flex-1">
                    加入比較
                </Button>
                <Button
                    onClick={() => window.location.href = `/rackets/compare?add=${racket.id}`}
                    className="flex-1"
                >
                    立即比較
                </Button>
            </div>
        </div>
    );
}
