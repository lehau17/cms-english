// src/App.tsx
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
// import GoogleTranslateDemo from "./components/GoogleTranslateDemo";
import ApiReportPage from "./pages/ApiReportPage";
import AssignmentPage from "./pages/AssignmentPage";
import ClassroomPage from "./pages/ClassroomPage";
import CoursePage from "./pages/CoursePage";
import CreateAssignmentPage from "./pages/CreateAssignmentPage";
import CreateCoursePage from "./pages/CreateCoursePage";
import DashboardPage from "./pages/DashboardPage";
import EditCoursePage from "./pages/EditCoursePage";
import LoginPage from "./pages/LoginPage";
import ParentLoginPage from "./pages/ParentLoginPage";
import ParentPage from "./pages/ParentPage";
import RoomPage from "./pages/RoomPage";
import SchedulePage from "./pages/SchedulePage";
import SettingsPage from "./pages/SettingsPage";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";

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
          { path: "/teachers", element: <TeacherPage /> },
          { path: "/parents", element: <ParentPage /> },
          { path: "/classrooms", element: <ClassroomPage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/rooms", element: <RoomPage /> },
          { path: "/courses", element: <CoursePage /> },
          { path: "/create-course", element: <CreateCoursePage /> },
          { path: "/courses/edit/:id", element: <EditCoursePage /> },
          { path: "/assignments", element: <AssignmentPage /> },
          { path: "/create-assignment", element: <CreateAssignmentPage /> },
          { path: "/assignments/create", element: <CreateAssignmentPage /> },
          { path: "/api-report", element: <ApiReportPage /> },
          { path: "/settings", element: <SettingsPage /> },
          { path: "*", element: <Navigate to="/dashboard" replace /> },
          // { path: "/google-translate-demo", element: <GoogleTranslateDemo /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
