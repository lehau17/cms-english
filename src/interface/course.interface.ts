
import { DifficultyLevel, LanguageCode } from "./enums";
import { CreateLessonDto, Lesson } from "./lesson.interface";

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
    instructorId: string;
    price?: number;
    currency?: string;
    maxStudents?: number;
    language?: LanguageCode;
    prerequisites?: string[];
    isPublished?: boolean;
    totalLessons?: number;
    totalDuration?: number;
    lessons: CreateLessonDto[];
}
