
import axiosInstance from "../config/axiosConfig";
import { Course } from "../interface/course.interface";
import { PageResponseDto } from "../interface/pagination.inerface";

export const getCourses = async (params: any): Promise<PageResponseDto<Course>> => {
  const response = await axiosInstance.get<PageResponseDto<Course>>("/private/v1/courses", { params });
  return response.data;
};

export const getCourseById = async (id: string): Promise<Course> => {
  const response = await axiosInstance.get<Course>(`/private/v1/courses/${id}`);
  return response.data;
};

export const createCourse = async (data: any): Promise<Course> => {
  const response = await axiosInstance.post<Course>("/private/v1/courses", data);
  return response.data;
};

export const updateCourse = async (id: string, data: any): Promise<Course> => {
  const response = await axiosInstance.put<Course>(`/private/v1/courses/${id}`, data);
  return response.data;
};

export const deleteCourse = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/courses/${id}`);
};
