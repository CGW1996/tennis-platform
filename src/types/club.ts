export interface Club {
    id: string;
    name: string;
    description: string;
    cover_image_url?: string;
    location: string;
    member_count: number;
    level_requirement: string;
    join_status: 'open' | 'invite_only' | 'closed';
    tags: string[];
    next_event_date?: string;
}
