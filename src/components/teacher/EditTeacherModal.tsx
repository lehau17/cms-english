import { useTeacher, useUpdateTeacher } from '@/hooks/useTeacher';
import { UserResponse } from '@/interface/user.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { Edit } from 'lucide-react';
import React, { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import ImageUpload from '../forms/ImageUpload';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: UserResponse | null;
}

interface EditTeacherFormValues {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone: string;
  displayName: string;
  avatarUrl?: string;
  gender?: 'MALE' | 'FEMALE';
}

const schema: yup.ObjectSchema<EditTeacherFormValues> = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').optional(),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  phone: yup.string().required('Phone number is required'),
  displayName: yup.string().required('Display name is required'),
  avatarUrl: yup
    .string()
    .test('is-url', 'Invalid URL format', (value) => {
      if (!value || value === '') return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    })
    .optional(),
  gender: yup.string().oneOf(['MALE', 'FEMALE']).optional(),
});

const EditTeacherModal: React.FC<EditTeacherModalProps> = ({ isOpen, onClose, teacher }) => {
  const queryClient = useQueryClient();
  const { data: teacherData } = useTeacher(teacher?.id || '');
  const updateTeacherMutation = useUpdateTeacher();

  const methods = useForm<EditTeacherFormValues>({
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, formState: { errors }, reset, control } = methods;

  useEffect(() => {
    if (teacherData) {
      reset(teacherData.data as any);
    }
  }, [teacherData, reset]);

  const onSubmit = (data: EditTeacherFormValues) => {
    if (teacher) {
      updateTeacherMutation.mutate({ id: teacher.id, data: data as any }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['teachers'] });
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Teacher"
      description={`Update ${teacher?.displayName}'s information`}
      icon={<Edit className="w-6 h-6 text-green-600" />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-h-[calc(90vh-200px)] overflow-y-auto space-y-3">
          {/* Avatar Upload - Centered at top */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Avatar
            </label>
            <Controller
              name="avatarUrl"
              control={control}
              render={({ field }) => (
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={() => field.onChange('')}
                />
              )}
            />
            {errors.avatarUrl && (
              <p className="mt-1 text-sm text-red-600 text-center">
                {errors.avatarUrl.message}
              </p>
            )}
          </div>

          <FormField name="email" label="Email *" placeholder="teacher@example.com" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="firstName" label="First Name *" placeholder="John" />
            <FormField name="lastName" label="Last Name *" placeholder="Doe" />
          </div>
          <FormField name="displayName" label="Display Name *" placeholder="John Doe" />
          <FormField name="phone" label="Phone *" placeholder="+84901234567" />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Gender</label>
            <select
              {...register('gender')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={updateTeacherMutation.isPending}>
                <span>Save Changes</span>
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EditTeacherModal;
