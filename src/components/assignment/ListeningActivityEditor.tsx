import { AddCircleOutline, DeleteOutline, ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    FormControlLabel,
    Grid,
    IconButton,
    Radio,
    TextField,
    Typography
} from '@mui/material';
import { Control, Controller, useFieldArray, UseFormRegister, UseFormWatch } from 'react-hook-form';
import AudioGenerationOptions from '../../components/AudioGenerationOptions';
import { AssignmentFormValues } from '../../schemas/assignment.schema';

interface ListeningActivityEditorProps {
    activityIndex: number;
    control: Control<AssignmentFormValues>;
    register: UseFormRegister<AssignmentFormValues>;
    watch: UseFormWatch<AssignmentFormValues>;
}

export const ListeningActivityEditor: React.FC<ListeningActivityEditorProps> = ({
    activityIndex,
    control,
    register,
    watch,
}) => {
    const basePath = `activities.${activityIndex}` as const;

    const { fields: questionFields, append: appendQuestion, remove: removeQuestion } = useFieldArray({
        control,
        name: `${basePath}.content.questions` as any,
    });

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Listening Content
            </Typography>

            <Grid container spacing={3}>
                {/* Audio Upload/Generation */}
                <Grid item xs={12}>
                    <Controller
                        name={`${basePath}.content.audioUrl` as any}
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
                </Grid>

                {/* Instructions */}
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Instructions (Optional)"
                        multiline
                        rows={2}
                        {...register(`${basePath}.content.instructions` as any)}
                        placeholder="Provide instructions for students"
                        size="small"
                    />
                </Grid>

                {/* Questions */}
                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                            Comprehension Questions ({questionFields.length})
                        </Typography>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddCircleOutline />}
                            onClick={() => appendQuestion({
                                id: Date.now(),
                                question: '',
                                options: ['', ''],
                                correctIndex: 0,
                            })}
                        >
                            Add Question
                        </Button>
                    </Box>

                    {questionFields.length === 0 ? (
                        <Alert severity="info">
                            No questions added yet. Click "Add Question" to create comprehension questions.
                        </Alert>
                    ) : (
                        questionFields.map((field, questionIndex) => (
                            <ListeningQuestionItem
                                key={field.id}
                                activityIndex={activityIndex}
                                questionIndex={questionIndex}
                                control={control}
                                register={register}
                                onRemove={() => removeQuestion(questionIndex)}
                            />
                        ))
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

// Separate component for each question
interface ListeningQuestionItemProps {
    activityIndex: number;
    questionIndex: number;
    control: Control<AssignmentFormValues>;
    register: UseFormRegister<AssignmentFormValues>;
    onRemove: () => void;
}

const ListeningQuestionItem: React.FC<ListeningQuestionItemProps> = ({
    activityIndex,
    questionIndex,
    control,
    register,
    onRemove,
}) => {
    const questionPath = `activities.${activityIndex}.content.questions.${questionIndex}` as const;

    const { fields: optionFields, append, remove } = useFieldArray({
        control,
        name: `${questionPath}.options` as any,
    });

    return (
        <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                    <Typography variant="body2" fontWeight={500}>
                        Question #{questionIndex + 1}
                    </Typography>
                    <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                    >
                        <DeleteOutline fontSize="small" />
                    </IconButton>
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Question"
                            {...register(`${questionPath}.question` as any)}
                            placeholder="Enter your question"
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                            Answer Options
                        </Typography>
                        {optionFields.map((field, optionIndex) => (
                            <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder={`Option ${optionIndex + 1}`}
                                    {...register(`${questionPath}.options.${optionIndex}` as any)}
                                />

                                <Controller
                                    name={`${questionPath}.correctIndex` as any}
                                    control={control}
                                    render={({ field: radioField }) => (
                                        <FormControlLabel
                                            control={
                                                <Radio
                                                    checked={radioField.value === optionIndex}
                                                    onChange={() => radioField.onChange(optionIndex)}
                                                    size="small"
                                                />
                                            }
                                            label={<Typography variant="caption">Correct</Typography>}
                                        />
                                    )}
                                />

                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => remove(optionIndex)}
                                    disabled={optionFields.length <= 2}
                                >
                                    <DeleteOutline fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                        <Button
                            size="small"
                            onClick={() => append('')}
                            variant="text"
                            sx={{ mt: 1 }}
                        >
                            + Add Option
                        </Button>
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

