/**
 * Notification utility functions for CMS
 */

interface ParsedNotificationData {
  type?: string;
  requestId?: string;
  sessionId?: string;
  classroomId?: string;
  classroomName?: string;
  studentId?: string;
  studentName?: string;
  sessionTitle?: string;
  sessionDate?: string;
  reason?: string;
}

/**
 * Parse notification data JSON string
 */
export function parseNotificationData(
  data: string | null | undefined
): ParsedNotificationData | null {
  if (!data) return null;
  try {
    return typeof data === 'string' ? JSON.parse(data) : data;
  } catch {
    return null;
  }
}

/**
 * Check if notification is a makeup attendance request
 */
export function isMakeupRequestNotification(
  data: ParsedNotificationData | null
): boolean {
  return data?.type === 'makeup_attendance_request';
}

/**
 * Get classroomId from makeup request notification
 */
export function getClassroomIdFromNotification(
  data: ParsedNotificationData | null
): string | null {
  return data?.classroomId || null;
}

/**
 * Check if notification is a reschedule request
 */
export function isRescheduleRequestNotification(
  data: ParsedNotificationData | null
): boolean {
  return data?.type === 'session_reschedule_request';
}

