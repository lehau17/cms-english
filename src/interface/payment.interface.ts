export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
}

export enum PaymentProvider {
    VNPAY = 'vnpay',
    MOMO = 'momo',
    STRIPE = 'stripe',
    PAYPAL = 'paypal',
    MANUAL = 'manual',
}

export enum TransactionType {
    COURSE_PURCHASE = 'course_purchase',
    REFUND = 'refund',
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    provider: PaymentProvider;
    type: TransactionType;
    vnpayTxnRef?: string;
    description?: string;
    studentId: string;
    courseId?: string;
    classroomId?: string;
    createdAt: string;
    updatedAt: string;
    completedAt?: string;

    // Relations
    student?: {
        id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
        displayName?: string;
    };
    course?: {
        id: string;
        title: string;
    };
    classroom?: {
        id: string;
        name: string;
    };
}
