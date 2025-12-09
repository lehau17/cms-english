import { Student } from '@/interface/student.interface';
import { Mail, Phone, Calendar, User, Shield, Key } from 'lucide-react';
import React, { useState } from 'react';
import { resetStudentPassword } from '@/apis/student';
import { toast } from 'react-hot-toast';

interface StudentProfileViewProps {
    student: Student;
}

const StudentProfileView: React.FC<StudentProfileViewProps> = ({ student }) => {
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleResetPassword = async () => {
        if (!student?.id) return;
        if (!newPassword || newPassword.length < 6) {
            toast.error('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setIsResettingPassword(true);
        try {
            await resetStudentPassword(student.id, newPassword);
            toast.success('Đặt lại mật khẩu thành công');
            setShowResetPasswordForm(false);
            setNewPassword('');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Đặt lại mật khẩu thất bại');
        } finally {
            setIsResettingPassword(false);
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header / Basic Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <img
                        src={student.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.username)}&background=3b82f6&color=fff`}
                        alt={student.username}
                        className="w-24 h-24 rounded-full object-cover border-4 border-blue-50"
                    />
                    <div className="text-center md:text-left flex-1">
                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {student.firstName && student.lastName
                                    ? `${student.firstName} ${student.lastName}`
                                    : student.username}
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${student.status === 'active' ? 'bg-green-100 text-green-700' :
                                    student.status === 'inactive' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {student.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {student.email}
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {student.phone || 'Chưa cập nhật'}
                            </div>
                            <div className="flex items-center gap-1">
                                <Shield className="w-4 h-4" />
                                {student.role}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Details Card */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        Thông tin chi tiết
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-50 pb-3 last:border-0">
                            <span className="text-gray-500">Tên đăng nhập</span>
                            <span className="col-span-2 font-medium text-gray-900">{student.username}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-50 pb-3 last:border-0">
                            <span className="text-gray-500">Họ và tên</span>
                            <span className="col-span-2 font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-50 pb-3 last:border-0">
                            <span className="text-gray-500">Giới tính</span>
                            <span className="col-span-2 font-medium text-gray-900">{student.gender}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-50 pb-3 last:border-0">
                            <span className="text-gray-500">Ngày tham gia</span>
                            <span className="col-span-2 font-medium text-gray-900">{formatDate(student.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm border-b border-gray-50 pb-3 last:border-0">
                            <span className="text-gray-500">Cập nhật cuối</span>
                            <span className="col-span-2 font-medium text-gray-900">{formatDate(student.updatedAt)}</span>
                        </div>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 h-fit">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Key className="w-5 h-5 text-indigo-600" />
                        Bảo mật tài khoản
                    </h3>

                    {!showResetPasswordForm ? (
                        <button
                            onClick={() => setShowResetPasswordForm(true)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-3 rounded-xl font-medium transition-all shadow-sm hover:shadow"
                        >
                            <Key className="w-5 h-5" />
                            Đặt lại mật khẩu
                        </button>
                    ) : (
                        <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Tối thiểu 6 ký tự"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleResetPassword}
                                    disabled={isResettingPassword || !newPassword || newPassword.length < 6}
                                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isResettingPassword ? 'Đang xử lý...' : 'Xác nhận'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowResetPasswordForm(false);
                                        setNewPassword('');
                                    }}
                                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfileView;
