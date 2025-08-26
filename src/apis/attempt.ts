
import axiosInstance from "../config/axiosConfig";
import { Attempt } from "../interface/attempt.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getAttempts = async (params: RequestPagingDto): Promise<PageResponseDto<Attempt>> => {
  const response = await axiosInstance.get<PageResponseDto<Attempt>>("/private/v1/attempts", { params });
  return response.data;
};

export const getAttemptById = async (id: string): Promise<Attempt> => {
  const response = await axiosInstance.get<Attempt>(`/private/v1/attempts/${id}`);
  return response.data;
};

export const createAttempt = async (data: any): Promise<Attempt> => {
  const response = await axiosInstance.post<Attempt>("/private/v1/attempts", data);
  return response.data;
};

export const updateAttempt = async (id: string, data: any): Promise<Attempt> => {
  const response = await axiosInstance.put<Attempt>(`/private/v1/attempts/${id}`, data);
  return response.data;
};

export const deleteAttempt = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/attempts/${id}`);
};
