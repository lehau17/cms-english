
import axiosInstance from "../config/axiosConfig";
import { Notification } from "../interface/notification.interface";
import { PageResponseDto } from "../interface/pagination.inerface";

export const getNotifications = async (params: any): Promise<PageResponseDto<Notification>> => {
  const response = await axiosInstance.get<PageResponseDto<Notification>>("/private/v1/notifications", { params });
  return response.data;
};

export const getNotificationById = async (id: string): Promise<Notification> => {
  const response = await axiosInstance.get<Notification>(`/private/v1/notifications/${id}`);
  return response.data;
};

export const createNotification = async (data: any): Promise<Notification> => {
  const response = await axiosInstance.post<Notification>("/private/v1/notifications", data);
  return response.data;
};

export const updateNotification = async (id: string, data: any): Promise<Notification> => {
  const response = await axiosInstance.put<Notification>(`/private/v1/notifications/${id}`, data);
  return response.data;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/notifications/${id}`);
};
