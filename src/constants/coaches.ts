export const CERTIFICATION_MAP: Record<string, string> = {
    'ptca': 'PTCA',
    'uspta': 'USPTA',
    'pti': 'PTI',
    'itf': 'ITF',
    'national': '國家級',
    'regional': '地區級',
};

export const SPECIALTY_MAP: Record<string, string> = {
    'beginner': '初學者',
    'intermediate': '中級',
    'advanced': '高級',
    'junior': '青少年',
    'senior': '銀髮族',
    'singles': '單打',
    'doubles': '雙打',
    'serve': '發球',
    'volleys': '網前',
    'groundstrokes': '底線',
    'strategy': '戰術',
    'fitness': '體能',
    'competitive': '競技',
};

export const getCertificationText = (category: string) => {
    return CERTIFICATION_MAP[category] || category;
};

export const getSpecialtyText = (specialty: string) => {
    return SPECIALTY_MAP[specialty] || specialty;
};

export const DAY_MAP: Record<string, string> = {
    'monday': '週一',
    'tuesday': '週二',
    'wednesday': '週三',
    'thursday': '週四',
    'friday': '週五',
    'saturday': '週六',
    'sunday': '週日',
};

export const getDayText = (day: string) => {
    return DAY_MAP[day] || day;
};
