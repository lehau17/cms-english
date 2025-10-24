
import axiosInstance from "../config/axiosConfig";
import { PageResponseDto } from "../interface/pagination.inerface";
import { LinkRequestStatus, ParentChild, ParentChildLinkRequest } from "../interface/parent-child.interface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getParentChildren = async (params: RequestPagingDto): Promise<PageResponseDto<ParentChild>> => {
    const response = await axiosInstance.get<PageResponseDto<ParentChild>>("/private/v1/parent-children", { params });
    return response.data;
};

export const getParentChildById = async (parentId: string, childId: string): Promise<ParentChild> => {
    const response = await axiosInstance.get<ParentChild>(`/private/v1/parent-children/${parentId}/${childId}`);
    return response.data;
};

export const createParentChild = async (data: any): Promise<ParentChild> => {
    const response = await axiosInstance.post<ParentChild>("/private/v1/parent-children", data);
    return response.data;
};

export const deleteParentChild = async (parentId: string, childId: string): Promise<void> => {
    await axiosInstance.delete(`/private/v1/parent-children/${parentId}/${childId}`);
};

// ==================== LINK REQUEST APIs ====================

export interface GetPendingRequestsParams extends RequestPagingDto {
    status?: LinkRequestStatus;
    parentId?: string;
    studentId?: string;
}

export const getPendingRequests = async (params: GetPendingRequestsParams): Promise<PageResponseDto<ParentChildLinkRequest>> => {
    const response = await axiosInstance.get<PageResponseDto<ParentChildLinkRequest>>("/private/v1/parent-children/link-requests/pending", { params });
    return response.data;
};

export const approveLinkRequest = async (requestId: string): Promise<ParentChildLinkRequest> => {
    const response = await axiosInstance.post<ParentChildLinkRequest>(`/private/v1/parent-children/link-requests/${requestId}/approve`);
    return response.data;
};

export const rejectLinkRequest = async (requestId: string): Promise<ParentChildLinkRequest> => {
    const response = await axiosInstance.post<ParentChildLinkRequest>(`/private/v1/parent-children/link-requests/${requestId}/reject`);
    return response.data;
};
