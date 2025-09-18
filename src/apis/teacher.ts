
import { ApiResponse } from "@/interface/base-response.interface";
import { UserResponse } from "@/interface/user.interface";
import axiosInstance from "../config/axiosConfig";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getTeachers = async (params: RequestPagingDto): Promise<PageResponseDto<UserResponse>> => {
  const response = await axiosInstance.get<PageResponseDto<UserResponse>>("/private/v1/teachers", { params });
  return response.data;
};

export const getTeacherById = async (id: string): Promise<ApiResponse<UserResponse>> => {
  const response = await axiosInstance.get<ApiResponse<UserResponse>>(`/private/v1/teachers/${id}`);
  return response.data;
};

export const createTeacher = async (data: any): Promise<ApiResponse<UserResponse>> => {
  const response = await axiosInstance.post<ApiResponse<UserResponse>>("/private/v1/teachers", data);
  return response.data;
};

export const updateTeacher = async (id: string, data: any): Promise<ApiResponse<UserResponse>> => {
  const response = await axiosInstance.put<ApiResponse<UserResponse>>(`/private/v1/teachers/${id}`, data);
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
