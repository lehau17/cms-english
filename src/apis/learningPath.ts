// Learning Path API Client - Phase 4 CMS
import axiosInstance from '../config/axiosConfig';
import { ApiResponse } from '@/interface/base-response.interface';
import { PageResponseDto } from '@/interface/pagination.inerface';
import { RequestPagingDto } from '@/interface/request-paging.interface';
import {
  LearningPath,
  PathTemplate,
  PromptTemplate,
  CreatePathTemplateDto,
  UpdatePathTemplateDto,
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
  LearningPathAnalytics,
  AnalyticsQueryParams,
} from '@/interface/learning-path.interface';

// Path Templates
export const getPathTemplates = async (
  params: RequestPagingDto,
): Promise<PageResponseDto<PathTemplate>> => {
  const response = await axiosInstance.get<PageResponseDto<PathTemplate>>(
    '/admin/v1/learning-paths/templates',
    { params },
  );
  return response.data;
};

export const getPathTemplateById = async (
  id: string,
): Promise<ApiResponse<PathTemplate>> => {
  const response = await axiosInstance.get<ApiResponse<PathTemplate>>(
    `/admin/v1/learning-paths/templates/${id}`,
  );
  return response.data;
};

export const createPathTemplate = async (
  data: CreatePathTemplateDto,
): Promise<ApiResponse<PathTemplate>> => {
  const response = await axiosInstance.post<ApiResponse<PathTemplate>>(
    '/admin/v1/learning-paths/templates',
    data,
  );
  return response.data;
};

export const updatePathTemplate = async (
  id: string,
  data: UpdatePathTemplateDto,
): Promise<ApiResponse<PathTemplate>> => {
  const response = await axiosInstance.put<ApiResponse<PathTemplate>>(
    `/admin/v1/learning-paths/templates/${id}`,
    data,
  );
  return response.data;
};

export const deletePathTemplate = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/v1/learning-paths/templates/${id}`);
};

// Prompt Templates
export const getPromptTemplates = async (
  params: RequestPagingDto,
): Promise<PageResponseDto<PromptTemplate>> => {
  const response = await axiosInstance.get<PageResponseDto<PromptTemplate>>(
    '/admin/v1/prompt-templates',
    { params },
  );
  return response.data;
};

export const getPromptTemplateById = async (
  id: string,
): Promise<ApiResponse<PromptTemplate>> => {
  const response = await axiosInstance.get<ApiResponse<PromptTemplate>>(
    `/admin/v1/prompt-templates/${id}`,
  );
  return response.data;
};

export const createPromptTemplate = async (
  data: CreatePromptTemplateDto,
): Promise<ApiResponse<PromptTemplate>> => {
  const response = await axiosInstance.post<ApiResponse<PromptTemplate>>(
    '/admin/v1/prompt-templates',
    data,
  );
  return response.data;
};

export const updatePromptTemplate = async (
  id: string,
  data: UpdatePromptTemplateDto,
): Promise<ApiResponse<PromptTemplate>> => {
  const response = await axiosInstance.put<ApiResponse<PromptTemplate>>(
    `/admin/v1/prompt-templates/${id}`,
    data,
  );
  return response.data;
};

export const deletePromptTemplate = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/admin/v1/prompt-templates/${id}`);
};

// Analytics
export const getLearningPathAnalytics = async (
  params: AnalyticsQueryParams,
): Promise<ApiResponse<LearningPathAnalytics>> => {
  const response = await axiosInstance.get<ApiResponse<LearningPathAnalytics>>(
    '/admin/v1/learning-paths/analytics',
    { params },
  );
  return response.data;
};

// Learning Paths (for monitoring)
export const getLearningPaths = async (
  params: RequestPagingDto,
): Promise<PageResponseDto<LearningPath>> => {
  const response = await axiosInstance.get<PageResponseDto<LearningPath>>(
    '/admin/v1/learning-paths',
    { params },
  );
  return response.data;
};

export const getLearningPathById = async (
  id: string,
): Promise<ApiResponse<LearningPath>> => {
  const response = await axiosInstance.get<ApiResponse<LearningPath>>(
    `/admin/v1/learning-paths/${id}`,
  );
  return response.data;
};
