import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { uploadDocument } from '../services/agent.service';

interface DocumentForm {
  title: string;
  content: string;
  type: string;
  source: string;
}

interface UseDocumentUploadReturn {
  form: DocumentForm;
  setForm: React.Dispatch<React.SetStateAction<DocumentForm>>;
  isUploading: boolean;
  handleUpload: () => void;
  resetForm: () => void;
}

const initialForm: DocumentForm = {
  title: '',
  content: '',
  type: 'regulation',
  source: '',
};

export const useDocumentUpload = (): UseDocumentUploadReturn => {
  const [form, setForm] = useState<DocumentForm>(initialForm);

  const uploadMutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      toast.success('Document uploaded successfully!');
      setForm(initialForm);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload document');
    },
  });

  const handleUpload = () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    uploadMutation.mutate({
      title: form.title.trim(),
      content: form.content.trim(),
      documentType: form.type,
      source: form.source.trim() || 'CMS Upload',
    });
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  return {
    form,
    setForm,
    isUploading: uploadMutation.isPending,
    handleUpload,
    resetForm,
  };
};
