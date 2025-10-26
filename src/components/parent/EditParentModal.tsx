import { updateParent } from '@/apis/parent';
import { Parent, UpdateParentData } from '@/interface/parent.interface';
import { Phone, Shield, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface EditParentModalProps {
    isOpen: boolean;
    onClose: () => void;
    parent: Parent;
    onSuccess: () => void;
}

const EditParentModal: React.FC<EditParentModalProps> = ({
    isOpen,
    onClose,
    parent,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<UpdateParentData>({
        firstName: parent.firstName,
        lastName: parent.lastName,
        phoneNumber: parent.phoneNumber || '',
        isActive: parent.isActive,
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.firstName || !formData.lastName) {
            toast.error('Vui lòng điền đầy đủ họ tên');
            return;
        }

        setLoading(true);
        try {
            await updateParent(parent.id, formData);
            toast.success('Cập nhật thông tin thành công');
            onSuccess();
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Lỗi khi cập nhật');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Chỉnh sửa thông tin phụ huynh
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Email (readonly) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={parent.email}
                            readOnly
                            className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                    </div>

                    {/* First Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Họ <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập họ"
                                required
                            />
                        </div>
                    </div>

                    {/* Last Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập tên"
                                required
                            />
                        </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Số điện thoại
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="0123456789"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                    Tài khoản hoạt động
                                </span>
                            </div>
                        </label>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Đang cập nhật...
                                </>
                            ) : (
                                'Cập nhật'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditParentModal;
