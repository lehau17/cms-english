import { resetStudentPassword } from '@/apis/student';
import { useStudent } from '@/hooks/useStudent';
import { Student } from '@/interface/student.interface';
import { BarChart3, Calendar, Eye, Key } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Modal from '../ui/Modal';

interface ViewStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
}

const ViewStudentModal: React.FC<ViewStudentModalProps> = ({ isOpen, onClose, student }) => {
    const { data: studentData, isLoading } = useStudent(student?.id || '');
    const navigate = useNavigate();
    const [isResettingPassword, setIsResettingPassword] = useState(false);
    const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    const handleViewSchedule = () => {
        if (student?.id) {
            navigate(`/students/${student.id}/schedule`);
            onClose(); // Close modal before navigating
        }
    };

    const handleViewAnalytics = () => {
        if (student?.id) {
            navigate(`/students/${student.id}/analytics`);
            onClose(); // Close modal before navigating
        }
    };

    const handleResetPassword = async () => {
        if (!student?.id) return;
        if (!newPassword || newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setIsResettingPassword(true);
        try {
            await resetStudentPassword(student.id, newPassword);
            toast.success('Password reset successfully');
            setShowResetPasswordForm(false);
            setNewPassword('');
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsResettingPassword(false);
        }
    };

    const getStudentDisplayName = (student: Student | null): string => {
        if (!student) return 'N/A';
        if (student.username) return student.username;
        if (student.firstName && student.lastName) {
            return `${student.firstName} ${student.lastName}`.trim();
        }
        if (student.firstName) return student.firstName;
        if (student.lastName) return student.lastName;
        return student.email || 'N/A';
    };

    const renderDetail = (label: string, value: any) => (
        <div className="py-1.5 sm:grid sm:grid-cols-3 sm:gap-3">
            <dt className="text-xs font-medium text-gray-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{value || 'N/A'}</dd>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Student Details"
            description={`Viewing details for ${getStudentDisplayName(student)}`}
            icon={<Eye className="w-6 h-6 text-blue-600" />}
        >
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : studentData ? (
                <>
                    {/* Avatar Display */}
                    {studentData.data.avatarUrl && (
                        <div className="flex justify-center mb-4">
                            <img
                                src={studentData.data.avatarUrl}
                                alt={studentData.data.username}
                                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                                onError={(e) => {
                                    e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(studentData.data.username) + '&background=3b82f6&color=fff';
                                }}
                            />
                        </div>
                    )}

                    <dl>
                        {renderDetail('Username', studentData.data.username)}
                        {renderDetail('First Name', studentData.data.firstName)}
                        {renderDetail('Last Name', studentData.data.lastName)}
                        {renderDetail('Email', studentData.data.email)}
                        {renderDetail('Phone', studentData.data.phone)}
                        {renderDetail('Gender', studentData.data.gender)}
                        {renderDetail('Status', studentData.data.status)}
                        {renderDetail('Role', studentData.data.role)}
                        {renderDetail('Created At', new Date(studentData.data.createdAt).toLocaleString())}
                        {renderDetail('Updated At', new Date(studentData.data.updatedAt).toLocaleString())}
                    </dl>

                    {/* Action Buttons */}
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                        <button
                            onClick={handleViewSchedule}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Calendar className="w-5 h-5" />
                            <span>View Schedule</span>
                        </button>
                        <button
                            onClick={handleViewAnalytics}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <BarChart3 className="w-5 h-5" />
                            <span>View Analytics</span>
                        </button>
                        {!showResetPasswordForm ? (
                            <button
                                onClick={() => setShowResetPasswordForm(true)}
                                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <Key className="w-5 h-5" />
                                <span>Reset Password</span>
                            </button>
                        ) : (
                            <div className="space-y-2">
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password (min 6 characters)"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                />
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleResetPassword}
                                        disabled={isResettingPassword || !newPassword || newPassword.length < 6}
                                        className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isResettingPassword ? (
                                            <span>Resetting...</span>
                                        ) : (
                                            <>
                                                <Key className="w-4 h-4" />
                                                <span>Confirm Reset</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowResetPasswordForm(false);
                                            setNewPassword('');
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <p>Could not load student details.</p>
            )}
        </Modal>
    );
};

export default ViewStudentModal;
