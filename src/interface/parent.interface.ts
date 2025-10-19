export interface Parent {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName?: string;
    phoneNumber?: string;
    avatarUrl?: string;
    experience?: number;
    highlights?: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    children?: StudentForParent[];
}

export interface StudentForParent {
    id: string;
    email: string;
    name: string;
    phone?: string;
    avatar?: string;
    isActive: boolean;
    createdAt: string;
}

export interface CreateParentData {
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    password: string;
    experience?: number;
    highlights?: string[];
}

export interface UpdateParentData {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    experience?: number;
    highlights?: string[];
    isActive?: boolean;
}

export interface AssignChildrenData {
    studentIds: string[];
}
