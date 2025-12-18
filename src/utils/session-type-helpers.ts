import { Video, Building, Layers } from 'lucide-react';

export type SessionType = 'online' | 'offline' | 'hybrid';

export const SESSION_TYPES = {
  ONLINE: 'online' as const,
  OFFLINE: 'offline' as const,
  HYBRID: 'hybrid' as const,
};

export function getSessionTypeIcon(type: SessionType) {
  const iconMap = {
    online: Video,
    offline: Building,
    hybrid: Layers,
  };
  return iconMap[type] || Building;
}

export function getSessionTypeColor(type: SessionType): string {
  const colorMap = {
    online: 'bg-blue-100 text-blue-800 border-blue-300',
    offline: 'bg-gray-100 text-gray-800 border-gray-300',
    hybrid: 'bg-purple-100 text-purple-800 border-purple-300',
  };
  return colorMap[type] || 'bg-gray-100 text-gray-800 border-gray-300';
}

export function getSessionTypeLabel(type: SessionType): string {
  const labelMap = {
    online: 'Online',
    offline: 'Offline',
    hybrid: 'Hybrid',
  };
  return labelMap[type] || 'Offline';
}

export function validateMeetingUrl(url: string): boolean {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}
