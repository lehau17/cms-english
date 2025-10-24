
export interface ParentChild {
    parentId: string;
    childId: string;
    createdAt: string;
}

export enum LinkRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface UserSummary {
    id: string;
    email: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
}

export interface ParentChildLinkRequest {
    id: string;
    parentId: string;
    studentId: string;
    status: LinkRequestStatus;
    requestedAt: string;
    resolvedAt: string | null;
    resolvedById: string | null;
    parent: UserSummary;
    student: UserSummary;
    resolvedBy?: UserSummary | null;
}
