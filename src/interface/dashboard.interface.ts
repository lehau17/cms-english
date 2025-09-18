export interface Dashboard {
    totalStudents: number;
    totalCourses: number;
    totalLessons: number;
    totalActivities: number;
    recentStudents: RecentStudent[];
    registrationTrend: RegistrationTrend[];
}

export interface RecentStudent {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string;
}

export interface RegistrationTrend {
    date: string;
    count: number;
}