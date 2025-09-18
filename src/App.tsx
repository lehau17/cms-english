// src/App.tsx
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import GoogleTranslateDemo from "./components/GoogleTranslateDemo";
import ApiReportPage from "./pages/ApiReportPage";
import ClassroomPage from "./pages/ClassroomPage";
import CoursePage from "./pages/CoursePage";
import CreateCoursePage from "./pages/CreateCoursePage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import ParentLoginPage from "./pages/ParentLoginPage";
import RoomPage from "./pages/RoomPage";
import SchedulePage from "./pages/SchedulePage";
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
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/students", element: <StudentPage /> },
          { path: "/teachers", element: <TeacherPage /> },
          { path: "/classrooms", element: <ClassroomPage /> },
          { path: "/schedule", element: <SchedulePage /> },
          { path: "/rooms", element: <RoomPage /> },
          { path: "/courses", element: <CoursePage /> },
          { path: "/create-course", element: <CreateCoursePage /> },
          { path: "/api-report", element: <ApiReportPage /> },
          // { path: "/google-translate-demo", element: <GoogleTranslateDemo /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
