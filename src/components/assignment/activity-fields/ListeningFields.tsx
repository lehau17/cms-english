import { createFreeAudio } from '@/apis/googleTranslate';
import { ListeningQuestionsEditor, UploadField } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import {
  type Control,
  Controller,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from 'react-hook-form';
import toast from 'react-hot-toast';

interface ListeningFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  setValue: UseFormSetValue<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const ListeningFields: React.FC<ListeningFieldsProps> = ({
  activityIndex,
  control,
  register,
  setValue,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;
  const [audioMode, setAudioMode] = useState<'upload' | 'text'>('upload');
  const [textInput, setTextInput] = useState('');
  const [language, setLanguage] = useState('en');

  const audioUrl = watch(`${basePath}.audioUrl` as any);

  const generateAudioMutation = useMutation({
    mutationFn: createFreeAudio,
    onSuccess: (data) => {
      setValue(`${basePath}.audioUrl` as any, data.url, { shouldDirty: true, shouldValidate: true });
      toast.success('Audio generated successfully!');
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to generate audio';
      toast.error(errorMessage);
    },
  });

  const handleGenerateAudio = () => {
    if (!textInput.trim()) {
      toast.error('Please enter text to generate audio');
      return;
    }

    generateAudioMutation.mutate({
      text: textInput.trim(),
      language: language,
    });
  };

  const handleModeChange = (_event: React.SyntheticEvent, newValue: 'upload' | 'text') => {
    setAudioMode(newValue);
  };

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'th', name: 'Thai' },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={audioMode} onChange={handleModeChange} aria-label="audio input mode">
            <Tab label="Upload File" value="upload" />
            <Tab label="Text to Audio" value="text" />
          </Tabs>
        </Box>

        {audioMode === 'upload' ? (
          <Controller
            name={`${basePath}.audioUrl` as any}
            control={control}
            render={({ field }) => (
              <UploadField
                name={field.name}
                label="Audio File"
                accept="audio/*"
                placeholder="Drag & drop or click to upload audio"
                register={register}
                setValue={setValue}
                watch={watch}
                type="audio"
              />
            )}
          />
        ) : (
          <div className="space-y-4">
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Text to Convert"
              placeholder="Enter the text you want to convert to audio..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              disabled={generateAudioMutation.isPending}
              helperText={`${textInput.length} characters`}
            />

            <FormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
                disabled={generateAudioMutation.isPending}
              >
                {supportedLanguages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleGenerateAudio}
              disabled={generateAudioMutation.isPending || !textInput.trim()}
              startIcon={generateAudioMutation.isPending ? <CircularProgress size={16} /> : null}
              fullWidth
            >
              {generateAudioMutation.isPending ? 'Generating Audio...' : 'Generate Audio'}
            </Button>

            {generateAudioMutation.isPending && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                <CircularProgress size={16} />
                <Typography variant="body2">Generating audio, please wait...</Typography>
              </Box>
            )}

            {audioUrl && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Generated Audio:
                </Typography>
                <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                  <audio controls className="w-full" src={audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {audioUrl}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => {
                      setValue(`${basePath}.audioUrl` as any, '', { shouldDirty: true, shouldValidate: true });
                      setTextInput('');
                    }}
                    sx={{ mt: 1 }}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
            )}
          </div>
        )}
      </div>
      <ListeningQuestionsEditor
        basePath={`${basePath}.questions`}
        control={control}
        register={register}
        watch={watch}
      />
    </div>
  );
};
