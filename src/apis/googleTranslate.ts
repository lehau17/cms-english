import axiosInstance from "../config/axiosConfig";

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslateResponse {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslateWithAudioResponse extends TranslateResponse {
  audioContent: string; // Base64 encoded audio
  audioLanguage: string;
}

export interface TextToSpeechRequest {
  text: string;
  languageCode?: string;
  voiceName?: string;
}

export interface TextToSpeechResponse {
  audioContent: string; // Base64 encoded audio
  languageCode: string;
  text: string;
}

export interface LanguageDetectionResponse {
  language: string;
  confidence: number;
}

export interface SupportedLanguage {
  code: string;
  name: string;
}

export interface VoiceInfo {
  name: string;
  languageCodes: string[];
  ssmlGender: string;
  naturalSampleRateHertz: number;
}

// Free TTS interfaces
export interface FreeTextToSpeechRequest {
  text: string;
  language?: string;
}

export interface FreeTextToSpeechResponse {
  filePath: string;
  url: string;
}

export interface FreeMultipleLanguagesRequest {
  text: string;
  languages?: string[];
}

export interface FreeMultipleLanguagesResponse {
  [key: string]: string; // language -> url mapping
}

/**
 * Dịch văn bản
 */
export const translateText = async (data: TranslateRequest): Promise<TranslateResponse> => {
  const response = await axiosInstance.post<TranslateResponse>("/client-api/google-translate/translate", data);
  return response.data;
};

/**
 * Dịch văn bản và tạo audio
 */
export const translateWithAudio = async (data: TranslateRequest): Promise<TranslateWithAudioResponse> => {
  const response = await axiosInstance.post<TranslateWithAudioResponse>("/client-api/google-translate/translate-with-audio", data);
  return response.data;
};

/**
 * Chuyển văn bản thành audio
 */
export const textToSpeech = async (data: TextToSpeechRequest): Promise<TextToSpeechResponse> => {
  const response = await axiosInstance.post<TextToSpeechResponse>("/client-api/google-translate/text-to-speech", data);
  return response.data;
};

/**
 * Phát hiện ngôn ngữ
 */
export const detectLanguage = async (text: string): Promise<LanguageDetectionResponse> => {
  const response = await axiosInstance.post<LanguageDetectionResponse>("/client-api/google-translate/detect-language", { text });
  return response.data;
};

/**
 * Lấy danh sách ngôn ngữ được hỗ trợ
 */
export const getSupportedLanguages = async (): Promise<SupportedLanguage[]> => {
  const response = await axiosInstance.get<SupportedLanguage[]>("/client-api/google-translate/supported-languages");
  return response.data;
};

/**
 * Lấy danh sách voices có sẵn
 */
export const getAvailableVoices = async (languageCode?: string): Promise<VoiceInfo[]> => {
  const params = languageCode ? { languageCode } : {};
  const response = await axiosInstance.get<VoiceInfo[]>("/client-api/google-translate/available-voices", { params });
  return response.data;
};

/**
 * Tạo audio URL từ base64 content
 */
export const createAudioUrl = (base64Audio: string): string => {
  const binaryString = atob(base64Audio);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'audio/mp3' });
  return URL.createObjectURL(blob);
};

/**
 * Phát audio từ base64 content
 */
export const playAudioFromBase64 = (base64Audio: string): void => {
  const audioUrl = createAudioUrl(base64Audio);
  const audio = new Audio(audioUrl);
  audio.play().catch(error => {
    console.error('Error playing audio:', error);
  });
};

// Free TTS functions
/**
 * Tạo audio miễn phí từ Google Translate TTS
 */
export const createFreeAudio = async (data: FreeTextToSpeechRequest): Promise<FreeTextToSpeechResponse> => {
  const response = await axiosInstance.post<FreeTextToSpeechResponse>("/client-api/google-translate/free/text-to-speech", data);
  return response.data;
};

/**
 * Tạo audio cho nhiều ngôn ngữ miễn phí
 */
export const createFreeAudioMultipleLanguages = async (data: FreeMultipleLanguagesRequest): Promise<FreeMultipleLanguagesResponse> => {
  const response = await axiosInstance.post<FreeMultipleLanguagesResponse>("/client-api/google-translate/free/text-to-speech-multiple", data);
  return response.data;
};

/**
 * Lấy danh sách ngôn ngữ được hỗ trợ cho free TTS
 */
export const getFreeSupportedLanguages = async (): Promise<SupportedLanguage[]> => {
  const response = await axiosInstance.get<SupportedLanguage[]>("/client-api/google-translate/free/supported-languages");
  return response.data;
};

/**
 * Phát audio từ URL
 */
export const playAudioFromUrl = (audioUrl: string): void => {
  const audio = new Audio(audioUrl);
  audio.play().catch(error => {
    console.error('Error playing audio from URL:', error);
  });
};

/**
 * Tải audio từ URL
 */
export const downloadAudioFromUrl = (audioUrl: string, fileName: string = 'audio.mp3'): void => {
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
