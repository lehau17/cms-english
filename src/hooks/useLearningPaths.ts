// Learning Path Hooks - Phase 4 CMS
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/interface/base-response.interface';
import { PageResponseDto } from '@/interface/pagination.inerface';
import {
  getPathTemplates,
  getPathTemplateById,
  createPathTemplate,
  updatePathTemplate,
  deletePathTemplate,
  getPromptTemplates,
  getPromptTemplateById,
  createPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
  getLearningPathAnalytics,
  getLearningPaths,
  getLearningPathById,
} from '@/apis/learningPath';
import {
  PathTemplate,
  PromptTemplate,
  LearningPath,
  LearningPathAnalytics,
  CreatePathTemplateDto,
  UpdatePathTemplateDto,
  CreatePromptTemplateDto,
  UpdatePromptTemplateDto,
  AnalyticsQueryParams,
} from '@/interface/learning-path.interface';

// Path Template Hooks
export const usePathTemplates = (params?: any) => {
  return useQuery<PageResponseDto<PathTemplate>, Error>({
    queryKey: ['path-templates', params],
    queryFn: () => getPathTemplates(params),
  });
};

export const usePathTemplate = (id: string) => {
  return useQuery<ApiResponse<PathTemplate>, Error>({
    queryKey: ['path-template', id],
    queryFn: () => getPathTemplateById(id),
    enabled: !!id,
  });
};

export const useCreatePathTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<PathTemplate>, Error, CreatePathTemplateDto>({
    mutationFn: createPathTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path-templates'] });
    },
  });
};

export const useUpdatePathTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PathTemplate>,
    Error,
    { id: string; data: UpdatePathTemplateDto }
  >({
    mutationFn: ({ id, data }) => updatePathTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['path-templates'] });
      queryClient.invalidateQueries({ queryKey: ['path-template', variables.id] });
    },
  });
};

export const useDeletePathTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePathTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['path-templates'] });
    },
  });
};

// Prompt Template Hooks
export const usePromptTemplates = (params?: any) => {
  return useQuery<PageResponseDto<PromptTemplate>, Error>({
    queryKey: ['prompt-templates', params],
    queryFn: () => getPromptTemplates(params),
  });
};

export const usePromptTemplate = (id: string, options?: { enabled?: boolean }) => {
  return useQuery<ApiResponse<PromptTemplate>, Error>({
    queryKey: ['prompt-template', id],
    queryFn: () => getPromptTemplateById(id),
    enabled: options?.enabled !== undefined ? options.enabled && !!id : !!id,
  });
};

export const useCreatePromptTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<PromptTemplate>, Error, CreatePromptTemplateDto>({
    mutationFn: createPromptTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-templates'] });
    },
  });
};

export const useUpdatePromptTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<PromptTemplate>,
    Error,
    { id: string; data: UpdatePromptTemplateDto }
  >({
    mutationFn: ({ id, data }) => updatePromptTemplate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompt-templates'] });
      queryClient.invalidateQueries({ queryKey: ['prompt-template', variables.id] });
    },
  });
};

export const useDeletePromptTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePromptTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompt-templates'] });
    },
  });
};

// Analytics Hook
export const useLearningPathAnalytics = (params: AnalyticsQueryParams) => {
  return useQuery<ApiResponse<LearningPathAnalytics>, Error>({
    queryKey: ['learning-path-analytics', params],
    queryFn: () => getLearningPathAnalytics(params),
  });
};

// Learning Path Hooks (for monitoring)
export const useLearningPaths = (params?: any) => {
  return useQuery<PageResponseDto<LearningPath>, Error>({
    queryKey: ['learning-paths', params],
    queryFn: () => getLearningPaths(params),
  });
};

export const useLearningPath = (id: string) => {
  return useQuery<ApiResponse<LearningPath>, Error>({
    queryKey: ['learning-path', id],
    queryFn: () => getLearningPathById(id),
    enabled: !!id,
  });
};
