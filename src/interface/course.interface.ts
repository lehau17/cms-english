
import { DifficultyLevel, LanguageCode } from "./enums";
import { CreateLessonDto, Lesson } from "./lesson.interface";

export interface SessionActivityDto {
    activityId: string;
    orderNo: number;
}

export interface SessionScheduleDto {
    sessionNumber: number;
    title?: string;
    description?: string;
    activities: SessionActivityDto[];
}

export interface Course {
    id: string;
    title: string;
    description?: string;
    orderNo?: number;
    difficulty: DifficultyLevel;
    estimatedTime?: number;
    imageUrl?: string;
    tags?: string[];
    instructorId: string;
    instructor?: {
        id: string;
        firstName?: string;
        lastName?: string;
        displayName?: string;
        email?: string;
        avatarUrl?: string;
    };
    price?: number;
    currency?: string;
    maxStudents?: number;
    language?: LanguageCode;
    prerequisites?: string[];
    isPublished?: boolean;
    totalLessons?: number;
    totalDuration?: number;
    lessons: Lesson[];
    plannedSessions?: number;
    sessionSchedules?: SessionScheduleDto[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateCourseDto {
    title: string;
    description?: string;
    orderNo?: number;
    difficulty: DifficultyLevel;
    estimatedTime?: number;
    imageUrl?: string;
    tags?: string[];
    price?: number;
    currency?: string;
    maxStudents?: number;
    prerequisites?: string[];
    isPublished?: boolean;
    totalLessons?: number;
    totalDuration?: number;
    plannedSessions?: number;
    sessionSchedules?: SessionScheduleDto[];
    lessons: CreateLessonDto[];
}
