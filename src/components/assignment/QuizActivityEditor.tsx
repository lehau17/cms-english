import { DeleteOutline } from '@mui/icons-material';
import {
    Box,
    Button,
    FormControlLabel,
    Grid,
    IconButton,
    Radio,
    TextField,
    Typography
} from '@mui/material';
import { Control, Controller, useFieldArray, UseFormRegister } from 'react-hook-form';
import { AssignmentFormValues } from '../../schemas/assignment.schema';

interface QuizActivityEditorProps {
    activityIndex: number;
    control: Control<AssignmentFormValues>;
    register: UseFormRegister<AssignmentFormValues>;
}

export const QuizActivityEditor: React.FC<QuizActivityEditorProps> = ({
    activityIndex,
    control,
    register,
}) => {
    const basePath = `activities.${activityIndex}` as const;

    const { fields: optionFields, append, remove } = useFieldArray({
        control,
        name: `${basePath}.content.options` as any,
    });

    return (
        <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Quiz Content
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Question"
                        multiline
                        rows={2}
                        {...register(`${basePath}.content.question` as any)}
                        placeholder="Enter your quiz question"
                        size="small"
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                            Answer Options
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => append('')}
                            variant="text"
                        >
                            + Add Option
                        </Button>
                    </Box>

                    {optionFields.map((field, optionIndex) => (
                        <Box key={field.id} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={`Option ${optionIndex + 1}`}
                                {...register(`${basePath}.content.options.${optionIndex}` as any)}
                            />

                            <Controller
                                name={`${basePath}.content.correctIndex` as any}
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
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Explanation (Optional)"
                        multiline
                        rows={2}
                        {...register(`${basePath}.content.explanation` as any)}
                        placeholder="Explain why this is the correct answer"
                        size="small"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

