import { useStudents } from '@/hooks/useStudent';
import { useAddStudentsToClassroom } from '@/hooks/useClassroom';
import { Student } from '@/interface/student.interface';
import { Classroom } from '@/interface/classroom.interface';
import { UserPlus } from 'lucide-react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface AddStudentToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
}

const AddStudentToClassModal: React.FC<AddStudentToClassModalProps> = ({ isOpen, onClose, classroom }) => {
  const { data: studentsData, isLoading } = useStudents({ limit: 1000 }); // Fetch all students
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const addStudentsMutation = useAddStudentsToClassroom();

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddStudents = () => {
    if (classroom && selectedStudentIds.length > 0) {
      addStudentsMutation.mutate({ classroomId: classroom.id, studentIds: selectedStudentIds }, {
        onSuccess: () => {
          toast.success('Students added successfully');
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to add students');
        }
      });
    }
  };

  const students = studentsData?.data.data || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Students to Classroom"
      description={`Add students to ${classroom?.name}`}
      icon={<UserPlus className="w-6 h-6 text-blue-600" />}
    >
      <div className="p-6">
        <div className="max-h-96 overflow-y-auto border rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="p-4">
                  <div className="flex items-center">
                    <input id="checkbox-all-search" type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                    <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">Username</th>
                <th scope="col" className="px-6 py-3">Email</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={3} className="text-center p-4">Loading...</td></tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input 
                          id={`checkbox-table-search-${student.id}`}
                          type="checkbox" 
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                        />
                        <label htmlFor={`checkbox-table-search-${student.id}`} className="sr-only">checkbox</label>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{student.username}</td>
                    <td className="px-6 py-4">{student.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="button" onClick={handleAddStudents} isLoading={addStudentsMutation.isPending} disabled={selectedStudentIds.length === 0}>
            <span>Add Selected Students</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddStudentToClassModal;
