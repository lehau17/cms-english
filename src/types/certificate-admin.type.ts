import { CertificateLayout, CertificateRequirementType, IssuedCertificate } from './certificate.type';

// Admin-specific types for certificate management

// Create/Update Certificate Template
export interface CreateCertificateTemplateDto {
    courseId: string;
    title?: string;
    description?: string;
    layout?: CertificateLayout;
    issuerName?: string;
    issuerTitle?: string;
    issuerSignature?: string;
    logoUrl?: string;
    requirementType?: CertificateRequirementType;
    minScore?: number;
    minProgress?: number;
    isActive?: boolean;
}

export interface UpdateCertificateTemplateDto {
    title?: string;
    description?: string;
    layout?: CertificateLayout;
    issuerName?: string;
    issuerTitle?: string;
    issuerSignature?: string;
    logoUrl?: string;
    requirementType?: CertificateRequirementType;
    minScore?: number;
    minProgress?: number;
    isActive?: boolean;
}

// Issue Certificate
export interface IssueCertificateDto {
    studentId: string;
    courseId: string;
    classroomId?: string;
    finalScore?: number;
    progress?: number;
    totalHours?: number;
    metadata?: any;
}

// Get All Certificates (Admin)
export interface GetAllCertificatesParams {
    skip?: number;
    take?: number;
    includeRevoked?: boolean;
    studentId?: string;
    courseId?: string;
}

export interface GetAllCertificatesResponse {
    data: IssuedCertificate[];
    total: number;
}

// Get Certificates by Course
export interface GetCertificatesByCourseParams {
    skip?: number;
    take?: number;
    includeRevoked?: boolean;
}

export interface GetCertificatesByCourseResponse {
    data: IssuedCertificate[];
    total: number;
}

// Revoke Certificate
export interface RevokeCertificateDto {
    reason: string;
}

// Get All Templates
export interface GetAllTemplatesParams {
    skip?: number;
    take?: number;
    isActive?: boolean;
}

// Certificate Statistics
export interface CertificateStats {
    totalIssued: number;
    issuedThisMonth: number;
    issuedThisWeek: number;
    revokedCount: number;
    byCourse: {
        courseId: string;
        courseName: string;
        count: number;
    }[];
    byMonth: {
        month: string;
        count: number;
    }[];
}

// Template Preview
export interface TemplatePreviewData {
    template: {
        title: string;
        issuerName: string;
        issuerTitle?: string;
        logoUrl?: string;
        layout?: CertificateLayout;
    };
    sampleData: {
        studentName: string;
        courseName: string;
        completionDate: string;
        certificateNumber: string;
        finalScore?: number;
    };
}

