
import axiosInstance from "../config/axiosConfig";
import { ParentChild } from "../interface/parent-child.interface";
import { PageResponseDto } from "../interface/pagination.inerface";

export const getParentChildren = async (params: any): Promise<PageResponseDto<ParentChild>> => {
  const response = await axiosInstance.get<PageResponseDto<ParentChild>>("/private/v1/parent-children", { params });
  return response.data;
};

export const getParentChildById = async (parentId: string, childId: string): Promise<ParentChild> => {
  const response = await axiosInstance.get<ParentChild>(`/private/v1/parent-children/${parentId}/${childId}`);
  return response.data;
};

export const createParentChild = async (data: any): Promise<ParentChild> => {
  const response = await axiosInstance.post<ParentChild>("/private/v1/parent-children", data);
  return response.data;
};

export const deleteParentChild = async (parentId: string, childId: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/parent-children/${parentId}/${childId}`);
};
