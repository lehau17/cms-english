// src/App.tsx
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import GoogleTranslateDemo from "./components/GoogleTranslateDemo";
import RoleBasedDashboard from "./components/RoleBasedDashboard";
import ApiReportPage from "./pages/ApiReportPage";
import AssignmentGradingPage from "./pages/AssignmentGradingPage";
import AssignmentPage from "./pages/AssignmentPage";
import CertificatesPage from "./pages/CertificatesPage";
import CertificateTemplatePreviewPage from "./pages/CertificateTemplatePreviewPage";
import CertificateTemplatesPage from "./pages/CertificateTemplatesPage";
import ClassroomDetailPage from "./pages/ClassroomDetailPage";
import ClassroomPage from "./pages/ClassroomPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursePage from "./pages/CoursePage";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import CreateCertificateTemplatePage from "./pages/CreateCertificateTemplatePage";
import CreateCoursePage from "./pages/CreateCoursePage";
import CreateNotificationPage from "./pages/CreateNotificationPage";
import CreatePodcastPage from "./pages/CreatePodcastPage";
import DashboardPage from "./pages/DashboardPage";
import EditAssignmentPage from "./pages/EditAssignmentPage";
import EditCoursePage from "./pages/EditCoursePage";
import EditPodcastPage from "./pages/EditPodcastPage";
import LinkRequestsPage from "./pages/LinkRequestsPage";
import LoginPage from "./pages/LoginPage";
import MediaLibraryPage from "./pages/MediaLibraryPage";
import NotFoundPage from "./pages/NotFoundPage";
import NotificationPage from "./pages/NotificationPage";
import ParentLoginPage from "./pages/ParentLoginPage";
import ParentPage from "./pages/ParentPage";
import ParentSchedulePage from "./pages/ParentSchedulePage";
import PaymentPage from "./pages/PaymentPage";
import PodcastPage from "./pages/PodcastPage";
import RescheduleRequestsPage from "./pages/RescheduleRequestsPage";
import RoomPage from "./pages/RoomPage";
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import StudentAnalyticsPage from "./pages/StudentAnalyticsPage";
import StudentDetailPage from './pages/StudentDetailPage';
import StudentPage from "./pages/StudentPage";
import StudentSchedulePage from "./pages/StudentSchedulePage";
import TeacherClassroomDashboardPage from "./pages/TeacherClassroomDashboardPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import TeacherDetailPage from "./pages/TeacherDetailPage";
import TeacherPage from "./pages/TeacherPage";
import TeacherSchedulePage from "./pages/TeacherSchedulePage";
import VocabularyDetailPage from "./pages/VocabularyDetailPage";
import VocabularyListPage from "./pages/VocabularyListPage";
// Learning Path Pages
import { LearningPathList } from "./pages/LearningPaths/LearningPathList";
import { LearningPathCreate } from "./pages/LearningPaths/LearningPathCreate";
import { LearningPathDetail } from "./pages/LearningPaths/LearningPathDetail";
import { LearningPathAnalytics } from "./pages/LearningPaths/LearningPathAnalytics";
// Prompt Template Pages
import { PromptTemplateList } from "./pages/PromptTemplates/PromptTemplateList";
import { PromptTemplateEditor } from "./pages/PromptTemplates/PromptTemplateEditor";
// Session Type Change Requests
import SessionTypeChangeRequestsPage from "./pages/admin/SessionTypeChangeRequests";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/parent-login", element: <ParentLoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <RoleBasedDashboard /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/teacher-dashboard", element: <TeacherDashboardPage /> },
          { path: "/students", element: <StudentPage /> },
          { path: "/students/:id", element: <StudentDetailPage /> },
          { path: "/students/:studentId/schedule", element: <StudentSchedulePage /> },
          { path: "/teachers", element: <TeacherPage /> },
          { path: "/teachers/:id", element: <TeacherDetailPage /> },
          { path: "/teacher/dashboard/:classroomId", element: <TeacherClassroomDashboardPage /> },
          { path: "/teachers/:teacherId/schedule", element: <TeacherSchedulePage /> },
          { path: "/parents", element: <ParentPage /> },
          { path: "/parents/:parentId/schedule", element: <ParentSchedulePage /> },
          { path: "/link-requests", element: <LinkRequestsPage /> },
          { path: "/reschedule-requests", element: <RescheduleRequestsPage /> },
          { path: "/type-change-requests", element: <SessionTypeChangeRequestsPage /> },
          { path: "/classrooms", element: <ClassroomPage /> },
          { path: "/classrooms/:id", element: <ClassroomDetailPage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/teacher-schedule", element: <TeacherSchedulePage /> },
          { path: "/rooms", element: <RoomPage /> },
          { path: "/vocabulary", element: <VocabularyListPage /> },
          { path: "/vocabulary/:listId", element: <VocabularyDetailPage /> },
          { path: "/courses", element: <CoursePage /> },
          { path: "/courses/:id", element: <CourseDetailPage /> },
          { path: "/create-course", element: <CreateCoursePage /> },
          { path: "/courses/edit/:id", element: <EditCoursePage /> },
          { path: "/assignments", element: <AssignmentPage /> },
          { path: "/classrooms/:classroomId/create-assignment", element: <CreateAssignmentPage /> },
          { path: "/classrooms/:classroomId/edit-assignment/:assignmentId", element: <EditAssignmentPage /> },
          { path: "/classrooms/:classroomId/assignments/:assignmentId/submissions/:submissionId/grade", element: <AssignmentGradingPage /> },
          { path: "/podcasts", element: <PodcastPage /> },
          { path: "/podcasts/create", element: <CreatePodcastPage /> },
          { path: "/podcasts/edit/:id", element: <EditPodcastPage /> },
          { path: "/podcasts/:id", element: <EditPodcastPage /> },
          { path: "/students/:id/analytics", element: <StudentAnalyticsPage /> },
          { path: "/notifications", element: <NotificationPage /> },
          { path: "/notifications/create", element: <CreateNotificationPage /> },
          { path: "/payments", element: <PaymentPage /> },
          { path: "/certificates", element: <CertificatesPage /> },
          { path: "/certificate-templates", element: <CertificateTemplatesPage /> },
          { path: "/certificate-templates/create", element: <CreateCertificateTemplatePage /> },
          { path: "/certificate-templates/:id", element: <CertificateTemplatePreviewPage /> },
          { path: "/certificate-templates/:id/edit", element: <CreateCertificateTemplatePage /> },
          { path: "/api-report", element: <ApiReportPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "/media", element: <MediaLibraryPage /> },
          // Learning Paths
          { path: "/learning-paths", element: <LearningPathList /> },
          { path: "/learning-paths/create", element: <LearningPathCreate /> },
          { path: "/learning-paths/:id", element: <LearningPathDetail /> },
          { path: "/learning-paths/:id/edit", element: <LearningPathCreate /> },
          { path: "/learning-paths/:id/analytics", element: <LearningPathAnalytics /> },
          // Prompt Templates
          { path: "/prompt-templates", element: <PromptTemplateList /> },
          { path: "/prompt-templates/create", element: <PromptTemplateEditor /> },
          { path: "/prompt-templates/:id/edit", element: <PromptTemplateEditor /> },
          // { path: "/google-translate-demo", element: <GoogleTranslateDemo /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
