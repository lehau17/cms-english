import { importCoursesFromExcel, ImportCoursesResponse } from '@/apis/course';
import { useDownloadCourseTemplate } from '@/hooks/useCourse';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Download, FileText, RefreshCw, Trash2, Upload, X } from 'lucide-react';
import { LibraryBooks, CheckCircleOutlined, CancelOutlined } from '@mui/icons-material';
import React, { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

interface ImportCoursesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ImportProgress {
    total: number;
    completed: number;
    current: string;
    phase: 'uploading' | 'processing' | 'generating' | 'session_schedules' | 'completed';
}

const ImportCoursesModal: React.FC<ImportCoursesModalProps> = ({ isOpen, onClose }) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [importProgress, setImportProgress] = useState<ImportProgress>({
        total: 0,
        completed: 0,
        current: '',
        phase: 'uploading'
    });
    const [importResults, setImportResults] = useState<ImportCoursesResponse | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();
    const downloadTemplateMutation = useDownloadCourseTemplate();

    // Validate file before adding
    const validateFile = (file: File): string | null => {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const validTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
        ];
        const validExtensions = ['.xlsx', '.xls'];

        if (!validTypes.includes(file.type) && !validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))) {
            return 'File phải là Excel (.xlsx hoặc .xls)';
        }

        if (file.size > maxSize) {
            return `File quá lớn (${(file.size / 1024 / 1024).toFixed(1)}MB). Tối đa 50MB`;
        }

        return null;
    };

    // Import mutation with progress tracking
    const importMutation = useMutation({
        mutationFn: async (files: File[]) => {
            setImportProgress({ total: files.length, completed: 0, current: files[0]?.name || '', phase: 'uploading' });

            const result = await importCoursesFromExcel(files);

            setImportProgress(prev => ({ ...prev, phase: 'processing' }));

            // Simulate progress for better UX
            for (let i = 1; i <= files.length; i++) {
                const isLastFile = i === files.length;

                // First set to generating phase
                setImportProgress(prev => ({
                    ...prev,
                    completed: i,
                    current: files[i - 1]?.name || '',
                    phase: 'generating'
                }));

                if (i < files.length) {
                    await new Promise(resolve => setTimeout(resolve, 600));
                } else {
                    // For the last file, show session schedules phase before completion
                    await new Promise(resolve => setTimeout(resolve, 400));

                    setImportProgress(prev => ({
                        ...prev,
                        phase: 'session_schedules'
                    }));

                    await new Promise(resolve => setTimeout(resolve, 600));

                    setImportProgress(prev => ({
                        ...prev,
                        phase: 'completed'
                    }));
                }
            }

            return result;
        },
        onSuccess: (data) => {
            setImportResults(data);

            const totalCourses = data.results
                .filter(r => r.success)
                .reduce((sum, r) => sum + (r.data?.totalCourses || 0), 0);

            const totalActivities = data.results
                .filter(r => r.success)
                .reduce((sum, r) => sum + r.data?.results?.reduce((actSum, course) => actSum + (course.activities || 0), 0) || 0, 0);

            // Calculate total session schedules if available
            const totalSessionSchedules = data.results
                .filter(r => r.success)
                .reduce((sum, r) => sum + (r.data?.totalSessionSchedules || 0), 0);

            if (data.successfulImports === data.totalFiles) {
                const sessionInfo = totalSessionSchedules > 0 ? ` và ${totalSessionSchedules} lộ trình buổi học` : '';
                toast.success(`🎉 Import thành công! Tạo ${totalCourses} khóa học với ${totalActivities} hoạt động${sessionInfo}`, {
                    duration: 5000
                });
            } else {
                toast.success(`✅ Import ${data.successfulImports}/${data.totalFiles} files thành công!`, {
                    duration: 4000
                });
            }

            queryClient.invalidateQueries({ queryKey: ['courses'] });

            // Show errors with better formatting
            const errors = data.results.filter(r => !r.success);
            if (errors.length > 0) {
                const errorMsg = `❌ ${errors.length} file thất bại:\\n${errors.map(e => `• ${e.fileName}: ${e.error}`).join('\\n')}`;
                toast.error(errorMsg, { duration: 8000 });
            }
        },
        onError: (error: any) => {
            setImportProgress(prev => ({ ...prev, phase: 'completed' }));

            const message = error.response?.data?.message || error.message || 'Import thất bại!';
            const details = error.response?.data?.details;

            toast.error(`❌ ${message}${details ? `\\n${details}` : ''}`, {
                duration: 6000
            });
        }
    });

    // Handle file selection
    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const newFiles: File[] = [];
        const errors: string[] = [];

        Array.from(files).forEach(file => {
            const validationError = validateFile(file);
            if (validationError) {
                errors.push(`${file.name}: ${validationError}`);
                return;
            }

            const isDuplicate = selectedFiles.some(f =>
                f.name === file.name && f.size === file.size
            );

            if (isDuplicate) {
                errors.push(`${file.name}: Đã được chọn`);
                return;
            }

            newFiles.push(file);
        });

        if (errors.length > 0) {
            toast.error(`⚠️ Một số file không hợp lệ:\\n${errors.join('\\n')}`, {
                duration: 6000
            });
        }

        if (newFiles.length > 0) {
            setSelectedFiles(prev => [...prev, ...newFiles]);
            toast.success(`✅ Thêm ${newFiles.length} file thành công`);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const clearAllFiles = () => {
        setSelectedFiles([]);
        setImportResults(null);
    };

    const handleImport = () => {
        if (selectedFiles.length === 0) {
            toast.error('Vui lòng chọn file Excel');
            return;
        }
        importMutation.mutate(selectedFiles);
    };

    const retryImport = () => {
        if (selectedFiles.length > 0) {
            setImportResults(null);
            importMutation.mutate(selectedFiles);
        }
    };

    const handleClose = () => {
        if (!importMutation.isPending) {
            setSelectedFiles([]);
            setImportResults(null);
            setImportProgress({ total: 0, completed: 0, current: '', phase: 'uploading' });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="relative flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div
                    aria-hidden="true"
                    className="fixed inset-0 z-0 transition-opacity bg-gray-900/25 backdrop-blur-sm"
                    onClick={handleClose}
                />

                <div className="relative z-10 inline-block w-full max-w-5xl px-6 py-8 overflow-hidden text-left align-bottom transition-all transform bg-white shadow-xl rounded-2xl sm:my-8 sm:align-middle">
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 mb-6">
                        <h3 className="text-2xl font-bold text-gray-900 flex-1 min-w-0 break-words flex items-center gap-2">
                            <LibraryBooks /> Import khóa học từ Excel
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                                onClick={() => downloadTemplateMutation.mutate()}
                                disabled={downloadTemplateMutation.isPending}
                                className="flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                                title="Download template Excel để import"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {downloadTemplateMutation.isPending ? 'Đang tải...' : 'Mẫu Excel'}
                            </button>
                            <button
                                onClick={handleClose}
                                disabled={importMutation.isPending}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* File Drop Zone */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer mb-6 ${isDragOver
                            ? 'border-blue-500 bg-blue-50 scale-105'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-25'
                            } ${importMutation.isPending ? 'pointer-events-none opacity-50' : ''}`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragOver(false);
                            handleFileSelect(e.dataTransfer.files);
                        }}
                    >
                        <div className="space-y-4">
                            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <Upload className={`w-8 h-8 text-blue-500 ${isDragOver ? 'animate-bounce' : ''}`} />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-700">
                                    {isDragOver ? 'Thả files tại đây!' : 'Kéo thả Excel files hoặc click để chọn'}
                                </p>
                                <p className="text-sm text-gray-500">Hỗ trợ .xlsx, .xls • Tối đa 50MB mỗi file</p>
                                <p className="text-xs text-gray-400 mt-1">Tự động tạo audio cho từ vựng</p>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            multiple
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </div>

                    {/* Selected Files */}
                    {selectedFiles.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-gray-700">
                                    Files đã chọn ({selectedFiles.length})
                                </h4>
                                <button
                                    onClick={clearAllFiles}
                                    disabled={importMutation.isPending}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                                >
                                    <Trash2 className="w-4 h-4 inline mr-1" />
                                    Xóa tất cả
                                </button>
                            </div>

                            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                                {selectedFiles.map((file, index) => (
                                    <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFile(index)}
                                            disabled={importMutation.isPending}
                                            className="text-red-400 hover:text-red-600 p-1 disabled:opacity-50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Import Progress */}
                    {importMutation.isPending && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-center mb-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
                                <span className="font-semibold text-blue-800">
                                    {importProgress.phase === 'uploading' && 'Đang upload files...'}
                                    {importProgress.phase === 'processing' && 'Đang xử lý nội dung...'}
                                    {importProgress.phase === 'generating' && 'Đang tạo audio cho từ vựng...'}
                                    {importProgress.phase === 'session_schedules' && 'Đang tạo lộ trình buổi học...'}
                                    {importProgress.phase === 'completed' && 'Hoàn thành!'}
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${(importProgress.completed / importProgress.total) * 100}%` }}
                                ></div>
                            </div>

                            <div className="text-center">
                                <p className="text-sm text-blue-700 mb-1">
                                    {importProgress.completed}/{importProgress.total} files • {importProgress.current}
                                </p>
                                <p className="text-xs text-blue-600">Có thể mất vài phút cho files lớn...</p>
                            </div>
                        </div>
                    )}

                    {/* Import Results */}
                    {importResults && (
                        <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="flex items-center mb-3">
                                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                <h4 className="font-semibold text-green-800">Kết quả Import</h4>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-3">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{importResults.successfulImports}</p>
                                    <p className="text-sm text-green-700">Files thành công</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-red-600">{importResults.failedImports}</p>
                                    <p className="text-sm text-red-700">Files thất bại</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{importResults.totalFiles}</p>
                                    <p className="text-sm text-blue-700">Tổng files</p>
                                </div>
                            </div>

                            {importResults.results.some(r => r.success) && (
                                <div className="text-sm text-green-700 bg-green-100 rounded-lg p-3">
                                    <p className="font-medium mb-1 flex items-center gap-1"><CheckCircleOutlined fontSize="small" /> Đã tạo thành công:</p>
                                    {importResults.results
                                        .filter(r => r.success)
                                        .map((result, index) => {
                                            const sessionInfo = result.data?.totalSessionSchedules
                                                ? `, ${result.data.totalSessionSchedules} lộ trình buổi học`
                                                : '';
                                            return (
                                                <p key={index} className="ml-4">
                                                    • {result.fileName}: {result.data?.totalCourses || 0} khóa học{sessionInfo}
                                                </p>
                                            );
                                        })}
                                </div>
                            )}

                            {importResults.results.some(r => !r.success) && (
                                <div className="text-sm text-red-700 bg-red-100 rounded-lg p-3 mt-3">
                                    <p className="font-medium mb-1 flex items-center gap-1"><CancelOutlined fontSize="small" /> Lỗi:</p>
                                    {importResults.results
                                        .filter(r => !r.success)
                                        .map((result, index) => (
                                            <p key={index} className="ml-4">
                                                • {result.fileName}: {result.error}
                                            </p>
                                        ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3">
                        {importResults && importResults.failedImports > 0 && (
                            <button
                                onClick={retryImport}
                                disabled={importMutation.isPending}
                                className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className="w-4 h-4 inline mr-2" />
                                Thử lại
                            </button>
                        )}

                        <button
                            onClick={handleClose}
                            disabled={importMutation.isPending}
                            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
                        >
                            {importMutation.isPending ? 'Đang xử lý...' : 'Đóng'}
                        </button>

                        <button
                            onClick={handleImport}
                            disabled={selectedFiles.length === 0 || importMutation.isPending}
                            className={`px-6 py-2 font-semibold rounded-lg transition-colors ${selectedFiles.length === 0 || importMutation.isPending
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            {importMutation.isPending ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                                    Đang Import...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 inline mr-2" />
                                    Import {selectedFiles.length} File
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportCoursesModal;
