export type DashboardNotificationType = 'success' | 'warning' | 'error' | 'info'

export interface DashboardCourseDistribution {
  label: string
  value: number
}

export interface DashboardUpcomingClass {
  id: string
  classroomName: string
  courseTitle?: string
  teacherName: string
  startTime: string
  endTime: string
  roomName?: string | null
  activeStudents: number
  maxStudents?: number | null
}

export interface DashboardNotification {
  id: string
  title: string
  message?: string | null
  type: DashboardNotificationType
  createdAt: string
}

export interface Dashboard {
  totalStudents: number
  totalCourses: number
  totalLessons: number
  totalActivities: number
  recentStudents: RecentStudent[]
  registrationTrend: RegistrationTrend[]
  courseDistribution: DashboardCourseDistribution[]
  upcomingClasses: DashboardUpcomingClass[]
  notifications: DashboardNotification[]
}

export interface RecentStudent {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
}

export interface RegistrationTrend {
  date: string
  count: number
}
