import { CreateTeacherFormValues } from "@/components/teacher/CreateTeacherModal";
import { ApiResponse } from "@/interface/base-response.interface";
import { PageResponseDto } from "@/interface/pagination.inerface";
import { UserResponse } from "@/interface/user.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTeacher,
  deleteTeacher,
  getTeacherById,
  getTeachers,
  updateTeacher,
} from "../apis/teacher";

export const useTeachers = (params?: any) => {
  return useQuery<PageResponseDto<UserResponse>, Error>({
    queryKey: ["teachers", params],
    queryFn: () => getTeachers(params),
  });
};

export const useTeacher = (id: string) => {
  return useQuery<ApiResponse<UserResponse>, Error>({
    queryKey: ["teacher", id],
    queryFn: () => getTeacherById(id),
    enabled: !!id,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<UserResponse>, Error, CreateTeacherFormValues>({
    mutationFn: createTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};

export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<UserResponse>,
    Error,
    { id: string; data: Partial<UserResponse> }
  >({
    mutationFn: ({ id, data }) => updateTeacher(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      queryClient.invalidateQueries({ queryKey: ["teacher", variables.id] });
    },
  });
};

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTeacher,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
};
