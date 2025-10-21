// Certificate Template Types
export enum CertificateRequirementType {
    COURSE_COMPLETION = 'course_completion',
    SCORE_BASED = 'score_based',
    COMBINED = 'combined',
}

export interface CertificateLayout {
    template?: string;

    // Container styling
    container?: {
        padding?: string;
        borderRadius?: string;
        boxShadow?: string;
        minHeight?: string;
    };

    // Background
    background?: {
        type?: string; // 'color' | 'gradient' | 'image'
        color?: string;
        gradientStart?: string;
        gradientEnd?: string;
        gradientAngle?: string;
        imageUrl?: string;
        opacity?: number;
    };

    // Border
    border?: {
        enabled?: boolean;
        style?: string; // 'solid' | 'dashed' | 'dotted' | 'double'
        color?: string;
        width?: number;
        radius?: string;
    };

    // Header
    header?: {
        logo?: {
            enabled?: boolean;
            size?: string;
            position?: string;
        };
        title?: {
            fontSize?: number;
            fontFamily?: string;
            color?: string;
            fontWeight?: string;
            letterSpacing?: string;
            lineHeight?: string;
            textAlign?: string;
            textShadow?: string;
            textTransform?: string;
            marginBottom?: string;
        };
        subtitle?: {
            text?: string;
            fontSize?: number;
            color?: string;
            fontStyle?: string;
        };
    };

    // Body
    body?: {
        padding?: string;
        studentName?: {
            fontSize?: number;
            fontFamily?: string;
            color?: string;
            fontWeight?: string;
            transform?: string;
            letterSpacing?: string;
            lineHeight?: string;
            textShadow?: string;
            marginTop?: string;
            marginBottom?: string;
        };
        courseName?: {
            fontSize?: number;
            fontFamily?: string;
            color?: string;
            fontStyle?: string;
            letterSpacing?: string;
            lineHeight?: string;
            marginTop?: string;
            marginBottom?: string;
        };
        description?: {
            fontSize?: number;
            color?: string;
            lineHeight?: string;
            maxWidth?: string;
        };
    };

    // Footer
    footer?: {
        padding?: string;
        borderTop?: {
            width?: string;
            style?: string;
            color?: string;
        };
        signature?: {
            enabled?: boolean;
            position?: string;
            lineWidth?: string;
            lineColor?: string;
            fontSize?: number;
            fontWeight?: string;
        };
        qrCode?: {
            enabled?: boolean;
            size?: number;
            position?: string;
            borderColor?: string;
            borderWidth?: string;
        };
        issueDate?: {
            fontSize?: number;
            color?: string;
            format?: string;
        };
    };

    // Decorations (NEW)
    decorations?: {
        seal?: {
            enabled?: boolean;
            imageUrl?: string;
            size?: string;
            position?: {
                top?: string;
                right?: string;
                bottom?: string;
                left?: string;
            };
            opacity?: number;
        };
        watermark?: {
            enabled?: boolean;
            text?: string;
            fontSize?: number;
            color?: string;
            opacity?: number;
            rotation?: string;
        };
        ribbon?: {
            enabled?: boolean;
            color?: string;
            text?: string;
            position?: 'top-left' | 'top-right';
        };
    };

    // Effects (NEW)
    effects?: {
        containerShadow?: string;
        innerGlow?: {
            enabled?: boolean;
            color?: string;
            blur?: string;
        };
    };
}

export interface CertificateTemplate {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    layout?: CertificateLayout;
    issuerName: string;
    issuerTitle?: string;
    issuerSignature?: string;
    logoUrl?: string;
    requirementType: CertificateRequirementType;
    minScore?: number;
    minProgress: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    course?: {
        id: string;
        title: string;
        description?: string;
    };
}

// Issued Certificate Types
export interface IssuedCertificate {
    id: string;
    certificateNumber: string;
    verificationCode: string;
    templateId: string;
    studentId: string;
    courseId: string;
    classroomId?: string;
    studentName: string;
    studentEmail: string;
    courseName: string;
    courseDescription?: string;
    completionDate: string;
    finalScore?: number;
    progress: number;
    totalHours?: number;
    issueDate: string;
    expiryDate?: string;
    verifiedAt?: string;
    isRevoked: boolean;
    revokedAt?: string;
    revokedReason?: string;
    metadata?: any;
    createdAt: string;
    updatedAt: string;
    template?: CertificateTemplate;
    student?: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        displayName?: string;
        avatarUrl?: string;
    };
    course?: {
        id: string;
        title: string;
        imageUrl?: string;
    };
    classroom?: {
        id: string;
        name: string;
        classCode: string;
    };
}

// API Request/Response Types
export interface GetMyCertificatesParams {
    skip?: number;
    take?: number;
}

export interface GetMyCertificatesResponse {
    data: IssuedCertificate[];
    total: number;
}

export interface VerifyCertificateResponse {
    success: boolean;
    certificate?: IssuedCertificate;
    message?: string;
}

// Certificate Progress Types
export interface CertificateProgress {
    courseId: string;
    courseName: string;
    completionPercentage: number;
    averageScore?: number;
    isEligible: boolean;
    requirementsMet: {
        progress: boolean;
        score: boolean;
    };
    template?: CertificateTemplate;
}

