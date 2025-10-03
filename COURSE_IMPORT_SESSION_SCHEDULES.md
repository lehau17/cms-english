# Course Import with Session Schedules

This document explains the updates made to the course import functionality to support the new session scheduling feature.

## Overview

The course import feature has been updated to support:

1. Importing `plannedSessions` field from "Course Meta" sheet
2. Importing session schedules from a new "Session Schedules" sheet
3. Linking activities to sessions based on lesson and activity references

## Excel Template Structure

The updated Excel template now includes:

### 1. Course Meta Sheet

The Course Meta sheet has been updated to include a `plannedSessions` column that defines the number of planned sessions for each course.

### 2. Course Content Sheet

The Course Content sheet remains the same, with each row defining a lesson activity.

### 3. Session Schedules Sheet (New)

A new sheet called "Session Schedules" has been added with the following columns:

- `courseCode`: The code of the course these sessions belong to (must match a code in the Course Meta sheet)
- `sessionNumber`: The number of the session (1, 2, 3, etc.)
- `title`: Optional title for the session
- `description`: Optional description for the session
- `activityRefs`: References to activities in the format "L1A2,L1A3,L2A1"

#### Activity Reference Format

The activity reference format is "LxAy" where:

- "L" is a prefix for "Lesson"
- "x" is the lesson number (orderNo)
- "A" is a prefix for "Activity"
- "y" is the activity number (orderNo)

For example:

- "L1A2" refers to Lesson 1, Activity 2
- "L3A5" refers to Lesson 3, Activity 5

Multiple activities are separated by commas without spaces: "L1A2,L1A3,L2A1"

## Import Process

The import process has been updated to:

1. Import courses with their `plannedSessions` value from the Course Meta sheet
2. Import and create lessons and activities from the Course Content sheet
3. Process the Session Schedules sheet to link activities to sessions
4. Update each course with its session schedules

## Frontend Updates

The ImportCoursesModal component has been updated to:

1. Show progress for session schedule processing
2. Include session schedule counts in success messages
3. Show the number of imported session schedules in the results

## How to Test

1. Download the updated template using the "Template" button in the import modal
2. Fill in the Course Meta sheet with at least the `plannedSessions` field
3. Fill in the Course Content sheet with lessons and activities
4. Fill in the Session Schedules sheet with session schedule information
5. Import the Excel file and verify that:
   - Courses are created with the correct `plannedSessions` value
   - Session schedules are created with the correct activities
   - The import progress shows the session schedule processing phase
   - The import results include the number of imported session schedules
