import axiosInstance from '@/config/axiosConfig';
import { SessionType } from '@/interface/classroom.interface';

export interface CreateTypeChangeRequestDto {
  requestedType: SessionType;
  reason: string;
}

export interface ReviewTypeChangeRequestDto {
  status: 'approved' | 'rejected';
  reviewNote?: string;
}

export interface TypeChangeRequest {
  id: string;
  sessionId: string;
  requestedById: string;
  currentType: SessionType;
  requestedType: SessionType;
  reason: string;
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

export interface PaginatedTypeChangeRequests {
  data: TypeChangeRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface QueryTypeChangeRequestDto {
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  page?: number;
  limit?: number;
}

/**
 * Create a session type change request (Teacher)
 */
export const createTypeChangeRequest = async (
  sessionId: string,
  data: CreateTypeChangeRequestDto,
): Promise<TypeChangeRequest> => {
  const response = await axiosInstance.post<{
    statusCode: number;
    message: string;
    data: TypeChangeRequest;
  }>(`/private/v1/sessions/${sessionId}/request-type-change`, data);
  return response.data.data;
};

/**
 * Get my type change requests (Teacher)
 */
export const getMyTypeChangeRequests = async (
  params: QueryTypeChangeRequestDto = {},
): Promise<PaginatedTypeChangeRequests> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: PaginatedTypeChangeRequests;
  }>(`/private/v1/sessions/my/type-change-requests?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Cancel a type change request (Teacher)
 */
export const cancelTypeChangeRequest = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/sessions/type-change-requests/${id}`);
};

/**
 * Get all type change requests (Admin) - with optional status filter
 */
export const getAllTypeChangeRequests = async (
  params: QueryTypeChangeRequestDto = {},
): Promise<PaginatedTypeChangeRequests> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: PaginatedTypeChangeRequests;
  }>(`/private/v1/type-change-requests?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Get pending type change requests (Admin)
 */
export const getPendingTypeChangeRequests = async (
  params: QueryTypeChangeRequestDto = {},
): Promise<PaginatedTypeChangeRequests> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: PaginatedTypeChangeRequests;
  }>(`/private/v1/type-change-requests/pending?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Get type change requests for a session
 */
export const getSessionTypeChangeRequests = async (
  sessionId: string,
  params: QueryTypeChangeRequestDto = {},
): Promise<PaginatedTypeChangeRequests> => {
  const queryParams = new URLSearchParams();
  if (params.status) queryParams.append('status', params.status);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());

  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: PaginatedTypeChangeRequests;
  }>(`/private/v1/sessions/${sessionId}/type-change-requests?${queryParams.toString()}`);
  return response.data.data;
};

/**
 * Get type change request by ID
 */
export const getTypeChangeRequestById = async (id: string): Promise<TypeChangeRequest> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: TypeChangeRequest;
  }>(`/private/v1/type-change-requests/${id}`);
  return response.data.data;
};

/**
 * Review (approve/reject) a type change request (Admin)
 */
export const reviewTypeChangeRequest = async (
  id: string,
  data: ReviewTypeChangeRequestDto,
): Promise<TypeChangeRequest> => {
  const response = await axiosInstance.put<{
    statusCode: number;
    message: string;
    data: TypeChangeRequest;
  }>(`/private/v1/type-change-requests/${id}/review`, data);
  return response.data.data;
};

/**
 * Get pending type change request by sessionId (Teacher)
 */
export const getPendingTypeChangeRequestBySession = async (
  sessionId: string,
): Promise<TypeChangeRequest | null> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: TypeChangeRequest | null;
  }>(`/private/v1/sessions/${sessionId}/type-change-request/pending`);
  return response.data.data;
};
