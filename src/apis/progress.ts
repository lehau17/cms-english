
import axiosInstance from "../config/axiosConfig";
import { Progress } from "../interface/progress.interface";
import { PageResponseDto } from "../interface/pagination.inerface";

export const getProgresses = async (params: any): Promise<PageResponseDto<Progress>> => {
  const response = await axiosInstance.get<PageResponseDto<Progress>>("/private/v1/progresses", { params });
  return response.data;
};

export const getProgressById = async (id: string): Promise<Progress> => {
  const response = await axiosInstance.get<Progress>(`/private/v1/progresses/${id}`);
  return response.data;
};

export const createProgress = async (data: any): Promise<Progress> => {
  const response = await axiosInstance.post<Progress>("/private/v1/progresses", data);
  return response.data;
};

export const updateProgress = async (id: string, data: any): Promise<Progress> => {
  const response = await axiosInstance.put<Progress>(`/private/v1/progresses/${id}`, data);
  return response.data;
};

export const deleteProgress = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/progresses/${id}`);
};
