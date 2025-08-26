
import axiosInstance from "../config/axiosConfig";
import { Classroom } from "../interface/classroom.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getClassrooms = async (params: RequestPagingDto): Promise<PageResponseDto<Classroom>> => {
  const response = await axiosInstance.get<PageResponseDto<Classroom>>("/private/v1/classrooms", { params });
  return response.data;
};

export const getClassroomById = async (id: string): Promise<Classroom> => {
  const response = await axiosInstance.get<Classroom>(`/private/v1/classrooms/${id}`);
  return response.data;
};

export const createClassroom = async (data: any): Promise<Classroom> => {
  const response = await axiosInstance.post<Classroom>("/private/v1/classrooms", data);
  return response.data;
};

export const updateClassroom = async (id: string, data: any): Promise<Classroom> => {
  const response = await axiosInstance.put<Classroom>(`/private/v1/classrooms/${id}`, data);
  return response.data;
};

export const deleteClassroom = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/classrooms/${id}`);
};

export const addStudentToClassroom = async (classroomId: string, studentId: string): Promise<void> => {
  await axiosInstance.post(`/private/v1/classrooms/${classroomId}/students`, { studentId });
};

export const removeStudentFromClassroom = async (classroomId: string, studentId: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/classrooms/${classroomId}/students/${studentId}`);
};

export const assignTeacherToClassroom = async (classroomId: string, teacherId: string): Promise<void> => {
  await axiosInstance.put(`/private/v1/classrooms/${classroomId}/teacher`, { teacherId });
};

export const exportClassrooms = async (params: RequestPagingDto): Promise<Blob> => {
    const response = await axiosInstance.get<Blob>("/private/v1/classrooms/export", {
        params,
        responseType: "blob",
    });
    return response.data;
};
