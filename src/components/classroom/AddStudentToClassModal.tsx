import axiosInstance from '@/config/axiosConfig';
import { useAddStudentsToClassroom } from '@/hooks/useClassroom';
import { useStudents } from '@/hooks/useStudent';
import { Classroom } from '@/interface/classroom.interface';
import { Student } from '@/interface/student.interface';
import { AlertCircle, CheckCircle, Download, FileSpreadsheet, Search, Upload, UserPlus, Users, X } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

interface AddStudentToClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
}

const AddStudentToClassModal: React.FC<AddStudentToClassModalProps> = ({ isOpen, onClose, classroom }) => {
  const { data: studentsData, isLoading, refetch } = useStudents({ limit: 1000 });
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const addStudentsMutation = useAddStudentsToClassroom();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedStudentIds([]);
      setSearchQuery('');
      setActiveTab('manual');
      setImportResult(null);
    }
  }, [isOpen]);

  const students = studentsData?.data?.data || [];

  // Filter students based on search query
  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;

    return students.filter((student: Student) =>
      student.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [students, searchQuery]); const handleSelectStudent = (studentId: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s: Student) => s.id));
    }
  };

  const handleAddStudents = async () => {
    if (classroom && selectedStudentIds.length > 0) {
      try {
        await addStudentsMutation.mutateAsync({
          classroomId: classroom.id,
          studentIds: selectedStudentIds
        });
        toast.success(`Added ${selectedStudentIds.length} students successfully`);
        onClose();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to add students');
      }
    }
  };

  const handleImportFromExcel = async (file: File) => {
    if (!classroom) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(
        `/private/v1/classrooms/${classroom.id}/import-students`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setImportResult(response.data.data);
      toast.success('Students imported successfully!');
      refetch(); // Refresh student list
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.message || 'Failed to import students');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];

      if (validTypes.includes(file.type)) {
        handleImportFromExcel(file);
      } else {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
      }
    }
  };

  const downloadTemplate = () => {
    // Create a simple CSV template for now
    const csvContent = 'username,email,firstName,lastName,password\nexample_student,student@example.com,John,Doe,password123\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3" style={{ display: isOpen ? 'flex' : 'none' }}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 id="modal-title" className="text-xl font-semibold text-gray-800">Add Students to Classroom</h3>
              <p id="modal-desc" className="text-sm text-gray-600">{`Add students to ${classroom?.name}`}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-white hover:text-gray-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body with Custom Styles */}
        <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="p-6">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'manual'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <UserPlus className="w-4 h-4" />
                Select Students
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${activeTab === 'import'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
                  }`}
              >
                <Upload className="w-4 h-4" />
                Import from Excel
              </button>
            </div>

            {activeTab === 'manual' ? (
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search students by name, username, or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
                  </span>
                  <span>
                    {selectedStudentIds.length} selected
                  </span>
                </div>

                {/* Student Table */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                                onChange={handleSelectAll}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                                Select All
                              </span>
                            </div>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Student Info
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Username
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8">
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                <span className="ml-2 text-gray-600">Loading students...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredStudents.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-8">
                              <div className="flex flex-col items-center">
                                <Users className="w-12 h-12 text-gray-300 mb-2" />
                                <span className="text-gray-600">
                                  {searchQuery ? 'No students found matching your search' : 'No students available'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredStudents.map((student: Student) => (
                            <tr
                              key={student.id}
                              className={`hover:bg-gray-50 ${selectedStudentIds.includes(student.id) ? 'bg-blue-50' : ''}`}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedStudentIds.includes(student.id)}
                                    onChange={() => handleSelectStudent(student.id)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-8 w-8">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                                      <span className="text-xs font-medium text-white">
                                        {student.username?.[0]?.toUpperCase() || 'U'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">
                                      {student.username}
                                    </p>
                                    <p className="text-xs text-gray-500">Student</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-900 font-mono">{student.username}</span>
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-sm text-gray-600">{student.email}</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {selectedStudentIds.length > 0 && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <Button type="button" variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleAddStudents}
                      isLoading={addStudentsMutation.isPending}
                      disabled={selectedStudentIds.length === 0}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add {selectedStudentIds.length} Student{selectedStudentIds.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Import Section */}
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <FileSpreadsheet className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Students from Excel</h3>
                  <p className="text-gray-600 mb-6">
                    Upload an Excel file with student information to add multiple students at once
                  </p>
                </div>

                {/* Template Download */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-blue-800 mb-1">Template Required</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        Download our template to ensure your data is formatted correctly
                      </p>
                      <button
                        onClick={downloadTemplate}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download Template
                      </button>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-700">
                      Drop your Excel file here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-500">Supports .xlsx and .xls files</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Import Progress */}
                {isImporting && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-600 mr-3"></div>
                      <span className="text-yellow-800 font-medium">Importing students...</span>
                    </div>
                  </div>
                )}

                {/* Import Result */}
                {importResult && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-green-800 mb-1">Import Successful!</h4>
                        <div className="text-sm text-green-700 space-y-1">
                          <p>✅ {importResult.successful || 0} students imported successfully</p>
                          {importResult.failed > 0 && (
                            <p>❌ {importResult.failed} students failed to import</p>
                          )}
                          {importResult.duplicates > 0 && (
                            <p>⚠️ {importResult.duplicates} duplicates skipped</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="button" variant="secondary" onClick={onClose}>
                    {importResult ? 'Done' : 'Cancel'}
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentToClassModal;
