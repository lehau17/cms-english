import axiosInstance from "../config/axiosConfig";
import { RequestPagingDto } from "../interface/request-paging.interface";

// ===========================================
// TYPES & INTERFACES
// ===========================================

// Assignment type enum

export enum AssignmentType {
  HOMEWORK = 'HOMEWORK',
  QUIZ = 'QUIZ',
  MIDTERM_EXAM = 'MIDTERM_EXAM',
  FINAL_EXAM = 'FINAL_EXAM'
}
// export type AssignmentType =
//   | 'HOMEWORK'
//   | 'QUIZ'
//   | 'MIDTERM_EXAM'
//   | 'FINAL_EXAM'
//   | 'PROJECT'
//   | 'PRACTICE';

export interface AssignmentActivity {
  id: string;
  type: string;
  title: string;
  instructions?: string | null;
  content: Record<string, any>;
  points?: number;
  difficulty?: string | null;
  hints?: string[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  type?: string;
  startTime?: string | null;
  dueDate?: string | null;
  totalPoints?: number;
  timeLimit?: number | null;
  maxAttempts?: number;
  isPublished: boolean;
  classroomId: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  classroom?: {
    id: string;
    name: string;
  };
  assignmentActivities?: AssignmentActivity[];
}

export interface CreateAssignmentDto {
  title?: string;
  description?: string;
  instructions?: string;
  type?: string;
  startTime?: string;
  dueDate?: string;
  totalPoints?: number;
  timeLimit?: number;
  maxAttempts?: number;
  isPublished?: boolean;
  assignedTo?: string[];
  activities?: Omit<AssignmentActivity, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface ImportPreviewResult {
  assignment: Partial<CreateAssignmentDto>;
  activities: any[];
  errors: string[];
  warnings: string[];
}

// Type alias for AssignmentActivity DTO (for compatibility)
export type AssignmentActivityDto = AssignmentActivity;

// Clone assignment payload
export interface CloneAssignmentPayload {
  targetClassroomId?: string;
  classroomId?: string;
  title?: string;
  dueDate?: string;
  isPublished?: boolean;
  activities?: string[];
  activityIds?: string[];
}

// Submission detail type
export interface SubmissionDetail {
  id: string;
  studentId: string;
  assignmentId: string;
  status: 'pending' | 'submitted' | 'graded' | 'late' | 'missing';
  score?: number | null;
  aiScore?: number | null;
  aiFeedback?: string | null;
  feedback?: string | null;
  gradedById?: string | null;
  gradedAt?: string | null;
  submittedAt?: string | null;
  attempt: number;
  timeSpent?: number | null;
  answers?: Record<string, any>;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    email?: string;
  };
  activityResults?: Array<{
    activityId: string;
    score?: number | null;
    feedback?: string | null;
    answer?: any;
  }>;
}

// My assignments response type
export interface MyAssignmentsResponse {
  assignments: Assignment[];
  total: number;
  page: number;
  limit: number;
}

// Grade submission payload
export interface GradeSubmissionPayload {
  score: number;
  feedback?: string;
  activityScores?: Array<{
    activityId: string;
    score: number;
    feedback?: string;
  }>;
}

// ===========================================
// API FUNCTIONS
// ===========================================

// Get assignments for the current user (for reuse dialog)
export const getMyAssignments = async (
  params: RequestPagingDto
): Promise<{ data: MyAssignmentsResponse; assignments: Assignment[] }> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: any;
  }>("/private/v1/assignments/my-assignments", { params });

  // Handle various response formats
  const data = response.data.data;

  // Format 1: { assignments: [], total: N }
  if (data?.assignments && Array.isArray(data.assignments)) {
    return {
      data: {
        assignments: data.assignments,
        total: data.total || data.assignments.length,
        page: data.page || params.page || 1,
        limit: data.limit || params.limit || 10,
      },
      assignments: data.assignments,
    };
  }

  // Format 2: PageResponseDto with nested data.data
  if (data?.data && Array.isArray(data.data)) {
    return {
      data: {
        assignments: data.data,
        total: data.totalItems || data.data.length,
        page: data.page || params.page || 1,
        limit: data.limit || params.limit || 10,
      },
      assignments: data.data,
    };
  }

  // Format 3: Direct array
  if (Array.isArray(data)) {
    return {
      data: {
        assignments: data,
        total: data.length,
        page: params.page || 1,
        limit: params.limit || 10,
      },
      assignments: data,
    };
  }

  return {
    data: { assignments: [], total: 0, page: 1, limit: 10 },
    assignments: [],
  };
};

// Create assignment in a classroom
export const createAssignment = async (
  classroomId: string,
  payload: CreateAssignmentDto
): Promise<Assignment> => {
  const response = await axiosInstance.post<{
    statusCode: number;
    message: string;
    data: Assignment;
  }>(`/private/v1/classrooms/${classroomId}/assignments`, payload);
  return response.data.data;
};

