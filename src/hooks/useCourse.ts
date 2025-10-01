import { createCourse, deleteCourse, downloadCourseTemplate, getCourseById, getCourses, updateCourse } from "@/apis/course";
import { ApiResponse } from "@/interface/base-response.interface";
import { Course } from "@/interface/course.interface";
import { PageResponseDto } from "@/interface/pagination.inerface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useCourses = (params?: any) => {
  return useQuery<PageResponseDto<Course>, Error>({
    queryKey: ["courses", params],
    queryFn: () => getCourses(params),
  });
};

export const useCourse = (id: string) => {
  return useQuery<ApiResponse<Course>, Error>({
    queryKey: ["course", id],
    queryFn: () => getCourseById(id),
    enabled: !!id,
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse<Course>, Error, Partial<Course>>({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiResponse<Course>,
    Error,
    { id: string; data: Partial<Course> }
  >({
    mutationFn: ({ id, data }) => updateCourse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", variables.id] });
    },
  });
};

export const useDeleteCourse = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};

export const useDownloadCourseTemplate = () => {
  return useMutation<Blob, Error>({
    mutationFn: downloadCourseTemplate,
    onSuccess: (blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'course-import-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
};
