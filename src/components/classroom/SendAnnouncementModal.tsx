import { useCreateClassroomAnnouncement } from '@/hooks/useNotification';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertCircle, Bell, Send, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as yup from 'yup';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface SendAnnouncementModalProps {
    isOpen: boolean;
    onClose: () => void;
    classroomId: string;
    classroomName?: string;
}

interface SendAnnouncementFormValues {
    title: string;
    content: string;
}

const schema = yup.object({
    title: yup.string().required('Tiêu đề là bắt buộc').min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
    content: yup.string().required('Nội dung là bắt buộc').min(10, 'Nội dung phải có ít nhất 10 ký tự'),
});

const SendAnnouncementModal: React.FC<SendAnnouncementModalProps> = ({
    isOpen,
    onClose,
    classroomId,
    classroomName,
}) => {
    const mutation = useCreateClassroomAnnouncement();

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SendAnnouncementFormValues>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            content: '',
        },
    });

    // Reset form khi modal đóng hoặc mở
    useEffect(() => {
        if (isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    const onSubmit = async (data: SendAnnouncementFormValues) => {
        try {
            const result = await mutation.mutateAsync({
                classroomId,
                title: data.title,
                content: data.content,
            });

            toast.success(`Thông báo đã được gửi thành công đến ${result.count} học sinh!`);
            reset();
            onClose();
        } catch (error: any) {
            toast.error(
                `Lỗi khi gửi thông báo: ${error?.response?.data?.message || error.message}`
            );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Gửi thông báo lớp học"
            description={classroomName ? `Lớp: ${classroomName}` : ''}
            icon={
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Bell className="h-5 w-5 text-blue-600" />
                </div>
            }
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Info Alert */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Lưu ý:</p>
                            <ul className="list-disc list-inside space-y-1 text-blue-700">
                                <li>Thông báo sẽ được gửi đến <strong>tất cả học sinh</strong> đang hoạt động trong lớp</li>
                                <li>Học sinh sẽ nhận thông báo qua in-app notification</li>
                                <li>Thông báo cũng có thể được gửi qua email nếu được cấu hình</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Title Field */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                        Tiêu đề thông báo <span className="text-red-500">*</span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        {...register('title')}
                        placeholder="Ví dụ: Thông báo nghỉ học, Lịch thi giữa kỳ, ..."
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.title
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-white'
                            }`}
                        disabled={mutation.isPending}
                    />
                    {errors.title && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.title.message}
                        </p>
                    )}
                </div>

                {/* Content Field */}
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                        Nội dung chi tiết <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="content"
                        {...register('content')}
                        rows={6}
                        placeholder="Nhập nội dung thông báo chi tiết..."
                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none ${errors.content
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-white'
                            }`}
                        disabled={mutation.isPending}
                    />
                    {errors.content && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {errors.content.message}
                        </p>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        disabled={mutation.isPending}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Hủy
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={mutation.isPending}
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                        {mutation.isPending ? (
                            <>
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Đang gửi...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Gửi thông báo
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default SendAnnouncementModal;

