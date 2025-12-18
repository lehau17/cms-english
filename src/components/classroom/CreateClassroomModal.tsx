import { createClassroom } from '@/apis/classroom';
import holidayApi from '@/apis/holiday';
import { useCourses } from '@/hooks/useCourse';
import { useTeachers } from '@/hooks/useTeacher';
import { useTeacherAvailability } from '@/hooks/useTeacherSchedule';
import { Classroom } from '@/interface/classroom.interface';
import { Weekday } from '@/interface/enums';
import { yupResolver } from '@hookform/resolvers/yup';
import { BarChart, Check, Lightbulb, Notes, Timer } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DatePicker } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { Calendar, Plus, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import IntegratedScheduleModal from '../schedule/IntegratedScheduleModal';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface CreateClassroomModalProps {
    isOpen: boolean;
    onClose: () => void;
}


interface ClassroomSlot {
    dayOfWeek: Weekday;
    startMinuteOfDay: number;
    endMinuteOfDay: number;
}

interface CreateClassroomFormValues {
    name: string;
    description: string;
    maxStudents: number;
    teacherId: string;
    isActive: boolean;
    courseId: string;
    periodStart: string;
    periodEnd?: string;
    autoCalculateDates: boolean;
    slots: ClassroomSlot[];
}

const schema = yup.object({
    name: yup.string().required('Vui lòng nhập tên lớp học'),
    description: yup.string().required('Vui lòng nhập mô tả'),
    maxStudents: yup.number().positive('Số học viên tối đa phải là số dương').required('Vui lòng nhập số học viên tối đa'),
    teacherId: yup.string().required('Vui lòng chọn giáo viên'),
    courseId: yup.string().required('Vui lòng chọn khóa học'),
    isActive: yup.boolean().default(true),
    periodStart: yup.string().required('Vui lòng chọn ngày bắt đầu'),
    periodEnd: yup.string().notRequired(), // Auto-calculated, not required
    autoCalculateDates: yup.boolean().default(true), // Always true
    slots: yup.array().of(
        yup.object({
            dayOfWeek: yup.mixed<Weekday>().oneOf(Object.values(Weekday)).required(),
            startMinuteOfDay: yup.number().min(0).max(1439).required(),
            endMinuteOfDay: yup.number().min(0).max(1439).required()
        })
    ).required('Vui lòng chọn ít nhất một khung giờ').min(1, 'Vui lòng chọn ít nhất một khung giờ')
});


const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ limit: 1000 });
    const { data: coursesData, isLoading: isLoadingCourses } = useCourses({ limit: 1000 });

    // State for integrated schedule modal
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [selectedTeacherName, setSelectedTeacherName] = useState<string>('');

    const methods = useForm<CreateClassroomFormValues>({
        resolver: yupResolver(schema) as any,
        defaultValues: {
            name: '',
            description: '',
            maxStudents: 30,
            isActive: true,
            teacherId: '',
            courseId: '',
            periodStart: '',
            periodEnd: '',
            autoCalculateDates: true, // Always true
            slots: [],
        },
    });

    const { register, handleSubmit, control, setValue, formState: { errors }, watch } = methods;
    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'slots',
    });

    // Watch for teacher changes to enable schedule viewing
    const selectedTeacherValue = watch('teacherId');
    const selectedPeriodStart = watch('periodStart');
    const selectedPeriodEnd = watch('periodEnd');
    const selectedCourseId = watch('courseId');

    const weekStartParam = selectedPeriodStart ? new Date(selectedPeriodStart).toISOString() : undefined;

    // Use new availability API - simpler and returns exact Mon-Sun schedule
    const {
        data: teacherAvailability,
        isLoading: isTeacherScheduleLoading,
    } = useTeacherAvailability(selectedTeacherId, weekStartParam, 'Asia_Ho_Chi_Minh', showScheduleModal);

    // API already returns in correct format: { mon: [], tue: [], ..., sun: [] }
    const teacherSchedule = teacherAvailability?.schedule ?? null;

    // Fetch holidays for current and next year
    const currentYear = new Date().getFullYear();
    const { data: currentYearHolidays } = useQuery({
        queryKey: ['holidays', currentYear],
        queryFn: () => holidayApi.getHolidays(currentYear),
        staleTime: 5 * 60 * 1000,
    });

    const { data: nextYearHolidays } = useQuery({
        queryKey: ['holidays', currentYear + 1],
        queryFn: () => holidayApi.getHolidays(currentYear + 1),
        staleTime: 5 * 60 * 1000,
    });

    // Combine holiday dates into a Set for efficient lookup
    const holidayDates = React.useMemo(() => {
        const dates = new Set<string>();
        currentYearHolidays?.data?.holidays?.forEach(h => dates.add(h.date));
        nextYearHolidays?.data?.holidays?.forEach(h => dates.add(h.date));
        return dates;
    }, [currentYearHolidays, nextYearHolidays]);

    const disabledDate = (current: Dayjs): boolean => {
        // Can not select days before today
        if (current && current < dayjs().startOf('day')) {
            return true;
        }
        // Disable holidays
        const dateStr = current.format('YYYY-MM-DD');
        return holidayDates.has(dateStr);
    };

    const createMutation = useMutation({
        mutationFn: (data: Partial<Classroom>) => createClassroom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['classrooms'] });
            onClose();
        },
    });

    // 🔄 Auto-calculate end date when course, start date, or slots change
    useEffect(() => {
        if (!selectedCourseId || !selectedPeriodStart || fields.length === 0) {
            return;
        }

        const selectedCourse = coursesData?.data?.data?.find(c => c.id === selectedCourseId);
        if (!selectedCourse?.plannedSessions) {
            return;
        }

        const startDate = new Date(selectedPeriodStart);
        const calculatedEndDate = calculateEndDate(selectedCourse.plannedSessions, fields, startDate);

        if (calculatedEndDate) {
            // Format as YYYY-MM-DD for date input
            const formattedDate = calculatedEndDate.toISOString().split('T')[0];
            setValue('periodEnd', formattedDate, { shouldValidate: true });
        }
    }, [selectedCourseId, selectedPeriodStart, fields, coursesData, setValue]);

    // Utility functions for time conversion
    const minutesToTimeString = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const timeStringToMinutes = (timeString: string): number => {
        const [hoursStr, minutesStr] = timeString.split(':');
        const hours = parseInt(hoursStr || '0', 10) || 0;
        const minutes = parseInt(minutesStr || '0', 10) || 0;
        return hours * 60 + minutes;
    };

    // 🔧 Calculate end date based on plannedSessions and slots (mimics backend logic)
    const calculateEndDate = (
        plannedSessions: number,
        slots: ClassroomSlot[],
        startDate: Date
    ): Date | null => {
        if (!plannedSessions || !slots.length || !startDate) return null;

        // Convert Weekday enum to day numbers (0=Sunday, 1=Monday, ..., 6=Saturday)
        const weekdayToNumber: Record<Weekday, number> = {
            [Weekday.SUN]: 0,
            [Weekday.MON]: 1,
            [Weekday.TUE]: 2,
            [Weekday.WED]: 3,
            [Weekday.THU]: 4,
            [Weekday.FRI]: 5,
            [Weekday.SAT]: 6,
        };

        const daysOfWeek = slots.map(slot => weekdayToNumber[slot.dayOfWeek]);

        // Find the last session date
        let currentDate = new Date(startDate);
        let sessionCount = 0;

        while (sessionCount < plannedSessions) {
            const dayOfWeek = currentDate.getDay();
            if (daysOfWeek.includes(dayOfWeek)) {
                sessionCount++;
                if (sessionCount === plannedSessions) {
                    // Return the day after the last session
                    const endDate = new Date(currentDate);
                    endDate.setDate(endDate.getDate() + 1);
                    return endDate;
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return currentDate;
    };

    const weekdayLabels = {
        [Weekday.MON]: 'Thứ 2',
        [Weekday.TUE]: 'Thứ 3',
        [Weekday.WED]: 'Thứ 4',
        [Weekday.THU]: 'Thứ 5',
        [Weekday.FRI]: 'Thứ 6',
        [Weekday.SAT]: 'Thứ 7',
        [Weekday.SUN]: 'Chủ nhật',
    };

    const onSubmit = (data: CreateClassroomFormValues) => {
        // Validate teacherId explicitly
        if (!data.teacherId || data.teacherId.trim() === '') {
            alert('Vui lòng chọn giáo viên');
            return;
        }

        // Always use auto-calculate mode (backend will calculate periodEnd)
        const payload: any = {
            ...data,
            periodStart: new Date(data.periodStart),
            autoCalculateDates: true, // Always true
        };

        // Don't send periodEnd - let backend calculate it
        delete payload.periodEnd;

        createMutation.mutate(payload);
    };

    const handleViewSchedule = () => {
        if (!selectedTeacherValue) return;

        const teacher = teachersData?.data.data.find(t => t.id === selectedTeacherValue);
        if (teacher) {
            setSelectedTeacherId(selectedTeacherValue);
            setSelectedTeacherName(`${teacher.firstName} ${teacher.lastName}`);
            setShowScheduleModal(true);
        }
    };

    const handleSlotsChange = (newSlots: ClassroomSlot[]) => {
        replace(newSlots);
    };

    // Check if schedule button should be enabled
    const canViewSchedule = !!selectedTeacherValue;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tạo lớp học mới"
            description="Điền thông tin để tạo lớp học"
            icon={<Plus className="w-6 h-6 text-purple-600" />}
            maxWidthClass="max-w-2xl"
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Row 1: Course & Teacher */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Khóa học <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('courseId', {
                                    onChange: (e) => {
                                        setValue('courseId', e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                            shouldTouch: true
                                        });
                                    }
                                })}
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                disabled={isLoadingCourses}
                            >
                                <option value="">{isLoadingCourses ? 'Đang tải...' : 'Chọn khóa học'}</option>
                                {coursesData?.data?.data?.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                            {errors.courseId && <p className="text-red-500 text-xs mt-1">{errors.courseId.message}</p>}
                        </div>

                        {/* Teacher Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Giáo viên <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('teacherId', {
                                    onChange: (e) => {
                                        setValue('teacherId', e.target.value, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                            shouldTouch: true
                                        });
                                    }
                                })}
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                disabled={isLoadingTeachers}
                            >
                                <option value="">{isLoadingTeachers ? 'Đang tải...' : 'Chọn giáo viên'}</option>
                                {teachersData?.data.data.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                        {teacher.firstName} {teacher.lastName}
                                    </option>
                                ))}
                            </select>
                            {errors.teacherId && <p className="text-red-500 text-xs mt-1">{errors.teacherId.message}</p>}
                        </div>
                    </div>

                    {/* Course Info Preview - Compact */}
                    {selectedCourseId && coursesData?.data?.data && (() => {
                        const selectedCourse = coursesData.data.data.find(c => c.id === selectedCourseId);
                        if (!selectedCourse) return null;
                        return (
                            <div className="flex items-center gap-4 p-3 bg-purple-50 border border-purple-100 rounded-lg text-sm">
                                <div className="flex items-center gap-1.5 text-purple-700">
                                    <Timer fontSize="small" />
                                    <span><strong>{selectedCourse.plannedSessions || '?'}</strong> buổi</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-purple-700">
                                    <Notes fontSize="small" />
                                    <span><strong>{selectedCourse.totalLessons || 0}</strong> bài học</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-purple-700">
                                    <BarChart fontSize="small" />
                                    <span>{selectedCourse.difficulty}</span>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Row 2: Start Date & Schedule Button */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Ngày bắt đầu <span className="text-red-500">*</span>
                            </label>
                            <Controller
                                control={control}
                                name="periodStart"
                                render={({ field }) => (
                                    <DatePicker
                                        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg hover:border-purple-500 focus:border-purple-500"
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày bắt đầu"
                                        value={field.value ? dayjs(field.value) : null}
                                        onChange={(date) => {
                                            field.onChange(date ? date.format('YYYY-MM-DD') : '');
                                        }}
                                        disabledDate={disabledDate}
                                    />
                                )}
                            />
                            {errors.periodStart && <p className="text-red-500 text-xs mt-1">{errors.periodStart.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Lịch học <span className="text-red-500">*</span>
                            </label>
                            <Button
                                type="button"
                                variant={canViewSchedule ? "primary" : "secondary"}
                                onClick={handleViewSchedule}
                                disabled={!canViewSchedule}
                                className="w-full h-[42px] justify-center"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                {fields.length > 0 ? `${fields.length} khung giờ đã chọn` : 'Chọn khung giờ'}
                            </Button>
                            {!canViewSchedule && (
                                <p className="text-gray-400 text-xs mt-1">Chọn giáo viên trước</p>
                            )}
                            {errors.slots && <p className="text-red-500 text-xs mt-1">{errors.slots.message}</p>}
                        </div>
                    </div>

                    {/* Selected Slots Preview - Compact */}
                    {fields.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full text-sm"
                                >
                                    <span className="text-green-700 font-medium">
                                        {weekdayLabels[field.dayOfWeek]} {minutesToTimeString(field.startMinuteOfDay)}-{minutesToTimeString(field.endMinuteOfDay)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => remove(index)}
                                        className="text-green-600 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Auto-calculated End Date - Inline */}
                    {selectedPeriodEnd && (
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">
                            <Check fontSize="small" />
                            <span>Ngày kết thúc dự kiến: <strong>{new Date(selectedPeriodEnd).toLocaleDateString('vi-VN')}</strong></span>
                        </div>
                    )}

                    {/* Classroom Details */}
                    <div className="pt-4 border-t border-gray-200 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField name="name" label="Tên lớp học *" placeholder="VD: Lớp TOEIC 500+" />
                            <FormField name="maxStudents" label="Số học viên tối đa" type="number" placeholder="30" />
                        </div>
                        <FormField name="description" label="Mô tả" placeholder="Mô tả ngắn về lớp học" />
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                {...register('isActive')}
                                id="isActive"
                                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="isActive" className="text-sm text-gray-700">Kích hoạt lớp học ngay</label>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={createMutation.isPending}>
                            Tạo lớp học
                        </Button>
                    </div>
                </form>
            </FormProvider>

            {/* Integrated Schedule Modal */}
            {showScheduleModal && selectedTeacherId && (
                <IntegratedScheduleModal
                    isOpen={showScheduleModal}
                    onClose={() => setShowScheduleModal(false)}
                    teacherName={selectedTeacherName || 'Teacher'}
                    schedule={teacherSchedule as any ?? null}
                    isLoading={isTeacherScheduleLoading}
                    onSlotsChange={handleSlotsChange}
                    currentSlots={fields}
                />
            )}
        </Modal>
    );
};

export default CreateClassroomModal;
