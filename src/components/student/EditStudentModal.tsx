import { useUpdateStudent, useStudent } from '@/hooks/useStudent';
import { Student } from '@/interface/student.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit } from 'lucide-react';
import React, { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
}

interface EditStudentFormValues {
  email?: string;
  phone?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female';
}

const schema = yup.object({
  email: yup.string().email('Invalid email'),
  phone: yup.string().matches(/^(0|\+84)\d{9}$/, 'Invalid Vietnamese phone number'),
  username: yup.string(),
  password: yup.string().min(6, 'Password must be at least 6 characters'),
  firstName: yup.string(),
  lastName: yup.string(),
  gender: yup.string().oneOf(['male', 'female']),
});

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student }) => {
  const queryClient = useQueryClient();
  const { data: studentData } = useStudent(student?.id || '');
  const updateStudentMutation = useUpdateStudent();

  const methods = useForm<EditStudentFormValues>({
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, formState: { errors }, reset } = methods;

  useEffect(() => {
    if (studentData) {
      reset(studentData.data);
    }
  }, [studentData, reset]);

  const onSubmit = (data: EditStudentFormValues) => {
    if (student) {
      updateStudentMutation.mutate({ id: student.id, data }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['students'] });
          toast.success('Student updated successfully');
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to update student');
        }
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student"
      description={`Update ${student?.username}'s information`}
      icon={<Edit className="w-6 h-6 text-green-600" />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-h-[calc(90vh-200px)] overflow-y-auto space-y-3">
          <FormField name="username" label="Username" placeholder="john.doe" />
          <FormField name="email" label="Email" placeholder="student@example.com" />
          <FormField name="password" label="New Password (optional)" type="password" placeholder="Enter new password" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="firstName" label="First Name" placeholder="John" />
            <FormField name="lastName" label="Last Name" placeholder="Doe" />
          </div>
          <FormField name="phone" label="Phone" placeholder="+84901234567" />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Gender</label>
            <select
              {...register('gender')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={updateStudentMutation.isPending}>
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EditStudentModal;
