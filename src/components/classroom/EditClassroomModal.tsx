import { updateClassroom } from '@/apis/classroom';
import { useTeachers } from '@/hooks/useTeacher';
import { Classroom } from '@/interface/classroom.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit } from 'lucide-react';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import AddStudentToClassModal from './AddStudentToClassModal';

interface EditClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
}

interface EditClassroomFormValues {
  name: string;
  description: string;
  maxStudents: number;
  teacherId: string;
  isActive: boolean;
  classCode?: string;
}

const schema = yup.object({
  name: yup.string().required('Classroom name is required'),
  description: yup.string(),
  maxStudents: yup.number().min(1, 'Min is 1').required('Max students is required'),
  teacherId: yup.string().required('Teacher is required'),
  isActive: yup.boolean().optional(),
  classCode: yup.string().optional(),
});

const EditClassroomModal: React.FC<EditClassroomModalProps> = ({ isOpen, onClose, classroom }) => {
  const queryClient = useQueryClient();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ limit: 1000 });
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);

  const methods = useForm<EditClassroomFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      maxStudents: 30,
      isActive: true,
      teacherId: '',
      classCode: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = methods;

  React.useEffect(() => {
    if (classroom) {
      reset({
        name: classroom.name ?? '',
        description: classroom.description ?? '',
        maxStudents: classroom.maxStudents ?? 30,
        classCode: classroom.classCode ?? '',
        isActive: classroom.isActive ?? true,
        teacherId: classroom.teacherId ?? '',
      });
    }
  }, [classroom, reset]);

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Classroom> }) => updateClassroom(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classrooms'] });
      onClose();
    },
  });

  const onSubmit = (data: EditClassroomFormValues) => {
    if (classroom) {
      updateMutation.mutate({ id: classroom.id, data });
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Edit Classroom"
        description="Update classroom information"
        icon={<Edit className="w-6 h-6 text-green-600" />}
      >
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto space-y-4">
            <FormField name="name" label="Classroom Name *" placeholder="Enter classroom name" />
            <FormField name="classCode" label="Class Code" placeholder="Auto-generated if empty" />
            <FormField name="description" label="Description" placeholder="Enter classroom description" />

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assigned Teacher *</label>
              <select
                {...register('teacherId')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                disabled={isLoadingTeachers}
              >
                <option value="">{isLoadingTeachers ? 'Loading teachers...' : 'Select a teacher'}</option>
                {teachersData?.data.data.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} - {t.email}
                  </option>
                ))}
              </select>
              {errors.teacherId && <p className="text-red-500 text-sm mt-1">{errors.teacherId.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="maxStudents" label="Max Students" type="number" placeholder="30" />
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="flex items-center h-12">
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-700">Active</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAddStudentModalOpen(true)}
                >
                  Add Students
                </Button>
                <div className="flex justify-end space-x-3">
                  <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                  <Button type="submit" isLoading={updateMutation.isPending}>
                    <span>Save Changes</span>
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal>
      <AddStudentToClassModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        classroom={classroom}
      />
    </>
  );
};

export default EditClassroomModal;
