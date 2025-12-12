import { Assignment } from '@/apis/assignment';

/**
 * Checks if an assignment can be edited based on its startTime.
 *
 * @param assignment - The assignment to check
 * @returns true if assignment can be edited (no startTime or startTime hasn't passed), false otherwise
 *
 * @example
 * ```typescript
 * const canEdit = canEditAssignment(assignment);
 * if (!canEdit) {
 *   // Disable edit button or show error
 * }
 * ```
 */
export function canEditAssignment(assignment: Assignment): boolean {
  // If no startTime, can always edit
  if (!assignment.startTime) {
    return true;
  }

  const now = new Date();
  const startTime = new Date(assignment.startTime);

  // Can edit if current time is before startTime
  return now < startTime;
}
















