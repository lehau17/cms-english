import { useCreateTeacher } from '@/hooks/useTeacher';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
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
    gender: Gender;
    experience?: number;
    highlights: { value: string }[];
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
        experience: yup.number().min(0).max(50).optional(),
        highlights: yup.array().of(yup.object({ value: yup.string().required() })).default([]),
    })
    .required();

const CreateTeacherModal: React.FC<CreateTeacherModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const createTeacherMutation = useCreateTeacher();

    const methods = useForm<CreateTeacherFormValues>({
        resolver: yupResolver<CreateTeacherFormValues, any, any>(schema),
        defaultValues: {
            gender: 'male',
            experience: undefined,
            highlights: [{ value: '' }],
        },
    });

    const { register, handleSubmit, formState: { errors }, control } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'highlights'
    });

    const onSubmit = (data: CreateTeacherFormValues) => {
        // Convert highlights array to string array for API
        const submitData = {
            ...data,
            highlights: data.highlights.map(h => h.value).filter(v => v.trim() !== '')
        };
        console.log('Create Teacher Data:', submitData);
        createTeacherMutation.mutate(submitData as any, {
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

                    {/* Experience */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Kinh nghiệm (năm)</label>
                        <input
                            type="number"
                            {...register('experience')}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                            placeholder="Nhập số năm kinh nghiệm"
                            min="0"
                            max="50"
                        />
                        {errors.experience && (
                            <p className="mt-1 text-xs text-red-500">{errors.experience.message}</p>
                        )}
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Điểm nổi bật</label>
                        <div className="space-y-2">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-2 items-center">
                                    <input
                                        {...register(`highlights.${index}.value`)}
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                        placeholder={`Điểm nổi bật ${index + 1}`}
                                    />
                                    {fields.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => remove(index)}
                                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => append({ value: '' })}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors border border-dashed border-purple-300"
                            >
                                <Plus className="h-4 w-4" />
                                Thêm điểm nổi bật
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Nhấn nút + để thêm điểm nổi bật mới</p>
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
