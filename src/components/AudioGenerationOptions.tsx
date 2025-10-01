import { CloudUpload, StopCircle, VolumeUp } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useGenerateAudio } from '../hooks/useGenerateAudio';

interface AudioGenerationOptionsProps {
  value?: string;
  onChange: (audioUrl: string) => void;
  label?: string;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

export const AudioGenerationOptions: React.FC<AudioGenerationOptionsProps> = ({
  value,
  onChange,
  label = 'Audio',
  required = false,
  error = false,
  helperText,
}) => {
  const [audioMode, setAudioMode] = useState<'upload' | 'generate'>('upload');
  const [textToSpeak, setTextToSpeak] = useState('');
  const [language, setLanguage] = useState('en');
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const generateAudioMutation = useGenerateAudio();

  const handleAudioModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const mode = event.target.value as 'upload' | 'generate';
    setAudioMode(mode);

    // Clear current value when switching modes
    if (mode === 'generate') {
      onChange('');
    }
  };

  const handleGenerateAudio = async () => {
    if (!textToSpeak.trim()) {
      return;
    }

    try {
      const result = await generateAudioMutation.mutateAsync({
        text: textToSpeak,
        language,
      });

      onChange(result.url);
      setAudioPreview(null); // Reset preview when new audio is generated
    } catch (error) {
      console.error('Failed to generate audio:', error);
    }
  };

  const handlePlayPreview = () => {
    if (!value) return;

    if (audioPreview && !audioPreview.paused) {
      audioPreview.pause();
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(value);
    audio.onended = () => setIsPlaying(false);
    audio.onloadstart = () => setIsPlaying(true);
    audio.onerror = () => {
      setIsPlaying(false);
      console.error('Error playing audio');
    };

    setAudioPreview(audio);
    audio.play();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a URL for the uploaded file
    const fileUrl = URL.createObjectURL(file);
    onChange(fileUrl);
    setAudioPreview(null); // Reset preview
  };

  return (
    <Box>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" required={required}>
          {label}
        </FormLabel>

        <RadioGroup
          value={audioMode}
          onChange={handleAudioModeChange}
          row
          sx={{ mb: 2 }}
        >
          <FormControlLabel value="upload" control={<Radio />} label="Upload File" />
          <FormControlLabel value="generate" control={<Radio />} label="Generate Audio" />
        </RadioGroup>

        {audioMode === 'upload' && (
          <Box>
            <input
              accept="audio/*"
              style={{ display: 'none' }}
              id="audio-upload-button"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="audio-upload-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 1 }}
              >
                Choose Audio File
              </Button>
            </label>
          </Box>
        )}

        {audioMode === 'generate' && (
          <Stack spacing={2}>
            <TextField
              label="Text to speak"
              multiline
              rows={3}
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              placeholder="Enter the text you want to convert to speech..."
              fullWidth
              required
            />

            <FormControl>
              <FormLabel>Language</FormLabel>
              <RadioGroup
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                row
              >
                <FormControlLabel value="en" control={<Radio />} label="English" />
                <FormControlLabel value="vi" control={<Radio />} label="Vietnamese" />
              </RadioGroup>
            </FormControl>

            <Button
              variant="contained"
              onClick={handleGenerateAudio}
              disabled={!textToSpeak.trim() || generateAudioMutation.isPending}
              startIcon={generateAudioMutation.isPending ? <CircularProgress size={20} /> : <VolumeUp />}
            >
              {generateAudioMutation.isPending ? 'Generating...' : 'Generate Audio'}
            </Button>
          </Stack>
        )}

        {/* Audio Preview */}
        {value && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="success" sx={{ mb: 1 }}>
              Audio ready!
            </Alert>
            <Button
              variant="outlined"
              size="small"
              onClick={handlePlayPreview}
              startIcon={isPlaying ? <StopCircle /> : <VolumeUp />}
            >
              {isPlaying ? 'Stop' : 'Preview'}
            </Button>
          </Box>
        )}

        {error && helperText && (
          <Typography variant="caption" color="error" sx={{ mt: 1 }}>
            {helperText}
          </Typography>
        )}
      </FormControl>
    </Box>
  );
};

export default AudioGenerationOptions;
