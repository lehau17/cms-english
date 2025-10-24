import { ApiResponse, Pagination } from "@/interface/base-response.interface";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    addStudentsToClassroom,
    createClassroom,
    deleteClassroom,
    getClassroomById,
    getClassrooms,
    importStudentsFromExcel,
    ImportStudentsResult,
    removeStudentFromClassroom,
    updateClassroom,
    updateClassroomStatus,
} from "../apis/classroom";
import { Classroom, ClassroomStatus } from "../interface/classroom.interface";

export const useClassrooms = (params?: any) => {
    return useQuery<ApiResponse<Pagination<Classroom>>, Error>({
        queryKey: ["classrooms", params],
        queryFn: () => getClassrooms(params),
    });
};

export const useClassroom = (id: string) => {
    return useQuery<ApiResponse<Classroom>, Error>({
        queryKey: ["classroom", id],
        queryFn: () => getClassroomById(id),
        enabled: !!id,
    });
};

export const useCreateClassroom = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Classroom>, Error, Partial<Classroom>>({
        mutationFn: createClassroom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
        },
    });
};

export const useUpdateClassroom = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Classroom>,
        Error,
        { id: string; data: Partial<Classroom> }
    >({
        mutationFn: ({ id, data }) => updateClassroom(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.invalidateQueries({ queryKey: ["classroom", variables.id] });
        },
    });
};

export const useDeleteClassroom = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<null>, Error, string>({
        mutationFn: deleteClassroom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
        },
    });
};

export const useAddStudentsToClassroom = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<null>,
        Error,
        { classroomId: string; studentIds: string[] }
    >({
        mutationFn: ({ classroomId, studentIds }) =>
            addStudentsToClassroom(classroomId, studentIds),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.invalidateQueries({ queryKey: ["classroom", variables.classroomId] });
        },
    });
};

export const useRemoveStudentFromClassroom = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<null>,
        Error,
        { classroomId: string; studentId: string }
    >({
        mutationFn: ({ classroomId, studentId }) =>
            removeStudentFromClassroom(classroomId, studentId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.invalidateQueries({ queryKey: ["classroom", variables.classroomId] });
        },
    });
};

export const useImportStudentsFromExcel = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<ImportStudentsResult>,
        Error,
        { classroomId: string; file: File }
    >({
        mutationFn: ({ classroomId, file }) =>
            importStudentsFromExcel(classroomId, file),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.invalidateQueries({ queryKey: ["classroom", variables.classroomId] });
        },
    });
};

// ==================== STATUS MANAGEMENT ====================

export const useUpdateClassroomStatus = () => {
    const queryClient = useQueryClient();
    return useMutation<
        Classroom,
        Error,
        { classroomId: string; status: ClassroomStatus }
    >({
        mutationFn: ({ classroomId, status }) =>
            updateClassroomStatus(classroomId, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["classrooms"] });
            queryClient.invalidateQueries({ queryKey: ["classroom", variables.classroomId] });
        },
    });
};
