import { Court } from '@/types/court';
import { CourtCard } from '@/components/courts/CourtCard';
import { Card, CardContent } from '@/components';

interface CourtListProps {
    courts: Court[];
    loading: boolean;
    selectedCourt: Court | null;
    onSelectCourt: (court: Court) => void;
    viewMode: 'list' | 'map';
}

export const CourtList = ({
    courts,
    loading,
    selectedCourt,
    onSelectCourt,
    viewMode,
}: CourtListProps) => {
    return (
        <div className={`${viewMode === 'map' ? 'lg:w-1/2' : 'w-full'}`}>
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                    找到 {courts.length} 個場地
                </h2>
            </div>

            <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </CardContent>
                        </Card>
                    ))
                ) : courts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-2">沒有找到符合條件的場地</div>
                        <p className="text-gray-500">請嘗試調整搜尋條件</p>
                    </div>
                ) : (
                    courts.map((court) => (
                        <CourtCard
                            key={court.id}
                            court={court}
                            onClick={onSelectCourt}
                            isSelected={selectedCourt?.id === court.id}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
