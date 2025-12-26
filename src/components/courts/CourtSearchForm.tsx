import { Button, Input } from '@/components';
import { UseFormRegister } from 'react-hook-form';
import { CourtSearchForm as CourtSearchFormType } from '@/lib/validations';

interface CourtSearchFormProps {
    register: UseFormRegister<CourtSearchFormType>;
    onSearch: () => void;
    onLocationClick: () => void;
    loading?: boolean;
    viewMode: 'list' | 'map';
    onViewModeChange: (mode: 'list' | 'map') => void;
}

export const CourtSearchForm = ({
    register,
    onSearch,
    onLocationClick,
    loading,
    viewMode,
    onViewModeChange,
}: CourtSearchFormProps) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <form onSubmit={onSearch} className="space-y-4">
                <div className="flex items-center space-x-4">
                    <div className="flex-1">
                        <Input
                            placeholder="搜尋場地名稱或地區..."
                            {...register('query')}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onLocationClick}
                    >
                        使用目前位置
                    </Button>
                </div>

                <div className="flex items-center justify-between">
                    <Button type="submit" loading={loading}>
                        搜尋場地
                    </Button>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">檢視模式:</span>
                        <Button
                            type="button"
                            variant={viewMode === 'list' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => onViewModeChange('list')}
                        >
                            列表
                        </Button>
                        <Button
                            type="button"
                            variant={viewMode === 'map' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => onViewModeChange('map')}
                        >
                            地圖
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
