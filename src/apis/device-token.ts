
import axiosInstance from "../config/axiosConfig";
import { DeviceToken } from "../interface/device-token.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getDeviceTokens = async (params: RequestPagingDto): Promise<PageResponseDto<DeviceToken>> => {
  const response = await axiosInstance.get<PageResponseDto<DeviceToken>>("/private/v1/device-tokens", { params });
  return response.data;
};

export const getDeviceTokenById = async (id: string): Promise<DeviceToken> => {
  const response = await axiosInstance.get<DeviceToken>(`/private/v1/device-tokens/${id}`);
  return response.data;
};

export const createDeviceToken = async (data: any): Promise<DeviceToken> => {
  const response = await axiosInstance.post<DeviceToken>("/private/v1/device-tokens", data);
  return response.data;
};

export const updateDeviceToken = async (id: string, data: any): Promise<DeviceToken> => {
  const response = await axiosInstance.put<DeviceToken>(`/private/v1/device-tokens/${id}`, data);
  return response.data;
};

export const deleteDeviceToken = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/device-tokens/${id}`);
};
