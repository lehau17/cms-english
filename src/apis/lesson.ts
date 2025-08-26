
import axiosInstance from "../config/axiosConfig";
import { Lesson } from "../interface/lesson.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getLessons = async (params: RequestPagingDto): Promise<PageResponseDto<Lesson>> => {
  const response = await axiosInstance.get<PageResponseDto<Lesson>>("/private/v1/lessons", { params });
  return response.data;
};

export const getLessonById = async (id: string): Promise<Lesson> => {
  const response = await axiosInstance.get<Lesson>(`/private/v1/lessons/${id}`);
  return response.data;
};

export const createLesson = async (data: any): Promise<Lesson> => {
  const response = await axiosInstance.post<Lesson>("/private/v1/lessons", data);
  return response.data;
};

export const updateLesson = async (id: string, data: any): Promise<Lesson> => {
  const response = await axiosInstance.put<Lesson>(`/private/v1/lessons/${id}`, data);
  return response.data;
};

export const deleteLesson = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/lessons/${id}`);
};
