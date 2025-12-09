import { createClassroom } from '@/apis/classroom';
import { useCourses } from '@/hooks/useCourse';
import { useTeachers } from '@/hooks/useTeacher';
import { useTeacherAvailability } from '@/hooks/useTeacherSchedule';
import { Classroom } from '@/interface/classroom.interface';
import { Weekday } from '@/interface/enums';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import IntegratedScheduleModal from '../schedule/IntegratedScheduleModal';
import { LibraryBooks, Notes, Schedule, BarChart, Lightbulb, Check, Timer } from '@mui/icons-material';
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

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tạo lớp học mới"
            description="Thêm lớp học mới vào hệ thống"
            icon={<Plus className="w-6 h-6 text-purple-600" />}
        >
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-h-[calc(90vh-200px)] overflow-y-auto space-y-3">

                    {/* Step 1: Select Course */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            <span className="inline-block w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mr-2 text-center leading-6">1</span>
                            Khóa học *
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
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
                            disabled={isLoadingCourses}
                        >
                            <option value="">{isLoadingCourses ? 'Đang tải khóa học...' : 'Chọn khóa học'}</option>
                            {coursesData?.data?.data?.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                        {errors.courseId && <p className="text-red-500 text-sm mt-1">{errors.courseId.message}</p>}
                    </div>

                    {/* Course Info Preview */}
                    {selectedCourseId && coursesData?.data?.data && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <h4 className="text-sm font-medium text-blue-800 mb-2">Thông tin khóa học</h4>
                            {(() => {
                                const selectedCourse = coursesData.data.data.find(c => c.id === selectedCourseId);
                                if (!selectedCourse) return null;

                                return (
                                    <div className="space-y-1 text-sm text-blue-700">
                                        <div className="flex items-center gap-1"><LibraryBooks fontSize="small" /> <strong>Tiêu đề:</strong> {selectedCourse.title}</div>
                                        <div className="flex items-center gap-1"><Timer fontSize="small" /> <strong>Số buổi dự kiến:</strong> {selectedCourse.plannedSessions || 'Không xác định'}</div>
                                        <div className="flex items-center gap-1"><Notes fontSize="small" /> <strong>Tổng số bài học:</strong> {selectedCourse.totalLessons || 0}</div>
                                        <div className="flex items-center gap-1"><Schedule fontSize="small" /> <strong>Thời lượng:</strong> {selectedCourse.totalDuration ? `${Math.round(selectedCourse.totalDuration / 60)} giờ` : 'Không xác định'}</div>
                                        <div className="flex items-center gap-1"><BarChart fontSize="small" /> <strong>Độ khó:</strong> {selectedCourse.difficulty}</div>
                                        {selectedCourse.plannedSessions && (
                                            <div className="mt-2 p-2 bg-blue-100 rounded text-xs flex items-start gap-1">
                                                <Lightbulb fontSize="small" /> <strong>Lưu ý:</strong> Khóa học này có {selectedCourse.plannedSessions} buổi học dự kiến.
                                                Lớp học sẽ tự động sắp xếp hoạt động theo lịch trình của khóa học.
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Step 2: Select Teacher */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            <span className="inline-block w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mr-2 text-center leading-6">2</span>
                            Assigned Teacher *
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
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
                            disabled={isLoadingTeachers}
                        >
                            <option value="">{isLoadingTeachers ? 'Loading teachers...' : 'Select a teacher'}</option>
                            {teachersData?.data.data.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.firstName} {teacher.lastName} - {teacher.email}
                                </option>
                            ))}
                        </select>
                        {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId.message}</p>}
                        {/* Debug info */}
                        {selectedTeacherValue && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Check fontSize="small" /> Selected: {selectedTeacherValue}</p>
                        )}

                        {/* Schedule Button - Only show after teacher is selected */}
                        {selectedTeacherValue && (
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={handleViewSchedule}
                                size="sm"
                                className="mt-2 w-full text-sm"
                            >
                                <Calendar className="w-4 h-4 mr-2" />
                                Xem Lịch & Chọn Khung Giờ
                            </Button>
                        )}
                    </div>

                    {/* Step 3: Select Start Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            <span className="inline-block w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mr-2 text-center leading-6">3</span>
                            Start Date *
                        </label>
                        <input
                            type="date"
                            {...register('periodStart')}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                        />
                        {errors.periodStart && <p className="text-red-500 text-sm mt-1">{errors.periodStart.message}</p>}
                    </div>

                    {/* Step 4: Selected Slots Preview */}
                    {fields.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-700">
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 mr-2"><Check fontSize="small" /></span>
                                Selected Schedule
                            </h4>
                            <div className="space-y-2">
                                {fields.map((field, index) => {
                                    const duration = (field.endMinuteOfDay - field.startMinuteOfDay) / 60;
                                    return (
                                        <div key={field.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <div className="flex-1">
                                                <span className="text-sm font-medium text-green-800">
                                                    {weekdayLabels[field.dayOfWeek]} {minutesToTimeString(field.startMinuteOfDay)} - {minutesToTimeString(field.endMinuteOfDay)}
                                                </span>
                                                <span className="text-xs text-green-600 ml-2">({duration.toFixed(1)}h)</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={() => remove(index)}
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    );
                                })}
                                <div className="text-sm text-gray-600 pt-2 border-t border-gray-200">
                                    Total weekly hours: {fields.reduce((total, field) =>
                                        total + ((field.endMinuteOfDay - field.startMinuteOfDay) / 60), 0
                                    ).toFixed(1)}h
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Auto-calculated End Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            <span className="inline-block w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mr-2 text-center leading-6">4</span>
                            Ngày kết thúc (Tự động tính)
                        </label>
                        {selectedPeriodEnd ? (
                            <input
                                type="date"
                                value={selectedPeriodEnd}
                                readOnly
                                className="w-full px-3 py-2 text-sm bg-green-50 border border-green-300 rounded-lg text-green-800 font-medium"
                                title="Automatically calculated based on course planned sessions and weekly schedule"
                            />
                        ) : (
                            <div className="px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-lg text-gray-400 flex items-center justify-center h-10">
                                {!selectedCourseId && '← Chọn khóa học trước'}
                                {selectedCourseId && !selectedPeriodStart && '← Chọn ngày bắt đầu'}
                                {selectedCourseId && selectedPeriodStart && fields.length === 0 && '← Chọn khung giờ học'}
                                {selectedCourseId && selectedPeriodStart && fields.length > 0 && 'Đang tính toán...'}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                            <span className="inline-block w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-bold mr-2 text-center leading-6">5</span>
                            Chi tiết lớp học
                        </h4>
                        <div className="space-y-3">
                            <FormField name="name" label="Tên lớp học *" placeholder="Nhập tên lớp học" />
                            <FormField name="description" label="Mô tả *" placeholder="Nhập mô tả lớp học" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <FormField name="maxStudents" label="Số học viên tối đa" type="number" placeholder="30" />
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Trạng thái</label>
                                    <div className="flex items-center h-10">
                                        <input
                                            type="checkbox"
                                            {...register('isActive')}
                                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                        />
                                        <span className="ml-3 text-sm font-medium text-gray-700">Hoạt động</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                        <div className="flex justify-end space-x-3">
                            <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
                            <Button type="submit" isLoading={createMutation.isPending}>
                                <span>Tạo lớp học</span>
                            </Button>
                        </div>
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
