
import { Classroom } from '@/interface/classroom.interface';
import { Calendar, CheckCircle, Eye, User, Users, X } from 'lucide-react';
import React from 'react';
import Button from '../ui/Button';

interface ViewClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
}

const ViewClassroomModal: React.FC<ViewClassroomModalProps> = ({ isOpen, onClose, classroom }) => {
    const formatDate = (dateString: string | Date | null | undefined): string => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      };

  if (!isOpen || !classroom) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center p-3 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Eye className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Classroom Details</h3>
                <p className="text-xs text-gray-600">View classroom information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-white hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg">
              <h4 className="text-xl font-semibold mb-1">{classroom.name}</h4>
              <p className="text-indigo-100 mb-3 text-sm">{classroom.description}</p>
              <div className="inline-flex items-center bg-white/20 px-2.5 py-1 rounded-full text-xs font-medium">
                <Calendar className="w-4 h-4 mr-1.5" />
                Code: {classroom.classCode}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-3">
                  <User className="w-4 h-4 text-gray-600 mr-2" />
                  <h5 className="text-sm font-semibold text-gray-800">Teacher Information</h5>
                </div>
                <p className="text-gray-700 text-sm font-medium">
                  {classroom.teacher?.firstName} {classroom.teacher?.lastName}
                </p>
                <p className="text-xs text-gray-500">{classroom.teacher?.email}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-3">
                  <Users className="w-4 h-4 text-gray-600 mr-2" />
                  <h5 className="text-sm font-semibold text-gray-800">Enrollment</h5>
                </div>
                <p className="text-xl font-semibold text-gray-800">
                  {classroom.students?.length || 0}
                  <span className="text-xs font-normal text-gray-500">
                    / {classroom.maxStudents}
                  </span>
                </p>
                <p className="text-xs text-gray-500">Students enrolled</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-4 h-4 text-gray-600 mr-2" />
                  <h5 className="text-sm font-semibold text-gray-800">Status</h5>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${classroom.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {classroom.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-3">
                  <Calendar className="w-4 h-4 text-gray-600 mr-2" />
                  <h5 className="text-sm font-semibold text-gray-800">Created Date</h5>
                </div>
                <p className="text-sm text-gray-700">{formatDate(classroom.createdAt)}</p>
              </div>
            </div>

            {classroom.students && classroom.students.length > 0 && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center mb-3">
                  <Users className="w-4 h-4 text-gray-600 mr-2" />
                  <h5 className="text-sm font-semibold text-gray-800">Students</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {classroom.students.map((student, index) => (
                    <div key={index} className="flex items-center p-2 bg-white rounded">
                      <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center mr-2.5">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <Button variant='secondary' onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewClassroomModal;
