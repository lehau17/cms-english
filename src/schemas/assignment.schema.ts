import * as yup from 'yup';

// Activity types validation
export const ACTIVITY_TYPES = [
    'quiz',
    'vocab',
    'listening',
    'pronunciation',
    'speaking',
    'mini_game',
    'reading',
    'writing',
    'grammar',
    'flashcard',
    'conversation',
    'fill_blank',
    'dictation',
    'matching',
] as const;

export type ActivityType = typeof ACTIVITY_TYPES[number];

// Quiz/Reading/Grammar content schema
const quizContentSchema = yup.object({
    question: yup.string().required('Question is required'),
    options: yup.array().of(yup.string().required('Option is required')).min(2, 'At least 2 options required'),
    correctIndex: yup.number().min(0).required('Correct answer is required'),
    explanation: yup.string().optional(),
});

// Listening content schema
const listeningContentSchema = yup.object({
    audioUrl: yup.string().required('Audio URL is required'),
    instructions: yup.string().optional(),
    questions: yup.array().of(
        yup.object({
            id: yup.mixed().optional(),
            question: yup.string().required('Question is required'),
            options: yup.array().of(yup.string().required()).min(2, 'At least 2 options required'),
            correctIndex: yup.number().min(0).required('Correct answer is required'),
        })
    ).min(1, 'At least 1 question required'),
});

// Pronunciation content schema
const pronunciationContentSchema = yup.object({
    text: yup.string().required('Text is required'),
    targetWords: yup.array().of(yup.string()).optional(),
});

// Activity schema
export const activitySchema = yup.object({
    id: yup.string().optional(),
    type: yup.string().oneOf(ACTIVITY_TYPES as unknown as string[]).required('Activity type is required'),
    title: yup.string().required('Activity title is required'),
    instructions: yup.string().optional(),
    content: yup.mixed().optional().default({}),
    points: yup.number().min(1, 'Points must be at least 1').default(10),
    passingScore: yup.number().min(0).max(100).optional().nullable(),
    difficulty: yup.string().oneOf(['beginner', 'elementary', 'intermediate', 'upper_intermediate', 'advanced', 'expert']).optional(),
    hints: yup.array().of(yup.string()).optional(),
});

// Assignment schema
export const assignmentSchema = yup.object({
    title: yup.string().required('Assignment title is required'),
    description: yup.string().optional(),
    instructions: yup.string().optional(),
    startTime: yup.string().optional().test('is-iso-date', 'Must be a valid ISO 8601 date', function (value) {
        if (!value || value === '') return true; // Allow empty
        const date = new Date(value);
        return !isNaN(date.getTime()) && value.includes('T');
    }),
    dueDate: yup.string().optional().test('is-iso-date', 'Must be a valid ISO 8601 date', function (value) {
        if (!value || value === '') return true; // Allow empty
        const date = new Date(value);
        return !isNaN(date.getTime()) && value.includes('T');
    }).test('start-before-due', 'Start time must be before due date', function (value) {
        const startTime = this.parent.startTime;
        if (!startTime || !value) return true; // Allow empty
        const start = new Date(startTime);
        const due = new Date(value);
        return start < due;
    }),
    totalPoints: yup.number().default(100).optional(),
    timeLimit: yup.number()
        .transform((value, originalValue) => {
            // Convert empty string, 0, null, or NaN to undefined (no limit)
            if (originalValue === '' || originalValue === 0 || originalValue === null || Number.isNaN(value)) return undefined;
            return value;
        })
        .min(1, 'Time limit must be at least 1 minute if set')
        .integer('Time limit must be a whole number')
        .optional()
        .nullable(),
    maxAttempts: yup.number().min(1, 'Max attempts must be at least 1').integer('Max attempts must be a whole number').optional(),
    isPublished: yup.boolean().default(false),
    activities: yup.array().of(activitySchema).optional(),
});

export type AssignmentFormValues = {
    title: string;
    description?: string;
    instructions?: string;
    startTime?: string;
    dueDate?: string;
    totalPoints?: number;
    timeLimit?: number;
    maxAttempts?: number;
    isPublished: boolean;
    activities?: ActivityFormValues[];
};

export type ActivityFormValues = {
    id?: string;
    type: string;
    title: string;
    instructions?: string;
    content: any;
    points: number;
    passingScore?: number;
    difficulty?: 'beginner' | 'elementary' | 'intermediate' | 'upper_intermediate' | 'advanced' | 'expert';
    hints?: string[];
};

