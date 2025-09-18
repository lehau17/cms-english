import { useCreateTeacher } from '@/hooks/useTeacher';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Gender = 'male' | 'female';

export interface CreateTeacherFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  displayName: string;
  gender: Gender
}

const schema: yup.ObjectSchema<CreateTeacherFormValues> = yup
  .object({
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    phone: yup.string().required('Phone number is required'),
    displayName: yup.string().required('Display name is required'),
    gender: yup
      .mixed<Gender>()
      .oneOf(['male', 'female'], 'Invalid gender')
      .required('Gender is required'),
  })
  .required();

const CreateTeacherModal: React.FC<CreateTeacherModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const createTeacherMutation = useCreateTeacher();

  const methods = useForm<CreateTeacherFormValues>({
    resolver: yupResolver<CreateTeacherFormValues, any, any>(schema),
    defaultValues: {
      gender: 'male',
    },
  });

  const { register, handleSubmit, formState: { errors } } = methods;

  const onSubmit = (data: CreateTeacherFormValues) => {
    createTeacherMutation.mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teachers'] });
        onClose();
      },
      onError: (error: any) => {
        console.error("Error creating teacher:", error);
        toast.error(error.response?.data?.message || 'Failed to create teacher');
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Teacher"
      description="Add a new teacher to the system"
      icon={<Plus className="w-6 h-6 text-purple-600" />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-h-[calc(90vh-200px)] overflow-y-auto space-y-3">
          <FormField name="email" label="Email *" placeholder="teacher@example.com" />
          <FormField name="password" label="Password" type="password" placeholder="Enter password" />
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
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>
            )}
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={createTeacherMutation.isPending}>
                <span>Create Teacher</span>
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default CreateTeacherModal;
