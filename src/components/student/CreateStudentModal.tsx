import { useCreateStudent } from '@/hooks/useStudent';
import { Gender } from '@/interface/enum.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { Plus } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateStudentFormValues {
  email: string;
  phone: string;
  displayName: string;
  password: string; // <-- BẮT BUỘC (đã sửa)
  firstName: string;
  lastName: string;
  gender: Gender;
}

// Đồng bộ schema với enum Gender
const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  phone: yup
    .string()
    .matches(/^(0|\+84)\d{9}$/, 'Invalid Vietnamese phone number')
    .required('Phone is required'),
  displayName: yup.string().required('Display name is required'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  gender: yup
    .mixed<Gender>()
    .oneOf([Gender.MALE, Gender.FEMALE])
    .required('Gender is required')
});

const CreateStudentModal: React.FC<CreateStudentModalProps> = ({ isOpen, onClose }) => {
  const createStudentMutation = useCreateStudent();

  const methods = useForm<CreateStudentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      gender: Gender.MALE,
    },
  });

  const { register, handleSubmit } = methods;

  const onSubmit = (data: CreateStudentFormValues) => {
    createStudentMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Student created successfully');
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create student');
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Student"
      description="Add a new student to the system"
      icon={<Plus className="w-6 h-6 text-purple-600" />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="p-4 max-h-[calc(90vh-200px)] overflow-y-auto space-y-3">
          <FormField name="displayName" label="Display Name *" placeholder="John Doe" />
          <FormField name="email" label="Email *" placeholder="student@example.com" />
          <FormField name="password" label="Password *" type="password" placeholder="Enter password" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <FormField name="firstName" label="First Name *" placeholder="John" />
            <FormField name="lastName" label="Last Name *" placeholder="Doe" />
          </div>
          <FormField name="phone" label="Phone *" placeholder="+84901234567" />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Gender</label>
            <select
              {...register('gender')}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
            >
              <option value={Gender.MALE}>Male</option>
              <option value={Gender.FEMALE}>Female</option>
            </select>
          </div>

          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
            <div className="flex justify-end space-x-3">
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
              <Button type="submit" isLoading={createStudentMutation.isPending}>
                <span>Create Student</span>
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default CreateStudentModal;
