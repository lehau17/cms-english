# CMS English - Admin Dashboard Application

> Last updated: 2025-01-27 — Tóm tắt: Admin CMS với 38+ pages, MUI + Vite, quản lý Course/Classroom/Student/Teacher với AI Agent integration.

## Overview & Architecture

**CMS English** là ứng dụng quản trị (Admin Dashboard) cho hệ thống học tiếng Anh trực tuyến, được xây dựng với:
- **Frontend Framework**: Vite + React 18 (TypeScript)
- **UI Libraries**: Material-UI (MUI) v5 + Tailwind CSS v4
- **State Management**: TanStack Query (React Query) v5
- **HTTP Client**: Axios với interceptors cho auth
- **Routing**: React Router DOM v6
- **Charts**: Chart.js, Recharts, React Chart.js 2
- **Forms**: React Hook Form + Yup/Zod validation
- **Notifications**: React Hot Toast

**Authentication**:
- Token lưu trong `localStorage.cms_auth` (format: `{token: "...", user: {...}}`)
- Axios interceptor tự động inject `Authorization: Bearer {token}`
- 401 response tự động clear token và redirect về `/login`

**API Base URL**: Cấu hình qua env `VITE_API_URL` (mặc định: `http://localhost:3000/api`)

## Thống Kê Nhanh

- **38+ pages** trong `src/pages/`
- **25+ API clients** trong `src/apis/`
- **30+ React hooks** trong `src/hooks/`
- **50+ components** được tổ chức theo feature
- **Role-based access**: Admin, Teacher, Parent, Student
- **AI Agent Integration**: Chat interface với streaming SSE

## Project Structure & Module Organization

```
cms-english/
├── src/
│   ├── apis/              # API clients (25+ files)
│   │   ├── analytics.ts   # Student/Class analytics
│   │   ├── agent.ts       # AI Agent chat & conversations
│   │   ├── assignment.ts
│   │   ├── attendance.api.ts
│   │   ├── auth.ts
│   │   ├── certificate.api.ts
│   │   ├── classroom.ts
│   │   ├── course.ts
│   │   ├── dashboard.ts
│   │   ├── payment.ts
│   │   ├── podcast.ts
│   │   └── ...
│   ├── components/        # UI components (50+ files)
│   │   ├── assignment/    # Assignment editor, grading
│   │   ├── attendance/    # Attendance management (13 files)
│   │   ├── certificate/   # Certificate layout editor
│   │   ├── classroom/    # Classroom components (11 files)
│   │   ├── course/       # Course management (8 files)
│   │   ├── dashboard/    # Dashboard widgets (14 files)
│   │   ├── parent/       # Parent management (5 files)
│   │   ├── schedule/     # Schedule components (5 files)
│   │   ├── student/      # Student management (5 files)
│   │   ├── teacher/      # Teacher management (4 files)
│   │   ├── vocabulary/   # Vocabulary management
│   │   └── ui/           # Reusable UI components
│   ├── context/          # React Context
│   │   └── AuthContext.tsx
│   ├── features/         # Feature modules
│   │   └── ai-report/    # AI Agent chat interface (25 files)
│   ├── hooks/            # Custom React hooks (30+ files)
│   │   ├── auth.queries.ts
│   │   ├── useAttendance.ts
│   │   ├── useClassroom.ts
│   │   ├── useCourse.ts
│   │   ├── useDashboard.ts
│   │   └── ...
│   ├── interface/        # TypeScript interfaces (25+ files)
│   │   ├── analytics.interface.ts
│   │   ├── auth.interface.ts
│   │   ├── enum.interface.ts
│   │   └── ...
│   ├── layouts/          # Layout components
│   │   └── DashboardLayout.tsx
│   ├── pages/            # Page components (38+ files)
│   ├── routes/           # Route guards
│   │   └── ProtectedRoute.tsx
│   ├── schemas/          # Validation schemas
│   │   └── assignment.schema.ts
│   ├── services/         # Business logic services
│   ├── styles/           # Global styles
│   └── types/            # Type definitions
├── public/               # Static assets
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json
```

## Các Trang Chính (38+ Pages)

### Dashboard & Analytics
- `DashboardPage` - Admin dashboard với widgets: stats, revenue trends, course distribution, upcoming classes
- `TeacherDashboardPage` - Teacher-specific dashboard
- `TeacherClassroomDashboardPage` - Classroom detail cho teacher
- `StudentAnalyticsPage` - Phân tích chi tiết học viên với AI insights
- `ApiReportPage` - API usage report

### User Management
- `StudentPage` - Quản lý học viên
- `TeacherPage` - Quản lý giáo viên
- `ParentPage` - Quản lý phụ huynh
- `LinkRequestsPage` - Yêu cầu liên kết parent-child

