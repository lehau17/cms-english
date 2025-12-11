import { createFreeAudio } from '@/apis/googleTranslate';
import {
  ConversationDialogEditor,
  FlashcardsEditor,
  ListeningQuestionsEditor,
  PronunciationPhrasesEditor,
  StringArrayField,
  UploadField,
  VocabItemsEditor
} from "@/components/shared/activity-editors";
import type { Activity } from "@/interface/activity.interface";
import { CreateCourseDto } from "@/interface/course.interface";
import { ActivityType, DifficultyLevel } from "@/interface/enums";
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
import { Brain, Plus, Sparkles, Trash2 } from "lucide-react";
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
import { AIActivityGeneratorModal } from "./AIActivityGeneratorModal";
const asPath = (s: string) => s as Path<CreateCourseDto>;

const activityTypes = Object.values(ActivityType).map(type => ({
  value: type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
  icon: Brain,
  description: `A ${type} activity.`
}));

const difficultyOptions = Object.values(DifficultyLevel).map(level => ({ value: level, label: level.charAt(0).toUpperCase() + level.slice(1), }));

// Listening Activity Content Component with Text-to-Audio
function ListeningActivityContent({
  basePath,
  lessonIndex,
  activityIndex,
  control,
  register,
  setValue,
  watch,
}: {
  basePath: string;
  lessonIndex: number;
  activityIndex: number;
  control: Control<CreateCourseDto>;
  register: UseFormRegister<CreateCourseDto>;
  setValue: UseFormSetValue<CreateCourseDto>;
  watch: UseFormWatch<CreateCourseDto>;
}) {
  const [audioMode, setAudioMode] = useState<'upload' | 'text'>('upload');
  const [textInput, setTextInput] = useState('');
  const [language, setLanguage] = useState('en');

  const audioUrl = watch(`${basePath}.content.audioUrl` as any);

  const generateAudioMutation = useMutation({
    mutationFn: createFreeAudio,
    onSuccess: (data) => {
      setValue(`${basePath}.content.audioUrl` as any, data.url, { shouldDirty: true, shouldValidate: true });
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
    <>
      <div className="mb-4">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={audioMode} onChange={handleModeChange} aria-label="audio input mode">
            <Tab label="Upload File" value="upload" />
            <Tab label="Text to Audio" value="text" />
          </Tabs>
        </Box>

        {audioMode === 'upload' ? (
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
                      setValue(`${basePath}.content.audioUrl` as any, '', { shouldDirty: true, shouldValidate: true });
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
        basePath={`${basePath}.content.questions`}
        control={control}
        register={register}
        watch={watch}
      />
    </>
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
      return { phrases: [{ text: "", sampleUrl: "" }], tips: [""], phonetics: "" };
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
            watch={watch}
          />
        </>,
        "Quiz"
      );

    case ActivityType.VOCAB:
      return section(
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
        <ListeningActivityContent
          basePath={basePath}
          lessonIndex={lessonIndex}
          activityIndex={activityIndex}
          control={control}
          register={register}
          setValue={setValue}
          watch={watch}
        />,
        "Listening"
      );

    case ActivityType.PRONUNCIATION:
      return section(
        <>
          <PronunciationPhrasesEditor
            basePath={`${basePath}.content`}
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
          />
          <div className="mt-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Phonetics</label>
            <input
              {...register(`${basePath}.content.phonetics` as const)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Phonetics (e.g., /aɪ siː ə ˈlaɪən/)"
            />
          </div>
          <div className="mt-4">
            <StringArrayField name={`${basePath}.content.tips`} control={control} label="Tips" placeholder="Tip" register={register} />
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
            watch={watch}
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
            watch={watch}
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

  const [showAIModal, setShowAIModal] = useState(false);

  // Get course and lesson context from form
  const courseTitle = watch('title') || '';
  const courseDescription = watch('description');
  const lessonTitle = watch(`lessons.${lessonIndex}.title`) || '';
  const lessonDescription = watch(`lessons.${lessonIndex}.description`);
  const lessonDifficulty = watch(`lessons.${lessonIndex}.difficulty`);

  const handleActivitiesGenerated = (generatedActivities: Activity[]) => {
    // Append all generated activities to the activities field array
    const startOrderNo = fields.length;
    generatedActivities.forEach((activity, index) => {
      append({
        type: activity.type as ActivityType,
        orderNo: startOrderNo + index + 1,
        title: activity.title,
        difficulty: activity.difficulty as DifficultyLevel,
        points: activity.points || 10,
        instructions: activity.instructions,
        passingScore: activity.passingScore ?? 70,
        content: activity.content,
      } as any);
    });

    toast.success(`Đã thêm ${generatedActivities.length} hoạt động từ AI!`);
  };

  // Handler mở AI modal với validation - bắt buộc có lesson title
  const handleOpenAIModal = () => {
    if (!lessonTitle || lessonTitle.trim() === '') {
      toast.error('Vui lòng nhập tiêu đề bài học trước khi tạo hoạt động bằng AI');
      return;
    }
    setShowAIModal(true);
  };

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

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleOpenAIModal}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded font-medium transition-all flex items-center border-none text-sm shadow-sm"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Generate Activities
        </button>
        <button
          type="button"
          onClick={() =>
            append({
              type: ActivityType.QUIZ,
              orderNo: fields.length + 1,
              title: "",
              difficulty: DifficultyLevel.BEGINNER,
              points: 10,
              passingScore: 70,
              content: defaultContentByType(ActivityType.QUIZ),
            } as any)
          }
          className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded font-medium transition-colors flex items-center border border-gray-300 text-sm hover:border-gray-400"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </button>
      </div>

      <AIActivityGeneratorModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        courseTitle={courseTitle}
        courseDescription={courseDescription}
        lessonTitle={lessonTitle}
        lessonDescription={lessonDescription}
        lessonDifficulty={lessonDifficulty}
        onActivitiesGenerated={handleActivitiesGenerated}
      />
    </div>
  );
};

export default LessonActivities;
