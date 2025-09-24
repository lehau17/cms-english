import axiosInstance from "../config/axiosConfig";
import type { PageResponseDto } from "@/interface/pagination.inerface";

export interface Room {
  id: string;
  name: string;
  code: string;
  location?: string;
  capacity: number;
  description?: string;
  equipment?: any;
  facilities?: any;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RequestPagingDto {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export const getRooms = async (params: RequestPagingDto): Promise<PageResponseDto<Room>> => {
  const resp = await axiosInstance.get<PageResponseDto<Room>>('/private/v1/rooms', { params });
  return resp.data;
};

export const createRoom = async (payload: Partial<Room>) => {
  const resp = await axiosInstance.post<Room>('/private/v1/rooms', payload);
  return resp.data;
}

export const updateRoom = async (id: string, payload: Partial<Room>) => {
  const resp = await axiosInstance.patch<Room>(`/private/v1/rooms/${id}`, payload);
  return resp.data;
}

export const deleteRoom = async (id: string) => {
  await axiosInstance.delete(`/private/v1/rooms/${id}`);
}

