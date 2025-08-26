
import axiosInstance from "../config/axiosConfig";
import { Activity } from "../interface/activity.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getActivities = async (params: RequestPagingDto): Promise<PageResponseDto<Activity>> => {
  const response = await axiosInstance.get<PageResponseDto<Activity>>("/private/v1/activities", { params });
  return response.data;
};

export const getActivityById = async (id: string): Promise<Activity> => {
  const response = await axiosInstance.get<Activity>(`/private/v1/activities/${id}`);
  return response.data;
};

export const createActivity = async (data: any): Promise<Activity> => {
  const response = await axiosInstance.post<Activity>("/private/v1/activities", data);
  return response.data;
};

export const updateActivity = async (id: string, data: any): Promise<Activity> => {
  const response = await axiosInstance.put<Activity>(`/private/v1/activities/${id}`, data);
  return response.data;
};

export const deleteActivity = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/activities/${id}`);
};
