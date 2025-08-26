
import axiosInstance from "../config/axiosConfig";
import { Teacher } from "../interface/teacher.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getTeachers = async (params: RequestPagingDto): Promise<PageResponseDto<Teacher>> => {
  const response = await axiosInstance.get<PageResponseDto<Teacher>>("/private/v1/teachers", { params });
  return response.data;
};

export const getTeacherById = async (id: string): Promise<Teacher> => {
  const response = await axiosInstance.get<Teacher>(`/private/v1/teachers/${id}`);
  return response.data;
};

export const createTeacher = async (data: any): Promise<Teacher> => {
  const response = await axiosInstance.post<Teacher>("/private/v1/teachers", data);
  return response.data;
};

export const updateTeacher = async (id: string, data: any): Promise<Teacher> => {
  const response = await axiosInstance.put<Teacher>(`/private/v1/teachers/${id}`, data);
  return response.data;
};

export const deleteTeacher = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/teachers/${id}`);
};

export const importTeachers = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append("file", file);
  await axiosInstance.post("/private/v1/teachers/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const exportTeachers = async (params: RequestPagingDto): Promise<Blob> => {
  const response = await axiosInstance.get<Blob>("/private/v1/teachers/export", {
    params,
    responseType: "blob",
  });
  return response.data;
};
