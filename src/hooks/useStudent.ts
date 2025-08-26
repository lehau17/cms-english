import { ApiResponse, Pagination } from "@/interface/base-response.interface"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createStudent,
  deleteStudent,
  getStudentById,
  getStudents,
  updateStudent,
} from "../apis/student"
import { Student } from "../interface/student.interface"

export const useStudents = (params?: any) => {
  return useQuery<ApiResponse<Pagination<Student>>, Error>({
    queryKey: ["students", params],
    queryFn: () => getStudents(params),
  })
}

export const useStudent = (id: string) => {
  return useQuery<ApiResponse<Student>, Error>({
    queryKey: ["student", id],
    queryFn: () => getStudentById(id),
    enabled: !!id,
  })
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<Student>, Error, Partial<Student>>({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
    },
  })
}

export const useUpdateStudent = () => {
  const queryClient = useQueryClient()
  return useMutation<
    ApiResponse<Student>,
    Error,
    { id: string; data: Partial<Student> }
  >({
    mutationFn: ({ id, data }) => updateStudent(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
      queryClient.invalidateQueries({ queryKey: ["student", variables.id] })
    },
  })
}

export const useDeleteStudent = () => {
  const queryClient = useQueryClient()
  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: deleteStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] })
    },
  })
}
