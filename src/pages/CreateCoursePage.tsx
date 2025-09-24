import { createCourse } from "@/apis/course";
import { getTeachers } from "@/apis/teacher";
import { uploadFile } from "@/apis/upload";
import ImportCoursesModal from "@/components/course/ImportCoursesModal";
import LessonActivities from "@/components/course/LessonActivities";
import { CreateCourseDto } from "@/interface/course.interface";
import { ActivityType, DifficultyLevel, LanguageCode } from "@/interface/enums";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Brain, Check, ChevronLeft, ChevronRight, Eye, FileSpreadsheet, GripVertical, Plus, Trash2, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import * as z from "zod";

const difficultyOptions = Object.values(DifficultyLevel).map(level => ({
  value: level,
  label: level.charAt(0).toUpperCase() + level.slice(1),
}));

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  price: z.number().optional(),
  instructorId: z.string().min(1, "Instructor is required"),
  difficulty: z.nativeEnum(DifficultyLevel),
  language: z.nativeEnum(LanguageCode).optional(),
  isPublished: z.boolean().optional(),
  imageUrl: z.string().optional(),
  lessons: z.array(z.object({
    title: z.string().min(1, "Lesson title is required"),
    description: z.string().optional(),
    orderNo: z.number(),
    difficulty: z.nativeEnum(DifficultyLevel).optional(),
    estimatedTime: z.number().min(0).optional(),
    isLocked: z.boolean().optional(),
    objectives: z.array(z.string()).optional(),
    activities: z.array(z.object({
      type: z.nativeEnum(ActivityType),
      orderNo: z.number(),
      title: z.string().min(1, "Activity title is required"),
      content: z.any(),
      timeLimit: z.number().min(0).optional(),
      maxAttempts: z.number().min(1).optional(),
      passingScore: z.number().min(0).max(100).optional(),
      difficulty: z.nativeEnum(DifficultyLevel).optional(),
      points: z.number().min(0).optional(),
      instructions: z.string().optional(),
    }))
  }))
});