// Update an existing assignment
export const updateAssignment = async (
  assignmentId: string,
  payload: Partial<CreateAssignmentDto>
): Promise<Assignment> => {
  const response = await axiosInstance.put<{
    statusCode: number;
    message: string;
    data: Assignment;
  }>(`/private/v1/assignments/${assignmentId}`, payload);
  return response.data.data;
};

// Delete an assignment
export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/assignments/${assignmentId}`);
};

// Get assignment by ID
export const getAssignmentById = async (
  assignmentId: string
): Promise<Assignment> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: Assignment;
  }>(`/private/v1/assignments/${assignmentId}`);
  return response.data.data;
};

// Download import template
export const downloadImportTemplate = async (): Promise<Blob> => {
  const response = await axiosInstance.get(
    "/private/v1/assignments/import/template",
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// Preview import data from Excel file
export const previewImportData = async (
  file: File
): Promise<{ data: ImportPreviewResult }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axiosInstance.post<{
    statusCode: number;
    message: string;
    data: ImportPreviewResult;
  }>("/private/v1/assignments/import/preview", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return { data: response.data.data };
};

// Import assignment from Excel file
export const importAssignment = async (
  classroomId: string,
  file: File,
  importData?: any
): Promise<Assignment> => {
  const formData = new FormData();
  formData.append("file", file);

  if (importData) {
    Object.keys(importData).forEach((key) => {
      formData.append(key, importData[key]);
    });
  }

  const response = await axiosInstance.post<{
    statusCode: number;
    message: string;
    data: Assignment;
  }>(`/private/v1/assignments/classroom/${classroomId}/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.data;
};

// Set assignment publish status
export const setAssignmentPublish = async (
  assignmentId: string,
  isPublished: boolean
): Promise<Assignment> => {
  return updateAssignment(assignmentId, { isPublished });
};

// Download assignment as PDF
export const downloadAssignmentPdf = async (
  assignmentId: string
): Promise<Blob> => {
  const response = await axiosInstance.get(
    `/private/v1/assignments/${assignmentId}/pdf`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};

// Clone assignment to another classroom
export const cloneAssignment = async (
  assignmentId: string,
  payload: CloneAssignmentPayload
): Promise<Assignment> => {
  // Normalize payload to use consistent field names for backend
  const normalizedPayload = {
    targetClassroomId: payload.targetClassroomId || payload.classroomId,
    title: payload.title,
    dueDate: payload.dueDate,
    isPublished: payload.isPublished,
    activities: payload.activities || payload.activityIds,
  };

  const response = await axiosInstance.post<{
    statusCode: number;
    message: string;
    data: Assignment;
  }>(`/private/v1/assignments/${assignmentId}/clone`, normalizedPayload);
  return response.data.data;
};

// Get submissions for an assignment
export const getSubmissions = async (
  assignmentId: string,
  params?: RequestPagingDto
): Promise<{ submissions: SubmissionDetail[]; total: number }> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: {
      submissions: SubmissionDetail[];
      total: number;
    };
  }>(`/private/v1/assignments/${assignmentId}/submissions`, { params });
  return response.data.data;
};

// Get single submission detail
export const getSubmissionDetail = async (
  submissionId: string
): Promise<SubmissionDetail> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: SubmissionDetail;
  }>(`/private/v1/submissions/${submissionId}`);
  return response.data.data;
};

// Alias for getSubmissionDetail (for compatibility)
export const getSubmissionDetails = getSubmissionDetail;

// Grade a submission
export const gradeSubmission = async (
  submissionId: string,
  payload: GradeSubmissionPayload
): Promise<SubmissionDetail> => {
  const response = await axiosInstance.post<{
    statusCode: number;
    message: string;
    data: SubmissionDetail;
  }>(`/private/v1/submissions/${submissionId}/grade`, payload);
  return response.data.data;
};

// Get assignments by classroom ID
export const getClassroomAssignments = async (
  classroomId: string
): Promise<{ data: Assignment[] }> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: any; // Use check any to handle variable response structure
  }>(`/private/v1/classrooms/${classroomId}/assignments`);

  const data = response.data.data;
  let assignments: Assignment[] = [];

  // Handle various response formats
  if (Array.isArray(data)) {
    assignments = data;
  } else if (data?.data && Array.isArray(data.data)) {
    assignments = data.data;
  } else if (data?.assignments && Array.isArray(data.assignments)) {
    assignments = data.assignments;
  }

  return { data: assignments };
};

// ===========================================
// EXPORT AS API OBJECT
// ===========================================

export const assignmentApi = {
  getMyAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentById,
  downloadImportTemplate,
  previewImportData,
  importAssignment,
  setAssignmentPublish,
  downloadAssignmentPdf,
  cloneAssignment,
  getSubmissions,
  getSubmissionDetail,
  gradeSubmission,
  getClassroomAssignments,
};

export default assignmentApi;
