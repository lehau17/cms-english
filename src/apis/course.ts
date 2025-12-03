
import { ApiResponse } from "@/interface/base-response.interface";
import axiosInstance from "../config/axiosConfig";
import { Course } from "../interface/course.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getCourses = async (params: RequestPagingDto): Promise<PageResponseDto<Course>> => {
  const response = await axiosInstance.get<PageResponseDto<Course>>("/private/v1/courses", { params });
  return response.data;
};

export const getCourseById = async (id: string): Promise<ApiResponse<Course>> => {
  const response = await axiosInstance.get<ApiResponse<Course>>(`/private/v1/courses/${id}`);
  return response.data;
};

export const createCourse = async (data: any): Promise<ApiResponse<Course>> => {
  const response = await axiosInstance.post<ApiResponse<Course>>("/private/v1/courses", data);
  return response.data;
};

export const updateCourse = async (id: string, data: any): Promise<ApiResponse<Course>> => {
  const response = await axiosInstance.put<ApiResponse<Course>>(`/private/v1/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/courses/${id}`);
};

export interface ImportCoursesResponse {
  totalFiles: number;
  successfulImports: number;
  failedImports: number;
  results: Array<{
    fileName: string;
    success: boolean;
    data?: {
      dryRun: boolean;
      upsert: boolean;
      publish: boolean;
      matchBy: string;
      totalCourses: number;
      totalSessionSchedules?: number;
      results: any[];
    };
    error?: string;
  }>;
}

export const importCoursesFromExcel = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append('files', file);
  });

  const response = await axiosInstance.post<ApiResponse<ImportCoursesResponse>>("/private/v1/courses/import-multiple-excels", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data
};

export const downloadCourseTemplate = async (): Promise<Blob> => {
  const response = await axiosInstance.get("/private/v1/courses/templates/download", {
    responseType: 'blob',
  });
  return response.data;
};

export interface CourseStats {
  total: number;
  published: number;
  unpublished: number;
  avgPrice: number;
}

export const getCourseStats = async (): Promise<CourseStats> => {
  const response = await axiosInstance.get('/private/v1/courses/stats');
  return response.data.data; // Backend wraps response in { statusCode, message, data }
};

// Bulk operations
export const bulkDeleteCourses = async (ids: string[]): Promise<void> => {
  await axiosInstance.post('/private/v1/courses/bulk-delete', { ids });
};

export const bulkPublishCourses = async (ids: string[]): Promise<void> => {
  await axiosInstance.post('/private/v1/courses/bulk-publish', { ids });
};

export const bulkUnpublishCourses = async (ids: string[]): Promise<void> => {
  await axiosInstance.post('/private/v1/courses/bulk-unpublish', { ids });
};

// Export
export const exportCourses = async (params: RequestPagingDto & {
  isPublished?: boolean;
  difficulty?: string;
}): Promise<Blob> => {
  const response = await axiosInstance.get('/private/v1/courses/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};
