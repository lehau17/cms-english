import { Box, Chip, Typography } from '@mui/material';
import { CheckCircle, XCircle } from 'lucide-react';
import React from 'react';

interface AnswerDisplayProps {
  activityType: string;
  studentAnswer: any;
  content?: any;
  isCorrectAnswer?: boolean;
  correctAnswer?: any; // For comparison
  showCorrectAnswer?: boolean; // Whether to show correct answer highlights
}

const AnswerDisplay: React.FC<AnswerDisplayProps> = ({
  activityType,
  studentAnswer,
  content,
  isCorrectAnswer = false,
  correctAnswer,
  showCorrectAnswer = true, // Default to true for backward compatibility
}) => {
  // For reading and quiz, show even if no answer (to show questions and options)
  const shouldShowWithoutAnswer = ['reading', 'quiz'].includes(activityType.toLowerCase());
  if (!studentAnswer && studentAnswer !== 0 && !shouldShowWithoutAnswer) {
    return <Typography color="text.secondary">Chưa có câu trả lời</Typography>;
  }

  switch (activityType.toLowerCase()) {
    case 'quiz':
      if (content?.questions && Array.isArray(content.questions)) {
        // Multiple questions - show all options
        return (
          <Box>
            {content.questions.map((q: any, index: number) => {
              const userAnswer = studentAnswer?.[index];
              const correctIndex = q.correctIndex;
              // Handle correctAnswer format: {"0": 2, "1": 2} or use correctIndex from question
              const correctAns = correctAnswer
                ? (typeof correctAnswer === 'object' && correctAnswer !== null
                  ? correctAnswer[index] ?? correctAnswer[String(index)]
                  : correctAnswer)
                : correctIndex;
              // Only mark as correct if student actually answered
              const hasAnswer = userAnswer !== null && userAnswer !== undefined;
              const isCorrect = hasAnswer && userAnswer === correctAns;

              return (
                <Box key={index} mb={3}>
                  <Typography variant="body2" fontWeight="bold" mb={1.5}>
                    Câu {index + 1}: {q.question}
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {q.options && q.options.length > 0 ? (
                      <Box>
                        {q.options.map((option: string, optionIndex: number) => {
                          // Only show as selected if student actually answered (and not showing correct answer section)
                          const isSelected = hasAnswer && userAnswer === optionIndex && !isCorrectAnswer;
                          const isCorrectOption = optionIndex === correctAns;
                          // Show correct answer if:
                          // 1. showCorrectAnswer is true AND
                          // 2. It's the correct option AND
                          // 3. Either: (a) showing correct answer section (isCorrectAnswer=true) OR (b) student didn't select this option
                          const showAsCorrect = showCorrectAnswer && isCorrectOption && (isCorrectAnswer || !isSelected);
                          const showAsWrong = isSelected && !isCorrect && !isCorrectAnswer;

                          return (
                            <Box
                              key={optionIndex}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor:
                                  showAsWrong
                                    ? 'error.50'
                                    : showAsCorrect
                                      ? 'success.50'
                                      : isSelected
                                        ? 'primary.50'
                                        : 'transparent',
                                border: `1px solid ${showAsWrong
                                  ? 'error.main'
                                  : showAsCorrect
                                    ? 'success.main'
                                    : isSelected
                                      ? 'primary.main'
                                      : 'grey.300'
                                  }`,
                              }}
                            >
                              {isSelected && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {isCorrect ? (
                                    <CheckCircle size={18} color="success" />
                                  ) : (
                                    <XCircle size={18} color="error" />
                                  )}
                                </Box>
                              )}
                              {showAsCorrect && !isSelected && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CheckCircle size={18} color="success" />
                                </Box>
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  flex: 1,
                                  fontWeight: isSelected || isCorrectOption ? 'medium' : 'normal',
                                }}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </Typography>
                              {isSelected && !isCorrectAnswer && (
                                <Chip
                                  label="Học viên chọn"
                                  size="small"
                                  color={isCorrect ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              )}
                              {showAsCorrect && !isSelected && (
                                <Chip
                                  label="Đáp án đúng"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Học viên chọn: Option {userAnswer}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      } else if (content?.options) {
        // Single question - show all options
        const userAnswer = studentAnswer;
        const correctIndex = content.correctIndex;
        const correctAns = correctAnswer ?? correctIndex;
        const hasAnswer = userAnswer !== null && userAnswer !== undefined;
        const isCorrect = hasAnswer && userAnswer === correctAns;

        return (
          <Box>
            {content.options && content.options.length > 0 ? (
              <Box>
                {content.options.map((option: string, optionIndex: number) => {
                  // Only show as selected if student actually answered
                  const isSelected = hasAnswer && userAnswer === optionIndex;
                  const isCorrectOption = optionIndex === correctAns;
                  // Show correct answer only if showCorrectAnswer is true and (not showing student's answer or student didn't answer)
                  const showAsCorrect = showCorrectAnswer && isCorrectOption && (!isCorrectAnswer || !hasAnswer);
                  const showAsWrong = isSelected && !isCorrect;

                  return (
                    <Box
                      key={optionIndex}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1.5,
                        mb: 1,
                        borderRadius: 1,
                        bgcolor:
                          showAsWrong
                            ? 'error.50'
                            : showAsCorrect
                              ? 'success.50'
                              : isSelected
                                ? 'primary.50'
                                : 'transparent',
                        border: `1px solid ${showAsWrong
                          ? 'error.main'
                          : showAsCorrect
                            ? 'success.main'
                            : isSelected
                              ? 'primary.main'
                              : 'grey.300'
                          }`,
                      }}
                    >
                      {isSelected && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {isCorrect ? (
                            <CheckCircle size={18} color="success" />
                          ) : (
                            <XCircle size={18} color="error" />
                          )}
                        </Box>
                      )}
                      {isCorrectOption && !isSelected && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircle size={18} color="success" />
                        </Box>
                      )}
                      <Typography
                        variant="body2"
                        sx={{
                          flex: 1,
                          fontWeight: isSelected || isCorrectOption ? 'medium' : 'normal',
                        }}
                      >
                        {String.fromCharCode(65 + optionIndex)}. {option}
                      </Typography>
                      {isSelected && !isCorrectAnswer && (
                        <Chip
                          label="Học viên chọn"
                          size="small"
                          color={isCorrect ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                      {showAsCorrect && !isSelected && (
                        <Chip
                          label="Đáp án đúng"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            ) : (
              <Typography>
                Học viên chọn: {content.options?.[userAnswer] || `Option ${userAnswer}`}
              </Typography>
            )}
          </Box>
        );
      }
      return <Typography>{String(studentAnswer)}</Typography>;

    case 'fill_blank':
      if (Array.isArray(studentAnswer)) {
        return (
          <Box>
            {studentAnswer.map((answer: string, index: number) => (
              <Chip
                key={index}
                label={answer || '(trống)'}
                size="small"
                sx={{ mr: 1, mb: 1 }}
                color={isCorrectAnswer ? 'success' : 'default'}
              />
            ))}
          </Box>
        );
      }
      return <Typography>{String(studentAnswer)}</Typography>;

    case 'matching':
      if (typeof studentAnswer === 'object' && studentAnswer !== null) {
        const pairs = content?.pairs || [];
        const leftItems = content?.leftItems || [];
        const rightItems = content?.rightItems || [];

        if (pairs.length > 0) {
          return (
            <Box>
              {pairs.map((pair: any, index: number) => {
                const matchedIndex = studentAnswer[index];
                const matchedRight = rightItems?.[matchedIndex];
                return (
                  <Box key={index} mb={1} display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">{pair.left}</Typography>
                    <Typography>→</Typography>
                    <Chip
                      label={matchedRight || `Index ${matchedIndex}`}
                      size="small"
                      color={isCorrectAnswer ? 'success' : 'default'}
                    />
                  </Box>
                );
              })}
            </Box>
          );
        } else if (leftItems.length > 0) {
          return (
            <Box>
              {leftItems.map((left: string, index: number) => {
                const matchedIndex = studentAnswer[index];
                const matchedRight = rightItems?.[matchedIndex];
                return (
                  <Box key={index} mb={1} display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">{left}</Typography>
                    <Typography>→</Typography>
                    <Chip
                      label={matchedRight || `Index ${matchedIndex}`}
                      size="small"
                      color={isCorrectAnswer ? 'success' : 'default'}
                    />
                  </Box>
                );
              })}
            </Box>
          );
        }
      }
      return <Typography>{JSON.stringify(studentAnswer)}</Typography>;

    case 'listening':
      // Show main audio first if available
      if (content?.audioUrl) {
        return (
          <Box>
            <Box mb={3} p={2} sx={{ bgcolor: 'primary.50', borderRadius: 1, border: '1px solid', borderColor: 'primary.main' }}>
              <Typography variant="body2" fontWeight="bold" mb={1.5} color="primary">
                Bài nghe:
              </Typography>
              <audio controls src={content.audioUrl} style={{ width: '100%' }} />
            </Box>
            {content?.questions && Array.isArray(content.questions) && (
              <Box>
                {content.questions.map((q: any, index: number) => {
                  const userAnswer = studentAnswer?.[index];
                  const correctIndex = q.correctIndex;
                  const correctAns = correctAnswer
                    ? (typeof correctAnswer === 'object' && correctAnswer !== null
                      ? correctAnswer[index] ?? correctAnswer[String(index)]
                      : correctAnswer)
                    : correctIndex;
                  const hasAnswer = userAnswer !== null && userAnswer !== undefined;
                  const isCorrect = hasAnswer && userAnswer === correctAns;

                  return (
                    <Box key={index} mb={3}>
                      <Typography variant="body2" fontWeight="bold" mb={1.5}>
                        Câu {index + 1}: {q.question}
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        {q.options && q.options.length > 0 ? (
                          <Box>
                            {q.options.map((option: string, optionIndex: number) => {
                              const isSelected = hasAnswer && userAnswer === optionIndex;
                              const isCorrectOption = optionIndex === correctAns;
                              const showAsCorrect = showCorrectAnswer && isCorrectOption && (!isCorrectAnswer || !hasAnswer);
                              const showAsWrong = isSelected && !isCorrect;

                              return (
                                <Box
                                  key={optionIndex}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1.5,
                                    mb: 1,
                                    borderRadius: 1,
                                    bgcolor:
                                      showAsWrong
                                        ? 'error.50'
                                        : showAsCorrect
                                          ? 'success.50'
                                          : isSelected
                                            ? 'primary.50'
                                            : 'transparent',
                                    border: `1px solid ${showAsWrong
                                      ? 'error.main'
                                      : showAsCorrect
                                        ? 'success.main'
                                        : isSelected
                                          ? 'primary.main'
                                          : 'grey.300'
                                      }`,
                                  }}
                                >
                                  {isSelected && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      {isCorrect ? (
                                        <CheckCircle size={18} color="success" />
                                      ) : (
                                        <XCircle size={18} color="error" />
                                      )}
                                    </Box>
                                  )}
                                  {isCorrectOption && !isSelected && (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <CheckCircle size={18} color="success" />
                                    </Box>
                                  )}
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      flex: 1,
                                      fontWeight: isSelected || isCorrectOption ? 'medium' : 'normal',
                                    }}
                                  >
                                    {String.fromCharCode(65 + optionIndex)}. {option}
                                  </Typography>
                                  {isSelected && !isCorrectAnswer && (
                                    <Chip
                                      label="Học viên chọn"
                                      size="small"
                                      color={isCorrect ? 'success' : 'error'}
                                      variant="outlined"
                                    />
                                  )}
                                  {showAsCorrect && !isSelected && (
                                    <Chip
                                      label="Đáp án đúng"
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        ) : (
                          <Typography color="text.secondary">
                            Học viên chọn: Option {userAnswer}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>
        );
      }
      // Fallback to questions only if no main audio
      if (content?.questions && Array.isArray(content.questions)) {
        return (
          <Box>
            {content.questions.map((q: any, index: number) => {
              const userAnswer = studentAnswer?.[index];
              const correctIndex = q.correctIndex;
              const correctAns = correctAnswer
                ? (typeof correctAnswer === 'object' && correctAnswer !== null
                  ? correctAnswer[index] ?? correctAnswer[String(index)]
                  : correctAnswer)
                : correctIndex;
              const hasAnswer = userAnswer !== null && userAnswer !== undefined;
              const isCorrect = hasAnswer && userAnswer === correctAns;

              return (
                <Box key={index} mb={3}>
                  <Typography variant="body2" fontWeight="bold" mb={1.5}>
                    Câu {index + 1}: {q.question}
                  </Typography>
                  {q.audioUrl && (
                    <Box mb={1.5}>
                      <audio controls src={q.audioUrl} style={{ width: '100%' }} />
                    </Box>
                  )}
                  <Box sx={{ pl: 2 }}>
                    {q.options && q.options.length > 0 ? (
                      <Box>
                        {q.options.map((option: string, optionIndex: number) => {
                          const isSelected = hasAnswer && userAnswer === optionIndex;
                          const isCorrectOption = optionIndex === correctAns;
                          const showAsCorrect = showCorrectAnswer && isCorrectOption && (!isCorrectAnswer || !hasAnswer);
                          const showAsWrong = isSelected && !isCorrect;

                          return (
                            <Box
                              key={optionIndex}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor:
                                  showAsWrong
                                    ? 'error.50'
                                    : showAsCorrect
                                      ? 'success.50'
                                      : isSelected
                                        ? 'primary.50'
                                        : 'transparent',
                                border: `1px solid ${showAsWrong
                                  ? 'error.main'
                                  : showAsCorrect
                                    ? 'success.main'
                                    : isSelected
                                      ? 'primary.main'
                                      : 'grey.300'
                                  }`,
                              }}
                            >
                              {isSelected && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {isCorrect ? (
                                    <CheckCircle size={18} color="success" />
                                  ) : (
                                    <XCircle size={18} color="error" />
                                  )}
                                </Box>
                              )}
                              {showAsCorrect && !isSelected && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CheckCircle size={18} color="success" />
                                </Box>
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  flex: 1,
                                  fontWeight: isSelected || isCorrectOption ? 'medium' : 'normal',
                                }}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </Typography>
                              {isSelected && !isCorrectAnswer && (
                                <Chip
                                  label="Học viên chọn"
                                  size="small"
                                  color={isCorrect ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              )}
                              {showAsCorrect && !isSelected && (
                                <Chip
                                  label="Đáp án đúng"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Học viên chọn: Option {userAnswer}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      }
      return <Typography color="text.secondary">Chưa có câu trả lời</Typography>;

    case 'speaking':
      if (studentAnswer?.audioUrl) {
        return (
          <Box>
            <audio controls src={studentAnswer.audioUrl} style={{ width: '100%' }} />
            {studentAnswer.transcript && (
              <Typography variant="body2" mt={1} color="text.secondary">
                Transcript: {studentAnswer.transcript}
              </Typography>
            )}
          </Box>
        );
      }
      return <Typography color="text.secondary">Chưa có audio</Typography>;

    case 'writing':
      return (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 1,
          }}
        >
          {typeof studentAnswer === 'string'
            ? studentAnswer
            : studentAnswer?.text || JSON.stringify(studentAnswer)}
        </Typography>
      );

    case 'pronunciation':
      if (typeof studentAnswer === 'object' && studentAnswer !== null) {
        const phrases = content?.phrases || [];
        return (
          <Box>
            {phrases.map((phrase: any, index: number) => {
              const audioUrl = studentAnswer[index];
              if (!audioUrl) return null;
              return (
                <Box key={index} mb={2}>
                  <Typography variant="body2" fontWeight="bold" mb={0.5}>
                    Phrase {index + 1}: {phrase.text || phrase}
                  </Typography>
                  <audio controls src={audioUrl} style={{ width: '100%' }} />
                </Box>
              );
            })}
          </Box>
        );
      }
      return <Typography color="text.secondary">Chưa có audio</Typography>;

    case 'vocab':
    case 'grammar':
      if (content?.questions && Array.isArray(content.questions)) {
        return (
          <Box>
            {content.questions.map((q: any, index: number) => {
              const userAnswer = studentAnswer?.[index];
              const correctIndex = q.correctIndex;
              const correctAns = correctAnswer
                ? (typeof correctAnswer === 'object' && correctAnswer !== null
                  ? correctAnswer[index] ?? correctAnswer[String(index)]
                  : correctAnswer)
                : correctIndex;
              const hasAnswer = userAnswer !== null && userAnswer !== undefined;
              const isCorrect = hasAnswer && userAnswer === correctAns;

              return (
                <Box key={index} mb={3}>
                  <Typography variant="body2" fontWeight="bold" mb={1.5}>
                    Câu {index + 1}: {q.question || ''}
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {q.options && q.options.length > 0 ? (
                      <Box>
                        {q.options.map((option: string, optionIndex: number) => {
                          const isSelected = hasAnswer && userAnswer === optionIndex;
                          const isCorrectOption = optionIndex === correctAns;
                          const showAsCorrect = showCorrectAnswer && isCorrectOption && (!isCorrectAnswer || !hasAnswer);
                          const showAsWrong = isSelected && !isCorrect;

                          return (
                            <Box
                              key={optionIndex}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor:
                                  showAsWrong
                                    ? 'error.50'
                                    : showAsCorrect
                                      ? 'success.50'
                                      : isSelected
                                        ? 'primary.50'
                                        : 'transparent',
                                border: `1px solid ${showAsWrong
                                  ? 'error.main'
                                  : showAsCorrect
                                    ? 'success.main'
                                    : isSelected
                                      ? 'primary.main'
                                      : 'grey.300'
                                  }`,
                              }}
                            >
                              {isSelected && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {isCorrect ? (
                                    <CheckCircle size={18} color="success" />
                                  ) : (
                                    <XCircle size={18} color="error" />
                                  )}
                                </Box>
                              )}
                              {showAsCorrect && !isSelected && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CheckCircle size={18} color="success" />
                                </Box>
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  flex: 1,
                                  fontWeight: isSelected || isCorrectOption ? 'medium' : 'normal',
                                }}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </Typography>
                              {isSelected && !isCorrectAnswer && (
                                <Chip
                                  label="Học viên chọn"
                                  size="small"
                                  color={isCorrect ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              )}
                              {showAsCorrect && !isSelected && (
                                <Chip
                                  label="Đáp án đúng"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Học viên chọn: Option {userAnswer}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      }
      return <Typography>{String(studentAnswer)}</Typography>;

    case 'reading':
      if (content?.questions && Array.isArray(content.questions)) {
        return (
          <Box>
            {content.questions.map((q: any, index: number) => {
              const userAnswer = studentAnswer?.[index];
              const correctIndex = q.correctIndex;
              const correctAns = correctAnswer
                ? (typeof correctAnswer === 'object' && correctAnswer !== null
                  ? correctAnswer[index] ?? correctAnswer[String(index)]
                  : correctAnswer)
                : correctIndex;
              const hasAnswer = userAnswer !== null && userAnswer !== undefined;
              const isCorrect = hasAnswer && userAnswer === correctAns;

              return (
                <Box key={index} mb={3}>
                  <Typography variant="body2" fontWeight="bold" mb={1.5}>
                    Câu {index + 1}: {q.question}
                  </Typography>
                  <Box sx={{ pl: 2 }}>
                    {q.options && q.options.length > 0 ? (
                      <Box>
                        {q.options.map((option: string, optionIndex: number) => {
                          const isSelected = hasAnswer && userAnswer === optionIndex;
                          const isCorrectOption = optionIndex === correctAns;
                          const showAsCorrect = showCorrectAnswer && isCorrectOption && (!isCorrectAnswer || !hasAnswer);
                          const showAsWrong = isSelected && !isCorrect;

                          return (
                            <Box
                              key={optionIndex}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 1.5,
                                mb: 1,
                                borderRadius: 1,
                                bgcolor:
                                  showAsWrong
                                    ? 'error.50'
                                    : showAsCorrect
                                      ? 'success.50'
                                      : isSelected
                                        ? 'primary.50'
                                        : 'transparent',
                                border: `1px solid ${showAsWrong
                                  ? 'error.main'
                                  : showAsCorrect
                                    ? 'success.main'
                                    : isSelected
                                      ? 'primary.main'
                                      : 'grey.300'
                                  }`,
                              }}
                            >
                              {isSelected && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  {isCorrect ? (
                                    <CheckCircle size={18} color="success" />
                                  ) : (
                                    <XCircle size={18} color="error" />
                                  )}
                                </Box>
                              )}
                              {showAsCorrect && !isSelected && (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <CheckCircle size={18} color="success" />
                                </Box>
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  flex: 1,
                                  fontWeight: isSelected || isCorrectOption ? 'medium' : 'normal',
                                }}
                              >
                                {String.fromCharCode(65 + optionIndex)}. {option}
                              </Typography>
                              {isSelected && !isCorrectAnswer && (
                                <Chip
                                  label="Học viên chọn"
                                  size="small"
                                  color={isCorrect ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              )}
                              {showAsCorrect && !isSelected && (
                                <Chip
                                  label="Đáp án đúng"
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography color="text.secondary">
                        Học viên chọn: Option {userAnswer}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        );
      }
      return <Typography color="text.secondary">Chưa có câu trả lời</Typography>;

    case 'dictation':
      return (
        <Typography
          variant="body2"
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            bgcolor: 'grey.50',
            p: 2,
            borderRadius: 1,
          }}
        >
          {String(studentAnswer)}
        </Typography>
      );

    default:
      return (
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'monospace',
            bgcolor: 'grey.50',
            p: 1,
            borderRadius: 1,
          }}
        >
          {JSON.stringify(studentAnswer, null, 2)}
        </Typography>
      );
  }
};

export default AnswerDisplay;







