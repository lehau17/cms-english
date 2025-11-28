import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AttendanceStatus,
  BulkAttendanceRequest,
  MarkAttendanceRequest,
  StudentHistoryFilter,
} from '@/interface/attendance.interface';
import * as attendanceApi from '@/apis/attendance.api';

// ==================== QUERY KEYS ====================

export const attendanceKeys = {
  all: ['attendance'] as const,
  session: (sessionId: string) => [...attendanceKeys.all, 'session', sessionId] as const,
  sessionSummary: (sessionId: string) =>
    [...attendanceKeys.session(sessionId), 'summary'] as const,
  unmarked: (sessionId: string) =>
    [...attendanceKeys.session(sessionId), 'unmarked'] as const,
  classroomStats: (classroomId: string) =>
    [...attendanceKeys.all, 'classroom', classroomId, 'stats'] as const,
  studentHistory: (classroomId: string, studentId: string, filter?: StudentHistoryFilter) =>
    [...attendanceKeys.all, 'classroom', classroomId, 'student', studentId, filter] as const,
};

// ==================== SESSION QUERIES ====================

/**
 * Get attendance list for a session
 */
export const useSessionAttendances = (sessionId: string) => {
  return useQuery({
    queryKey: attendanceKeys.session(sessionId),
    queryFn: () => attendanceApi.getSessionAttendances(sessionId),
    enabled: !!sessionId,
  });
};

/**
 * Get session attendance summary
 */
export const useSessionSummary = (sessionId: string) => {
  return useQuery({
    queryKey: attendanceKeys.sessionSummary(sessionId),
    queryFn: () => attendanceApi.getSessionSummary(sessionId),
    enabled: !!sessionId,
  });
};

/**
 * Get unmarked students
 */
export const useUnmarkedStudents = (sessionId: string) => {
  return useQuery({
    queryKey: attendanceKeys.unmarked(sessionId),
    queryFn: () => attendanceApi.getUnmarkedStudents(sessionId),
    enabled: !!sessionId,
  });
};

// ==================== CLASSROOM QUERIES ====================

/**
 * Get classroom attendance statistics
 */
export const useClassroomAttendanceStats = (classroomId: string) => {
  return useQuery({
    queryKey: attendanceKeys.classroomStats(classroomId),
    queryFn: () => attendanceApi.getClassroomStats(classroomId),
    enabled: !!classroomId,
  });
};

/**
 * Get student attendance history
 */
export const useStudentHistory = (
  classroomId: string,
  studentId: string,
  filter?: StudentHistoryFilter
) => {
  return useQuery({
    queryKey: attendanceKeys.studentHistory(classroomId, studentId, filter),
    queryFn: () => attendanceApi.getStudentHistory(classroomId, studentId, filter),
    enabled: !!classroomId && !!studentId,
  });
};

// ==================== MUTATIONS ====================

/**
 * Mark attendance for a single student
 */
export const useMarkAttendance = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      studentId,
      data,
    }: {
      studentId: string;
      data: MarkAttendanceRequest;
    }) => attendanceApi.markAttendance(sessionId, studentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(sessionId) });
    },
  });
};

/**
 * Bulk mark attendance
 */
export const useBulkMarkAttendance = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BulkAttendanceRequest) =>
      attendanceApi.bulkMarkAttendance(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(sessionId) });
    },
  });
};

/**
 * Quick check-in
 */
export const useQuickCheckIn = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => attendanceApi.quickCheckIn(sessionId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(sessionId) });
    },
  });
};

/**
 * Quick check-out
 */
export const useQuickCheckOut = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => attendanceApi.quickCheckOut(sessionId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(sessionId) });
    },
  });
};

/**
 * Mark all unmarked students as absent
 */
export const useMarkAllAbsent = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => attendanceApi.markAllAbsent(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(sessionId) });
    },
  });
};

/**
 * Delete attendance record
 */
export const useDeleteAttendance = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (studentId: string) => attendanceApi.deleteAttendance(sessionId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.session(sessionId) });
    },
  });
};

// ==================== HELPER HOOKS ====================

/**
 * Get attendance status options for select/dropdown
 */
export const useAttendanceStatusOptions = () => {
  return [
    { value: AttendanceStatus.PRESENT, label: 'Co mat', color: 'success' },
    { value: AttendanceStatus.ABSENT, label: 'Vang', color: 'error' },
    { value: AttendanceStatus.LATE, label: 'Di muon', color: 'warning' },
    { value: AttendanceStatus.EXCUSED, label: 'Co phep', color: 'info' },
  ];
};
