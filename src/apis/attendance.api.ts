import axiosInstance from '@/config/axiosConfig';
import {
    AttendanceRecord,
    BulkAttendanceRequest,
    ClassroomAttendanceStats,
    MarkAllAbsentResponse,
    MarkAttendanceRequest,
    SessionAttendanceSummary,
    StudentAttendanceHistory,
    StudentHistoryFilter,
    UnmarkedStudent,
} from '@/interface/attendance.interface';
import { ApiResponse } from '@/interface/base-response.interface';

const BASE_URL = '/private/v1';

// ==================== SESSION ATTENDANCE ====================

/**
 * Get attendance list for a session
 */
export const getSessionAttendances = async (
  sessionId: string
): Promise<AttendanceRecord[]> => {
  const response = await axiosInstance.get<ApiResponse<AttendanceRecord[]>>(
    `${BASE_URL}/sessions/${sessionId}/attendance`
  );
  return response.data.data;
};

/**
 * Get attendance summary for a session
 */
export const getSessionSummary = async (
  sessionId: string
): Promise<SessionAttendanceSummary> => {
  const response = await axiosInstance.get<ApiResponse<SessionAttendanceSummary>>(
    `${BASE_URL}/sessions/${sessionId}/attendance/summary`
  );
  return response.data.data;
};

/**
 * Get unmarked students for a session
 */
export const getUnmarkedStudents = async (
  sessionId: string
): Promise<UnmarkedStudent[]> => {
  const response = await axiosInstance.get<ApiResponse<UnmarkedStudent[]>>(
    `${BASE_URL}/sessions/${sessionId}/attendance/unmarked`
  );
  return response.data.data;
};

// ==================== MARK ATTENDANCE ====================

/**
 * Mark attendance for a single student
 */
export const markAttendance = async (
  sessionId: string,
  studentId: string,
  data: MarkAttendanceRequest
): Promise<AttendanceRecord> => {
  const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>(
    `${BASE_URL}/sessions/${sessionId}/attendance/${studentId}`,
    data
  );
  return response.data.data;
};

/**
 * Bulk mark attendance for multiple students
 */
export const bulkMarkAttendance = async (
  sessionId: string,
  data: BulkAttendanceRequest
): Promise<AttendanceRecord[]> => {
  const response = await axiosInstance.post<ApiResponse<AttendanceRecord[]>>(
    `${BASE_URL}/sessions/${sessionId}/attendance/bulk`,
    data
  );
  return response.data.data;
};

/**
 * Quick check-in for a student
 */
export const quickCheckIn = async (
  sessionId: string,
  studentId: string
): Promise<AttendanceRecord> => {
  const response = await axiosInstance.post<ApiResponse<AttendanceRecord>>(
    `${BASE_URL}/sessions/${sessionId}/attendance/${studentId}/check-in`
  );
  return response.data.data;
};

/**
 * Quick check-out for a student
 */
export const quickCheckOut = async (
  sessionId: string,
  studentId: string
): Promise<AttendanceRecord> => {
  const response = await axiosInstance.put<ApiResponse<AttendanceRecord>>(
    `${BASE_URL}/sessions/${sessionId}/attendance/${studentId}/check-out`
  );
  return response.data.data;
};

/**
 * Mark all unmarked students as absent
 */
export const markAllAbsent = async (
  sessionId: string
): Promise<MarkAllAbsentResponse> => {
  const response = await axiosInstance.post<ApiResponse<MarkAllAbsentResponse>>(
    `${BASE_URL}/sessions/${sessionId}/attendance/mark-all-absent`
  );
  return response.data.data;
};

/**
 * Delete attendance record
 */
export const deleteAttendance = async (
  sessionId: string,
  studentId: string
): Promise<void> => {
  await axiosInstance.delete(
    `${BASE_URL}/sessions/${sessionId}/attendance/${studentId}`
  );
};

// ==================== CLASSROOM STATS ====================

/**
 * Get classroom attendance statistics
 */
export const getClassroomStats = async (
  classroomId: string
): Promise<ClassroomAttendanceStats> => {
  const response = await axiosInstance.get<ApiResponse<ClassroomAttendanceStats>>(
    `${BASE_URL}/classrooms/${classroomId}/attendance/stats`
  );
  return response.data.data;
};

/**
 * Get student attendance history in a classroom
 */
export const getStudentHistory = async (
  classroomId: string,
  studentId: string,
  filter?: StudentHistoryFilter
): Promise<StudentAttendanceHistory> => {
  const params = new URLSearchParams();

  if (filter?.page) params.append('page', String(filter.page));
  if (filter?.limit) params.append('limit', String(filter.limit));
  if (filter?.fromDate) params.append('fromDate', filter.fromDate);
  if (filter?.toDate) params.append('toDate', filter.toDate);
  if (filter?.status) params.append('status', filter.status);

  const queryString = params.toString();
  const url = `${BASE_URL}/classrooms/${classroomId}/students/${studentId}/attendance${
    queryString ? `?${queryString}` : ''
  }`;

  const response = await axiosInstance.get<ApiResponse<StudentAttendanceHistory>>(url);
  return response.data.data;
};
