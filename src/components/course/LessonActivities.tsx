import { uploadFile } from "@/apis/upload";
import { CreateCourseDto } from "@/interface/course.interface";
import { ActivityType, DifficultyLevel } from "@/interface/enums";
import { useMutation } from "@tanstack/react-query";
import { Brain, Image, Music, Plus, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
    type Control,
    type FieldErrors,
    type Path,
    useFieldArray,
    type UseFormRegister,
    type UseFormSetValue,
    type UseFormWatch
} from "react-hook-form";
import toast from "react-hot-toast";
const asPath = (s: string) => s as Path<CreateCourseDto>;


const activityTypes = Object.values(ActivityType).map(type => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1),
    icon: Brain,
    description: `A ${type} activity.`
}));

const difficultyOptions = Object.values(DifficultyLevel).map(level => ({ value: level, label: level.charAt(0).toUpperCase() + level.slice(1), }));

// UploadField component tái sử dụng cho image và audio
function UploadField({
    name,
    label,
    accept,
    placeholder,
    register,
    setValue,
    watch,
    type = 'image'
}: {
    name: string;
    label: string;
    accept: string;
    placeholder: string;
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
    type?: 'image' | 'audio';
}) {
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sử dụng watch với callback để theo dõi giá trị
    const currentValue = watch(name);

    const uploadMutation = useMutation({
        mutationFn: uploadFile,
        onSuccess: (data) => {
            setValue(name, data.data.url, { shouldDirty: true, shouldValidate: true });
            toast.success(`${type === 'image' ? 'Image' : 'Audio'} uploaded successfully!`);
        },
        onError: (error) => {
            console.error(`Upload error for ${name}:`, error);
            toast.error(`Failed to upload ${type}`);
        }
    });

    const handleFileSelect = (file: File) => {
        if (file && file.type.startsWith(type === 'image' ? 'image/' : 'audio/')) {
            uploadMutation.mutate(file);
        } else {
            toast.error(`Please upload a valid ${type} file`);
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">{label}</label>
            <div
                className={`relative border border-dashed rounded p-4 text-center transition-all duration-200 ${uploadMutation.isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                    } ${isDragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    } ${currentValue ? 'bg-gray-50' : 'bg-white'}`}
                onClick={() => {
                    if (!currentValue && fileInputRef.current) {
                        fileInputRef.current.click();
                    }
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    const files = e.dataTransfer.files;
                    if (files.length > 0 && files[0]) {
                        handleFileSelect(files[0]);
                    }
                }}
            >
                {currentValue ? (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center">
                            {type === 'image' ? (
                                <div className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                                    <img
                                        src={currentValue}
                                        alt="Uploaded image"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            console.error('Image failed to load:', currentValue);
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                                            <Image className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-16 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Music className="w-8 h-8 text-blue-600" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-600 truncate" title={currentValue}>
                            {currentValue.split('/').pop() || 'File uploaded'}
                        </p>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setValue(name, '', { shouldDirty: true, shouldValidate: true });
                            }}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-white rounded-full p-1 shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-center">
                            {type === 'image' ? (
                                <Image className={`w-6 h-6 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                            ) : (
                                <Music className={`w-6 h-6 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} />
                            )}
                        </div>
                        <p className="text-xs text-gray-500">{placeholder}</p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                            handleFileSelect(file);
                        }
                        // Reset input để có thể chọn cùng file lần nữa
                        e.target.value = '';
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ pointerEvents: currentValue ? 'none' : 'auto' }}
                />
            </div>
            {uploadMutation.isPending && (
                <div className="text-center">
                    <div className="inline-flex items-center text-blue-600 text-xs">
                        <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                        Uploading...
                    </div>
                </div>
            )}
        </div>
    );
}
const defaultContentByType = (type: ActivityType) => {
    switch (type) {
        case ActivityType.QUIZ:
            return { questions: [{ question: "", options: ["", ""], correctIndex: 0, explanation: "" }] };
        case ActivityType.VOCAB:
            return {
                items: [
                    { word: "", definition: "", examples: [""], imageUrl: "", audioUrl: "" }
                ]
            };
        case ActivityType.LISTENING:
            return {
                audioUrl: "",
                questions: [
                    { question: "", options: ["", ""], correctIndex: 0 }
                ]
            };
        case ActivityType.PRONUNCIATION:
            return { phrase: "", tips: [""], sampleUrl: "" };
        case ActivityType.SPEAKING:
            return { prompt: "", minSeconds: 15, tips: [""] };
        case ActivityType.MINI_GAME:
            return { target: "", pool: [""], rounds: 3 };
        case ActivityType.READING:
            return { passage: "", questions: [{ question: "", options: ["", ""], correctIndex: 0 }] };
        case ActivityType.WRITING:
            return { prompt: "", minWords: 40, rubric: [""] };
        case ActivityType.GRAMMAR:
            return { rule: "", exercises: [{ question: "", options: ["", ""], correctIndex: 0 }] };
        case ActivityType.FLASHCARD:
            return { cards: [{ front: "", back: "", imageUrl: "" }] };
        case ActivityType.CONVERSATION:
            return { scenario: "", initialDialog: [{ role: "assistant", text: "" }], suggestions: [""] };
        case ActivityType.FILL_BLANK:
            return { passage: "", blanks: [""] };
        case ActivityType.DICTATION:
            return { audioUrl: "", transcript: "", minWords: 0 };
        case ActivityType.MATCHING:
            return { pairs: [{ left: "", right: "" }] };
        default:
            return {};
    }
};


