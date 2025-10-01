// Test component để demo chức năng audio generation
// File: src/components/AudioGenerationDemo.tsx

import { Box, Paper, Typography } from '@mui/material';
import React, { useState } from 'react';
import AudioGenerationOptions from './AudioGenerationOptions';

export const AudioGenerationDemo: React.FC = () => {
  const [audioUrl, setAudioUrl] = useState('');

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Audio Generation Demo
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph>
        This demo shows how the audio generation feature works for listening activities.
      </Typography>

      <AudioGenerationOptions
        label="Demo Audio Content"
        value={audioUrl}
        onChange={setAudioUrl}
        required={false}
      />

      {audioUrl && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.main', color: 'white', borderRadius: 1 }}>
          <Typography variant="body2">
            ✅ Audio generated successfully!
          </Typography>
          <Typography variant="caption" display="block">
            URL: {audioUrl.substring(0, 50)}...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default AudioGenerationDemo;
