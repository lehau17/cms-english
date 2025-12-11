import { Add, Delete } from '@mui/icons-material';
import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { Control, Controller, UseFormRegister, UseFormWatch } from 'react-hook-form';
import AudioGenerationOptions from '../../components/AudioGenerationOptions';
import { AssignmentFormValues } from '../../schemas/assignment.schema';

interface TypeSpecificFieldsProps {
  idx: number;
  type: string;
  control?: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  setValue: any;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const TypeSpecificFields: React.FC<TypeSpecificFieldsProps> = ({
  idx,
  type,
  control,
  register,
  setValue,
  watch,
}) => {
  const basePath = `activities.${idx}.content`;
  const val = (name: string) => watch(`${basePath}.${name}` as any);

  // helpers for array fields
  const addTo = (name: string, item: any) => {
    const arr = (val(name) as any[]) || [];
    setValue(`${basePath}.${name}` as any, [...arr, item]);
  };
  const removeAt = (name: string, i: number) => {
    const arr = (val(name) as any[]) || [];
    setValue(
      `${basePath}.${name}` as any,
      arr.filter((_, idx) => idx !== i)
    );
  };

  switch (type) {
    case 'quiz':
    case 'grammar':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Nội dung Quiz
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Các câu hỏi ({((val('questions') as any[]) || []).length} câu)
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() =>
                addTo('questions', {
                  question: '',
                  options: ['', ''],
                  correctIndex: 0,
                  explanation: '',
                })
              }
            >
              Thêm câu hỏi
            </Button>
          </Box>
          {((val('questions') as any[]) || []).map((q, qIndex) => (
            <Paper key={qIndex} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Câu {qIndex + 1}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => removeAt('questions', qIndex)}
                  color="error"
                >
                  <Delete />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Câu hỏi"
                    multiline
                    rows={2}
                    value={q.question}
                    onChange={(e) => {
                      const arr = [...((val('questions') as any[]) || [])];
                      arr[qIndex] = { ...arr[qIndex], question: e.target.value };
                      setValue(`${basePath}.questions` as any, arr);
                    }}
                    placeholder="Nhập câu hỏi..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Giải thích (Tùy chọn)"
                    multiline
                    rows={2}
                    value={q.explanation || ''}
                    onChange={(e) => {
                      const arr = [...((val('questions') as any[]) || [])];
                      arr[qIndex] = { ...arr[qIndex], explanation: e.target.value };
                      setValue(`${basePath}.questions` as any, arr);
                    }}
                    placeholder="Giải thích tại sao đây là câu trả lời đúng..."
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    Các lựa chọn
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {(q.options || []).map((opt: string, optIndex: number) => (
                      <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={opt}
                          onChange={(e) => {
                            const questions = [...((val('questions') as any[]) || [])];
                            const options = [...(questions[qIndex].options || [])];
                            options[optIndex] = e.target.value;
                            questions[qIndex] = { ...questions[qIndex], options };
                            setValue(`${basePath}.questions` as any, questions);
                          }}
                          placeholder={`Lựa chọn ${optIndex + 1}`}
                        />
                        <IconButton
                          size="small"
                          onClick={() => {
                            const questions = [...((val('questions') as any[]) || [])];
                            const options = [...(questions[qIndex].options || [])];
                            options.splice(optIndex, 1);
                            questions[qIndex] = { ...questions[qIndex], options };
                            setValue(`${basePath}.questions` as any, questions);
                          }}
                          color="error"
                          disabled={(q.options || []).length <= 2}
                        >
                          <Delete />
                        </IconButton>
                        {q.correctIndex === optIndex && (
                          <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                            ✓ Đúng
                          </Typography>
                        )}
                      </Box>
                    ))}
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => {
                        const questions = [...((val('questions') as any[]) || [])];
                        const options = [...(questions[qIndex].options || []), ''];
                        questions[qIndex] = { ...questions[qIndex], options };
                        setValue(`${basePath}.questions` as any, questions);
                      }}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Thêm lựa chọn
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Chỉ số đáp án đúng"
                    type="number"
                    inputProps={{ min: 0, max: Math.max(0, (q.options || []).length - 1) }}
                    value={q.correctIndex ?? 0}
                    onChange={(e) => {
                      const questions = [...((val('questions') as any[]) || [])];
                      questions[qIndex] = {
                        ...questions[qIndex],
                        correctIndex: parseInt(e.target.value) || 0,
                      };
                      setValue(`${basePath}.questions` as any, questions);
                    }}
                    helperText={`Chỉ số từ 0 đến ${Math.max(0, (q.options || []).length - 1)}`}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          {((val('questions') as any[]) || []).length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography color="text.secondary">
                Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
              </Typography>
            </Box>
          )}
        </Paper>
      );

