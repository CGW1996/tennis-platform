import { Input } from '@/components';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CourtSearchForm } from '@/lib/validations';
import { SearchFilters } from '@/types/court';
import { FACILITIES } from '@/constants/courts';

interface CourtFiltersProps {
    register: UseFormRegister<CourtSearchForm>;
    errors: FieldErrors<CourtSearchForm>;
    filters: SearchFilters;
    onFilterChange: (newFilters: SearchFilters) => void;
}

export const CourtFilters = ({
    register,
    errors,
    filters,
    onFilterChange,
}: CourtFiltersProps) => {
    const updateFilter = (key: keyof SearchFilters, value: any) => {
        onFilterChange({
            ...filters,
            [key]: value,
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">篩選條件</h3>
                <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                    <option value="distance">距離排序</option>
                    <option value="price">價格排序</option>
                    <option value="rating">評分排序</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        搜尋半徑 (公里)
                    </label>
                    <Input
                        type="number"
                        min="1"
                        max="50"
                        {...register('radius', { valueAsNumber: true })}
                        error={errors.radius?.message}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        價格範圍
                    </label>
                    <div className="flex items-center space-x-2">
                        <input
                            type="range"
                            min="0"
                            max="2000"
                            step="100"
                            value={filters.priceRange[0]}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                updateFilter('priceRange', [val, filters.priceRange[1]]);
                            }}
                            className="flex-1"
                        />
                        <span className="text-sm text-gray-600">
                            ${filters.priceRange[0]}-${filters.priceRange[1]}
                        </span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        場地類型
                    </label>
                    <select
                        value={filters.courtType}
                        onChange={(e) => updateFilter('courtType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                        <option value="">全部</option>
                        <option value="hard">硬地</option>
                        <option value="clay">紅土</option>
                        <option value="grass">草地</option>
                        <option value="synthetic">人工草皮</option>
                    </select>
                </div>
            </div>

            <div className="space-y-3">
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">設施</h4>
                    <div className="flex flex-wrap gap-2">
                        {FACILITIES.map((facility) => (
                            <button
                                key={facility}
                                type="button"
                                onClick={() => {
                                    const newFacilities = filters.facilities.includes(facility)
                                        ? filters.facilities.filter((f) => f !== facility)
                                        : [...filters.facilities, facility];
                                    updateFilter('facilities', newFacilities);
                                }}
                                className={`px-3 py-1 rounded-full text-sm border transition-colors ${filters.facilities.includes(facility)
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {facility}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
