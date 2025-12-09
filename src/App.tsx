// src/App.tsx
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import GoogleTranslateDemo from "./components/GoogleTranslateDemo";
import RoleBasedDashboard from "./components/RoleBasedDashboard";
import ApiReportPage from "./pages/ApiReportPage";
import StudentDetailPage from './pages/StudentDetailPage';
import AssignmentPage from "./pages/AssignmentPage";
import CertificatesPage from "./pages/CertificatesPage";
import CertificateTemplatePreviewPage from "./pages/CertificateTemplatePreviewPage";
import CertificateTemplatesPage from "./pages/CertificateTemplatesPage";
import ClassroomDetailPage from "./pages/ClassroomDetailPage";
import ClassroomPage from "./pages/ClassroomPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursePage from "./pages/CoursePage";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import EditAssignmentPage from "./pages/EditAssignmentPage";
import CreateCertificateTemplatePage from "./pages/CreateCertificateTemplatePage";
import CreateCoursePage from "./pages/CreateCoursePage";
import DashboardPage from "./pages/DashboardPage";
import EditCoursePage from "./pages/EditCoursePage";
import LinkRequestsPage from "./pages/LinkRequestsPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ParentLoginPage from "./pages/ParentLoginPage";
import ParentPage from "./pages/ParentPage";
import ParentSchedulePage from "./pages/ParentSchedulePage";
import CreateNotificationPage from "./pages/CreateNotificationPage";
import CreatePodcastPage from "./pages/CreatePodcastPage";
import EditPodcastPage from "./pages/EditPodcastPage";
import NotificationPage from "./pages/NotificationPage";
import PaymentPage from "./pages/PaymentPage";
import PodcastPage from "./pages/PodcastPage";
import RoomPage from "./pages/RoomPage";
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import StudentPage from "./pages/StudentPage";
import StudentAnalyticsPage from "./pages/StudentAnalyticsPage";
import StudentSchedulePage from "./pages/StudentSchedulePage";
import TeacherClassroomDashboardPage from "./pages/TeacherClassroomDashboardPage";
import TeacherDashboardPage from "./pages/TeacherDashboardPage";
import TeacherPage from "./pages/TeacherPage";
import TeacherDetailPage from "./pages/TeacherDetailPage";
import TeacherSchedulePage from "./pages/TeacherSchedulePage";
import VocabularyDetailPage from "./pages/VocabularyDetailPage";
import VocabularyListPage from "./pages/VocabularyListPage";

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
