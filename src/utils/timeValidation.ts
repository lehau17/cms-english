/**
 * Time validation utilities for 15-minute interval constraints
 */

/**
 * Check if a date/time is in a valid 15-minute interval (00, 15, 30, 45)
 * @param date - Date to validate
 * @returns true if minutes are 0, 15, 30, or 45
 */
export const isValid15MinuteInterval = (date: Date): boolean => {
  const minutes = date.getMinutes();
  return minutes % 15 === 0;
};

/**
 * Round a date to the nearest 15-minute interval
 * @param date - Date to round
 * @returns Date rounded to nearest 15-minute interval
 */
export const roundTo15Minutes = (date: Date): Date => {
  const rounded = new Date(date);
  const minutes = rounded.getMinutes();
  const roundedMinutes = Math.round(minutes / 15) * 15;
  rounded.setMinutes(roundedMinutes, 0, 0);
  return rounded;
};

/**
 * Get error message for invalid 15-minute interval
 * @returns Error message in Vietnamese
 */
export const get15MinuteIntervalErrorMessage = (): string => {
  return 'Thời gian phải là bội số của 15 phút (ví dụ: 12:00, 12:15, 12:30, 12:45)';
};




















