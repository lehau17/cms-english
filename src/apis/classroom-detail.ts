import axiosInstance from "../config/axiosConfig";

export const getClassroomDetail = async (id: string) => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: any;
  }>(`/private/v1/classrooms/${id}/detail`);
  return response.data.data;
};

export interface StudentGrade {
  studentId: string;
  studentName: string;
  midterm?: number | null;
  final?: number | null;
  tests?: number | null;
  activities?: number | null;
  finalGrade: number;
}

export interface ClassroomGradebook {
  classroomId: string;
  classroomName: string;
  students: StudentGrade[];
}

export const getClassroomGradebook = async (id: string): Promise<ClassroomGradebook> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: ClassroomGradebook;
  }>(`/private/v1/gradebook/classrooms/${id}`);
  return response.data.data;
};

export const exportClassroomGradebook = async (id: string): Promise<Blob> => {
  const response = await axiosInstance.get(`/private/v1/gradebook/classrooms/${id}/export`, {
    responseType: 'blob',
  });
  return response.data;
};

export interface AssignmentDetail {
  assignmentId: string;
  title: string;
  type: string;
  totalPoints: number;
  weight: number;
  score: number | null;
  maxScore: number;
  submissionId: string | null;
  submittedAt: string | null;
  gradedAt: string | null;
  feedback: string | null;
  attemptCount: number;
}

export interface ActivityDetail {
  activityId: string;
  title: string;
  type: string;
  lessonTitle: string;
  bestScore: number | null;
  currentScore: number | null;
  attemptsCount: number;
  state: string;
  timeSpentSec: number;
}

export interface StudentGradeDetails {
  studentId: string;
  studentName: string;
  classroomId: string;
  classroomName: string;
  assignments: {
    midterm: AssignmentDetail[];
    final: AssignmentDetail[];
    tests: AssignmentDetail[];
  };
  activities: ActivityDetail[];
}

export const getStudentGradeDetails = async (
  classroomId: string,
  studentId: string,
): Promise<StudentGradeDetails> => {
  const response = await axiosInstance.get<{
    statusCode: number;
    message: string;
    data: StudentGradeDetails;
  }>(`/private/v1/gradebook/classrooms/${classroomId}/students/${studentId}/details`);
  return response.data.data;
};
