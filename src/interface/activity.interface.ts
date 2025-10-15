import { ActivityType, DifficultyLevel } from "./enums";

export interface Activity {
    id: string;
    type: ActivityType;
    orderNo: number;
    title: string;
    content: any;
    passingScore?: number;
    difficulty?: DifficultyLevel;
    points?: number;
    instructions?: string;
    hints?: any;
    mediaUrls?: any;
}

export interface CreateActivityDto {
    type: ActivityType;
    orderNo: number;
    title: string;
    content: any;
    passingScore?: number;
    difficulty?: DifficultyLevel;
    points?: number;
    instructions?: string;
    hints?: any;
    mediaUrls?: any;
}
