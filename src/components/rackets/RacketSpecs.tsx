import { Racket } from '@/types/racket';

interface RacketSpecsProps {
    racket: Racket;
}

export default function RacketSpecs({ racket }: RacketSpecsProps) {
    return (
        <div>
            <h3 className="text-lg font-semibold mb-4">技術規格</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(racket.specifications || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">{key}</span>
                        <span className="font-medium">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
