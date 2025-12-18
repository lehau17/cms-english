/**
 * Date validation utilities for date restrictions
 */

import { ClassroomSession } from '@/apis/classroom';

/**
 * Extract dates with scheduled/ongoing sessions
 * @param sessions - Array of classroom sessions
 * @returns Set of date strings (YYYY-MM-DD format)
 */
export const getBookedDates = (sessions: ClassroomSession[]): Set<string> => {
  const bookedDates = new Set<string>();

  sessions
    .filter(session => session.status === 'scheduled' || session.status === 'ongoing')
    .forEach(session => {
      const date = new Date(session.startTime);
      const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
      bookedDates.add(dateString);
    });

  return bookedDates;
};

/**
 * Check if a date has a scheduled session
 * @param date - Date to check
 * @param bookedDates - Set of booked date strings
 * @returns true if date is booked
 */
export const isDateBooked = (date: Date, bookedDates: Set<string>): boolean => {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return bookedDates.has(dateString);
};

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns true if date is before today
 */
export const isPastDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

/**
 * Get error message for past date
 * @returns Error message in Vietnamese
 */
export const getPastDateErrorMessage = (): string => {
  return 'Không thể chọn ngày trong quá khứ';
};

/**
 * Get error message for booked date
 * @returns Error message in Vietnamese
 */
export const getBookedDateErrorMessage = (): string => {
  return 'Ngày này đã có lịch học. Vui lòng chọn ngày khác.';
};




















