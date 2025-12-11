import { Assignment, AssignmentType } from '@/apis/assignment';

/**
 * Check if two dates are on the same day (ignoring time)
 */
function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if a session date falls on an exam day
 * @param sessionDate - The session start date
 * @param examAssignments - Array of exam assignments (MIDTERM_EXAM or FINAL_EXAM)
 * @returns true if session date is on an exam day
 */
export function isExamDate(
  sessionDate: Date | string,
  examAssignments: Assignment[],
): boolean {
  if (!examAssignments || examAssignments.length === 0) {
    return false;
  }

  const session = new Date(sessionDate);
  const sessionDateOnly = new Date(
    session.getFullYear(),
    session.getMonth(),
    session.getDate(),
  );

  return examAssignments.some((exam) => {
    if (!exam.startTime) {
      return false;
    }

    const examStartDate = new Date(exam.startTime);
    const examStartDateOnly = new Date(
      examStartDate.getFullYear(),
      examStartDate.getMonth(),
      examStartDate.getDate(),
    );

    // Check if session date matches exam start date
    if (isSameDate(sessionDateOnly, examStartDateOnly)) {
      return true;
    }

    // Check if exam has dueDate and session date matches exam end date
    if (exam.dueDate) {
      const examEndDate = new Date(exam.dueDate);
      const examEndDateOnly = new Date(
        examEndDate.getFullYear(),
        examEndDate.getMonth(),
        examEndDate.getDate(),
      );

      if (isSameDate(sessionDateOnly, examEndDateOnly)) {
        return true;
      }

      // Check if session date falls within exam date range
      if (
        sessionDateOnly >= examStartDateOnly &&
        sessionDateOnly <= examEndDateOnly
      ) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Filter assignments to get only exam assignments (MIDTERM_EXAM or FINAL_EXAM)
 * @param assignments - Array of all assignments
 * @returns Array of exam assignments only
 */
export function getExamAssignments(
  assignments: Assignment[],
): Assignment[] {
  if (!assignments || assignments.length === 0) {
    return [];
  }

  return assignments.filter(
    (assignment) =>
      assignment.type === AssignmentType.MIDTERM_EXAM ||
      assignment.type === AssignmentType.FINAL_EXAM,
  );
}












