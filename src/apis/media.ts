import axiosInstance from "../config/axiosConfig";

export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnail?: string;
  isProcessed: boolean;
  duration?: number;
  usageCount: number;
  tags?: string[];
  description?: string;
  category?: string;
  source?: string;
  sourceId?: string;
  context?: any;
  createdAt: string;
  updatedAt: string;
}

export interface MediaListParams {
  mimeType?: string;
  source?: string;
  sourceId?: string;
  tags?: string[];
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MediaListResponse {
  data: MediaFile[];
  total: number;
  page: number;
}

export async function getMediaList(
  params?: MediaListParams,
): Promise<MediaListResponse> {
  const response = await axiosInstance.get('/private/v1/media', { params });
  return response.data.data;
}

export async function getMediaById(id: string): Promise<MediaFile> {
  const response = await axiosInstance.get(`/private/v1/media/${id}`);
  return response.data;
}

export async function searchMedia(
  query: string,
  params?: { type?: string; category?: string; page?: number; limit?: number },
): Promise<{ results: MediaFile[]; total: number; page: number }> {
  const response = await axiosInstance.get('/private/v1/media/search', {
    params: { q: query, ...params },
  });
  return response.data;
}














