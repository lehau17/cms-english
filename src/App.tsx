// src/App.tsx
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
// import GoogleTranslateDemo from "./components/GoogleTranslateDemo";
import ApiReportPage from "./pages/ApiReportPage";
import AssignmentPage from "./pages/AssignmentPage";
import ClassroomDetailPage from "./pages/ClassroomDetailPage";
import ClassroomPage from "./pages/ClassroomPage";
import CourseDetailPage from "./pages/CourseDetailPage";
import CoursePage from "./pages/CoursePage";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import DashboardPage from "./pages/DashboardPage";
import EditCoursePage from "./pages/EditCoursePage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ParentLoginPage from "./pages/ParentLoginPage";
import ParentPage from "./pages/ParentPage";
import ParentSchedulePage from "./pages/ParentSchedulePage";
import RoomPage from "./pages/RoomPage";
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import StudentPage from "./pages/StudentPage";
import StudentSchedulePage from "./pages/StudentSchedulePage";
import TeacherPage from "./pages/TeacherPage";
import TeacherSchedulePage from "./pages/TeacherSchedulePage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/parent-login", element: <ParentLoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "/", element: <Navigate to="/dashboard" replace /> },
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/students", element: <StudentPage /> },
          { path: "/students/:studentId/schedule", element: <StudentSchedulePage /> },
          { path: "/teachers", element: <TeacherPage /> },
          { path: "/teachers/:teacherId/schedule", element: <TeacherSchedulePage /> },
          { path: "/parents", element: <ParentPage /> },
          { path: "/parents/:parentId/schedule", element: <ParentSchedulePage /> },
          { path: "/classrooms", element: <ClassroomPage /> },
          { path: "/classrooms/:id", element: <ClassroomDetailPage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/teacher-schedule", element: <TeacherSchedulePage /> },
          { path: "/rooms", element: <RoomPage /> },
          { path: "/courses", element: <CoursePage /> },
          { path: "/courses/:id", element: <CourseDetailPage /> },
          { path: "/create-course", element: <CreateCoursePage /> },
          { path: "/courses/edit/:id", element: <EditCoursePage /> },
          { path: "/assignments", element: <AssignmentPage /> },
          { path: "/create-assignment", element: <CreateAssignmentPage /> },
          { path: "/assignments/create", element: <CreateAssignmentPage /> },
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
