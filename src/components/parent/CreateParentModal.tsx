import { createParent } from '@/apis/parent';
import { CreateParentData } from '@/interface/parent.interface';
import { Eye, EyeOff, Lock, Mail, Phone, User, X } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CreateParentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateParentModal: React.FC<CreateParentModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<CreateParentData>({
        email: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
        password: '',
        experience: undefined,
        highlights: [],
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setLoading(true);
        try {
            await createParent(formData);
            toast.success('Tạo tài khoản phụ huynh thành công');
            onSuccess();
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                phoneNumber: '',
                password: '',
                experience: undefined,
                highlights: [],
            });
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Lỗi khi tạo tài khoản');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        if (name === 'experience') {
            setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleHighlightsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        const highlights = value.split('\n').filter(item => item.trim() !== '');
        setFormData(prev => ({ ...prev, highlights }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Tạo tài khoản phụ huynh
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
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

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập mật khẩu"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Experience */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kinh nghiệm (năm)
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience || ''}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Nhập số năm kinh nghiệm"
                                min="0"
                                max="50"
                            />
                        </div>
                    </div>

                    {/* Highlights */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Điểm nổi bật
                        </label>
                        <textarea
                            value={formData.highlights?.join('\n') || ''}
                            onChange={handleHighlightsChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Nhập các điểm nổi bật, mỗi điểm một dòng&#10;Ví dụ:&#10;IELTS 8.0&#10;TOEIC 950&#10;Business English"
                            rows={4}
                        />
                        <p className="text-xs text-gray-500 mt-1">Mỗi điểm nổi bật trên một dòng</p>
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
                                    Đang tạo...
                                </>
                            ) : (
                                'Tạo tài khoản'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateParentModal;
