import React from 'react';
import {
    Headphones,
    Mic,
    MenuBook,
    Edit,
    LibraryBooks,
    Notes,
    Quiz,
    RecordVoiceOver,
    Description,
    CheckCircle,
    Cancel,
    Warning,
    SmartToy,
    Lightbulb,
    TrackChanges,
    BarChart,
    RocketLaunch,
    AutoAwesome,
    Settings,
    Schedule,
    WbTwilight,
    WbSunny,
    NightsStay,
    Sync,
    Build,
    Close,
    Info,
} from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';

/**
 * Get MUI icon for activity type
 */
export const getActivityIcon = (type: string, props?: SvgIconProps): React.ReactNode => {
    const iconProps: SvgIconProps = { fontSize: 'small', ...props };

    switch (type?.toLowerCase()) {
        case 'listening':
            return <Headphones {...iconProps} />;
        case 'speaking':
            return <Mic {...iconProps} />;
        case 'reading':
            return <MenuBook {...iconProps} />;
        case 'writing':
            return <Edit {...iconProps} />;
        case 'vocabulary':
        case 'vocab':
            return <LibraryBooks {...iconProps} />;
        case 'grammar':
            return <Notes {...iconProps} />;
        case 'quiz':
            return <Quiz {...iconProps} />;
        case 'pronunciation':
            return <RecordVoiceOver {...iconProps} />;
        case 'mini_game':
        case 'minigame':
            return <AutoAwesome {...iconProps} />;
        case 'flashcard':
            return <Description {...iconProps} />;
        case 'conversation':
            return <Mic {...iconProps} />;
        default:
            return <Description {...iconProps} />;
    }
};

/**
 * Get MUI icon for status
 */
export const getStatusIcon = (status: 'success' | 'error' | 'warning' | 'info', props?: SvgIconProps): React.ReactNode => {
    const iconProps: SvgIconProps = { fontSize: 'small', ...props };

    switch (status) {
        case 'success':
            return <CheckCircle {...iconProps} color="success" />;
        case 'error':
            return <Cancel {...iconProps} color="error" />;
        case 'warning':
            return <Warning {...iconProps} color="warning" />;
        case 'info':
            return <Info {...iconProps} color="info" />;
        default:
            return <Info {...iconProps} />;
    }
};

/**
 * Get MUI icon for time of day
 */
export const getTimeOfDayIcon = (time: 'morning' | 'afternoon' | 'evening', props?: SvgIconProps): React.ReactNode => {
    const iconProps: SvgIconProps = { fontSize: 'small', ...props };

    switch (time) {
        case 'morning':
            return <WbTwilight {...iconProps} />;
        case 'afternoon':
            return <WbSunny {...iconProps} />;
        case 'evening':
            return <NightsStay {...iconProps} />;
        default:
            return <Schedule {...iconProps} />;
    }
};

// Commonly used icons as components
export const AIIcon = (props: SvgIconProps) => <SmartToy {...props} />;
export const TipIcon = (props: SvgIconProps) => <Lightbulb {...props} />;
export const GoalIcon = (props: SvgIconProps) => <TrackChanges {...props} />;
export const StatsIcon = (props: SvgIconProps) => <BarChart {...props} />;
export const LaunchIcon = (props: SvgIconProps) => <RocketLaunch {...props} />;
export const MagicIcon = (props: SvgIconProps) => <AutoAwesome {...props} />;
export const SettingsIcon = (props: SvgIconProps) => <Settings {...props} />;
export const EditIcon = (props: SvgIconProps) => <Edit {...props} />;
export const TimeIcon = (props: SvgIconProps) => <Schedule {...props} />;
export const SyncIcon = (props: SvgIconProps) => <Sync {...props} />;
export const ToolIcon = (props: SvgIconProps) => <Build {...props} />;
export const CloseIcon = (props: SvgIconProps) => <Close {...props} />;
export const BookIcon = (props: SvgIconProps) => <LibraryBooks {...props} />;
export const NotesIcon = (props: SvgIconProps) => <Notes {...props} />;
export const SuccessIcon = (props: SvgIconProps) => <CheckCircle {...props} color="success" />;
export const ErrorIcon = (props: SvgIconProps) => <Cancel {...props} color="error" />;
