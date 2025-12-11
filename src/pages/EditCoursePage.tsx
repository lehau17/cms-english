import { getCourseById, updateCourse } from '@/apis/course';
import { uploadFile } from '@/apis/upload';
import LessonActivities from '@/components/course/LessonActivities';
import { Course } from '@/interface/course.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, Calendar, CheckCircle, CircleDot, FileEdit, GripVertical, Library, Plus, RefreshCw, Save, Target, Trash2, Upload, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import FormField from '../components/forms/FormField';
import Button from '../components/ui/Button';

interface ActivityFormData {
  id?: string;
  type: string;
  orderNo: number;
  title: string;
  content?: any;
  passingScore?: number;
  difficulty?: string;
  points?: number;
  instructions?: string;
  hints?: any;
  mediaUrls?: any;
}

interface LessonFormData {
  id?: string;
  title: string;
  description?: string;
  orderNo: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: number;
  isLocked: boolean;
  objectives?: string;
  activities: ActivityFormData[];
}

interface EditCourseFormValues {
  title: string;
  description: string;
  price: number;
  difficulty: string;
  language: string;
  imageUrl?: string;
  prerequisites?: string[];
  isPublished: boolean;
  lessons: LessonFormData[];
}

const activitySchema = yup.object({
  id: yup.string().optional(),
  type: yup.string().required(),
  orderNo: yup.number().min(1).required(),
  title: yup.string().required('Activity title is required'),
  content: yup.mixed().optional(),
  passingScore: yup.number().min(0).max(100).optional(),
  difficulty: yup.string().optional(),
  points: yup.number().min(0).optional(),
  instructions: yup.string().optional(),
  hints: yup.mixed().optional(),
  mediaUrls: yup.mixed().optional(),
});

const lessonSchema = yup.object({
  id: yup.string().optional(),
  title: yup.string().required('Lesson title is required'),
  description: yup.string().optional(),
  orderNo: yup.number().min(1).required(),
  difficulty: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required(),
  estimatedTime: yup.number().min(1).optional(),
  isLocked: yup.boolean().default(true),
  objectives: yup.string().optional(),
  activities: yup.array().of(activitySchema).default([]),
});