const CreateCoursePage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: teachersData, isLoading: isLoadingTeachers } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => getTeachers({ page: 1, limit: 100 }),
  });

  const { mutate, isPending: isCreating } = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      toast.success('Course created successfully!');
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      navigate('/courses');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create course');
    }
  });

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm<CreateCourseDto>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      instructorId: '',
      difficulty: DifficultyLevel.BEGINNER,
      language: LanguageCode.EN,
      isPublished: false,
      imageUrl: '',
      lessons: [],
    },
  });

  // Hook upload file
  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data: any) => {
      const imageUrl = data.data.url + '?t=' + Date.now();
      setValue('imageUrl', imageUrl);
      toast.success('Upload ảnh thành công!');
    },
    onError: (error: any) => {
      console.error('Upload error for course image:', error);
      toast.error('Upload ảnh thất bại!');
    }
  });

  const { fields: lessonFields, append: appendLesson, remove: removeLesson } = useFieldArray({
    control,
    name: "lessons",
  });

  const steps = [
    { number: 1, title: 'Course Info', icon: BookOpen, color: 'text-blue-600' },
    { number: 2, title: 'Add Lessons', icon: BookOpen, color: 'text-green-600' },
    { number: 3, title: 'Add Activities', icon: Brain, color: 'text-purple-600' },
    { number: 4, title: 'Review & Submit', icon: Eye, color: 'text-orange-600' },
  ];

  const onSubmit = (data: CreateCourseDto) => {
    // Sanitize activities content before submit
    const payload: CreateCourseDto = {
      ...data,
      lessons: (data.lessons || []).map((lesson) => ({
        ...lesson,
        activities: (lesson.activities || []).map((act) => {
          const next = { ...act } as any
          const c = (next as any).activities ? (next as any).activities : next.content
          const content = next.content ?? {}

          // Fill Blank: support [____] placeholders and [answer] extraction
          if (next.type === ActivityType.FILL_BLANK) {
            const passage: string = content.passage || ''
            // Case 1: [answer] → extract answers and clean passage
            if (/\[[^_\]]+\]/.test(passage)) {
              const answers: string[] = []
              const clean = passage.replace(/\[([^_\]]+)\]/g, (_m: string, g1: string) => {
                answers.push(g1)
                return g1
              })
              next.content = {
                ...content,
                passage: clean,
                blanks: answers,
              }
            } else {
              // Case 2: [____] placeholders → ensure blanks length
              const count = (passage.match(/\[_{2,}\]/g) || []).length
              const blanks: string[] = Array.isArray(content.blanks) ? [...content.blanks] : []
              if (count > 0 && blanks.length !== count) {
                const resized = Array.from({ length: count }, (_: unknown, i: number) => blanks[i] || '')
                next.content = { ...content, blanks: resized }
              }
            }
          }

          // Matching: map leftItems/rightItems → pairs if present
          if (next.type === ActivityType.MATCHING) {
            const left: string[] | undefined = (content as any).leftItems
            const right: string[] | undefined = (content as any).rightItems
            if (Array.isArray(left) && Array.isArray(right)) {
              const len = Math.min(left.length, right.length)
              const pairs = Array.from({ length: len }, (_: unknown, i: number) => ({ left: left[i], right: right[i] }))
              const { leftItems, rightItems, ...rest } = content as any
              next.content = { ...rest, pairs }
            }
          }

          // Dictation: default minWords
          if (next.type === ActivityType.DICTATION) {
            next.content = { ...content, minWords: typeof content.minWords === 'number' ? content.minWords : 0 }
          }

          return next
        }),
      })),
    }

    mutate(payload)
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
              ${currentStep >= step.number
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {currentStep > step.number ? (
                <Check className="w-6 h-6" />
              ) : (
                <step.icon className="w-6 h-6" />
              )}
            </div>
            <div className="ml-3 text-left">
              <div className={`text-sm font-semibold ${currentStep >= step.number ? step.color : 'text-gray-400'}`}>
                Step {step.number}
              </div>
              <div className={`text-xs ${currentStep >= step.number ? 'text-gray-700' : 'text-gray-400'}`}>
                {step.title}
              </div>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className={`w-5 h-5 mx-4 ${currentStep > step.number ? 'text-purple-600' : 'text-gray-300'}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ảnh khoá học *</label>
            <div
              className={`group relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${isDragOver
                ? 'border-purple-500 bg-purple-50 scale-105 shadow-lg'
                : 'border-gray-300 hover:border-purple-400 hover:bg-purple-25 hover:shadow-md'
                } ${watch('imageUrl') ? 'bg-gray-50' : 'bg-white'}`}
              onClick={() => {
                if (!uploadMutation.isPending && fileInputRef.current) {
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
                if (files.length > 0 && !uploadMutation.isPending) {
                  const file = files[0];
                  if (file && file.type.startsWith('image/')) {
                    console.log('Drag & drop upload for course image:', file.name);
                    uploadMutation.mutate(file);
                  } else {
                    toast.error('Please upload an image file');
                  }
                }
              }}
            >
              {watch('imageUrl') ? (
                <div className="space-y-4">
                  <div className="relative inline-block group">
                    <img
                      src={watch('imageUrl')}
                      alt="Course cover"
                      className="h-32 w-auto max-w-full rounded-lg shadow-md mx-auto hover:shadow-lg transition-shadow duration-300 object-cover"
                      onError={(e) => {
                        console.error('Image failed to load:', watch('imageUrl'));
                        // Try loading without timestamp if failed
                        const currentUrl = watch('imageUrl');
                        if (currentUrl) {
                          const originalUrl = currentUrl.split('?')[0];
                          if (originalUrl && e.currentTarget.src !== originalUrl) {
                            e.currentTarget.src = originalUrl;
                          } else {
                            e.currentTarget.style.display = 'none';
                          }
                        } else {
                          e.currentTarget.style.display = 'none';
                        }
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', watch('imageUrl'));
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setValue('imageUrl', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-300"></div>
                  </div>
                  <p className="text-sm text-gray-600">Click to change image or drag a new one here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className={`w-8 h-8 ${isDragOver ? 'text-purple-600 animate-bounce' : 'text-purple-400 group-hover:text-purple-600'} transition-all duration-300`} />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-700 mb-1">
                      {isDragOver ? 'Drop your image here!' : 'Drag & drop your course image'}
                    </p>
                    <p className="text-sm text-gray-500">or click to browse files</p>
                  </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && !uploadMutation.isPending) {
                    console.log('Starting upload for course image:', file.name);
                    uploadMutation.mutate(file);
                  }
                  // Reset input để có thể chọn cùng file lần nữa
                  e.target.value = '';
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {uploadMutation.isPending && (
              <div className="mt-4 text-center">
                <div className="inline-flex items-center text-purple-600 bg-purple-50 px-4 py-2 rounded-full">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600 mr-3"></div>
                  <span className="font-medium">Uploading image...</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
            {errors.imageUrl && <p className="text-red-500 text-sm mt-1">{errors.imageUrl.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title *</label>
            <input
              {...register("title")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="Enter course title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
            <textarea
              {...register("description")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
              rows={4}
              placeholder="Enter course description"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Instructor & Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Instructor *</label>
            <select
              {...register("instructorId")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              disabled={isLoadingTeachers}
            >
              <option value="">Select an instructor</option>
              {teachersData?.data.data.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName} - {teacher.email}
                </option>
              ))}
            </select>
            {errors.instructorId && <p className="text-red-500 text-sm mt-1">{errors.instructorId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
            <input
              type="number"
              {...register("price", { valueAsNumber: true })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
              placeholder="0"
              min="0"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
            <select
              {...register("difficulty")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              {difficultyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.difficulty && <p className="text-red-500 text-sm mt-1">{errors.difficulty.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
            <select
              {...register("language")}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            >
              {Object.values(LanguageCode).map((lang) => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
            {errors.language && <p className="text-red-500 text-sm mt-1">{errors.language.message}</p>}
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              {...register("isPublished")}
              className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="ml-3 text-sm font-medium text-gray-700">Publish immediately after creation</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">📖 Course Lessons</h3>
          <p className="text-gray-600">Add and organize lessons for your course</p>
        </div>
        <button
          type="button"
          onClick={() => appendLesson({ title: '', description: '', orderNo: lessonFields.length + 1, difficulty: DifficultyLevel.BEGINNER, isLocked: true, activities: [] })}
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Lesson
        </button>
      </div>

      {lessonFields.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h4 className="text-xl font-semibold text-gray-600 mb-2">No lessons yet</h4>
          <p className="text-gray-500 mb-6">Start building your course by adding the first lesson</p>
          <button
            type="button"
            onClick={() => appendLesson({ title: '', description: '', orderNo: lessonFields.length + 1, difficulty: DifficultyLevel.BEGINNER, isLocked: true, activities: [] })}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            <Plus className="w-5 h-5 mr-2 inline" />
            Add First Lesson
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {lessonFields.map((lesson, index) => (
            <div key={lesson.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                  <span className="bg-purple-100 text-purple-700 text-sm font-semibold px-3 py-1 rounded-full">
                    Lesson #{index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeLesson(index)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lesson Title *</label>
                  <input
                    {...register(`lessons.${index}.title`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="e.g., Introduction to React"
                  />
                  {errors.lessons?.[index]?.title && <p className="text-red-500 text-sm mt-1">{errors.lessons[index].title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    {...register(`lessons.${index}.difficulty`)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  {...register(`lessons.${index}.description`)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                  rows={2}
                  placeholder="Brief lesson description..."
                />
              </div>
              <LessonActivities lessonIndex={index} control={control} register={register} errors={errors} setValue={setValue} watch={watch} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep3 = () => renderStep2(); // Merged into step 2

  const renderStep4 = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-2">🔍 Review & Submit</h3>
      {/* Review content here */}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Create New Course</h1>
          <p className="text-xl text-gray-600">Build a comprehensive course with lessons and activities</p>

          {/* Quick Import Button */}
          <div className="mt-6">
            <button
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FileSpreadsheet className="w-5 h-5 mr-2" />
              📚 Import from Excel
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Quickly create multiple courses with auto-generated audio
            </p>
          </div>
        </div>

        {renderStepIndicator()}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 min-h-[600px]">
            <div className="p-8">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep2()} {/* Merged step 3 into 2 */}
              {currentStep === 4 && renderStep4()}
            </div>

            <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                  className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all ${currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <ChevronLeft className="w-5 h-5 mr-2" />
                  Previous
                </button>

                <div className="text-sm text-gray-500">
                  Step {currentStep} of {steps.length}
                </div>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white`}
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isCreating}
                    className={`flex items-center px-8 py-3 rounded-xl font-semibold transition-all bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white`}
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    {isCreating ? 'Creating...' : 'Create Course'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Import Modal */}
        <ImportCoursesModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
        />
      </div>
    </div>
  );
};


export default CreateCoursePage;