function VocabItemsEditor({
    basePath, control, register, setValue, watch
}: {
    basePath: string;
    control: Control<CreateCourseDto>;
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
}) {
    const name = `${basePath}.items`;
    const { fields, append, remove } = useFieldArray({ control, name: name as any });

    return (
        <div className="space-y-3">
            <label className="block text-xs font-medium text-gray-600">Vocabulary Items *</label>

            {fields.map((f, i) => (
                <div key={f.id} className="p-3 border rounded-lg bg-white space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="font-semibold text-sm text-purple-800">Item #{i + 1}</div>
                        <button type="button" onClick={() => remove(i)} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <input
                            {...register(`${name}.${i}.word` as const)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Word *"
                        />
                        <input
                            {...register(`${name}.${i}.definition` as const)}
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Definition *"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                        <UploadField
                            key={`image-${f.id}`}
                            name={`${name}.${i}.imageUrl`}
                            label="Image"
                            accept="image/*"
                            placeholder="Drag & drop or click to upload image"
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            type="image"
                        />
                        <UploadField
                            key={`audio-${f.id}`}
                            name={`${name}.${i}.audioUrl`}
                            label="Audio"
                            accept="audio/*"
                            placeholder="Drag & drop or click to upload audio"
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            type="audio"
                        />
                    </div>

                    {/* examples: string[] */}
                    <StringArrayField
                        name={`${name}.${i}.examples`}
                        control={control}
                        label="Examples"
                        placeholder="Example sentence"
                        register={register}
                    />
                </div>
            ))}

            <button
                type="button"
                onClick={() => append({ word: "", definition: "", examples: [""], imageUrl: "", audioUrl: "" })}
                className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
            >
                + Add vocab item
            </button>
        </div>
    );
}


function StringArrayField({
    name, control, label, placeholder = "Value", register, errors
}: {
    name: string;
    control: Control<CreateCourseDto>;
    label: string;
    placeholder?: string;
    register: UseFormRegister<any>;
    errors?: any;
}) {
    const { fields, append, remove } = useFieldArray({ control, name: name as any });

    // Parse error path để lấy error message
    const getFieldError = (index: number) => {
        const parts = name.split('.');
        let errorObj = errors;
        for (const part of parts) {
            if (errorObj?.[part]) {
                errorObj = errorObj[part];
            } else {
                return null;
            }
        }
        return errorObj?.[index]?.message;
    };

    // Lấy error chung cho toàn bộ array
    const getArrayError = () => {
        const parts = name.split('.');
        let errorObj = errors;
        for (const part of parts) {
            if (errorObj?.[part]) {
                errorObj = errorObj[part];
            } else {
                return null;
            }
        }
        return errorObj?.message || (Array.isArray(errorObj) ? null : errorObj?.message);
    };

    const arrayError = getArrayError();

    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">{label}</label>
            {fields.map((f, i) => {
                const fieldError = getFieldError(i);
                return (
                    <div key={f.id} className="space-y-1">
                        <div className="flex items-center gap-2">
                            <input
                                {...register(`${name}.${i}` as const)}
                                className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 transition-colors ${fieldError
                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                                    }`}
                                placeholder={placeholder}
                            />
                            <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {fieldError && (
                            <p className="text-xs text-red-600">{fieldError}</p>
                        )}
                    </div>
                );
            })}
            {arrayError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
                    {arrayError}
                </p>
            )}
            <button
                type="button"
                onClick={() => append("")}
                className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
            >
                + Add
            </button>
        </div>
    );
}


// ====== Biên tập options + correctIndex cho các dạng trắc nghiệm ======
function OptionsEditor({
    basePath,
    control,
    register,
    showExplanation = false,
}: {
    basePath: string; // ví dụ "lessons.0.activities.1.content"
    control: Control<CreateCourseDto>;
    register: UseFormRegister<any>;
    showExplanation?: boolean;
}) {
    const name = `${basePath}.options`;
    const { fields, append, remove } = useFieldArray({ control, name: name as any });
    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Options *</label>
            <div className="space-y-2">
                {fields.map((f, i) => (
                    <div key={f.id} className="flex items-center gap-2">
                        <input
                            {...register(`${name}.${i}` as const)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={`Option #${i + 1}`}
                        />
                        <label className="text-xs inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded">
                            <input type="radio" value={i} {...register(`${basePath}.correctIndex` as const, { valueAsNumber: true })} />
                            Correct
                        </label>
                        <button type="button" onClick={() => remove(i)} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => append("")}
                    className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
                >
                    + Add option
                </button>
                {showExplanation && (
                    <input
                        {...register(`${basePath}.explanation` as const)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="Explanation (optional)"
                    />
                )}
            </div>
        </div>
    );
}

// ====== Editor cho LISTENING QUESTIONS ======
function ListeningQuestionsEditor({
    basePath,
    control,
    register,
}: {
    basePath: string;
    control: Control<CreateCourseDto>;
    register: UseFormRegister<any>;
}) {
    const { fields, append, remove } = useFieldArray({ control, name: basePath as any });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Questions</label>
                <button
                    type="button"
                    onClick={() => append({ question: "", options: ["", ""], correctIndex: 0 })}
                    className="text-purple-700 border border-purple-300 px-3 py-1 rounded text-sm hover:bg-purple-50"
                >
                    + Add Question
                </button>
            </div>

            {fields.map((field, questionIndex) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-white">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Question #{questionIndex + 1}</h4>
                        <button
                            type="button"
                            onClick={() => remove(questionIndex)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="space-y-3">
                        <input
                            {...register(`${basePath}.${questionIndex}.question` as const)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Enter your question"
                        />

                        <ListeningQuestionOptionsEditor
                            basePath={`${basePath}.${questionIndex}`}
                            control={control}
                            register={register}
                        />
                    </div>
                </div>
            ))}

            {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">No questions added yet</p>
                    <button
                        type="button"
                        onClick={() => append({ question: "", options: ["", ""], correctIndex: 0 })}
                        className="text-purple-700 border border-purple-300 px-4 py-2 rounded hover:bg-purple-50"
                    >
                        Add First Question
                    </button>
                </div>
            )}
        </div>
    );
}

// ====== Editor cho LISTENING QUESTION OPTIONS ======
function ListeningQuestionOptionsEditor({
    basePath,
    control,
    register,
}: {
    basePath: string;
    control: Control<CreateCourseDto>;
    register: UseFormRegister<any>;
}) {
    const optionsName = `${basePath}.options`;
    const { fields, append, remove } = useFieldArray({ control, name: optionsName as any });

    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Answer Options</label>
            <div className="space-y-2">
                {fields.map((field, optionIndex) => (
                    <div key={field.id} className="flex items-center gap-2">
                        <input
                            {...register(`${optionsName}.${optionIndex}` as const)}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder={`Option ${optionIndex + 1}`}
                        />
                        <label className="text-xs inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded whitespace-nowrap">
                            <input
                                type="radio"
                                value={optionIndex}
                                {...register(`${basePath}.correctIndex` as const, { valueAsNumber: true })}
                            />
                            Correct
                        </label>
                        <button
                            type="button"
                            onClick={() => remove(optionIndex)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={() => append("")}
                className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
            >
                + Add Option
            </button>
        </div>
    );
}

// ====== Editor cho FLASHCARD ======
function FlashcardsEditor({
    basePath,
    control,
    register,
    setValue,
    watch,
}: {
    basePath: string;
    control: Control<CreateCourseDto>;
    register: UseFormRegister<any>;
    setValue: UseFormSetValue<any>;
    watch: UseFormWatch<any>;
}) {
    const name = `${basePath}.cards`;
    const { fields, append, remove } = useFieldArray({ control, name: name as any });
    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Cards *</label>
            <div className="space-y-3">
                {fields.map((f, i) => (
                    <div key={f.id} className="grid md:grid-cols-3 gap-2">
                        <input {...register(`${name}.${i}.front` as const)} className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Front *" />
                        <input {...register(`${name}.${i}.back` as const)} className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Back *" />
                        <div className="flex items-center gap-2">
                            <div className="flex-1">
                                <UploadField
                                    key={`flashcard-image-${f.id}`}
                                    name={`${name}.${i}.imageUrl`}
                                    label=""
                                    accept="image/*"
                                    placeholder="Upload image"
                                    register={register}
                                    setValue={setValue}
                                    watch={watch}
                                    type="image"
                                />
                            </div>
                            <button type="button" onClick={() => remove(i)} className="text-red-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <button type="button" onClick={() => append({ front: "", back: "", imageUrl: "" })} className="text-purple-700 border border-purple-300 px-2 py-1 rounded text-xs">
                + Add card
            </button>
        </div>
    );
}

// ====== Form theo từng ActivityType ======
function ActivityContentFields({
    lessonIndex,
    activityIndex,
    control,
    register,
    watch,
    setValue,
    errors,
}: {
    lessonIndex: number;
    activityIndex: number;
    control: Control<CreateCourseDto>;
    register: UseFormRegister<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    errors?: any;
}) {
    const basePath = `lessons.${lessonIndex}.activities.${activityIndex}`;
    const type: ActivityType | undefined = watch(`${basePath}.type` as const);

    // Gán default content khi đổi type
    const prevTypeRef = useRef<ActivityType | undefined>(type);
    useEffect(() => {
        if (!type) return;
        if (prevTypeRef.current !== type) {
            setValue(`${basePath}.content` as const, defaultContentByType(type), { shouldDirty: true, shouldValidate: false });
            prevTypeRef.current = type;
        }
    }, [type, basePath, setValue]);

    if (!type) return null;

    const section = (children: React.ReactNode, title: string) => (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded">
            <div className="font-medium text-gray-800 mb-3">{title}</div>
            <div className="space-y-3">{children}</div>
        </div>
    );

    switch (type) {
        case ActivityType.QUIZ:
            return section(
                <>
                    <ListeningQuestionsEditor
                        basePath={`${basePath}.content.questions`}
                        control={control}
                        register={register}
                    />
                </>,
                "Quiz"
            );

        case ActivityType.VOCAB:
            return section(
                // ⬇️ dùng editor mới cho danh sách items
                <VocabItemsEditor
                    basePath={`${basePath}.content`}
                    control={control}
                    register={register}
                    setValue={setValue}
                    watch={watch}
                />,
                "Vocabulary"
            );

        case ActivityType.LISTENING:
            return section(
                <>
                    <div className="mb-4">
                        <UploadField
                            key={`listening-audio-${lessonIndex}-${activityIndex}`}
                            name={`${basePath}.content.audioUrl`}
                            label="Audio File"
                            accept="audio/*"
                            placeholder="Drag & drop or click to upload audio"
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            type="audio"
                        />
                    </div>
                    <ListeningQuestionsEditor
                        basePath={`${basePath}.content.questions`}
                        control={control}
                        register={register}
                    />
                </>,
                "Listening"
            );

        case ActivityType.PRONUNCIATION:
            return section(
                <>
                    <input {...register(`${basePath}.content.phrase` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Target phrase *" />
                    <div className="grid md:grid-cols-2 gap-3">
                        <StringArrayField name={`${basePath}.content.tips`} control={control} label="Tips" placeholder="Tip" register={register} />
                        <UploadField
                            key={`pronunciation-audio-${lessonIndex}-${activityIndex}`}
                            name={`${basePath}.content.sampleUrl`}
                            label="Sample Audio"
                            accept="audio/*"
                            placeholder="Upload sample pronunciation"
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            type="audio"
                        />
                    </div>
                </>,
                "Pronunciation"
            );

        case ActivityType.SPEAKING:
            return section(
                <>
                    <input {...register(`${basePath}.content.prompt` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Prompt *" />
                    <div className="grid md:grid-cols-2 gap-3">
                        <input
                            type="number"
                            min={0}
                            {...register(`${basePath}.content.minSeconds` as const, { valueAsNumber: true })}
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Min seconds (e.g., 15)"
                        />
                        <StringArrayField name={`${basePath}.content.tips`} control={control} label="Tips" placeholder="Tip" register={register} />
                    </div>
                </>,
                "Speaking"
            );

        case ActivityType.MINI_GAME:
            return section(
                <>
                    <div className="grid md:grid-cols-3 gap-3">
                        <input {...register(`${basePath}.content.target` as const)} className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Target *" />
                        <input
                            type="number"
                            min={1}
                            {...register(`${basePath}.content.rounds` as const, { valueAsNumber: true })}
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Rounds *"
                        />
                    </div>
                    <StringArrayField name={`${basePath}.content.pool`} control={control} label="Word pool *" placeholder="Word" register={register} />
                </>,
                "Mini Game"
            );

        case ActivityType.READING:
            return section(
                <>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Passage *</label>
                        <textarea {...register(`${basePath}.content.passage` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" rows={4} placeholder="Reading passage *" />
                    </div>
                    <ListeningQuestionsEditor
                        basePath={`${basePath}.content.questions`}
                        control={control}
                        register={register}
                    />
                </>,
                "Reading"
            );

        case ActivityType.WRITING:
            return section(
                <>
                    <input {...register(`${basePath}.content.prompt` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Prompt *" />
                    <div className="grid md:grid-cols-2 gap-3">
                        <input
                            type="number"
                            min={0}
                            {...register(`${basePath}.content.minWords` as const, { valueAsNumber: true })}
                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            placeholder="Min words (e.g., 40)"
                        />
                        <StringArrayField
                            name={`${basePath}.content.rubric`}
                            control={control}
                            label="Rubric *"
                            placeholder="Criterion (e.g., Grammar - 25%)"
                            register={register}
                            errors={errors}
                        />
                    </div>
                </>,
                "Writing"
            );

        case ActivityType.GRAMMAR:
            return section(
                <>
                    <div className="mb-4">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Grammar Rule *</label>
                        <input {...register(`${basePath}.content.rule` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Grammar rule *" />
                    </div>
                    <ListeningQuestionsEditor
                        basePath={`${basePath}.content.exercises`}
                        control={control}
                        register={register}
                    />
                </>,
                "Grammar"
            );

        case ActivityType.FLASHCARD:
            return section(<FlashcardsEditor basePath={`${basePath}.content`} control={control} register={register} setValue={setValue} watch={watch} />, "Flashcards");

        case ActivityType.CONVERSATION:
            return section(
                <>
                    <input {...register(`${basePath}.content.scenario` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Scenario *" />
                    {/* initialDialog: array of {role,text} */}
                    <ConversationDialogEditor basePath={`${basePath}.content.initialDialog`} control={control} register={register} />
                    <StringArrayField name={`${basePath}.content.suggestions`} control={control} label="Suggestions" placeholder="Suggestion" register={register} />
                </>,
                "Conversation"
            );

        default:

        case ActivityType.FILL_BLANK:
            return section(
                <>
                    <textarea
                        {...register(`${basePath}.content.passage` as const)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        rows={3}
                        placeholder="Passage with blanks. Use [____] to mark blanks (e.g., The [____] is [____])."
                    />
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>
                            {(() => {
                                const p = watch(`${basePath}.content.passage` as const) as string;
                                const count = (p?.match(/\[_{2,}\]/g) || []).length;
                                const blanks = (watch(`${basePath}.content.blanks` as const) as string[]) || [];
                                return `Detected ${count} blanks • Answers: ${blanks.length}`;
                            })()}
                        </span>
                        <button
                            type="button"
                            className="px-2 py-1 border rounded"
                            onClick={() => {
                                const passage = (watch(`${basePath}.content.passage` as const) as string) || "";
                                const count = (passage.match(/\[_{2,}\]/g) || []).length;
                                const current: string[] = (watch(`${basePath}.content.blanks` as const) as string[]) || [];
                                const next = Array.from({ length: count }, (_, i) => current[i] || "");
                                setValue(`${basePath}.content.blanks` as any, next, { shouldDirty: true });
                            }}
                        >
                            Sync answers
                        </button>
                    </div>
                    <StringArrayField
                        name={`${basePath}.content.blanks`}
                        control={control}
                        label="Blanks / Answers (in order)"
                        placeholder="answer"
                        register={register}
                    />
                </>,
                "Fill in the Blanks"
            );

        case ActivityType.DICTATION:
            return section(
                <>
                    <div className="grid md:grid-cols-2 gap-3">
                        <UploadField
                            key={`dictation-audio-${lessonIndex}-${activityIndex}`}
                            name={`${basePath}.content.audioUrl`}
                            label="Audio File (optional)"
                            accept="audio/*"
                            placeholder="Upload audio for dictation"
                            register={register}
                            setValue={setValue}
                            watch={watch}
                            type="audio"
                        />
                        <input {...register(`${basePath}.content.minWords` as const, { valueAsNumber: true })} className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Min words (optional)" />
                    </div>
                    <textarea {...register(`${basePath}.content.transcript` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none" rows={2} placeholder="Expected transcript / answer" />
                </>,
                "Dictation"
            );

        case ActivityType.MATCHING:
            return section(
                <>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Pairs are matched by index.</span>
                        <button
                            type="button"
                            className="px-2 py-1 border rounded"
                            onClick={() => {
                                const left: string[] = (watch(`${basePath}.content.leftItems` as const) as string[]) || [];
                                const right: string[] = (watch(`${basePath}.content.rightItems` as const) as string[]) || [];
                                setValue(`${basePath}.content.leftItems` as any, [...left, ""], { shouldDirty: true });
                                setValue(`${basePath}.content.rightItems` as any, [...right, ""], { shouldDirty: true });
                            }}
                        >
                            Add Pair
                        </button>
                    </div>
                    {(() => {
                        const left: string[] = (watch(`${basePath}.content.leftItems` as const) as string[]) || [];
                        const right: string[] = (watch(`${basePath}.content.rightItems` as const) as string[]) || [];
                        const len = Math.max(left.length, right.length);
                        return (
                            <div className="space-y-2">
                                {Array.from({ length: len }).map((_, i) => (
                                    <div key={i} className="grid md:grid-cols-3 gap-2 items-center">
                                        <input
                                            {...register(`${basePath}.content.leftItems.${i}` as const)}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder={`Left #${i + 1}`}
                                        />
                                        <input
                                            {...register(`${basePath}.content.rightItems.${i}` as const)}
                                            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder={`Right #${i + 1}`}
                                        />
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                className="text-red-600 border px-2 py-1 rounded"
                                                onClick={() => {
                                                    const l: string[] = (watch(`${basePath}.content.leftItems` as const) as string[]) || [];
                                                    const r: string[] = (watch(`${basePath}.content.rightItems` as const) as string[]) || [];
                                                    const l2 = l.filter((_, idx) => idx !== i);
                                                    const r2 = r.filter((_, idx) => idx !== i);
                                                    setValue(`${basePath}.content.leftItems` as any, l2, { shouldDirty: true });
                                                    setValue(`${basePath}.content.rightItems` as any, r2, { shouldDirty: true });
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </>,
                "Matching"
            );
            return null;
    }
}

// Editor cho initialDialog (role + text)
function ConversationDialogEditor({
    basePath,
    control,
    register,
}: {
    basePath: string;
    control: Control<CreateCourseDto>;
    register: UseFormRegister<any>;
}) {
    const { fields, append, remove } = useFieldArray({ control, name: basePath as any });
    return (
        <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600">Initial Dialog</label>
            {fields.map((f, i) => (
                <div key={f.id} className="grid md:grid-cols-3 gap-2">
                    <select {...register(`${basePath}.${i}.role` as const)} className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                        <option value="assistant">assistant</option>
                        <option value="user">user</option>
                    </select>
                    <input {...register(`${basePath}.${i}.text` as const)} className="md:col-span-2 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" placeholder="Text *" />
                    <div className="md:col-span-3 flex justify-end">
                        <button type="button" onClick={() => remove(i)} className="text-red-500">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
            <button type="button" onClick={() => append({ role: "assistant", text: "" })} className="text-purple-700 border border-purple-300 px-2 py-1 rounded text-xs">
                + Add message
            </button>
        </div>
    );
}

// ====== COMPONENT CHÍNH: LessonActivities ======
const LessonActivities = ({
    lessonIndex,
    control,
    register,
    errors,
    setValue,
    watch,
}: {
    lessonIndex: number;
    control: Control<CreateCourseDto>;
    register: UseFormRegister<CreateCourseDto>;
    errors: FieldErrors<CreateCourseDto>;
    setValue: UseFormSetValue<CreateCourseDto>;
    watch: UseFormWatch<CreateCourseDto>;
}) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `lessons.${lessonIndex}.activities` as const,
    });

    return (
        <div className="mt-6 pl-6 border-l-2 border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Activities</h4>

            {fields.map((activity, activityIndex) => {
                const base = `lessons.${lessonIndex}.activities.${activityIndex}` as const;
                const currentType: ActivityType | undefined = watch(`${base}.type` as const);

                return (
                    <div key={activity.id} className="bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h5 className="font-semibold text-gray-800">Activity #{activityIndex + 1}</h5>
                            <button type="button" onClick={() => remove(activityIndex)} className="text-gray-500 hover:text-red-600 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Activity Title *</label>
                                <input
                                    {...register(`${base}.title`)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="e.g., Grammar Quiz"
                                />
                                {errors.lessons?.[lessonIndex]?.activities?.[activityIndex]?.title && (
                                    <p className="text-red-500 text-xs mt-1">{(errors.lessons![lessonIndex]!.activities![activityIndex]! as any).title?.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                                <select
                                    {...register(`${base}.type` as const)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                >
                                    {activityTypes.map((t) => (
                                        <option key={t.value as any} value={t.value as any}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Order No</label>
                                <input
                                    type="number"
                                    min={1}
                                    {...register(`${base}.orderNo` as const, { valueAsNumber: true })}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    placeholder="1"
                                />
                            </div>
                        </div>

                        {/* Meta optional */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                                <select {...register(`${base}.difficulty` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors">
                                    {difficultyOptions.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Passing score (%)</label>
                                <input type="number" min={0} max={100} {...register(`${base}.passingScore` as const, { valueAsNumber: true })} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" />
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
                            <textarea {...register(`${base}.instructions` as const)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors" rows={2} placeholder="Short instructions..." />
                        </div>

                        {/* —— KHU VỰC NỘI DUNG RIÊNG THEO TYPE —— */}
                        <ActivityContentFields
                            lessonIndex={lessonIndex}
                            activityIndex={activityIndex}
                            control={control}
                            register={register}
                            watch={watch}
                            setValue={setValue}
                            errors={errors}
                        />
                    </div>
                );
            })}

            <button
                type="button"
                onClick={() =>
                    append({
                        type: ActivityType.QUIZ,
                        orderNo: fields.length + 1,
                        title: "",
                        difficulty: DifficultyLevel.BEGINNER,
                        points: 10,
                        content: defaultContentByType(ActivityType.QUIZ),
                    } as any)
                }
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded font-medium transition-colors flex items-center border border-gray-300 text-sm hover:border-gray-400"
            >
                <Plus className="w-4 h-4 mr-2" />
                Add Activity
            </button>
        </div>
    );
};

export default LessonActivities;
