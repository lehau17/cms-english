# Course Import Update Plan

This document outlines the changes needed to update the course import functionality to support the new session scheduling feature.

## Background

The course creation flow has been modified to support session scheduling. Previously, the number of sessions was defined at the classroom level. Now, it's defined at the course level with a `plannedSessions` field and detailed session schedules in the `sessionSchedules` array.

## Required Changes

### 1. Backend Changes

In `english-learning/apps/client-api/src/domains/course/service/couse-import.service.ts`:

- Add a new "Session Schedules" sheet to the Excel template.
- Update the import logic to parse and process session schedules from Excel.
- Modify the `normalizeMeta` method to handle the `plannedSessions` field.
- Add support for mapping activities to sessions.

### 2. Frontend Changes

In CMS English application:

- Update the import modal to display progress for session schedule processing.
- Ensure the Excel template download includes the new session schedules sheet.

## Implementation Details

### Excel Template Structure

The updated Excel template will include a new sheet called "Session Schedules" with the following columns:

- `courseCode` - to link sessions to the correct course
- `sessionNumber` - the session number (1, 2, 3, etc.)
- `title` - optional title for the session
- `description` - optional description for the session
- `activityIds` - pipe-separated list of activity IDs to include in this session

### Course Import Service Changes

1. Add logic to parse the Session Schedules sheet.
2. Link the parsed session schedules to the course by matching on courseCode.
3. Update the course creation/update logic to include the session schedules.

### Frontend Import Modal Changes

1. Update import progress indicator to include session schedule processing.
2. Update results display to show number of session schedules imported.

## Testing Strategy

1. Generate new template Excel file and verify it includes the Session Schedules sheet.
2. Create a test Excel file with course data including session schedules.
3. Import the test file and verify that:
   - Courses are created with the correct session schedules
   - Activities are correctly linked to sessions
   - Frontend displays appropriate progress and results information.
