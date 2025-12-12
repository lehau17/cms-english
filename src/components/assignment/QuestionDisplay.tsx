import { Box, Chip, Paper, Typography } from '@mui/material';
import React from 'react';

interface QuestionDisplayProps {
  content: any;
  activityType: string;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
  content,
  activityType,
}) => {
  if (!content) {
    return null;
  }

  switch (activityType.toLowerCase()) {
    case 'vocab':
      // Vocabulary activity - show vocabulary list
      if (content?.items && Array.isArray(content.items)) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary" mb={2} fontWeight="bold">
              Danh sách từ vựng:
            </Typography>
            <Box>
              {content.items.map((item: any, index: number) => (
                <Box key={index} mb={3} pb={2} sx={{ borderBottom: index < content.items.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      {item.word}
                    </Typography>
                    {item.pronunciation && (
                      <Typography variant="body2" color="text.secondary">
                        {item.pronunciation}
                      </Typography>
                    )}
                    {item.partOfSpeech && (
                      <Chip
                        label={item.partOfSpeech}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                  {item.translationVi && (
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      <strong>Nghĩa:</strong> {item.translationVi}
                    </Typography>
                  )}
                  {item.definition && (
                    <Typography variant="body2" mb={1}>
                      <strong>Definition:</strong> {item.definition}
                    </Typography>
                  )}
                  {item.examples && Array.isArray(item.examples) && item.examples.length > 0 && (
                    <Box mb={1}>
                      <Typography variant="body2" fontWeight="medium" mb={0.5}>
                        Examples:
                      </Typography>
                      {item.examples.map((example: string, exIndex: number) => (
                        <Typography key={exIndex} variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', ml: 2 }}>
                          • {example}
                        </Typography>
                      ))}
                    </Box>
                  )}
                  {(item.synonyms && Array.isArray(item.synonyms) && item.synonyms.length > 0) && (
                    <Box mb={1}>
                      <Typography variant="body2" fontWeight="medium" mb={0.5}>
                        Synonyms:
                      </Typography>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {item.synonyms.map((syn: string, synIndex: number) => (
                          <Chip key={synIndex} label={syn} size="small" variant="outlined" sx={{ fontSize: '0.7rem' }} />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {item.audioUrl && (
                    <Box mt={1}>
                      <audio controls src={typeof item.audioUrl === 'string' ? item.audioUrl : item.audioUrl.url} style={{ width: '100%', maxWidth: '300px' }} />
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        );
      }
      // Fallback to questions format if items not available
      if (content?.questions && Array.isArray(content.questions)) {
        return (
          <Box>
            {content.questions.map((q: any, index: number) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}
              >
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Câu {index + 1}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {q.question}
                </Typography>
              </Paper>
            ))}
          </Box>
        );
      }
      return null;

    case 'quiz':
    case 'grammar':
      // Multiple questions format
      if (content?.questions && Array.isArray(content.questions)) {
        return (
          <Box>
            {content.questions.map((q: any, index: number) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}
              >
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Câu {index + 1}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {q.question}
                </Typography>
              </Paper>
            ))}
          </Box>
        );
      }
      // Single question format
      if (content?.question) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body1" fontWeight="medium">
              {content.question}
            </Typography>
          </Paper>
        );
      }
      return null;

    case 'listening':
      // Show main audio if available
      if (content?.audioUrl) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary" mb={1.5} fontWeight="bold">
              Bài nghe:
            </Typography>
            <Box mb={2}>
              <audio controls src={content.audioUrl} style={{ width: '100%' }} />
            </Box>
            {content?.questions && Array.isArray(content.questions) && content.questions.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" mb={1} fontWeight="bold">
                  Câu hỏi:
                </Typography>
                {content.questions.map((q: any, index: number) => (
                  <Box key={index} mb={1.5}>
                    <Typography variant="body2" fontWeight="medium">
                      Câu {index + 1}: {q.question}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        );
      }
      // Fallback to questions only if no main audio
      if (content?.questions && Array.isArray(content.questions)) {
        return (
          <Box>
            {content.questions.map((q: any, index: number) => (
              <Paper
                key={index}
                variant="outlined"
                sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}
              >
                <Typography variant="body2" color="text.secondary" mb={0.5}>
                  Câu {index + 1}
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {q.question}
                </Typography>
                {q.audioUrl && (
                  <Box mt={1}>
                    <audio controls src={q.audioUrl} style={{ width: '100%' }} />
                  </Box>
                )}
              </Paper>
            ))}
          </Box>
        );
      }
      return null;

    case 'fill_blank':
      if (content?.text) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body1" fontWeight="medium">
              {content.text}
            </Typography>
            {content.instructions && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {content.instructions}
              </Typography>
            )}
          </Paper>
        );
      }
      return null;

    case 'matching':
      if (content?.pairs && Array.isArray(content.pairs)) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Nối các cặp sau:
            </Typography>
            <Box>
              {content.pairs.map((pair: any, index: number) => (
                <Typography key={index} variant="body2" mb={0.5}>
                  {index + 1}. {pair.left} ↔ {pair.right}
                </Typography>
              ))}
            </Box>
          </Paper>
        );
      } else if (content?.leftItems && content?.rightItems) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Nối các cặp sau:
            </Typography>
            <Box display="flex" gap={4}>
              <Box flex={1}>
                <Typography variant="body2" fontWeight="bold" mb={1}>
                  Cột trái:
                </Typography>
                {content.leftItems.map((item: string, index: number) => (
                  <Typography key={index} variant="body2" mb={0.5}>
                    {index + 1}. {item}
                  </Typography>
                ))}
              </Box>
              <Box flex={1}>
                <Typography variant="body2" fontWeight="bold" mb={1}>
                  Cột phải:
                </Typography>
                {content.rightItems.map((item: string, index: number) => (
                  <Typography key={index} variant="body2" mb={0.5}>
                    {String.fromCharCode(65 + index)}. {item}
                  </Typography>
                ))}
              </Box>
            </Box>
          </Paper>
        );
      }
      return null;

    case 'writing':
      if (content?.prompt) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body1" fontWeight="medium">
              {content.prompt}
            </Typography>
            {content.instructions && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {content.instructions}
              </Typography>
            )}
          </Paper>
        );
      }
      return null;

    case 'speaking':
    case 'pronunciation':
      if (content?.prompt) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body1" fontWeight="medium">
              {content.prompt}
            </Typography>
            {content.instructions && (
              <Typography variant="body2" color="text.secondary" mt={1}>
                {content.instructions}
              </Typography>
            )}
          </Paper>
        );
      }
      if (content?.phrases && Array.isArray(content.phrases)) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Phát âm các cụm từ sau:
            </Typography>
            <Box>
              {content.phrases.map((phrase: any, index: number) => (
                <Typography key={index} variant="body2" mb={0.5}>
                  {index + 1}. {phrase.text || phrase}
                </Typography>
              ))}
            </Box>
          </Paper>
        );
      }
      return null;

    case 'reading':
      if (content?.passage) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary" mb={1} fontWeight="bold">
              Đoạn văn:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.8,
                mb: 2,
              }}
            >
              {content.passage}
            </Typography>
            {content.questions && Array.isArray(content.questions) && content.questions.length > 0 && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" mb={1} fontWeight="bold">
                  Câu hỏi:
                </Typography>
                {content.questions.map((q: any, index: number) => (
                  <Box key={index} mb={1.5}>
                    <Typography variant="body2" fontWeight="medium">
                      Câu {index + 1}: {q.question}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        );
      }
      return null;

    case 'dictation':
      if (content?.instructions) {
        return (
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body1" fontWeight="medium">
              {content.instructions}
            </Typography>
            {content.audioUrl && (
              <Box mt={1}>
                <audio controls src={content.audioUrl} style={{ width: '100%' }} />
              </Box>
            )}
          </Paper>
        );
      }
      return null;

    default:
      return null;
  }
};

export default QuestionDisplay;











