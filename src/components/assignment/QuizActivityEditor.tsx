import { AddCircleOutline, DeleteOutline, ExpandLess, ExpandMore } from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    FormControlLabel,
    Grid,
    IconButton,
    Radio,
    TextField,
    Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { Control, Controller, useFieldArray, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { AssignmentFormValues } from '../../schemas/assignment.schema';

interface QuizActivityEditorProps {
    activityIndex: number;
    control: Control<AssignmentFormValues>;
    register: UseFormRegister<AssignmentFormValues>;
    watch: UseFormWatch<AssignmentFormValues>;
    setValue: UseFormSetValue<AssignmentFormValues>;
}

interface QuestionItemProps {
    activityIndex: number;
    questionIndex: number;
    control: Control<AssignmentFormValues>;
    register: UseFormRegister<AssignmentFormValues>;
    watch: UseFormWatch<AssignmentFormValues>;
    setValue: UseFormSetValue<AssignmentFormValues>;
    onRemove: () => void;
    canRemove: boolean;
}

const QuestionItem: React.FC<QuestionItemProps> = ({
    activityIndex,
    questionIndex,
    control,
    register,
    watch,
    setValue,
    onRemove,
    canRemove,
}) => {
    const [expanded, setExpanded] = useState(true);
    const basePath = `activities.${activityIndex}.content.questions.${questionIndex}` as const;

    // Watch options to manage add/remove
    const options = watch(`${basePath}.options` as any) || [];

    const handleAddOption = () => {
        const currentOptions = options || [];
        setValue(`${basePath}.options` as any, [...currentOptions, '']);
    };

    const handleRemoveOption = (optionIndex: number) => {
        const currentOptions = [...options];
        currentOptions.splice(optionIndex, 1);
        setValue(`${basePath}.options` as any, currentOptions);

        // Adjust correctIndex if needed
        const correctIndex = watch(`${basePath}.correctIndex` as any);
        if (correctIndex >= optionIndex && correctIndex > 0) {
            setValue(`${basePath}.correctIndex` as any, correctIndex - 1);
        }
    };

    const questionText = watch(`${basePath}.question` as any) || '';

    return (
        <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)} sx={{ mb: 1 }}>
            <AccordionSummary>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                        <Typography variant="subtitle2">
                            Câu {questionIndex + 1}: {questionText.slice(0, 50)}{questionText.length > 50 ? '...' : ''}
                        </Typography>
                    </Box>
                    {canRemove && (
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
                    )}
                </Box>
            </AccordionSummary>
            <AccordionDetails>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Câu hỏi"
                            multiline
                            rows={2}
                            {...register(`${basePath}.question` as any)}
                            placeholder="Nhập câu hỏi"
                            size="small"
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                Các lựa chọn
                            </Typography>
                            <Button size="small" onClick={handleAddOption} startIcon={<AddCircleOutline />}>
                                Thêm lựa chọn
                            </Button>
                        </Box>

                        {options.map((_: any, optionIndex: number) => (
                            <Box key={optionIndex} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder={`Lựa chọn ${optionIndex + 1}`}
                                    {...register(`${basePath}.options.${optionIndex}` as any)}
                                />

                                <Controller
                                    name={`${basePath}.correctIndex` as any}
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
                                            label={<Typography variant="caption">Đúng</Typography>}
                                        />
                                    )}
                                />

                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleRemoveOption(optionIndex)}
                                    disabled={options.length <= 2}
                                >
                                    <DeleteOutline fontSize="small" />
                                </IconButton>
                            </Box>
                        ))}
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Giải thích (Tùy chọn)"
                            multiline
                            rows={2}
                            {...register(`${basePath}.explanation` as any)}
                            placeholder="Giải thích tại sao đây là câu trả lời đúng"
                            size="small"
                        />
                    </Grid>
                </Grid>
            </AccordionDetails>
        </Accordion>
    );
};

export const QuizActivityEditor: React.FC<QuizActivityEditorProps> = ({
    activityIndex,
    control,
    register,
    watch,
    setValue,
}) => {
    const basePath = `activities.${activityIndex}.content.questions` as const;

    const { fields: questionFields, append, remove } = useFieldArray({
        control,
        name: basePath as any,
    });

    const handleAddQuestion = () => {
        append({
            question: '',
            options: ['', ''],
            correctIndex: 0,
            explanation: '',
        });
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Nội dung Quiz ({questionFields.length} câu hỏi)
                </Typography>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AddCircleOutline />}
                    onClick={handleAddQuestion}
                >
                    Thêm câu hỏi
                </Button>
            </Box>

            {questionFields.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography color="text.secondary">
                        Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                    </Typography>
                </Box>
            ) : (
                questionFields.map((field, questionIndex) => (
                    <QuestionItem
                        key={field.id}
                        activityIndex={activityIndex}
                        questionIndex={questionIndex}
                        control={control}
                        register={register}
                        watch={watch}
                        setValue={setValue}
                        onRemove={() => remove(questionIndex)}
                        canRemove={questionFields.length > 1}
                    />
                ))
            )}
        </Box>
    );
};
