import {
  detectLanguage,
  getSupportedLanguages,
  playAudioFromBase64,
  textToSpeech,
  translateText,
  translateWithAudio,
  type SupportedLanguage
} from '@/apis/googleTranslate';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Languages, Loader2, Play, Volume2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const GoogleTranslateDemo: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<SupportedLanguage[]>([]);
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');

  // Load supported languages on component mount
  React.useEffect(() => {
    const loadLanguages = async () => {
      try {
        const languages = await getSupportedLanguages();
        setSupportedLanguages(languages);
      } catch (error) {
        console.error('Failed to load languages:', error);
        toast.error('Failed to load supported languages');
      }
    };
    loadLanguages();
  }, []);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translateText({
        text: inputText,
        targetLanguage,
        sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      });

      setTranslatedText(result.translatedText);
      setDetectedLanguage(result.sourceLanguage);

      toast.success('Translation completed!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTranslateWithAudio = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setIsTranslating(true);
    setIsGeneratingAudio(true);
    try {
      const result = await translateWithAudio({
        text: inputText,
        targetLanguage,
        sourceLanguage: sourceLanguage === 'auto' ? undefined : sourceLanguage,
      });

      setTranslatedText(result.translatedText);
      setDetectedLanguage(result.sourceLanguage);

      // Play the generated audio
      playAudioFromBase64(result.audioContent);

      toast.success('Translation with audio completed!');
    } catch (error) {
      console.error('Translation with audio error:', error);
      toast.error('Translation with audio failed');
    } finally {
      setIsTranslating(false);
      setIsGeneratingAudio(false);
    }
  };

  const handleTextToSpeech = async () => {
    if (!translatedText.trim()) {
      toast.error('Please translate text first');
      return;
    }

    setIsGeneratingAudio(true);
    try {
      const result = await textToSpeech({
        text: translatedText,
        languageCode: targetLanguage,
      });

      playAudioFromBase64(result.audioContent);
      toast.success('Audio generated!');
    } catch (error) {
      console.error('Text-to-speech error:', error);
      toast.error('Audio generation failed');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleDetectLanguage = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to detect language');
      return;
    }

    try {
      const result = await detectLanguage(inputText);
      setDetectedLanguage(result.language);
      toast.success(`Detected language: ${result.language} (${Math.round(result.confidence * 100)}% confidence)`);
    } catch (error) {
      console.error('Language detection error:', error);
      toast.error('Language detection failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-6 h-6" />
            Google Translate API Demo
          </CardTitle>
          <CardDescription>
            Test Google Translate API với tính năng dịch văn bản và tạo audio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="input-text">Input Text</Label>
              <Textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text to translate..."
                rows={4}
                className="mt-1"
              />
            </div>

            {/* Language Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Source Language</Label>
                <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto Detect</SelectItem>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Target Language</Label>
                <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name} ({lang.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleDetectLanguage}
                variant="outline"
                disabled={!inputText.trim()}
              >
                Detect Language
              </Button>

              <Button
                onClick={handleTranslate}
                disabled={!inputText.trim() || isTranslating}
              >
                {isTranslating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4 mr-2" />
                )}
                Translate
              </Button>

              <Button
                onClick={handleTranslateWithAudio}
                disabled={!inputText.trim() || isTranslating}
              >
                {isTranslating || isGeneratingAudio ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-2" />
                )}
                Translate + Audio
              </Button>
            </div>
          </div>

          {/* Results Section */}
          {(translatedText || detectedLanguage) && (
            <div className="space-y-4 border-t pt-6">
              {detectedLanguage && (
                <div>
                  <Label>Detected Language</Label>
                  <p className="mt-1 text-sm text-gray-600">
                    {detectedLanguage === 'auto' ? 'Auto detected' : detectedLanguage}
                  </p>
                </div>
              )}

              {translatedText && (
                <div>
                  <Label>Translated Text</Label>
                  <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-800">{translatedText}</p>
                    <Button
                      onClick={handleTextToSpeech}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      disabled={isGeneratingAudio}
                    >
                      {isGeneratingAudio ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Play Audio
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p><strong>POST</strong> /client-api/google-translate/translate - Dịch văn bản</p>
            <p><strong>POST</strong> /client-api/google-translate/translate-with-audio - Dịch + tạo audio</p>
            <p><strong>POST</strong> /client-api/google-translate/text-to-speech - Chỉ tạo audio</p>
            <p><strong>POST</strong> /client-api/google-translate/detect-language - Phát hiện ngôn ngữ</p>
            <p><strong>GET</strong> /client-api/google-translate/supported-languages - Danh sách ngôn ngữ</p>
            <p><strong>GET</strong> /client-api/google-translate/available-voices - Danh sách voices</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleTranslateDemo;
