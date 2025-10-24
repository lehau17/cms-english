import axiosInstance from "../config/axiosConfig";
import { Classroom, ClassroomStatus } from "../interface/classroom.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getClassrooms = async (params: RequestPagingDto): Promise<PageResponseDto<Classroom>> => {
    const response = await axiosInstance.get<PageResponseDto<Classroom>>("/private/v1/classrooms", { params });
    return response.data;
};

export const getClassroomById = async (id: string): Promise<Classroom> => {
    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: Classroom;
    }>(`/private/v1/classrooms/${id}`);
    return response.data.data;
};

export const createClassroom = async (data: any): Promise<Classroom> => {
    const response = await axiosInstance.post<Classroom>("/private/v1/classrooms", data);
    return response.data;
};

export const updateClassroom = async (id: string, data: any): Promise<Classroom> => {
    const response = await axiosInstance.put<Classroom>(`/private/v1/classrooms/${id}`, data);
    return response.data;
};

export const deleteClassroom = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/private/v1/classrooms/${id}`);
};

export const addStudentsToClassroom = async (classroomId: string, studentIds: string[]): Promise<void> => {
    await axiosInstance.post(`/private/v1/classrooms/${classroomId}/students`, { studentIds });
};

export const removeStudentFromClassroom = async (classroomId: string, studentId: string): Promise<void> => {
    await axiosInstance.delete(`/private/v1/classrooms/${classroomId}/students/${studentId}`);
};

export const assignTeacherToClassroom = async (classroomId: string, teacherId: string): Promise<void> => {
    await axiosInstance.put(`/private/v1/classrooms/${classroomId}/teacher`, { teacherId });
};

export const exportClassrooms = async (params: RequestPagingDto): Promise<Blob> => {
    const response = await axiosInstance.get<Blob>("/private/v1/classrooms/export", {
        params,
        responseType: "blob",
    });
    return response.data;
};

export interface ImportStudentsResult {
    totalProcessed: number;
    successfullyImported: number;
    failedImports: number;
    errors: Array<{
        row: number;
        email: string;
        error: string;
    }>;
    createdStudents: Array<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }>;
    existingStudents: Array<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }>;
}

export const importStudentsFromExcel = async (classroomId: string, file: File): Promise<ImportStudentsResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post<ImportStudentsResult>(
        `/private/v1/classrooms/${classroomId}/import-students`,
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );
    return response.data;
};

// System Schedule Types
export interface SystemScheduleSession {
    sessionId: string;
    classroomId: string;
    classroomName: string;
    classCode: string;
    title: string;
    description: string | null;
    status: string;
    type: string;
    startTime: string; // ISO string from backend
    endTime: string; // ISO string from backend
    timezone: string;
    durationHours: number;
    meetingUrl: string | null;
    notes: string | null;
    course: {
        id: string;
        title: string;
        description: string | null;
        imageUrl: string | null;
    };
    instructor: {
        id: string;
        firstName: string;
        lastName: string;
        displayName: string | null;
        avatarUrl: string | null;
        email: string;
    };
    state: string;
    stateLabel: string;
    startsInMinutes: number | null;
    endsInMinutes: number | null;
}

export interface SystemScheduleDay {
    date: Date; // Date object
    dayOfWeek: string; // mon, tue, wed, thu, fri, sat, sun
    label: string; // Formatted label like "13/10/2025, 07:00:00"
    sessions: SystemScheduleSession[];
}

export interface SystemScheduleResponse {
    timezone: string;
    weekStart: string;
    weekEnd: string;
    days: SystemScheduleDay[];
    summary: {
        totalSessions: number;
        byState: Record<string, number>;
    };
    filters: {
        teacherId?: string;
        classroomId?: string;
        status?: string;
    };
}

export interface SystemScheduleParams {
    weekStart?: string;
    days?: number;
    timezone?: string;
    teacherId?: string;
    classroomId?: string;
    status?: string;
}

export const getSystemSchedule = async (params: SystemScheduleParams): Promise<SystemScheduleResponse> => {
    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: SystemScheduleResponse;
    }>('/private/v1/classrooms/system-schedule', { params });
    return response.data.data;
};

// ==================== STATUS MANAGEMENT ====================

export const updateClassroomStatus = async (classroomId: string, status: ClassroomStatus): Promise<Classroom> => {
    const response = await axiosInstance.patch<{
        statusCode: number;
        message: string;
        data: Classroom;
    }>(`/private/v1/classrooms/${classroomId}/status`, { status });
    return response.data.data;
};

// ==================== TRANSFER STUDENT ====================

export interface TransferStudentPayload {
    studentId: string;
    currentClassroomId: string;
    newClassroomId: string;
}

export interface TransferStudentResponse {
    success: boolean;
    message: string;
}

export const transferStudent = async (payload: TransferStudentPayload): Promise<TransferStudentResponse> => {
    const response = await axiosInstance.post<{
        statusCode: number;
        message: string;
        data: TransferStudentResponse;
    }>('/private/v1/classrooms/transfer-student', payload);
    return response.data.data;
};
