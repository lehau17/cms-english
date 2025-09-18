import { ImportStudentsResult } from '@/apis/classroom';
import { useImportStudentsFromExcel } from '@/hooks/useClassroom';
import { Classroom } from '@/interface/classroom.interface';
import { AlertCircle, CheckCircle, FileText, Upload, XCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface ImportStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classroom: Classroom | null;
}

const ImportStudentsModal: React.FC<ImportStudentsModalProps> = ({
  isOpen,
  onClose,
  classroom
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportStudentsResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importMutation = useImportStudentsFromExcel();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('Please select a valid Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = () => {
    if (!classroom || !selectedFile) return;

    importMutation.mutate(
      { classroomId: classroom.id, file: selectedFile },
      {
        onSuccess: (response) => {
          setImportResult(response.data);
          toast.success('Students imported successfully!');
        },
        onError: (error: any) => {
          toast.error(error.response?.data?.message || 'Failed to import students');
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResult(null);
    onClose();
  };

  const downloadTemplate = () => {
    // Create a sample Excel template
    const csvContent = "Email,Phone,First Name,Last Name,Display Name,Gender\nstudent1@example.com,0901234567,Nguyen,Van A,Nguyen Van A,male\nstudent2@example.com,0901234568,Tran,Thi B,Tran Thi B,female";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'student_import_template.csv';
    link.click();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Students from Excel"
      description={`Import students to ${classroom?.name}`}
      icon={<Upload className="w-6 h-6 text-blue-600" />}
    >
      <div className="p-4">
        {/* Template Download */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-xs font-medium text-blue-900">Excel Template</h4>
              <p className="text-xs text-blue-700 mt-1">
                Download the template to ensure your data is formatted correctly.
              </p>
              <button
                onClick={downloadTemplate}
                className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Download Template
              </button>
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Excel File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {selectedFile ? selectedFile.name : 'Click to upload Excel file'}
                  </span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                  />
                </label>
                <p className="mt-1 text-xs text-gray-500">
                  XLSX, XLS up to 10MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Import Results */}
        {importResult && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-xs font-medium text-gray-900 mb-2">Import Results</h4>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-semibold text-blue-600">{importResult.totalProcessed}</div>
                <div className="text-xs text-gray-600">Total Processed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-green-600">{importResult.successfullyImported}</div>
                <div className="text-xs text-gray-600">Successfully Imported</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-red-600">{importResult.failedImports}</div>
                <div className="text-xs text-gray-600">Failed</div>
              </div>
            </div>

            {/* Created Students */}
            {importResult.createdStudents.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-green-800 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  New Students Created ({importResult.createdStudents.length})
                </h5>
                <div className="max-h-32 overflow-y-auto">
                  {importResult.createdStudents.map((student, index) => (
                    <div key={index} className="text-xs text-green-700 py-1">
                      {student.firstName} {student.lastName} ({student.email})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Students */}
            {importResult.existingStudents.length > 0 && (
              <div className="mb-4">
                <h5 className="text-xs font-medium text-blue-800 mb-2 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Existing Students Added ({importResult.existingStudents.length})
                </h5>
                <div className="max-h-32 overflow-y-auto">
                  {importResult.existingStudents.map((student, index) => (
                    <div key={index} className="text-xs text-blue-700 py-1">
                      {student.firstName} {student.lastName} ({student.email})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <div>
                <h5 className="text-xs font-medium text-red-800 mb-2 flex items-center">
                  <XCircle className="w-4 h-4 mr-1" />
                  Errors ({importResult.errors.length})
                </h5>
                <div className="max-h-32 overflow-y-auto">
                  {importResult.errors.map((error, index) => (
                    <div key={index} className="text-xs text-red-700 py-1">
                      Row {error.row}: {error.error} ({error.email})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {importResult ? 'Close' : 'Cancel'}
          </Button>
          {!importResult && (
            <Button
              type="button"
              onClick={handleImport}
              isLoading={importMutation.isPending}
              disabled={!selectedFile}
            >
              Import Students
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ImportStudentsModal;
