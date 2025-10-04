# Teacher Schedule Feature

## Overview
This feature adds a dedicated schedule page for teachers to view their own teaching schedule when they log in to the CMS.

## Implementation Details

### New Page Component
- **File**: `src/pages/TeacherSchedulePage.tsx`
- **Route**: `/teacher-schedule`
- **Purpose**: Displays the teacher's weekly schedule with their classroom assignments

### Key Features
1. **Teacher-Specific View**: Automatically fetches and displays the schedule for the currently logged-in teacher using their user ID
2. **Weekly Calendar**: Shows schedule organized by days of the week (Monday-Sunday)
3. **Time Slots**: Displays start and end times for each class session
4. **Class Details**: Shows classroom name, session title, status, and type
5. **Summary Statistics**: Total classes and total teaching hours for the week

### UI Components
- Responsive grid layout (7 columns for 7 days of the week)
- Color-coded status indicators (purple for occupied slots, gray for available)
- Loading state with spinner
- Empty state for days with no classes
- Gradient styling matching the existing design system

### Role-Based Navigation
- **Sidebar**: Updated to show "My Schedule" menu item only for users with `UserRole.TEACHER`
- **Admin users**: Continue to see the original "Schedule" page with all schedules
- **Teachers**: See the new "My Schedule" page with only their schedule

### API Integration
- Uses existing `getTeacherSchedule` API endpoint: `/private/v1/classrooms/teacher/{teacherId}/schedule`
- Leverages existing `useTeacherSchedule` hook for data fetching
- Integrates with TanStack Query for caching and loading states

### Authentication
- Requires user to be logged in (protected by `ProtectedRoute`)
- Automatically fetches schedule using the authenticated user's ID from `useAuth()` hook
- Displays user's name in the schedule header

## Technical Changes

### Modified Files
1. `src/App.tsx`: Added route for `/teacher-schedule`
2. `src/components/Sidebar.tsx`: 
   - Added role-based filtering for navigation items
   - Added "My Schedule" item for teachers
   - Restricted admin pages to admin users only

### New Files
1. `src/pages/TeacherSchedulePage.tsx`: Complete teacher schedule page implementation

## Usage
1. Teacher logs in via the admin login endpoint
2. After authentication, the sidebar shows "My Schedule" menu item
3. Clicking "My Schedule" navigates to `/teacher-schedule`
4. Page displays the teacher's weekly schedule with all their classes

## Design Decisions
- Reused existing components and styling patterns from the codebase
- Leveraged existing API endpoints and hooks (no backend changes required)
- Implemented role-based access control for clean separation between admin and teacher views
- Maintained consistent UI/UX with the rest of the admin panel

## Future Enhancements (Optional)
- Add week navigation (previous/next week)
- Add export/print functionality
- Add filters for specific date ranges
- Add notifications for upcoming classes
- Add ability to add notes to schedule items
