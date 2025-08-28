
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
    <div className="fixed inset-0 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <Eye className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Classroom Details</h3>
                <p className="text-sm text-gray-600">View classroom information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-500 hover:bg-white hover:text-gray-800 transition-all duration-200 shadow-sm"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-160px)] overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl">
              <h4 className="text-2xl font-bold mb-2">{classroom.name}</h4>
              <p className="text-indigo-100 mb-4">{classroom.description}</p>
              <div className="inline-flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                <Calendar className="w-4 h-4 mr-2" />
                Code: {classroom.classCode}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center mb-3">
                  <User className="w-5 h-5 text-gray-600 mr-2" />
                  <h5 className="font-semibold text-gray-800">Teacher Information</h5>
                </div>
                <p className="text-gray-700 font-medium">
                  {classroom.teacher?.firstName} {classroom.teacher?.lastName}
                </p>
                <p className="text-sm text-gray-500">{classroom.teacher?.email}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 text-gray-600 mr-2" />
                  <h5 className="font-semibold text-gray-800">Enrollment</h5>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {classroom.students?.length || 0}
                  <span className="text-sm font-normal text-gray-500">
                    / {classroom.maxStudents}
                  </span>
                </p>
                <p className="text-sm text-gray-500">Students enrolled</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-5 h-5 text-gray-600 mr-2" />
                  <h5 className="font-semibold text-gray-800">Status</h5>
                </div>
                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${classroom.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}>
                  {classroom.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center mb-3">
                  <Calendar className="w-5 h-5 text-gray-600 mr-2" />
                  <h5 className="font-semibold text-gray-800">Created Date</h5>
                </div>
                <p className="text-gray-700">{formatDate(classroom.createdAt)}</p>
              </div>
            </div>

            {classroom.students && classroom.students.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center mb-3">
                  <Users className="w-5 h-5 text-gray-600 mr-2" />
                  <h5 className="font-semibold text-gray-800">Students</h5>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {classroom.students.map((student, index) => (
                    <div key={index} className="flex items-center p-2 bg-white rounded-lg">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{student.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
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
