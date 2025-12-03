import { ApiResponse } from "@/interface/base-response.interface";
import axiosInstance from "../config/axiosConfig";
import { PageResponseDto } from "../interface/pagination.inerface";
import { RequestPagingDto } from "../interface/request-paging.interface";
import { Student } from "../interface/student.interface";

export const getStudents = async (
    params: RequestPagingDto
): Promise<PageResponseDto<Student>> => {
    const response = await axiosInstance.get<PageResponseDto<Student>>(
        "/private/v1/students",
        { params }
    );
    return response.data;
};

export const getStudentById = async (
    id: string
): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.get<ApiResponse<Student>>(
        `/private/v1/students/${id}`
    )
    return response.data
}

export const createStudent = async (
    data: Partial<Student>
): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.post<ApiResponse<Student>>(
        "/private/v1/students",
        data
    )
    return response.data
}

export const updateStudent = async (
    id: string,
    data: Partial<Student>
): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.patch<ApiResponse<Student>>(
        `/private/v1/students/${id}`,
        data
    )
    return response.data
}

export const deleteStudent = async (
    id: string
): Promise<ApiResponse<null>> => {
    const response = await axiosInstance.delete<ApiResponse<null>>(
        `/private/v1/students/${id}`
    )
    return response.data
}

export const bulkDeleteStudents = async (
    ids: string[]
): Promise<ApiResponse<{ count: number }>> => {
    const response = await axiosInstance.post<ApiResponse<{ count: number }>>(
        "/private/v1/students/bulk-delete",
        { ids }
    )
    return response.data
}

export const getStudentStats = async (): Promise<ApiResponse<{
    total: number;
    active: number;
    inactive: number;
    byGender: Record<string, number>;
}>> => {
    const response = await axiosInstance.get<ApiResponse<{
        total: number;
        active: number;
        inactive: number;
        byGender: Record<string, number>;
    }>>("/private/v1/students/stats")
    return response.data
}

export const exportStudents = async (
    params: RequestPagingDto
): Promise<Blob> => {
    const response = await axiosInstance.get("/private/v1/students/export", {
        params,
        responseType: 'blob'
    })
    return response.data
}

export const downloadImportTemplate = async (): Promise<Blob> => {
    const response = await axiosInstance.get("/private/v1/students/import-template", {
        responseType: 'blob'
    })
    return response.data
}

export const importStudents = async (
    file: File
): Promise<ApiResponse<{ created: number; errors: any[] }>> => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await axiosInstance.post<ApiResponse<{ created: number; errors: any[] }>>(
        "/private/v1/students/import",
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }
    )
    return response.data
}

export const resetStudentPassword = async (
    id: string,
    newPassword: string
): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.post<ApiResponse<Student>>(
        `/private/v1/students/${id}/reset-password`,
        { newPassword }
    )
    return response.data
}

export const activateStudent = async (
    id: string
): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.patch<ApiResponse<Student>>(
        `/private/v1/students/${id}/activate`
    )
    return response.data
}

export const deactivateStudent = async (
    id: string
): Promise<ApiResponse<Student>> => {
    const response = await axiosInstance.patch<ApiResponse<Student>>(
        `/private/v1/students/${id}/deactivate`
    )
    return response.data
}
