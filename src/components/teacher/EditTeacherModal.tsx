import { useTeacher, useUpdateTeacher } from '@/hooks/useTeacher';
import { UserResponse } from '@/interface/user.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
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
    experience?: number;
    highlights: { value: string }[];
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
    experience: yup.number().min(0).max(50).optional(),
    highlights: yup.array().of(yup.object({ value: yup.string().required() })).default([]),
});

const EditTeacherModal: React.FC<EditTeacherModalProps> = ({ isOpen, onClose, teacher }) => {
    const queryClient = useQueryClient();
    const { data: teacherData } = useTeacher(teacher?.id || '');
    const updateTeacherMutation = useUpdateTeacher();

    const methods = useForm<EditTeacherFormValues>({
        resolver: yupResolver(schema),
    });

    const { register, handleSubmit, formState: { errors }, reset, control } = methods;
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'highlights'
    });

    useEffect(() => {
        if (teacherData) {
            const data = teacherData.data as any;
            // Convert highlights array to object array format
            if (data.highlights && Array.isArray(data.highlights)) {
                data.highlights = data.highlights.map((h: string) => ({ value: h }));
            } else {
                data.highlights = [{ value: '' }];
            }
            reset(data);
        }
    }, [teacherData, reset]);


    const onSubmit = (data: EditTeacherFormValues) => {
        // Convert highlights array to string array for API
        const submitData = {
            ...data,
            highlights: data.highlights.map(h => h.value).filter(v => v.trim() !== '')
        };
        if (teacher) {
            updateTeacherMutation.mutate({ id: teacher.id, data: submitData as any }, {
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

                    {/* Experience */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Kinh nghiệm (năm)</label>
                        <input
                            type="number"
                            {...register('experience')}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                                className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors border border-dashed border-green-300"
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
