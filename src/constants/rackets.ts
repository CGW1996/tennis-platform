export const BRAND_OPTIONS = [
    'Wilson', 'Babolat', 'Head', 'Prince', 'Yonex', 'Tecnifibre', 'Dunlop', 'Volkl', 'Pacific'
];

export const CATEGORY_MAP: Record<string, string> = {
    'power': '力量型',
    'control': '控制型',
    'tweener': '全面型',
    'comfort': '舒適型',
};

export const SKILL_LEVEL_MAP: Record<string, string> = {
    'beginner': '初學者',
    'intermediate': '中級',
    'advanced': '高級',
    'professional': '專業級',
};

export const getCategoryText = (category: string) => {
    return CATEGORY_MAP[category] || category;
};

export const getSkillLevelText = (level: string) => {
    return SKILL_LEVEL_MAP[level] || level;
};
