import { UserResponse } from "./user.interface";

export interface Classroom {
   name: string;
    description: string;
    createdAt: Date;
    teacherId: string;
    isActive: boolean;
    maxStudents: number;
    id: string;
    classCode: string;
    settings: any;
    schedule: any | null;
    updatedAt: Date;
  expiresAt: Date | null;
  teacher?: UserResponse
  students : UserResponse[]
}


