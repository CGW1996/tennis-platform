import { Racket } from '@/types/racket';

interface PerformanceRadarProps {
    racket: Racket;
}

export default function PerformanceRadar({ racket }: PerformanceRadarProps) {
    const stats = [
        { name: '力量', value: racket.powerLevel, color: 'bg-red-500' },
        { name: '控制', value: racket.controlLevel, color: 'bg-blue-500' },
        { name: '操控性', value: racket.maneuverLevel, color: 'bg-yellow-500' },
        { name: '穩定性', value: racket.stabilityLevel, color: 'bg-purple-500' },
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">性能評分</h3>
            {stats.map((stat) => (
                <div key={stat.name} className="flex items-center space-x-3">
                    <span className="w-16 text-sm text-gray-600">{stat.name}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full ${stat.color}`}
                            style={{ width: `${stat.value * 10}%` }}
                        />
                    </div>
                    <span className="w-12 text-sm font-medium">{stat.value}/10</span>
                </div>
            ))}
        </div>
    );
}