    case 'reading':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Nội dung Đọc hiểu
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Đoạn văn (Tùy chọn)"
                multiline
                rows={5}
                {...register(`${basePath}.passage` as any)}
                placeholder="Nhập đoạn văn..."
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Các câu hỏi
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() =>
                    addTo('questions', {
                      question: '',
                      options: ['', ''],
                      correctIndex: 0,
                    })
                  }
                >
                  Thêm câu hỏi
                </Button>
              </Box>
              {((val('questions') as any[]) || []).map((q, qIndex) => (
                <Paper key={qIndex} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Question {qIndex + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeAt('questions', qIndex)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Question Text"
                        value={q.question}
                        onChange={(e) => {
                          const arr = [...((val('questions') as any[]) || [])];
                          arr[qIndex] = { ...arr[qIndex], question: e.target.value };
                          setValue(`${basePath}.questions` as any, arr);
                        }}
                        placeholder="Enter the question..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" gutterBottom>
                        Answer Options
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(q.options || []).map((opt: string, optIndex: number) => (
                          <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={opt}
                              onChange={(e) => {
                                const questions = [...((val('questions') as any[]) || [])];
                                const options = [...(questions[qIndex].options || [])];
                                options[optIndex] = e.target.value;
                                questions[qIndex] = { ...questions[qIndex], options };
                                setValue(`${basePath}.questions` as any, questions);
                              }}
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                const questions = [...((val('questions') as any[]) || [])];
                                const options = [...(questions[qIndex].options || [])];
                                options.splice(optIndex, 1);
                                questions[qIndex] = { ...questions[qIndex], options };
                                setValue(`${basePath}.questions` as any, questions);
                              }}
                              color="error"
                              disabled={(q.options || []).length <= 2}
                            >
                              <Delete />
                            </IconButton>
                            {q.correctIndex === optIndex && (
                              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                ✓ Đúng
                              </Typography>
                            )}
                          </Box>
                        ))}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => {
                            const questions = [...((val('questions') as any[]) || [])];
                            const options = [...(questions[qIndex].options || []), ''];
                            questions[qIndex] = { ...questions[qIndex], options };
                            setValue(`${basePath}.questions` as any, questions);
                          }}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          Thêm lựa chọn
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Correct Answer Index"
                        type="number"

                        value={q.correctIndex}
                        onChange={(e) => {
                          const questions = [...((val('questions') as any[]) || [])];
                          questions[qIndex] = {
                            ...questions[qIndex],
                            correctIndex: parseInt(e.target.value) || 0,
                          };
                          setValue(`${basePath}.questions` as any, questions);
                        }}
                        placeholder="0"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </Paper>
      );

    case 'listening': {
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Nội dung Nghe
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {control ? (
                <Controller
                  name={`${basePath}.audioUrl` as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <AudioGenerationOptions
                      value={field.value}
                      onChange={field.onChange}
                      label="Audio File"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              ) : (
                <AudioGenerationOptions
                  value={val('audioUrl')}
                  onChange={(audioUrl) => setValue(`${basePath}.audioUrl` as any, audioUrl)}
                  label="Audio File"
                  required
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Questions
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() =>
                    addTo('questions', {
                      question: '',
                      options: ['', ''],
                      correctIndex: 0,
                    })
                  }
                >
                  Add Question
                </Button>
              </Box>
              {((val('questions') as any[]) || []).map((q, qIndex) => (
                <Paper key={qIndex} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" fontWeight={600}>
                      Question {qIndex + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeAt('questions', qIndex)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Question Text"
                        value={q.question}
                        onChange={(e) => {
                          const arr = [...((val('questions') as any[]) || [])];
                          arr[qIndex] = { ...arr[qIndex], question: e.target.value };
                          setValue(`${basePath}.questions` as any, arr);
                        }}
                        placeholder="Enter the question..."
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" gutterBottom>
                        Answer Options
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {(q.options || []).map((opt: string, optIndex: number) => (
                          <Box key={optIndex} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={opt}
                              onChange={(e) => {
                                const questions = [...((val('questions') as any[]) || [])];
                                const options = [...(questions[qIndex].options || [])];
                                options[optIndex] = e.target.value;
                                questions[qIndex] = { ...questions[qIndex], options };
                                setValue(`${basePath}.questions` as any, questions);
                              }}
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            <IconButton
                              size="small"
                              onClick={() => {
                                const questions = [...((val('questions') as any[]) || [])];
                                const options = [...(questions[qIndex].options || [])];
                                options.splice(optIndex, 1);
                                questions[qIndex] = { ...questions[qIndex], options };
                                setValue(`${basePath}.questions` as any, questions);
                              }}
                              color="error"
                              disabled={(q.options || []).length <= 2}
                            >
                              <Delete />
                            </IconButton>
                            {q.correctIndex === optIndex && (
                              <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                ✓ Đúng
                              </Typography>
                            )}
                          </Box>
                        ))}
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<Add />}
                          onClick={() => {
                            const questions = [...((val('questions') as any[]) || [])];
                            const options = [...(questions[qIndex].options || []), ''];
                            questions[qIndex] = { ...questions[qIndex], options };
                            setValue(`${basePath}.questions` as any, questions);
                          }}
                          sx={{ alignSelf: 'flex-start' }}
                        >
                          Thêm lựa chọn
                        </Button>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Correct Answer Index"
                        type="number"
                        inputProps={{ min: 0, max: Math.max(0, (q.options || []).length - 1) }}
                        value={q.correctIndex}
                        onChange={(e) => {
                          const questions = [...((val('questions') as any[]) || [])];
                          questions[qIndex] = {
                            ...questions[qIndex],
                            correctIndex: parseInt(e.target.value) || 0,
                          };
                          setValue(`${basePath}.questions` as any, questions);
                        }}
                        placeholder="0"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
            </Grid>
          </Grid>
        </Paper>
      );
    }

    case 'vocab':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Vocabulary Content
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Vocabulary Items
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => addTo('items', { word: '', definition: '' })}
            >
              Add Word
            </Button>
          </Box>
          {((val('items') as any[]) || []).map((item, i) => (
            <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Word"
                    value={item.word}
                    onChange={(e) => {
                      const arr = [...((val('items') as any[]) || [])];
                      arr[i] = { ...arr[i], word: e.target.value };
                      setValue(`${basePath}.items` as any, arr);
                    }}
                    placeholder="Enter word..."
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Definition"
                    value={item.definition}
                    onChange={(e) => {
                      const arr = [...((val('items') as any[]) || [])];
                      arr[i] = { ...arr[i], definition: e.target.value };
                      setValue(`${basePath}.items` as any, arr);
                    }}
                    placeholder="Enter definition..."
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton
                    onClick={() => removeAt('items', i)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Paper>
      );

    case 'pronunciation':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Pronunciation Content
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Phrases to Practice
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => addTo('phrases', { text: '', sampleUrl: '' })}
            >
              Add Phrase
            </Button>
          </Box>
          {((val('phrases') as any[]) || []).map((phrase, i) => (
            <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Phrase"
                    value={phrase.text}
                    onChange={(e) => {
                      const arr = [...((val('phrases') as any[]) || [])];
                      arr[i] = { ...arr[i], text: e.target.value };
                      setValue(`${basePath}.phrases` as any, arr);
                    }}
                    placeholder="Enter phrase to practice..."
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <AudioGenerationOptions
                    value={phrase.sampleUrl}
                    onChange={(sampleUrl) => {
                      const arr = [...((val('phrases') as any[]) || [])];
                      arr[i] = { ...arr[i], sampleUrl };
                      setValue(`${basePath}.phrases` as any, arr);
                    }}
                    label="Sample Audio (Optional)"
                    required={false}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton
                    onClick={() => removeAt('phrases', i)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Paper>
      );

    case 'speaking':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Speaking Content
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Speaking Prompt"
                multiline
                rows={3}
                {...register(`${basePath}.prompt` as any)}
                placeholder="Enter the speaking prompt..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Seconds"
                type="number"
                inputProps={{ min: 0 }}
                {...register(`${basePath}.minSeconds` as any, {
                  valueAsNumber: true,
                })}
                placeholder="10"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Tips for Students
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {((val('tips') as string[]) || []).map((tip, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={tip}
                      onChange={(e) => {
                        const arr = [...((val('tips') as string[]) || [])];
                        arr[i] = e.target.value;
                        setValue(`${basePath}.tips` as any, arr);
                      }}
                      placeholder={`Tip ${i + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeAt('tips', i)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addTo('tips', '')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Tip
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      );

    case 'writing':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Writing Content
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Writing Prompt"
                multiline
                rows={3}
                {...register(`${basePath}.prompt` as any)}
                placeholder="Enter the writing prompt..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Words"
                type="number"
                inputProps={{ min: 0 }}
                {...register(`${basePath}.minWords` as any, {
                  valueAsNumber: true,
                })}
                placeholder="50"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Grading Rubric
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {((val('rubric') as string[]) || []).map((item, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={item}
                      onChange={(e) => {
                        const arr = [...((val('rubric') as string[]) || [])];
                        arr[i] = e.target.value;
                        setValue(`${basePath}.rubric` as any, arr);
                      }}
                      placeholder={`Rubric item ${i + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeAt('rubric', i)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addTo('rubric', '')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Rubric Item
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      );

    case 'flashcard':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Flashcard Content
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Flashcards
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => addTo('cards', { front: '', back: '' })}
            >
              Add Card
            </Button>
          </Box>
          {((val('cards') as any[]) || []).map((card, i) => (
            <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Front"
                    value={card.front}
                    onChange={(e) => {
                      const arr = [...((val('cards') as any[]) || [])];
                      arr[i] = { ...arr[i], front: e.target.value };
                      setValue(`${basePath}.cards` as any, arr);
                    }}
                    placeholder="Front of card..."
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Back"
                    value={card.back}
                    onChange={(e) => {
                      const arr = [...((val('cards') as any[]) || [])];
                      arr[i] = { ...arr[i], back: e.target.value };
                      setValue(`${basePath}.cards` as any, arr);
                    }}
                    placeholder="Back of card..."
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton
                    onClick={() => removeAt('cards', i)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Paper>
      );

    case 'conversation':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Conversation Content
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Scenario"
                {...register(`${basePath}.scenario` as any)}
                placeholder="Enter the conversation scenario..."
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Initial Dialog
              </Typography>
              {((val('initialDialog') as any[]) || []).map((dialog, i) => (
                <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Role</InputLabel>
                        <Select
                          value={dialog.role}
                          onChange={(e) => {
                            const arr = [...((val('initialDialog') as any[]) || [])];
                            arr[i] = { ...arr[i], role: e.target.value };
                            setValue(`${basePath}.initialDialog` as any, arr);
                          }}
                          label="Role"
                        >
                          <MenuItem value="assistant">Assistant</MenuItem>
                          <MenuItem value="user">User</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={7}>
                      <TextField
                        fullWidth
                        label="Message"
                        value={dialog.text}
                        onChange={(e) => {
                          const arr = [...((val('initialDialog') as any[]) || [])];
                          arr[i] = { ...arr[i], text: e.target.value };
                          setValue(`${basePath}.initialDialog` as any, arr);
                        }}
                        placeholder="Enter message..."
                      />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <IconButton
                        onClick={() => removeAt('initialDialog', i)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() => addTo('initialDialog', { role: 'assistant', text: '' })}
              >
                Add Dialog
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Suggestions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {((val('suggestions') as string[]) || []).map((suggestion, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={suggestion}
                      onChange={(e) => {
                        const arr = [...((val('suggestions') as string[]) || [])];
                        arr[i] = e.target.value;
                        setValue(`${basePath}.suggestions` as any, arr);
                      }}
                      placeholder={`Suggestion ${i + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeAt('suggestions', i)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addTo('suggestions', '')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Suggestion
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      );

    case 'fill_blank':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Fill in the Blank Content
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Passage with Blanks"
                multiline
                rows={4}
                {...register(`${basePath}.passage` as any)}
                placeholder="Enter passage with [____] for blanks..."
                helperText="Use [____] to mark blanks. Each [____] corresponds to one answer in order."
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  Answers (in order)
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    const passage: string = watch(`${basePath}.passage` as any) || '';
                    const count = (passage.match(/\[_{2,}\]/g) || []).length;
                    const arr = Array.from(
                      { length: count },
                      (_, i) => ((val('blanks') as string[]) || [])[i] || ''
                    );
                    setValue(`${basePath}.blanks` as any, arr);
                  }}
                >
                  Sync with Passage
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {((val('blanks') as string[]) || []).map((blank, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={blank}
                      onChange={(e) => {
                        const arr = [...((val('blanks') as string[]) || [])];
                        arr[i] = e.target.value;
                        setValue(`${basePath}.blanks` as any, arr);
                      }}
                      placeholder={`Answer ${i + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeAt('blanks', i)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addTo('blanks', '')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Answer
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      );

    case 'dictation':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Dictation Content
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {control ? (
                <Controller
                  name={`${basePath}.audioUrl` as any}
                  control={control}
                  render={({ field, fieldState }) => (
                    <AudioGenerationOptions
                      value={field.value}
                      onChange={field.onChange}
                      label="Audio File"
                      required
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                    />
                  )}
                />
              ) : (
                <AudioGenerationOptions
                  value={val('audioUrl')}
                  onChange={(audioUrl) => setValue(`${basePath}.audioUrl` as any, audioUrl)}
                  label="Audio File"
                  required
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Words"
                type="number"
                inputProps={{ min: 0 }}
                {...register(`${basePath}.minWords` as any, {
                  valueAsNumber: true,
                })}
                placeholder="0"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Correct Transcript"
                multiline
                rows={4}
                {...register(`${basePath}.transcript` as any)}
                placeholder="Enter the correct transcript..."
              />
            </Grid>
          </Grid>
        </Paper>
      );

    case 'matching':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Matching Content
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" fontWeight={600}>
              Matching Pairs
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Add />}
              onClick={() => addTo('pairs', { left: '', right: '' })}
            >
              Add Pair
            </Button>
          </Box>
          {((val('pairs') as any[]) || []).map((pair, i) => (
            <Paper key={i} sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Left Item"
                    value={pair.left}
                    onChange={(e) => {
                      const arr = [...((val('pairs') as any[]) || [])];
                      arr[i] = { ...arr[i], left: e.target.value };
                      setValue(`${basePath}.pairs` as any, arr);
                    }}
                    placeholder="Left side item..."
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <TextField
                    fullWidth
                    label="Right Item"
                    value={pair.right}
                    onChange={(e) => {
                      const arr = [...((val('pairs') as any[]) || [])];
                      arr[i] = { ...arr[i], right: e.target.value };
                      setValue(`${basePath}.pairs` as any, arr);
                    }}
                    placeholder="Right side item..."
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <IconButton
                    onClick={() => removeAt('pairs', i)}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Paper>
      );

    case 'mini_game':
      return (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Mini Game Content
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Target"
                {...register(`${basePath}.target` as any)}
                placeholder="Enter game target..."
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rounds"
                type="number"
                inputProps={{ min: 1 }}
                {...register(`${basePath}.rounds` as any, {
                  valueAsNumber: true,
                })}
                placeholder="3"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Word Pool
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {((val('pool') as string[]) || []).map((word, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={word}
                      onChange={(e) => {
                        const arr = [...((val('pool') as string[]) || [])];
                        arr[i] = e.target.value;
                        setValue(`${basePath}.pool` as any, arr);
                      }}
                      placeholder={`Word ${i + 1}`}
                    />
                    <IconButton
                      size="small"
                      onClick={() => removeAt('pool', i)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => addTo('pool', '')}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Add Word
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      );

    default:
      return (
        <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
          <Typography variant="body2" color="text.secondary">
            Editor for "{type}" activity is not yet implemented.
            <br />
            You can still create this activity type, but content editing will be limited.
          </Typography>
        </Paper>
      );


  }
};
