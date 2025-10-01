import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../config/axiosConfig';
import type { ApiResponse } from '../interface/base-response.interface';

interface AudioGenerationRequest {
  text: string;
  language?: string;
}

interface AudioGenerationResponse {
  url: string;
}

export const useGenerateAudio = () => {
  return useMutation({
    mutationFn: async ({ text, language = 'en' }: AudioGenerationRequest) => {
      const result = await api.post<ApiResponse<AudioGenerationResponse>>(
        '/public/v1/google-translate/free/text-to-speech',
        { text, language }
      );
      return result.data.data;
    },
    onSuccess: (data) => {
      toast.success('Audio generated successfully');
    },
    onError: (error: any) => {
      console.error('Audio generation error:', error);
      toast.error(error?.response?.data?.message || 'Failed to generate audio');
    },
  });
};
