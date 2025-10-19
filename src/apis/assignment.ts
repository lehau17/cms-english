import axiosInstance from '../config/axiosConfig';

export enum AssignmentType {
    HOMEWORK = 'HOMEWORK',
    QUIZ = 'QUIZ',
    MIDTERM_EXAM = 'MIDTERM_EXAM',
    FINAL_EXAM = 'FINAL_EXAM'
}

export interface Assignment {
    id: string;
    title: string;
    description?: string;
    instructions?: string;
    dueDate?: string;
    totalPoints?: number;
    timeLimit?: number;
    maxAttempts?: number;
    status: string;
    isPublished: boolean;
    type?: AssignmentType;
    weight?: number;
    teacherId: string;
    classroomId: string;
    teacher?: {
        id: string;
        displayName?: string;
        firstName?: string;
        lastName?: string;
        email?: string;
    };
    classroom?: {
        id: string;
        name: string;
        classCode: string;
    };
    assignmentActivities?: AssignmentActivity[];
    createdAt: string;
    updatedAt: string;
}

export interface AssignmentActivity {
    id: string;
    type: string;
    title: string;
    instructions?: string;
    content: Record<string, any>;
    points: number;
    difficulty?: string;
    hints?: string[];
}

export interface CreateAssignmentDto {
    title: string;
    description?: string;
    instructions?: string;
    dueDate?: string;
    totalPoints?: number;
    timeLimit?: number;
    maxAttempts?: number;
    isPublished?: boolean;
    assignedTo?: string[];
    activities: AssignmentActivityDto[];
    customContent?: any;
}

export interface AssignmentActivityDto {
    type: string;
    title: string;
    instructions?: string;
    content: Record<string, any>;
    points: number;
    difficulty?: string;
    hints?: string[];
}

export interface AssignmentsResponse {
    assignments: Assignment[];
    total: number;
    page: number;
    limit: number;
}

export interface QueryAssignmentsDto {
    page?: number;
    limit?: number;
    status?: string;
    classroomId?: string;
}

// API Functions
export const assignmentApi = {
    // Get assignments by teacher
    getMyAssignments: async (params?: QueryAssignmentsDto) => {
        const response = await axiosInstance.get('/private/v1/assignments/my-assignments', { params });
        return response.data;
    },

    // Get assignments by classroom
    getClassroomAssignments: async (classroomId: string, params?: QueryAssignmentsDto) => {
        const response = await axiosInstance.get(`/private/v1/assignments/classroom/${classroomId}`, { params });
        return response.data;
    },

    // Get assignment by ID
    getAssignmentById: async (assignmentId: string, includeSubmissions?: boolean) => {
        const response = await axiosInstance.get(`/private/v1/assignments/${assignmentId}`, {
            params: { includeSubmissions }
        });
        return response.data;
    },

    // Create assignment
    createAssignment: async (classroomId: string, data: CreateAssignmentDto) => {
        const response = await axiosInstance.post(`/private/v1/assignments/classroom/${classroomId}`, data);
        return response.data;
    },

    // Update assignment
    updateAssignment: async (assignmentId: string, data: Partial<CreateAssignmentDto>) => {
        const response = await axiosInstance.put(`/private/v1/assignments/${assignmentId}`, data);
        return response.data;
    },

    // Delete assignment
    deleteAssignment: async (assignmentId: string) => {
        const response = await axiosInstance.delete(`/private/v1/assignments/${assignmentId}`);
        return response.data;
    },

    // Publish/unpublish assignment
    publishAssignment: async (assignmentId: string) => {
        const response = await axiosInstance.patch(`/private/v1/assignments/${assignmentId}/publish`);
        return response.data;
    },

    // Download assignment as PDF
    downloadAssignmentPdf: async (assignmentId: string): Promise<Blob> => {
        const response = await axiosInstance.get(`/private/v1/assignments/${assignmentId}/pdf`, {
            responseType: 'blob',
        });
        return response.data;
    },

    // Import assignment template
    downloadImportTemplate: async (): Promise<Blob> => {
        const response = await axiosInstance.get('/private/v1/assignments/import/template', {
            responseType: 'blob',
        });
        return response.data;
    },

    // Preview import data
    previewImportData: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post('/private/v1/assignments/import/preview', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Import assignments
    importAssignments: async (classroomId: string, file: File, importDto?: any) => {
        const formData = new FormData();
        formData.append('file', file);
        if (importDto) {
            formData.append('importDto', JSON.stringify(importDto));
        }

        const response = await axiosInstance.post(`/private/v1/assignments/import/${classroomId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get assignment submissions
    getAssignmentSubmissions: async (assignmentId: string) => {
        const response = await axiosInstance.get(`/private/v1/assignments/${assignmentId}/submissions`);
        return response.data;
    },

    // Grade submission
    gradeSubmission: async (submissionId: string, data: { score: number; feedback?: string }) => {
        const response = await axiosInstance.patch(`/private/v1/assignments/submissions/${submissionId}/grade`, data);
        return response.data;
    },
};

// Utility functions
export const downloadPdfFromBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

export const downloadAssignmentPdf = async (assignmentId: string, assignmentTitle: string) => {
    try {
        const blob = await assignmentApi.downloadAssignmentPdf(assignmentId);
        const filename = `assignment-${assignmentTitle.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
        downloadPdfFromBlob(blob, filename);
        return true;
    } catch (error: any) {
        console.error('Error downloading PDF:', error);
        throw new Error(error?.response?.data?.message || 'Failed to download PDF');
    }
};

export default assignmentApi;
