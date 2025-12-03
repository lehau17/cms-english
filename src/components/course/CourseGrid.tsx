import { Course } from '@/interface/course.interface';
import { Box, CircularProgress } from '@mui/material';
import React from 'react';
import CourseCard from './CourseCard';

interface CourseGridProps {
    courses: Course[];
    isLoading: boolean;
    onView: (course: Course) => void;
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
    formatDate: (dateString: string | Date | null | undefined) => string;
    emptyState?: React.ReactNode;
    selectedCourses?: (string | number)[];
    onSelectionChange?: (selected: (string | number)[]) => void;
}

const CourseGrid: React.FC<CourseGridProps> = ({
    courses,
    isLoading,
    onView,
    onEdit,
    onDelete,
    formatDate,
    emptyState,
    selectedCourses = [],
    onSelectionChange,
}) => {
    const handleSelect = (courseId: string, selected: boolean) => {
        if (!onSelectionChange) return;
        if (selected) {
            onSelectionChange([...selectedCourses, courseId]);
        } else {
            onSelectionChange(selectedCourses.filter(id => id !== courseId));
        }
    };
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={6}>
                <CircularProgress />
            </Box>
        );
    }

    if (courses.length === 0) {
        return <>{emptyState}</>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course) => (
                <CourseCard
                    key={course.id}
                    course={course}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    formatDate={formatDate}
                    isSelected={selectedCourses.includes(course.id)}
                    onSelect={onSelectionChange ? handleSelect : undefined}
                />
            ))}
        </div>
    );
};

export default CourseGrid;

