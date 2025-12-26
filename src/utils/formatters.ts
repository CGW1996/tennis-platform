export const formatGender = (gender?: string): string => {
    if (!gender) return '';
    switch (gender) {
        case 'male': return '♂ 男';
        case 'female': return '♀ 女';
        default: return '其他';
    }
};

export const formatPlayingStyle = (style?: string): string => {
    if (!style) return '';
    switch (style) {
        case 'aggressive': return '攻擊型';
        case 'defensive': return '防守型';
        default: return '全能型';
    }
};

export const formatPlayingFrequency = (frequency?: string): string => {
    if (!frequency) return '';
    switch (frequency) {
        case 'casual': return '休閒';
        case 'regular': return '定期';
        default: return '競技';
    }
};

export const formatPreferredTime = (time: string): string => {
    switch (time) {
        case 'morning': return '早';
        case 'weekday': return '平日';
        case 'weekend': return '週末';
        case 'afternoon': return '午';
        case 'evening': return '晚';
        default: return time;
    }
};

export const formatPreferredTimes = (times?: string[]): string => {
    if (!times || times.length === 0) return '';
    return times.map(formatPreferredTime).join('、');
};

export const formatDistance = (distance?: number): string => {
    if (distance === undefined || distance === null) return '';
    return `${distance.toFixed(1)} km`;
};
