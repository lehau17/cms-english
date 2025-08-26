import { ApiResponse, Pagination } from "@/interface/base-response.interface"
import axiosInstance from "../config/axiosConfig"
import { Student } from "../interface/student.interface"

import { RequestPagingDto } from "../interface/request-paging.interface";

export const getStudents = async (
  params: RequestPagingDto
): Promise<ApiResponse<Pagination<Student>>> => {
  const response = await axiosInstance.get<
    ApiResponse<Pagination<Student>>
  >("/private/v1/students", { params })
  return response.data
}

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
  const response = await axiosInstance.put<ApiResponse<Student>>(
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