### Course & Content
- `CoursePage` - Danh sách khóa học
- `CourseDetailPage` - Chi tiết khóa học
- `CreateCoursePage` - Tạo khóa học mới
- `EditCoursePage` - Chỉnh sửa khóa học
- `AssignmentPage` - Quản lý bài tập
- `CreateAssignmentPage` - Tạo bài tập mới
- `PodcastPage` - Quản lý podcast
- `CreatePodcastPage` - Tạo podcast
- `EditPodcastPage` - Chỉnh sửa podcast
- `VocabularyListPage` - Danh sách từ vựng
- `VocabularyDetailPage` - Chi tiết từ vựng

### Classroom Management
- `ClassroomPage` - Danh sách lớp học
- `ClassroomDetailPage` - Chi tiết lớp học với attendance, assignments, students

### Schedule & Rooms
- `SchedulePage` - Lịch học (Admin view)
- `TeacherSchedulePage` - Lịch dạy của giáo viên
- `StudentSchedulePage` - Lịch học của học viên
- `ParentSchedulePage` - Lịch học của con (Parent view)
- `RoomPage` - Quản lý phòng học

### Certificate System
- `CertificatesPage` - Danh sách chứng chỉ đã cấp
- `CertificateTemplatesPage` - Quản lý template chứng chỉ
- `CreateCertificateTemplatePage` - Tạo/chỉnh sửa template
- `CertificateTemplatePreviewPage` - Preview template

### System & Settings
- `NotificationPage` - Quản lý thông báo
- `CreateNotificationPage` - Tạo thông báo
- `PaymentPage` - Quản lý thanh toán
- `SettingsPage` - Cài đặt hệ thống
- `LoginPage` - Đăng nhập Admin/Teacher
- `ParentLoginPage` - Đăng nhập Parent
- `NotFoundPage` - 404 page

## Dashboard Widgets (14 Components)

Dashboard được xây dựng với các widget module:

1. **WelcomeWidget** - Welcome banner với thông tin user
2. **StatsOverviewWidget** - 6 metrics chính: students, teachers, courses, classrooms, revenue
3. **NotificationsWidget** - Thông báo mới nhất
4. **RevenueTrendWidget** - Biểu đồ xu hướng doanh thu
5. **CourseDistributionWidget** - Phân bổ khóa học (pie chart)
6. **TopCoursesWidget** - Top khóa học phổ biến
7. **RecentStudentsWidget** - Học viên mới đăng ký
8. **UpcomingClassesWidget** - Lớp học sắp diễn ra
9. **RegistrationTrendWidget** - Xu hướng đăng ký
10. **AIAnalyticsWidget** - Phân tích AI cho học viên
11. **AIAnalyticsDashboardWidget** - AI analytics dashboard
12. **ExtendedStatsWidget** - Extended statistics với 11+ metrics
13. **StatsCardsWidget** - Stat cards cơ bản
14. **QuickActionsWidget** - Quick action buttons

## AI Agent Integration

### Features
- **Streaming Chat**: SSE (Server-Sent Events) với `streamAgentChat()` trong `src/apis/agent.ts`
- **Conversation Management**: Multi-conversation support với CRUD operations
- **Document Upload**: Upload documents cho RAG context
- **Chart Generation**: AI có thể generate charts và render trong chat
- **File Downloads**: Support download files từ AI responses

### Components (`src/features/ai-report/`)
- `AiReportPage.tsx` - Main chat interface
- `components/chat/` - Chat UI components (ChatList, ChatInput, StreamingMessage, etc.)
- `components/analytics/` - Analytics panels
- `components/documents/` - Document manager
- `hooks/useStreamChat.ts` - Hook cho streaming chat
- `hooks/useConversations.ts` - Hook cho conversation management

### API Endpoints
- `GET /private/v1/agent/chat/stream` - Streaming chat endpoint
- `GET /private/v1/agent/conversations` - List conversations
- `GET /private/v1/agent/conversations/:id` - Get conversation
- `POST /private/v1/agent/conversations/:id/delete` - Delete conversation

## API Clients Structure

Tất cả API clients trong `src/apis/` sử dụng `axiosInstance` từ `src/config/axiosConfig.ts`:

- **Analytics**: `getStudentAnalytics()`, `getClassAnalytics()`
- **Agent**: `agentChat()`, `streamAgentChat()`, `getConversations()`, `getConversation()`
- **Assignment**: CRUD operations cho assignments
- **Attendance**: Attendance tracking và reports
- **Auth**: Login, logout, get current user
- **Certificate**: Certificate management APIs
- **Classroom**: Classroom CRUD và detail
- **Course**: Course management
- **Dashboard**: Dashboard stats APIs
- **Payment**: Payment management
- **Podcast**: Podcast CRUD
- **Student/Teacher/Parent**: User management APIs
- **Schedule**: Schedule management cho các roles
- **Vocabulary**: Vocabulary list management

## Authentication & Authorization

### Auth Flow
1. User login qua `LoginPage` hoặc `ParentLoginPage`
2. Token được lưu vào `localStorage.cms_auth` với format:
   ```json
   {
     "token": "jwt_token_here",
     "user": { "id": "...", "role": "admin", ... }
   }
   ```
3. `AuthContext` quản lý auth state và sync với localStorage
4. `ProtectedRoute` check authentication trước khi render pages
5. `RoleBasedDashboard` redirect user đến dashboard phù hợp với role

