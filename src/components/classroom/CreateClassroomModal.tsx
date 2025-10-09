import { createClassroom } from '@/apis/classroom';
import { useCourses } from '@/hooks/useCourse';
import { useTeachers } from '@/hooks/useTeacher';
import { useTeacherAvailability } from '@/hooks/useTeacherSchedule';
import { Classroom } from '@/interface/classroom.interface';
import { Weekday } from '@/interface/enums';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
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
  periodEnd: string;
  slots: ClassroomSlot[];
}

const schema = yup.object({
  name: yup.string().required('Classroom name is required'),
  description: yup.string().required('Description is required'),
  maxStudents: yup.number().positive('Max students must be positive').required('Max students is required'),
  teacherId: yup.string().required('Teacher is required'),
  courseId: yup.string().required('Course is required'),
  isActive: yup.boolean().default(true),
  periodStart: yup.string().required('Start date is required'),
  periodEnd: yup.string().required('End date is required'),
  slots: yup.array().of(
    yup.object({
      dayOfWeek: yup.mixed<Weekday>().oneOf(Object.values(Weekday)).required(),
      startMinuteOfDay: yup.number().min(0).max(1439).required(),
      endMinuteOfDay: yup.number().min(0).max(1439).required()
    })
  ).required('At least one time slot is required').min(1, 'At least one time slot is required')
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
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      maxStudents: 30,
      isActive: true,
      teacherId: '',
      courseId: '',
      periodStart: '',
      periodEnd: '',
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
  }; const weekdayLabels = {
    [Weekday.MON]: 'Monday',
    [Weekday.TUE]: 'Tuesday',
    [Weekday.WED]: 'Wednesday',
    [Weekday.THU]: 'Thursday',
    [Weekday.FRI]: 'Friday',
    [Weekday.SAT]: 'Saturday',
    [Weekday.SUN]: 'Sunday',
  };

  const onSubmit = (data: CreateClassroomFormValues) => {
    console.log('🔍 Form data before submit:', data);
    console.log('🔍 teacherId value:', data.teacherId);
    console.log('🔍 Form errors:', errors);

    // Validate teacherId explicitly
    if (!data.teacherId || data.teacherId.trim() === '') {
      console.error('❌ TeacherId is empty!');
      alert('Please select a teacher');
      return;
    }

    // Convert periodStart and periodEnd to Date objects for backend
    const payload = {
      ...data,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
    };
    console.log('✅ Submitting payload:', payload);
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
      title="Create New Classroom"
      description="Add a new classroom to the system"
      icon={<Plus className="w-6 h-6 text-purple-600" />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-h-[calc(90vh-200px)] overflow-y-auto space-y-3">

          <FormField name="name" label="Classroom Name *" placeholder="Enter classroom name" />
          <FormField name="description" label="Description" placeholder="Enter classroom description" />

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Course *</label>
            <select
              {...register('courseId', {
                onChange: (e) => {
                  console.log('🔍 Course selected:', e.target.value);
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
              <option value="">{isLoadingCourses ? 'Loading courses...' : 'Select a course'}</option>
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
              <h4 className="text-sm font-medium text-blue-800 mb-2">Course Information</h4>
              {(() => {
                const selectedCourse = coursesData.data.data.find(c => c.id === selectedCourseId);
                if (!selectedCourse) return null;

                return (
                  <div className="space-y-1 text-sm text-blue-700">
                    <div>📚 <strong>Title:</strong> {selectedCourse.title}</div>
                    <div>⏱️ <strong>Planned Sessions:</strong> {selectedCourse.plannedSessions || 'Not specified'}</div>
                    <div>📝 <strong>Total Lessons:</strong> {selectedCourse.totalLessons || 0}</div>
                    <div>⏰ <strong>Duration:</strong> {selectedCourse.totalDuration ? `${Math.round(selectedCourse.totalDuration / 60)} hours` : 'Not specified'}</div>
                    <div>📊 <strong>Difficulty:</strong> {selectedCourse.difficulty}</div>
                    {selectedCourse.plannedSessions && (
                      <div className="mt-2 p-2 bg-blue-100 rounded text-xs">
                        💡 <strong>Note:</strong> This course has {selectedCourse.plannedSessions} planned sessions.
                        The classroom will automatically organize activities according to the course's session schedule.
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Assigned Teacher *</label>
            <select
              {...register('teacherId', {
                onChange: (e) => {
                  console.log('🔍 Teacher selected:', e.target.value);
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
              <p className="text-xs text-green-600 mt-1">✓ Selected: {selectedTeacherValue}</p>
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

          {/* Selected Slots Preview */}
          {fields.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Selected Schedule</h4>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="maxStudents" label="Max Students" type="number" placeholder="30" />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <div className="flex items-center h-10">
                <input
                  type="checkbox"
                  {...register('isActive')}
                  className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="periodStart" label="Start Date *" type="date" />
            <FormField name="periodEnd" label="End Date *" type="date" />
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={createMutation.isPending}>
                <span>Create Classroom</span>
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
          schedule={teacherSchedule ?? null}
          isLoading={isTeacherScheduleLoading}
          onSlotsChange={handleSlotsChange}
          currentSlots={fields}
        />
      )}
    </Modal>
  );
};

export default CreateClassroomModal;
