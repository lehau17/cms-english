export enum UserRole {
  STUDENT = 'student',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  CONTENT_CREATOR = 'content_creator',
}

export enum Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  PENDING = 'pending',
  SUSPENDED = 'suspended',
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum LanguageCode {
  EN = 'en',
  VI = 'vi',
  KO = 'ko',
  JP = 'jp',
  ZH = 'zh',
  FR = 'fr',
  ES = 'es',
  DE = 'de',
}

export enum TimezoneCode {
  ASIA_HO_CHI_MINH = 'Asia/Ho_Chi_Minh',
  ASIA_TOKYO = 'Asia/Tokyo',
  ASIA_SEOUL = 'Asia/Seoul',
  AMERICA_NEW_YORK = 'America/New_York',
  EUROPE_LONDON = 'Europe/London',
  AMERICA_LOS_ANGELES = 'America/Los_Angeles',
  AUSTRALIA_SYDNEY = 'Australia/Sydney',
}