### User Roles
- `ADMIN` - Full access, dashboard tại `/dashboard`
- `TEACHER` - Teacher dashboard tại `/teacher-dashboard`
- `PARENT` - Limited access, schedule view
- `STUDENT` - Limited access (chủ yếu qua englishWeb app)

### Route Protection
- Public routes: `/login`, `/parent-login`
- Protected routes: Tất cả routes khác được wrap trong `ProtectedRoute`
- Role-based navigation: `Sidebar` component filter menu items theo role

## Build, Test, and Development Commands

```bash
# Development
npm run dev          # Start dev server (Vite HMR)

# Build
npm run build        # Production build to dist/

# Preview
npm run preview      # Serve dist/ for testing

# Linting
npm run lint         # Run ESLint
```

### Environment Setup
Tạo file `.env` trong root:
```env
VITE_API_URL=http://localhost:3000/api
```

## Coding Style & Naming Conventions

- **TypeScript**: Strict mode enabled, no implicit any
- **Indentation**: 2 spaces
- **Components**: PascalCase files (`StudentCard.tsx`)
- **Hooks**: `useX.ts` pattern (`useCourses.ts`, `useAuth.ts`)
- **APIs**: Resource-based naming (`student.ts`, `course.ts`) hoặc `*.api.ts`
- **Interfaces**: PascalCase trong `src/interface/` (`Student`, `PaginationParams`)
- **Styling**:
  - MUI components cho complex UI
  - Tailwind utilities cho quick styling
  - Shared styles trong `src/styles/`
- **No emojis** trong code comments (theo workspace rules)

## State Management Patterns

### TanStack Query (React Query)
- **Queries**: Data fetching với caching
  - `useQuery` cho GET requests
  - Auto refetch on window focus
  - Stale time và cache time configuration
- **Mutations**: Data modifications
  - `useMutation` cho POST/PUT/DELETE
  - Optimistic updates khi cần
- **Query Keys**: Hierarchical structure
  - `['students', { page, limit }]`
  - `['student-analytics', studentId, period]`

### React Context
- `AuthContext`: Global auth state
- `AuthProvider`: Wraps app, sync với localStorage

## Testing Guidelines

- **Test Framework**: Vitest + React Testing Library (nếu có)
- **Test Files**: `*.test.ts(x)` hoặc `*.spec.ts(x)` next to source
- **Coverage**: Target 80%+ cho critical paths
- **E2E**: Có thể dùng Playwright (chưa config)

## Commit & Pull Request Guidelines

### Commit Format
Conventional Commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks
- `docs:` - Documentation updates

### PR Checklist
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run preview` tested manually
- [ ] UI screenshots (nếu có UI changes)
- [ ] API contract changes documented
- [ ] Interface types updated nếu cần

## Security & Configuration Tips

- **Environment Variables**: Chỉ dùng `VITE_` prefix (exposed to client)
- **Token Storage**: `localStorage.cms_auth` - không log token trong console
- **API URLs**: HTTPS cho production
- **CORS**: Backend phải config CORS cho frontend origin
- **Error Handling**: Axios interceptor handle 401, 500+ errors với toast notifications

## Known Issues & Unimplemented Features

Theo workspace rules, các tính năng chưa hoàn thành:

1. **DashboardPage**: Một số widgets đang dùng mock data
   - Stats cards có thể cần real API integration
   - Upcoming classes widget cần verify data source

2. **Analytics**:
   - `getClassAnalytics()` trong `analytics.ts` có thể cần fix response type (line 20-24)

3. **AI Agent**:
   - Streaming có thể cần optimize buffering strategy
   - Error handling cho network interruptions

## Integration với Backend

Backend API base: `english-learning/` (NestJS monolith)

- **Client API**: `apps/client-api` - Main API server
- **Port**: Mặc định 3334, có thể config qua `CLIENT_API_PORT`
- **Swagger**: `/api/docs` khi dev server chạy
- **Auth**: JWT tokens, refresh token support
- **AI Agent**: Endpoints tại `/private/v1/agent/*`

## Quick Reference

### Thêm Page Mới
1. Tạo component trong `src/pages/NewPage.tsx`
2. Thêm route trong `src/App.tsx`
3. Thêm menu item trong `src/components/Sidebar.tsx` (nếu cần)
4. Tạo API client trong `src/apis/` (nếu cần)
5. Tạo hooks trong `src/hooks/` (nếu cần)

### Thêm API Client
1. Tạo file trong `src/apis/resource.ts`
2. Import `axiosInstance` từ `src/config/axiosConfig.ts`
3. Define interfaces trong `src/interface/resource.interface.ts`
4. Export functions sử dụng `ApiResponse<T>` wrapper

### Thêm Dashboard Widget
1. Tạo component trong `src/components/dashboard/WidgetName.tsx`
2. Import và sử dụng trong `DashboardPage.tsx`
3. Tạo hook trong `src/hooks/useDashboard.ts` nếu cần data fetching