const schema = yup.object({
  title: yup.string().required('Course title is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().min(0).required('Price is required'),
  difficulty: yup.string().required('Difficulty is required'),
  language: yup.string().required('Language is required'),
  imageUrl: yup.string().optional(),
  prerequisites: yup.array().of(yup.string()).optional(),
  isPublished: yup.boolean().default(false),
  lessons: yup.array().of(lessonSchema).default([]),
});

const difficultyOptions = [
  { value: 'beginner', label: 'Beginner', color: 'text-green-600', bg: 'bg-green-50 border-green-200', icon: CircleDot },
  { value: 'intermediate', label: 'Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200', icon: CircleDot },
  { value: 'advanced', label: 'Advanced', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: CircleDot },
];

// NOTE: Using LessonActivities component from @/components/course/LessonActivities
// This component provides rich UI for editing each activity type (Quiz, Reading, Listening, etc.)
// instead of manual JSON editing

const EditCoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'course' | 'lessons'>('course');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: courseDetailResponse,
    isLoading: isLoadingCourseDetail,
  } = useQuery({
    queryKey: ['course-detail', id],
    queryFn: () => getCourseById(id as string),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  });

  const detailCourse = courseDetailResponse?.data;

  // Upload mutation for image
  const uploadMutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data: any) => {
      const imageUrl = data.data.url;
      const urlWithTimestamp = imageUrl.includes('?')
        ? `${imageUrl}&t=${Date.now()}`
        : `${imageUrl}?t=${Date.now()}`;
      setValue('imageUrl', urlWithTimestamp);
      toast.success('Upload ảnh thành công!');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      console.error('Upload error for course image:', error);
      toast.error('Upload ảnh thất bại!');

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  });

  const methods = useForm<EditCourseFormValues>({
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control, watch, setValue } = methods;
  const { fields: lessonFields, append: addLesson, remove: removeLesson, move: moveLesson, update: updateLesson } = useFieldArray({
    control,
    name: 'lessons',
  });

  useEffect(() => {
    if (detailCourse) {
      reset({
        title: detailCourse.title,
        description: detailCourse.description || '',
        price: detailCourse.price || 0,
        difficulty: detailCourse.difficulty,
        language: detailCourse.language,
        imageUrl: detailCourse.imageUrl || '',
        prerequisites: detailCourse.prerequisites || [],
        isPublished: detailCourse.isPublished ?? false,
        lessons: detailCourse.lessons?.map(lesson => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description || '',
          orderNo: lesson.orderNo,
          difficulty: lesson.difficulty,
          estimatedTime: lesson.estimatedTime || 30,
          isLocked: lesson.isLocked,
          objectives: Array.isArray(lesson.objectives) ? lesson.objectives.join('\n') : (lesson.objectives || ''),
          activities: lesson.activities?.map(activity => ({
            id: activity.id,
            type: activity.type,
            orderNo: activity.orderNo,
            title: activity.title,
            content: activity.content,
            passingScore: activity.passingScore,
            difficulty: activity.difficulty,
            points: activity.points,
            instructions: activity.instructions,
            hints: activity.hints,
            mediaUrls: activity.mediaUrls,
          })) || [],
        })) || [],
      });
    }
  }, [detailCourse, reset]);

  const editMutation = useMutation({
    mutationFn: (data: EditCourseFormValues) => {
      // Sanitize activities content before submit (similar to CreateCoursePage)
      const courseData = {
        ...data,
        lessons: data.lessons?.map(lesson => ({
          ...lesson,
          objectives: lesson.objectives
            ? (typeof lesson.objectives === 'string'
              ? lesson.objectives.split('\n').filter((obj: string) => obj.trim())
              : lesson.objectives)
            : [],
          activities: (lesson.activities || []).map((act) => {
            const next = { ...act } as any;
            const content = next.content ?? {};

            // Fill Blank: support [____] placeholders and [answer] extraction
            if (next.type === 'fill_blank' || next.type === 'FILL_BLANK') {
              const passage: string = content.passage || '';
              // Case 1: [answer] → extract answers and clean passage
              if (/\[[^_\]]+\]/.test(passage)) {
                const answers: string[] = [];
                const clean = passage.replace(/\[([^_\]]+)\]/g, (_m: string, g1: string) => {
                  answers.push(g1);
                  return g1;
                });
                next.content = {
                  ...content,
                  passage: clean,
                  blanks: answers,
                };
              } else {
                // Case 2: [____] placeholders → ensure blanks length
                const count = (passage.match(/\[_{2,}\]/g) || []).length;
                const blanks: string[] = Array.isArray(content.blanks) ? [...content.blanks] : [];
                if (count > 0 && blanks.length !== count) {
                  const resized = Array.from({ length: count }, (_: unknown, i: number) => blanks[i] || '');
                  next.content = { ...content, blanks: resized };
                }
              }
            }

            // Matching: map leftItems/rightItems → pairs if present
            if (next.type === 'matching' || next.type === 'MATCHING') {
              const left: string[] | undefined = (content as any).leftItems;
              const right: string[] | undefined = (content as any).rightItems;
              if (Array.isArray(left) && Array.isArray(right)) {
                const len = Math.min(left.length, right.length);
                const pairs = Array.from({ length: len }, (_: unknown, i: number) => ({ left: left[i], right: right[i] }));
                const { leftItems, rightItems, ...rest } = content as any;
                next.content = { ...rest, pairs };
              }
            }

            // Dictation: default minWords
            if (next.type === 'dictation' || next.type === 'DICTATION') {
              next.content = { ...content, minWords: typeof content.minWords === 'number' ? content.minWords : 0 };
            }

            return next;
          }),
        })),
      };
      return updateCourse(id as string, courseData as Partial<Course>);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['course-detail', id] });
      }
      navigate('/courses');
    },
  });

  const onSubmit = (data: EditCourseFormValues) => {
    editMutation.mutate(data);
  };

  const handleAddLesson = () => {
    const newOrder = lessonFields.length + 1;
    addLesson({
      title: '',
      description: '',
      orderNo: newOrder,
      difficulty: 'beginner',
      estimatedTime: 30,
      isLocked: true,
      objectives: '',
      activities: [],
    });
  };

  const handleMoveLesson = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < lessonFields.length) {
      moveLesson(index, targetIndex);

      // Update order numbers after moving
      const currentLessons = watch('lessons');
      currentLessons.forEach((lesson, idx) => {
        updateLesson(idx, { ...lesson, orderNo: idx + 1 });
      });
    }
  };

  const getDifficultyOption = (difficulty: string) => {
    return difficultyOptions.find(opt => opt.value === difficulty) || difficultyOptions[0];
  };

  const totalEstimatedTime = lessonFields.reduce((total, field, index) => {
    const time = watch(`lessons.${index}.estimatedTime`) || 0;
    return total + time;
  }, 0);

  if (isLoadingCourseDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-purple-600">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-400 border-t-transparent" />
          <span className="text-lg font-medium">Loading course details...</span>
        </div>
      </div>
    );
  }

  if (!detailCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
          <button
            onClick={() => navigate('/courses')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/* Compact Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/courses')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">✏️ {detailCourse?.title}</h1>
                <p className="text-xs text-gray-500">Edit Course</p>
              </div>
            </div>

            {/* Right: Quick Info + Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className={`px-2 py-1 rounded-full font-medium flex items-center gap-1 ${detailCourse?.isPublished
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
                  }`}>
                  {detailCourse?.isPublished ? <><CheckCircle className="w-3 h-3" /> Published</> : <><FileEdit className="w-3 h-3" /> Draft</>}
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                  <Library className="w-3 h-3" /> {lessonFields.length} lessons
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> {totalEstimatedTime}m
                </span>
              </div>
              <Button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Compact Tab Navigation */}
            <div className="flex bg-white border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('course')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'course'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <BookOpen className="w-4 h-4 inline mr-1" /> Course Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lessons')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'lessons'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Library className="w-4 h-4 inline mr-1" /> Lessons ({lessonFields.length})
              </button>
            </div>

            {/* Course Details Tab */}
            {activeTab === 'course' && (
              <div className="space-y-4">
                {/* Basic Information */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" /> Basic Information
                  </h3>
                  <div className="space-y-3">
                    <FormField name="title" label="Course Title *" placeholder="Enter course title" />
                    <FormField name="description" label="Description *" placeholder="Enter course description" type="textarea" />
                  </div>
                </div>

                {/* Settings - 2 Column Grid */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">⚙️ Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField name="price" label="Giá (VND)" type="number" placeholder="0" />
                    <FormField name="difficulty" label="Difficulty" placeholder="beginner" />
                    <FormField name="language" label="Language" placeholder="en" />
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Course Image (Optional)</label>
                      <div
                        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 cursor-pointer ${isDragOver
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
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
                              uploadMutation.mutate(file);
                            } else {
                              toast.error('Please upload an image file');
                            }
                          }
                        }}
                      >
                        {watch('imageUrl') ? (
                          <div className="space-y-3">
                            <div className="relative inline-block">
                              <img
                                src={watch('imageUrl')}
                                alt="Course cover"
                                className="h-24 w-auto max-w-full rounded shadow-md mx-auto hover:shadow-lg transition-shadow duration-300 object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setValue('imageUrl', '');
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-600">Click to change image or drag a new one here</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <Upload className={`w-6 h-6 ${isDragOver ? 'text-indigo-600' : 'text-gray-400'} transition-colors`} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {isDragOver ? 'Drop your image here!' : 'Drag & drop course image'}
                              </p>
                              <p className="text-xs text-gray-500">or click to browse files</p>
                            </div>
                          </div>
                        )}
                        {uploadMutation.isPending && (
                          <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
                            <div className="text-center">
                              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                              <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadMutation.mutate(file);
                          }
                        }}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Prerequisites (Optional)</label>
                      <input
                        type="text"
                        {...register('prerequisites')}
                        placeholder="Enter comma-separated course IDs"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Comma-separated list of prerequisite course IDs</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center p-2 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      {...register('isPublished')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">✅ Published</span>
                  </div>
                </div>

                {/* Metadata - Inline */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 px-4 py-2">
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Created: {detailCourse.createdAt ? new Date(detailCourse.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Updated: {detailCourse.updatedAt ? new Date(detailCourse.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-3">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Library className="w-4 h-4" /> Lessons ({lessonFields.length})
                    </h3>
                    <Button
                      type="button"
                      onClick={handleAddLesson}
                      className="bg-green-600 hover:bg-green-700 text-sm px-3 py-1.5"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {lessonFields.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 text-sm mb-3">No lessons yet</p>
                      <Button
                        type="button"
                        onClick={handleAddLesson}
                        variant="secondary"
                        className="text-sm"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add First Lesson
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lessonFields.map((field, index) => {
                        const difficultyOption = getDifficultyOption(watch(`lessons.${index}.difficulty`));
                        const isExistingLesson = !!(field as any).id;

                        return (
                          <div key={field.id} className={`border rounded-lg p-3 ${isExistingLesson
                            ? 'bg-white border-gray-200'
                            : 'bg-green-50 border-green-300'
                            }`}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 text-xs">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <span className={`font-semibold px-2 py-0.5 rounded ${isExistingLesson
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : 'bg-green-100 text-green-700'
                                  }`}>
                                  #{index + 1}
                                </span>
                                {difficultyOption && (
                                  <span className={`px-2 py-0.5 rounded font-medium ${difficultyOption.bg} ${difficultyOption.color}`}>
                                    {difficultyOption.label}
                                  </span>
                                )}
                                <span className="text-gray-500">
                                  ⏱️ {watch(`lessons.${index}.estimatedTime`) || 0}m
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleMoveLesson(index, 'up')}
                                  disabled={index === 0}
                                  className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveLesson(index, 'down')}
                                  disabled={index === lessonFields.length - 1}
                                  className="p-1 text-gray-500 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeLesson(index)}
                                  className="p-1 text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                              <FormField
                                name={`lessons.${index}.title`}
                                label="Title *"
                                placeholder="Lesson title"
                              />
                              <FormField
                                name={`lessons.${index}.description`}
                                label="Description"
                                placeholder="Brief description"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                                <input
                                  type="number"
                                  {...register(`lessons.${index}.orderNo`)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Time (min)</label>
                                <input
                                  type="number"
                                  {...register(`lessons.${index}.estimatedTime`)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                  min="1"
                                  placeholder="30"
                                />
                              </div>
                            </div>

                            <div className="mt-2">
                              <label className="flex items-center gap-1 text-xs font-medium text-gray-600 mb-1">
                                <Target className="w-3 h-3" /> Objectives
                              </label>
                              <textarea
                                {...register(`lessons.${index}.objectives`)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none"
                                rows={2}
                                placeholder="One per line..."
                              />
                            </div>

                            {/* Activities Section */}
                            <div className="mt-3 border-t border-gray-200 pt-3">
                              <LessonActivities
                                lessonIndex={index}
                                control={control as any}
                                register={register as any}
                                errors={errors as any}
                                setValue={setValue as any}
                                watch={watch as any}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}


          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default EditCoursePage;
