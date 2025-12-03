import { useStudent, useUpdateStudent } from '@/hooks/useStudent';
import { Student } from '@/interface/student.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { Edit } from 'lucide-react';
import React, { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import ImageUpload from '../forms/ImageUpload';
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
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  gender?: 'male' | 'female';
}

const schema = yup.object({
  email: yup.string().email('Invalid email'),
  phone: yup.string().matches(/^(0|\+84)\d{9}$/, 'Invalid Vietnamese phone number'),
  displayName: yup.string(),
  firstName: yup.string(),
  lastName: yup.string(),
  avatarUrl: yup
    .string()
    .test('is-url', 'Invalid URL format', (value) => {
      if (!value || value === '') return true; // Allow empty
      try {
        new URL(value); // Check if valid URL (allows http://localhost)
        return true;
      } catch {
        return false;
      }
    }),
  gender: yup.string().oneOf(['male', 'female']),
});

const EditStudentModal: React.FC<EditStudentModalProps> = ({ isOpen, onClose, student }) => {
  const queryClient = useQueryClient();
  const { data: studentData } = useStudent(student?.id || '');
  const updateStudentMutation = useUpdateStudent();

  const methods = useForm<EditStudentFormValues>({
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, formState: { errors }, reset, control } = methods;

  useEffect(() => {
    if (studentData?.data) {
      // Only populate editable fields - username removed, use displayName directly
      const editableData = {
        email: studentData.data.email,
        phone: studentData.data.phone,
        displayName: studentData.data.displayName || '',
        firstName: studentData.data.firstName,
        lastName: studentData.data.lastName,
        avatarUrl: studentData.data.avatarUrl,
        gender: studentData.data.gender as 'male' | 'female',
      };
      reset(editableData);
    }
  }, [studentData, reset]);

  const onSubmit = (data: EditStudentFormValues) => {
    if (student) {
      // Filter out empty/undefined values
      const updatePayload: Record<string, any> = {};
      Object.entries(data).forEach(([key, value]) => {
        // Only include non-empty values
        if (value !== undefined && value !== '' && value !== null) {
          updatePayload[key] = value;
        }
      });

      updateStudentMutation.mutate({ id: student.id, data: updatePayload }, {
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

  const getStudentDisplayName = (student: Student | null): string => {
    if (!student) return 'student';
    if (student.displayName) return student.displayName;
    if (student.firstName && student.lastName) {
      return `${student.firstName} ${student.lastName}`.trim();
    }
    if (student.firstName) return student.firstName;
    if (student.lastName) return student.lastName;
    return student.email || 'student';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Student"
      description={`Update ${getStudentDisplayName(student)}'s information`}
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

          <FormField name="displayName" label="Display Name" placeholder="John Doe" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="firstName" label="First Name" placeholder="Nguyen" />
            <FormField name="lastName" label="Last Name" placeholder="Van A" />
          </div>
          <FormField name="email" label="Email" placeholder="student@example.com" />
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
