import { UserResponse } from "./user.interface";

export enum ClassroomStatus {
    upcoming = "upcoming",
    ongoing = "ongoing",
    completed = "completed",
    cancelled = "cancelled"
}

export type SessionType = 'online' | 'offline' | 'hybrid';

export interface Classroom {
    name: string;
    description: string;
    createdAt: Date;
    teacherId: string;
    courseId?: string;
    isActive: boolean;
    maxStudents: number;
    id: string;
    classCode: string;
    settings: any;
    schedule: any | null;
    updatedAt: Date;
    expiresAt: Date | null;
    status: ClassroomStatus;
    teacher?: UserResponse;
    students: UserResponse[];
    course?: { title: string };
    _count?: { students: number };
    periodStart: Date;
    periodEnd: Date;
}

export interface ClassroomSessionExtended {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    status: string;
    instructorId: string;
    classroomId: string;
    type: SessionType;
    meetingUrl?: string | null;
}


