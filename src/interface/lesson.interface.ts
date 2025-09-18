import { Activity, CreateActivityDto } from "./activity.interface";
import { DifficultyLevel } from "./enums";

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    orderNo: number;
    difficulty?: DifficultyLevel;
    estimatedTime?: number;
    isLocked?: boolean;
    objectives?: string[];
    activities: Activity[];
}

export interface CreateLessonDto {
    title: string;
    description?: string;
    orderNo: number;
    difficulty?: DifficultyLevel;
    estimatedTime?: number;
    isLocked?: boolean;
    objectives?: string[];
    activities: CreateActivityDto[];
}