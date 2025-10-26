import { useStudent } from '@/hooks/useStudent';
import { Student } from '@/interface/student.interface';
import { Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';

interface ViewStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
}

const ViewStudentModal: React.FC<ViewStudentModalProps> = ({ isOpen, onClose, student }) => {
    const { data: studentData, isLoading } = useStudent(student?.id || '');
    const navigate = useNavigate();

    const handleViewSchedule = () => {
        if (student?.id) {
            navigate(`/students/${student.id}/schedule`);
            onClose(); // Close modal before navigating
        }
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
            description={`Viewing details for ${student?.username}`}
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
                        {renderDetail('Email', studentData.data.email)}
                        {renderDetail('Phone', studentData.data.phone)}
                        {renderDetail('Gender', studentData.data.gender)}
                        {renderDetail('Status', studentData.data.status)}
                        {renderDetail('Created At', new Date(studentData.data.createdAt).toLocaleString())}
                        {renderDetail('Updated At', new Date(studentData.data.updatedAt).toLocaleString())}
                    </dl>

                    {/* View Schedule Button */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                            onClick={handleViewSchedule}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            <Calendar className="w-5 h-5" />
                            <span>View Schedule</span>
                        </button>
                    </div>
                </>
            ) : (
                <p>Could not load student details.</p>
            )}
        </Modal>
    );
};

export default ViewStudentModal;
