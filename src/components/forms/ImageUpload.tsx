import { Image as ImageIcon, Upload, X } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);

  // Sync previewUrl with value prop
  useEffect(() => {
    setPreviewUrl(value);
  }, [value]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/public/v1/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      const uploadedUrl = data.data.url;

      // Update both local state and parent form
      setPreviewUrl(uploadedUrl);
      onChange(uploadedUrl);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        await uploadFile(files[0]!);
      }
    },
    [disabled, isUploading]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || isUploading) return;

    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      await uploadFile(files[0]);
    }
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
    if (onRemove) {
      onRemove();
    }
    onChange('');
  };

  return (
    <div className="w-full">
      {previewUrl ? (
        // Preview uploaded image
        <div className="relative group">
          <div className="flex justify-center">
            <img
              src={previewUrl}
              alt="Uploaded avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-lg"
              onError={(e) => {
                e.currentTarget.src = 'https://ui-avatars.com/api/?name=Avatar&background=3b82f6&color=fff';
              }}
            />
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-0 right-1/2 translate-x-16 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        // Upload area
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative flex flex-col items-center justify-center
            w-full h-48 border-2 border-dashed rounded-lg
            transition-all duration-200 cursor-pointer
            ${isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />

          <div className="flex flex-col items-center space-y-2 pointer-events-none">
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <div className="p-3 bg-blue-100 rounded-full">
                  {isDragging ? (
                    <Upload className="w-8 h-8 text-blue-600" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-blue-600" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {isDragging ? 'Drop image here' : 'Upload avatar image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag & drop or click to select
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {uploadError && (
        <p className="mt-2 text-sm text-red-600 text-center">{uploadError}</p>
      )}
    </div>
  );
};

export default ImageUpload;
