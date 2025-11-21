export enum PodcastCategory {
    NEWS = 'news',
    STORY = 'story',
    CONVERSATION = 'conversation',
    EDUCATION = 'education',
    ENTERTAINMENT = 'entertainment',
    BUSINESS = 'business',
    TECHNOLOGY = 'technology',
    HEALTH = 'health',
    TRAVEL = 'travel',
    CULTURE = 'culture',
    SCIENCE = 'science',
    OTHER = 'other',
}

export enum PodcastDifficulty {
    BEGINNER = 'beginner',
    ELEMENTARY = 'elementary',
    INTERMEDIATE = 'intermediate',
    UPPER_INTERMEDIATE = 'upper_intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert',
}

export enum PodcastSource {
    YOUTUBE = 'youtube',
    UPLOAD = 'upload',
    GENERATED = 'generated',
}

export enum PodcastStatus {
    DRAFT = 'draft',
    PUBLISHED = 'published',
    ARCHIVED = 'archived',
}

export enum PodcastMediaType {
    AUDIO = 'audio',
    VIDEO = 'video',
}

export interface PodcastGap {
    startIndex: number;
    endIndex: number;
    answer: string;
    orderNo?: number;
}

export interface Podcast {
    id: string;
    title: string;
    description: string;
    content: string;
    audioUrl?: string;
    videoUrl?: string;
    mediaType: PodcastMediaType;
    thumbnailUrl?: string;
    category: PodcastCategory;
    difficulty: PodcastDifficulty;
    source: PodcastSource;
    status: PodcastStatus;
    duration?: number;
    durationFormatted?: string;
    views: number;
    rating: number;
    totalRatings: number;
    gaps: PodcastGap[];
    createdAt: string;
    updatedAt: string;
}

export interface CreatePodcastDto {
    title: string;
    description: string;
    content: string;
    audioUrl?: string;
    videoUrl?: string;
    mediaType: PodcastMediaType;
    thumbnailUrl?: string;
    category: PodcastCategory;
    difficulty: PodcastDifficulty;
    audioMode: 'upload' | 'generate';
    voiceType?: string;
    speechSpeed?: number;
    duration?: number;
    gaps?: PodcastGap[];
}

export interface UpdatePodcastDto {
    title?: string;
    description?: string;
    content?: string; // transcript
    audioUrl?: string;
    videoUrl?: string;
    mediaType?: PodcastMediaType;
    thumbnailUrl?: string;
    category?: PodcastCategory;
    difficulty?: PodcastDifficulty;
    status?: PodcastStatus;
    duration?: number;
    gaps?: PodcastGap[];
}
