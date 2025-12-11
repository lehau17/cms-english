import { uploadFile } from "@/apis/upload";
import { useMutation } from "@tanstack/react-query";
import { Image, Music, X } from "lucide-react";
import { useRef, useState } from "react";
import {
  FieldValues,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from "react-hook-form";
import toast from "react-hot-toast";

interface UploadFieldProps<TForm extends FieldValues = any> {
  name: string;
  label: string;
  accept: string;
  placeholder: string;
  register: UseFormRegister<TForm>;
  setValue: UseFormSetValue<TForm>;
  watch: UseFormWatch<TForm>;
  type?: 'image' | 'audio';
}

export function UploadField<TForm extends FieldValues = any>({
  name,
  label,
  accept,
  placeholder,
  register,
  setValue,
  watch,
  type = 'image'
}: UploadFieldProps<TForm>) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Watch value - handle both string and object {url, filePath} formats from AI-generated activities
  const rawValue = watch(name as any);

  const currentValue = typeof rawValue === 'object' && (rawValue as any)?.url
    ? (rawValue as any).url
    : (typeof rawValue === 'string' ? rawValue : '');

  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      setValue(name as any, data.data.url as any, { shouldDirty: true, shouldValidate: true });
      toast.success(`${type === 'image' ? 'Image' : 'Audio'} uploaded successfully!`);
    },
    onError: (error) => {
      console.error(`Upload error for ${name}:`, error);
      toast.error(`Failed to upload ${type}`);
    }
  });

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith(type === 'image' ? 'image/' : 'audio/')) {
      uploadMutation.mutate(file);
    } else {
      toast.error(`Please upload a valid ${type} file`);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      <div
        className={`relative border border-dashed rounded p-4 text-center transition-all duration-200 ${uploadMutation.isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          } ${isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          } ${currentValue ? 'bg-gray-50' : 'bg-white'}`}
        onClick={() => {
          if (!currentValue && fileInputRef.current) {
            fileInputRef.current.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          const files = e.dataTransfer.files;
          if (files.length > 0 && files[0]) {
            handleFileSelect(files[0]);
          }
        }}
      >
        {currentValue ? (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              {type === 'image' ? (
                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={currentValue}
                    alt="Uploaded image"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error('Image failed to load:', currentValue);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                      <Image className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full bg-blue-50 rounded-lg p-3">
                  <audio
                    controls
                    className="w-full h-8"
                    src={currentValue}
                    onError={(e) => {
                      console.error('Audio failed to load:', currentValue);
                    }}
                  >
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600 truncate" title={currentValue}>
              {currentValue.split('/').pop() || 'File uploaded'}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setValue(name as any, '' as any, { shouldDirty: true, shouldValidate: true });
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-center">
              {type === 'image' ? (
                <Image className={`w-6 h-6 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
              ) : (
                <Music className={`w-6 h-6 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
              )}
            </div>
            <p className="text-xs text-gray-500">{placeholder}</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleFileSelect(file);
            }
            // Reset input to allow selecting the same file again
            e.target.value = '';
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ pointerEvents: currentValue ? 'none' : 'auto' }}
        />
      </div>
      {uploadMutation.isPending && (
        <div className="text-center">
          <div className="inline-flex items-center text-blue-600 text-xs">
            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
            Uploading...
          </div>
        </div>
      )}
    </div>
  );
}













