import axiosInstance from '../config/axiosConfig';
import { AnalyticsPeriod, ClassAnalytics, StudentAnalytics } from '../interface/analytics.interface';

export async function getStudentAnalytics(
    studentId: string,
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS
): Promise<StudentAnalytics> {
    const response = await axiosInstance.get<StudentAnalytics>(
        `/private/v1/dashboard/analytics/student/${studentId}`,
        { params: { period } }
    );
    return response.data;
}

export async function getClassAnalytics(
    classroomId: string,
    period: AnalyticsPeriod = AnalyticsPeriod.LAST_30_DAYS
): Promise<ClassAnalytics> {
    const response = await axiosInstance.get<ClassAnalytics>(
        `/private/v1/dashboard/analytics/classroom/${classroomId}`,
        { params: { period } }
    );
    return response.data;
}
