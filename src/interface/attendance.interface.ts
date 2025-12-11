import { PaginationData } from './pagination.inerface';

/**
 * Attendance status enum
 */
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

/**
 * Session status enum
 */
export enum SessionStatus {
  SCHEDULED = 'scheduled',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

/**
 * Attendance status labels (Vietnamese)
 */
export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'Co mat',
  [AttendanceStatus.ABSENT]: 'Vang',
  [AttendanceStatus.LATE]: 'Di muon',
  [AttendanceStatus.EXCUSED]: 'Co phep',
};

/**
 * Session status labels (Vietnamese)
 */
export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  [SessionStatus.SCHEDULED]: 'Chua dien ra',
  [SessionStatus.ONGOING]: 'Dang dien ra',
  [SessionStatus.COMPLETED]: 'Da hoan thanh',
  [SessionStatus.CANCELLED]: 'Da huy',
};

/**
 * Attendance status colors for UI
 */
export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'success',
  [AttendanceStatus.ABSENT]: 'error',
  [AttendanceStatus.LATE]: 'warning',
  [AttendanceStatus.EXCUSED]: 'info',
};

/**
 * Session status colors for UI
 */
export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = {
  [SessionStatus.SCHEDULED]: 'default',
  [SessionStatus.ONGOING]: 'success',
  [SessionStatus.COMPLETED]: 'info',
  [SessionStatus.CANCELLED]: 'error',
};

/**
 * Classroom session for attendance
 */
export interface ClassroomSession {
  id: string;
  classroomId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: SessionStatus | string;
  type: string;
  meetingUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Student info in attendance
 */
export interface AttendanceStudent {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
}

/**
 * Single attendance record
 */
export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  checkInTime: string | null;
  checkOutTime: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student: AttendanceStudent;
}

/**
 * Session attendance summary
 */
export interface SessionAttendanceSummary {
  sessionId: string;
  totalStudents: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
  attendances: AttendanceRecord[];
}

/**
 * Unmarked student
 */
export interface UnmarkedStudent {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarUrl: string | null;
}

/**
 * Student attendance history item
 */
export interface StudentHistoryItem {
  sessionId: string;
  sessionTitle: string;
  sessionDate: string;
  status: string;
}

/**
 * Student attendance history with pagination
 */
export interface StudentAttendanceHistory {
  totalSessions: number;
  attended: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
  history: StudentHistoryItem[];
  pagination: PaginationData;
}

/**
 * Student stats in classroom
 */
export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  attendanceRate: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

/**
 * Classroom attendance statistics
 */
export interface ClassroomAttendanceStats {
  totalSessions: number;
  averageAttendanceRate: number;
  studentStats: StudentAttendanceStats[];
}

/**
 * Mark all absent response
 */
export interface MarkAllAbsentResponse {
  markedCount: number;
  students: Array<{ id: string; name: string }>;
}

// ==================== REQUEST TYPES ====================

/**
 * Mark attendance request
 */
export interface MarkAttendanceRequest {
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

/**
 * Bulk attendance item
 */
export interface BulkAttendanceItem {
  studentId: string;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  notes?: string;
}

/**
 * Bulk attendance request
 */
export interface BulkAttendanceRequest {
  attendances: BulkAttendanceItem[];
}

/**
 * Student history filter
 */
export interface StudentHistoryFilter {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  status?: AttendanceStatus;
}

/**
 * Blocking status
 */
export interface BlockingStatus {
  isBlocked: boolean;
  blockedAt?: string;
  blockedReason?: string;
  consecutiveAbsences: number;
  threshold: number;
  lastAbsenceDate?: string;
}

/**
 * Blocking configuration
 */
export interface BlockingConfig {
  enabled: boolean;
  threshold: number;
}

/**
 * Blocked student info
 */
export interface BlockedStudent {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentAvatar: string | null;
  consecutiveAbsences: number;
  blockedAt: string | null;
  blockedReason: string | null;
}

/**
 * Update blocking config request
 */
export interface UpdateBlockingConfigRequest {
  enabled?: boolean;
  threshold?: number;
}

/**
 * Unblock student request
 */
export interface UnblockStudentRequest {
  reason: string;
  notes?: string;
}

/**
 * Block student request
 */
export interface BlockStudentRequest {
  reason: string;
  notes?: string;
}
