import { UserResponse } from "./user.interface";

export enum ClassroomStatus {
    upcoming = "upcoming",
    ongoing = "ongoing",
    completed = "completed",
    cancelled = "cancelled"
}

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
    teacher?: UserResponse
    students: UserResponse[]
}


