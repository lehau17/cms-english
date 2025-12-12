// Learning Path TypeScript Interfaces - Phase 4 CMS
// Based on Phase 1 DTOs and backend schema

export enum ActivityType {
  VOCAB = 'VOCAB',
  GRAMMAR = 'GRAMMAR',
  LISTENING = 'LISTENING',
  READING = 'READING',
  SPEAKING = 'SPEAKING',
  WRITING = 'WRITING',
  PRONUNCIATION = 'PRONUNCIATION',
  FILL_BLANK = 'FILL_BLANK',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MATCHING = 'MATCHING',
  REORDER = 'REORDER',
  DICTATION = 'DICTATION',
  CONVERSATION = 'CONVERSATION',
  ROLE_PLAY = 'ROLE_PLAY',
  VIDEO = 'VIDEO',
}

export enum SkillTarget {
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR',
  LISTENING = 'LISTENING',
  READING = 'READING',
  SPEAKING = 'SPEAKING',
  WRITING = 'WRITING',
  PRONUNCIATION = 'PRONUNCIATION',
}

export enum StepStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
  FAILED = 'FAILED',
}

export enum LearningPathStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export interface LearningPathStep {
  id: string;
  learningPathId: string;
  activityType: ActivityType;
  activityId?: string;
  targetSkills: SkillTarget[];
  difficulty: number;
  order: number;
  status: StepStatus;
  completedAt?: string;
  score?: number;
  attempts: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LearningPath {
  id: string;
  userId: string;
  classroomId?: string;
  name: string;
  description?: string;
  targetLevel: string;
  status: LearningPathStatus;
  isDynamic: boolean;
  currentStepId?: string;
  completedSteps: number;
  totalSteps: number;
  startedAt?: string;
  completedAt?: string;
  steps?: LearningPathStep[];
  createdAt: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  prompt: string;
  variables: string[];
  activityType?: ActivityType;
  targetSkills?: SkillTarget[];
  metadata?: Record<string, any>;
  timesUsed: number;
  avgQualityScore?: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// DTO Interfaces for API requests
export interface CreateLearningPathDto {
  userId: string;
  classroomId?: string;
  name: string;
  description?: string;
  targetLevel: string;
  isDynamic?: boolean;
}

export interface CreateStepDto {
  activityType: ActivityType;
  activityId?: string;
  targetSkills: SkillTarget[];
  difficulty: number;
  order: number;
  metadata?: Record<string, any>;
}

export interface UpdateLearningPathDto {
  name?: string;
  description?: string;
  targetLevel?: string;
  status?: LearningPathStatus;
}

export interface CreatePromptTemplateDto {
  name: string;
  category: string;
  description?: string;
  prompt: string;
  variables: string[];
  activityType?: ActivityType;
  targetSkills?: SkillTarget[];
}

export interface UpdatePromptTemplateDto {
  name?: string;
  category?: string;
  description?: string;
  prompt?: string;
  variables?: string[];
  activityType?: ActivityType;
  targetSkills?: SkillTarget[];
}

// Path Template (for CRUD management)
export interface PathTemplate {
  id: string;
  name: string;
  description?: string;
  targetLevel: string;
  steps: CreateStepDto[];
  metadata?: Record<string, any>;
  createdBy: string;
  timesUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePathTemplateDto {
  name: string;
  description?: string;
  targetLevel: string;
  steps: CreateStepDto[];
  metadata?: Record<string, any>;
}

export interface UpdatePathTemplateDto {
  name?: string;
  description?: string;
  targetLevel?: string;
  steps?: CreateStepDto[];
  metadata?: Record<string, any>;
}

// Analytics Interfaces
export interface LearningPathAnalytics {
  classroomId?: string;
  completionRate: number;
  avgCompletionTime: number;
  totalPaths: number;
  activePaths: number;
  completedPaths: number;
  skillMastery: Record<SkillTarget, number>;
  difficultyDistribution: Record<string, number>;
  bottleneckActivities: Array<{
    activityType: ActivityType;
    failureRate: number;
    avgAttempts: number;
  }>;
}

export interface CompletionRateData {
  date: string;
  rate: number;
  total: number;
  completed: number;
}

export interface StudentPathProgress {
  userId: string;
  userName: string;
  pathId: string;
  pathName: string;
  progress: number;
  currentStep: number;
  totalSteps: number;
  status: LearningPathStatus;
  lastActivityAt?: string;
}

export interface AnalyticsQueryParams {
  classroomId?: string;
  startDate?: string;
  endDate?: string;
  targetLevel?: string;
}
