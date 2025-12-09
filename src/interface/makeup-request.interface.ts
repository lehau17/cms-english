/**
 * Makeup Attendance Request types for CMS
 */

export type MakeupRequestStatus = 'pending' | 'approved' | 'rejected';

export interface MakeupRequestStudent {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    avatarUrl?: string;
    email?: string;
}

export interface MakeupRequestSession {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    classroomId?: string;
}

export interface MakeupRequestReviewer {
    id: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
}

export interface MakeupAttendanceRequest {
    id: string;
    sessionId: string;
    studentId: string;
    reason: string;
    evidenceUrls: string[];
    status: MakeupRequestStatus;
    reviewedById?: string | null;
    reviewedAt?: string | null;
    reviewNote?: string | null;
    createdAt: string;
    updatedAt: string;
    student?: MakeupRequestStudent;
    session?: MakeupRequestSession;
    reviewedBy?: MakeupRequestReviewer | null;
}

export interface ReviewMakeupRequestDto {
    status: 'approved' | 'rejected';
    reviewNote?: string;
}

export interface PaginatedMakeupRequests {
    data: MakeupAttendanceRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface MakeupRequestFilter {
    page?: number;
    limit?: number;
    status?: MakeupRequestStatus;
}
