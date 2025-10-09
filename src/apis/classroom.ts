import axiosInstance from "../config/axiosConfig";
import { Classroom } from "../interface/classroom.interface";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";

export const getClassrooms = async (params: RequestPagingDto): Promise<PageResponseDto<Classroom>> => {
  const response = await axiosInstance.get<PageResponseDto<Classroom>>("/private/v1/classrooms", { params });
  return response.data;
};

export const getClassroomById = async (id: string): Promise<Classroom> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: Classroom;
  }>(`/private/v1/classrooms/${id}`);
  return response.data.data;
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

export const addStudentsToClassroom = async (classroomId: string, studentIds: string[]): Promise<void> => {
  await axiosInstance.post(`/private/v1/classrooms/${classroomId}/students`, { studentIds });
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

export interface ImportStudentsResult {
  totalProcessed: number;
  successfullyImported: number;
  failedImports: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
  createdStudents: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }>;
  existingStudents: Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }>;
}

export const importStudentsFromExcel = async (classroomId: string, file: File): Promise<ImportStudentsResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axiosInstance.post<ImportStudentsResult>(
    `/private/v1/classrooms/${classroomId}/import-students`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
