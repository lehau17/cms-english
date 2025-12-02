import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import React from 'react';

import { getApiBaseUrl, getFileButtonColor, getFileType } from '../../services/agent.service';
import { FileDownload } from '../../types';

interface FileDownloadButtonProps {
  file: FileDownload;
}

export const FileDownloadButton: React.FC<FileDownloadButtonProps> = ({ file }) => {
  const fileType = getFileType(file.filename);
  const colorClass = getFileButtonColor(fileType);

  const getIcon = () => {
    switch (fileType) {
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'pdf':
      case 'word':
        return <FileText className="h-4 w-4" />;
      default:
        return <Download className="h-4 w-4" />;
    }
  };

  return (
    <a
      href={`${getApiBaseUrl()}${file.downloadUrl}`}
      download={file.filename}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium shadow-sm hover:shadow-md text-white ${colorClass}`}
    >
      {getIcon()}
      <span className="truncate max-w-xs">{file.filename}</span>
      {file.recordCount && (
        <span className="text-xs opacity-90 bg-white/20 px-2 py-0.5 rounded">
          {file.recordCount} rows
        </span>
      )}
    </a>
  );
};

// ===================== FILE LIST =====================
interface FileListProps {
  files: FileDownload[];
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
  if (!files || files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file, idx) => (
        <FileDownloadButton key={idx} file={file} />
      ))}
    </div>
  );
};
