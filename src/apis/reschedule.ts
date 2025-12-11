import axiosInstance from '@/config/axiosConfig';

export interface CreateRescheduleRequestDto {
    newStartTime: string; // ISO string
    newEndTime: string; // ISO string
    reason: string;
    evidenceUrls?: string[];
}

export interface ReviewRescheduleRequestDto {
    approved: boolean;
    reviewNote?: string;
}

export interface QueryRescheduleRequestDto {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    page?: number;
    limit?: number;
}

export interface RescheduleRequest {
    id: string;
    sessionId: string;
    requestedById: string;
    newStartTime: string;
    newEndTime: string;
    reason: string;
    evidenceUrls: string[];
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    reviewedById?: string | null;
    reviewedAt?: string | null;
    reviewNote?: string | null;
    createdAt: string;
    updatedAt: string;
    requestedBy?: {
        id: string;
        firstName?: string;
        lastName?: string;
        displayName?: string;
        avatarUrl?: string;
        email?: string;
    };
    session?: {
        id: string;
        title: string;
        startTime: string;
        endTime: string;
        classroomId: string;
        instructorId: string;
        classroom?: {
            id: string;
            name: string;
            classCode: string;
        };
    };
    reviewedBy?: {
        id: string;
        firstName?: string;
        lastName?: string;
        displayName?: string;
    } | null;
}

export interface PaginatedRescheduleRequests {
    data: RescheduleRequest[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Create a reschedule request (Teacher)
 */
export const createRescheduleRequest = async (
    sessionId: string,
    data: CreateRescheduleRequestDto,
): Promise<RescheduleRequest> => {
    const response = await axiosInstance.post<{
        statusCode: number;
        message: string;
        data: RescheduleRequest;
    }>(`/private/v1/sessions/${sessionId}/reschedule-request`, data);
    return response.data.data;
};

/**
 * Get my reschedule requests (Teacher)
 */
export const getMyRescheduleRequests = async (
    params: QueryRescheduleRequestDto = {},
): Promise<PaginatedRescheduleRequests> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: PaginatedRescheduleRequests;
    }>(`/private/v1/sessions/my/reschedule-requests?${queryParams.toString()}`);
    return response.data.data;
};

/**
 * Cancel a reschedule request (Teacher)
 */
export const cancelRescheduleRequest = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/private/v1/sessions/reschedule-requests/${id}`);
};

/**
 * Get all reschedule requests (Admin) - with optional status filter
 */
export const getAllRescheduleRequests = async (
    params: QueryRescheduleRequestDto = {},
): Promise<PaginatedRescheduleRequests> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: PaginatedRescheduleRequests;
    }>(`/private/v1/reschedule-requests?${queryParams.toString()}`);
    return response.data.data;
};

/**
 * Get pending reschedule requests (Admin)
 */
export const getPendingRescheduleRequests = async (
    params: QueryRescheduleRequestDto = {},
): Promise<PaginatedRescheduleRequests> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: PaginatedRescheduleRequests;
    }>(`/private/v1/reschedule-requests/pending?${queryParams.toString()}`);
    return response.data.data;
};

/**
 * Get reschedule requests for a session (Admin)
 */
export const getSessionRescheduleRequests = async (
    sessionId: string,
    params: QueryRescheduleRequestDto = {},
): Promise<PaginatedRescheduleRequests> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: PaginatedRescheduleRequests;
    }>(`/private/v1/sessions/${sessionId}/reschedule-requests?${queryParams.toString()}`);
    return response.data.data;
};

/**
 * Get reschedule requests for a classroom (Admin)
 */
export const getClassroomRescheduleRequests = async (
    classroomId: string,
    params: QueryRescheduleRequestDto = {},
): Promise<PaginatedRescheduleRequests> => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: PaginatedRescheduleRequests;
    }>(`/private/v1/classrooms/${classroomId}/reschedule-requests?${queryParams.toString()}`);
    return response.data.data;
};

/**
 * Get reschedule request by ID
 */
export const getRescheduleRequestById = async (id: string): Promise<RescheduleRequest> => {
    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: RescheduleRequest;
    }>(`/private/v1/reschedule-requests/${id}`);
    return response.data.data;
};

/**
 * Review (approve/reject) a reschedule request (Admin)
 */
export const reviewRescheduleRequest = async (
    id: string,
    data: ReviewRescheduleRequestDto,
): Promise<RescheduleRequest> => {
    const response = await axiosInstance.put<{
        statusCode: number;
        message: string;
        data: RescheduleRequest;
    }>(`/private/v1/reschedule-requests/${id}/review`, data);
    return response.data.data;
};

/**
 * Get pending reschedule request by sessionId (Teacher)
 */
export const getPendingRequestBySession = async (
    sessionId: string,
): Promise<RescheduleRequest | null> => {
    const response = await axiosInstance.get<{
        statusCode: number;
        message: string;
        data: RescheduleRequest | null;
    }>(`/private/v1/sessions/${sessionId}/reschedule-request/pending`);
    return response.data.data;
};

/**
 * Update a pending reschedule request (Teacher)
 */
export const updateRescheduleRequest = async (
    id: string,
    data: Partial<CreateRescheduleRequestDto>,
): Promise<RescheduleRequest> => {
    const response = await axiosInstance.put<{
        statusCode: number;
        message: string;
        data: RescheduleRequest;
    }>(`/private/v1/sessions/reschedule-requests/${id}`, data);
    return response.data.data;
};

