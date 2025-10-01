export interface Parent {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  phoneNumber?: string;
  avatarUrl?: string;
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
}

export interface UpdateParentData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}

export interface AssignChildrenData {
  studentIds: string[];
}
