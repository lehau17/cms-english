import { UserRole } from "./enum.interface";

export enum NotificationType {
  achievement = 'achievement',
  reminder = 'reminder',
  system = 'system',
  social = 'social',
  assignment = 'assignment',
  streak = 'streak',
  parent_child = 'parent_child'
}

export enum NotificationChannel {
  socket = 'socket',
  fcm = 'fcm',
  email = 'email',
  sms = 'sms',
  in_app = 'in_app'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  data?: any;
  readAt?: string;
  channel: NotificationChannel;
  createdAt: string;
  updatedAt: string;
}

export type NotificationTarget = 'all' | 'role' | 'users';

export interface CreateBroadcastNotificationDto {
  target: NotificationTarget;
  targetRoles?: UserRole[];
  targetUserIds?: string[];
  title: string;
  body?: string;
  data?: string;
  channel: NotificationChannel;
}

export interface GetNotificationsQuery {
  page?: number;
  limit?: number;
  userId?: string;
  channel?: NotificationChannel;
  read?: boolean;
}
