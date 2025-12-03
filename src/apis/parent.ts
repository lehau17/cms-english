import axiosInstance from '@/config/axiosConfig';
import { Pagination } from '@/interface/base-response.interface';
import { AssignChildrenData, CreateParentData, Parent, StudentForParent, UpdateParentData } from '@/interface/parent.interface';
import { RequestPagingDto } from '@/interface/request-paging.interface';

// Get all parents with pagination
export const getParents = async (params: RequestPagingDto): Promise<Pagination<Parent>> => {
  const response = await axiosInstance.get('/private/v1/admin/parents', { params });
  return response.data;
};

// Get parent by ID
export const getParentById = async (id: string): Promise<Parent> => {
  const response = await axiosInstance.get(`/private/v1/admin/parents/${id}`);
  return response.data;
};

// Create new parent
export const createParent = async (data: CreateParentData): Promise<Parent> => {
  const response = await axiosInstance.post('/private/v1/admin/parents', data);
  return response.data;
};

// Update parent
export const updateParent = async (id: string, data: UpdateParentData): Promise<Parent> => {
  const response = await axiosInstance.put(`/private/v1/admin/parents/${id}`, data);
  return response.data;
};

// Delete parent
export const deleteParent = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/admin/parents/${id}`);
};

// Get available students for parent assignment
export const getUnassignedStudents = async (): Promise<StudentForParent[]> => {
  const response = await axiosInstance.get('/private/v1/admin/parents/available-students');
  return response.data.data
};

// Assign children to parent
export const assignChildrenToParent = async (parentId: string, data: AssignChildrenData): Promise<void> => {
  await axiosInstance.post(`/private/v1/admin/parents/${parentId}/assign-children`, data);
};

// Remove child from parent
export const removeChildFromParent = async (parentId: string, childId: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/admin/parents/${parentId}/children/${childId}`);
};

// Bulk operations
export const bulkDeleteParents = async (ids: string[]): Promise<{ count: number }> => {
  const response = await axiosInstance.post('/private/v1/admin/parents/bulk-delete', { ids });
  return response.data;
};

export const bulkActivateParents = async (ids: string[]): Promise<{ count: number }> => {
  const response = await axiosInstance.post('/private/v1/admin/parents/bulk-activate', { ids });
  return response.data;
};

export const bulkDeactivateParents = async (ids: string[]): Promise<{ count: number }> => {
  const response = await axiosInstance.post('/private/v1/admin/parents/bulk-deactivate', { ids });
  return response.data;
};

// Statistics
export const getParentStats = async (): Promise<{
  total: number;
  active: number;
  inactive: number;
  withChildren: number;
  withoutChildren: number;
  avgChildrenPerParent: number;
}> => {
  const response = await axiosInstance.get('/private/v1/admin/parents/stats');
  return response.data.data; // Backend wraps response in { statusCode, message, data }
};

// Export/Import
export const exportParents = async (params: RequestPagingDto): Promise<Blob> => {
  const response = await axiosInstance.get('/private/v1/admin/parents/export', {
    params,
    responseType: 'blob'
  });
  return response.data;
};

export const downloadImportTemplate = async (): Promise<Blob> => {
  const response = await axiosInstance.get('/private/v1/admin/parents/import-template', {
    responseType: 'blob'
  });
  return response.data;
};

export const importParents = async (file: File): Promise<{ created: number; errors: any[] }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post('/private/v1/admin/parents/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};
