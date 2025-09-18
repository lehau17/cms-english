import { createClassroom } from '@/apis/classroom';
import { useCourses } from '@/hooks/useCourse';
import { useTeachers } from '@/hooks/useTeacher';
import { Classroom } from '@/interface/classroom.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface CreateClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  plannedHours: number;
  sessionDurationHours: number;
}

const schema = yup.object({
  name: yup.string().required('Classroom name is required'),
  description: yup.string().required('Description is required'),
  maxStudents: yup.number().min(1).required('Max students is required'),
  teacherId: yup.string().required('Teacher is required'),
  courseId: yup.string().required('Course is required'),
  isActive: yup.boolean().default(true),
  periodStart: yup.string().required('Start date is required'),
  periodEnd: yup.string().required('End date is required'),
  plannedHours: yup.number().min(1).required('Planned hours is required'),
  sessionDurationHours: yup.number().min(0.1).required('Session duration is required'),
});


const CreateClassroomModal: React.FC<CreateClassroomModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ limit: 1000 });
  const { data: coursesData, isLoading: isLoadingCourses } = useCourses({ limit: 1000 });

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
      plannedHours: 36,
      sessionDurationHours: 1.5,
    },
  });

  const { register, handleSubmit, formState: { errors } } = methods;

  const createMutation = useMutation({
    mutationFn: (data: Partial<Classroom>) => createClassroom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      onClose();
    },
  });

  const onSubmit = (data: CreateClassroomFormValues) => {
    // Convert periodStart and periodEnd to Date objects for backend
    const payload = {
      ...data,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
    };
    createMutation.mutate(payload);
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
              {...register('courseId')}
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

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Assigned Teacher *</label>
            <select
              {...register('teacherId')}
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
          </div>


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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="plannedHours" label="Planned Hours *" type="number" placeholder="36" />
            <FormField name="sessionDurationHours" label="Session Duration (hours) *" type="number" placeholder="1.5" />
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
    </Modal>
  );
};

export default CreateClassroomModal;
