export enum AnalyticsPeriod {
    LAST_7_DAYS = 'last_7_days',
    LAST_30_DAYS = 'last_30_days',
    LAST_90_DAYS = 'last_90_days',
    ALL_TIME = 'all_time',
}

export interface AnalyticsInsight {
    category: string;
    insight: string;
    sentiment: 'positive' | 'neutral' | 'negative';
}

export interface AnalyticsRecommendation {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}

export interface StudentAnalytics {
    studentId: string;
    studentName: string;
    totalActivitiesCompleted: number;
    averageScore: number;
    completionRate: number;
    totalTimeSpentMinutes: number;
    insights: AnalyticsInsight[];
    recommendations: AnalyticsRecommendation[];
    aiSummary: string;
    generatedAt: Date;
}

export interface StrugglingStudent {
    studentId: string;
    studentName: string;
    averageScore: number;
    issue: string;
}

export interface ClassAnalytics {
    classroomId: string;
    classroomName: string;
    totalStudents: number;
    classAverageScore: number;
    classCompletionRate: number;
    strugglingStudents: StrugglingStudent[];
    insights: AnalyticsInsight[];
    recommendations: AnalyticsRecommendation[];
    aiSummary: string;
    generatedAt: Date;
}
