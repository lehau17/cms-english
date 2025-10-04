import { getCourseById, updateCourse } from '@/apis/course';
import { useTeachers } from '@/hooks/useTeacher';
import { Course } from '@/interface/course.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowLeft, ArrowUp, BookOpen, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import FormField from '../components/forms/FormField';
import Button from '../components/ui/Button';

interface LessonFormData {
  id?: string;
  title: string;
  description: string;
  orderNo: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  isLocked: boolean;
  objectives: string;
}

interface EditCourseFormValues {
  title: string;
  description: string;
  price: number;
  instructorId: string;
  difficulty: string;
  language: string;
  isPublished: boolean;
  lessons: LessonFormData[];
}

const lessonSchema = yup.object({
  title: yup.string().required('Lesson title is required'),
  description: yup.string().optional(),
  orderNo: yup.number().min(1).required(),
  difficulty: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required(),
  estimatedTime: yup.number().min(1).optional(),
  isLocked: yup.boolean().default(true),
  objectives: yup.string().optional(),
});

const schema = yup.object({
  title: yup.string().required('Course title is required'),
  description: yup.string().required('Description is required'),
  price: yup.number().min(0).required('Price is required'),
  instructorId: yup.string().required('Instructor is required'),
  difficulty: yup.string().required('Difficulty is required'),
  language: yup.string().required('Language is required'),
  isPublished: yup.boolean().default(false),
  lessons: yup.array().of(lessonSchema).default([]),
});

const difficultyOptions = [
  { value: 'beginner', label: '🟢 Beginner', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { value: 'intermediate', label: '🟡 Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { value: 'advanced', label: '🔴 Advanced', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
];

const EditCoursePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ limit: 1000 });
  const [activeTab, setActiveTab] = useState<'course' | 'lessons'>('course');

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

  const methods = useForm<EditCourseFormValues>({
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = methods;
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
        instructorId: detailCourse.instructorId,
        difficulty: detailCourse.difficulty,
        language: detailCourse.language,
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
        })) || [],
      });
    }
  }, [detailCourse, reset]);

  const editMutation = useMutation({
    mutationFn: (data: Partial<Course>) => {
      const courseData = {
        ...data,
        lessons: data.lessons?.map(lesson => ({
          ...lesson,
          objectives: lesson.objectives ? lesson.objectives.split('\n').filter(obj => obj.trim()) : [],
        })),
      };
      return updateCourse(id as string, courseData);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Courses</span>
            </button>
            <div className="h-8 w-px bg-gray-300"></div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          </div>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white px-6 py-6 rounded-xl shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-wide opacity-80 mb-1">Editing course</p>
                  <h2 className="text-2xl font-bold leading-snug">{detailCourse.title}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                    <BookOpen className="h-4 w-4" /> ID: <span className="font-mono">{detailCourse.id}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                    {detailCourse.isPublished ? '✅ Published' : '📝 Draft'}
                  </span>
                  {detailCourse.language && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2">
                      🌐 {detailCourse.language.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab('course')}
                className={`flex-1 px-6 py-4 text-base font-semibold transition-colors ${activeTab === 'course'
                  ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                📚 Course Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lessons')}
                className={`flex-1 px-6 py-4 text-base font-semibold transition-colors relative ${activeTab === 'lessons'
                  ? 'bg-purple-50 text-purple-700 border-b-4 border-purple-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                📖 Lessons ({lessonFields.length})
                {lessonFields.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {lessonFields.length}
                  </span>
                )}
              </button>
            </div>

            {/* Course Details Tab */}
            {activeTab === 'course' && (
              <div className="space-y-6">
                {/* Course Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📊 Course Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="font-bold text-purple-600 text-2xl mb-1">{lessonFields.length}</div>
                      <div className="text-gray-600 text-sm">Lessons</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="font-bold text-blue-600 text-2xl mb-1">{totalEstimatedTime}min</div>
                      <div className="text-gray-600 text-sm">Duration</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="font-bold text-green-600 text-2xl mb-1">{detailCourse.isPublished ? '✅' : '❌'}</div>
                      <div className="text-gray-600 text-sm">Published</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="font-bold text-orange-600 text-2xl mb-1">${watch('price') || 0}</div>
                      <div className="text-gray-600 text-sm">Price</div>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📚 Basic Information</h3>
                  <div className="space-y-4">
                    <FormField name="title" label="Course Title *" placeholder="Enter course title" />
                    <FormField name="description" label="Description *" placeholder="Enter course description" type="textarea" rows={4} />
                  </div>
                </div>

                {/* Instructor & Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">👨‍🏫 Instructor & Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instructor *</label>
                      <select
                        {...register('instructorId')}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-white"
                        disabled={isLoadingTeachers}
                      >
                        <option value="">{isLoadingTeachers ? 'Loading teachers...' : 'Select an instructor'}</option>
                        {teachersData?.data.data.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            👨‍🏫 {teacher.firstName} {teacher.lastName} - {teacher.email}
                          </option>
                        ))}
                      </select>
                      {errors.instructorId && <p className="text-red-500 text-sm mt-1">{errors.instructorId.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name="price" label="Price ($)" type="number" placeholder="0" />
                      <FormField name="difficulty" label="Course Difficulty" placeholder="beginner" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name="language" label="Language" placeholder="en" />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Publication Status</label>
                        <div className="flex items-center h-12 bg-gray-50 rounded-lg px-4 border border-gray-200">
                          <input
                            type="checkbox"
                            {...register('isPublished')}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="ml-3 text-base font-medium text-gray-700">✅ Publish course</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">📅 Course History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Created:</span>
                      <div className="text-gray-900 font-semibold mt-1">
                        {detailCourse.createdAt ? `${new Date(detailCourse.createdAt).toLocaleDateString('vi-VN')} at ${new Date(detailCourse.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-600 font-medium">Last Updated:</span>
                      <div className="text-gray-900 font-semibold mt-1">
                        {detailCourse.updatedAt ? `${new Date(detailCourse.updatedAt).toLocaleDateString('vi-VN')} at ${new Date(detailCourse.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">📖 Course Lessons</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Manage lessons • Total: {lessonFields.length} lessons • Duration: {totalEstimatedTime} minutes
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddLesson}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Add Lesson
                    </Button>
                  </div>

                  {/* Lessons Summary */}
                  {lessonFields.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border border-blue-200 mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">📊 Lessons Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <span className="text-blue-600 font-bold text-xl block">
                            {lessonFields.filter((_, index) => watch(`lessons.${index}.difficulty`) === 'beginner').length}
                          </span>
                          <span className="text-gray-600 text-sm">🟢 Beginner</span>
                        </div>
                        <div className="text-center">
                          <span className="text-yellow-600 font-bold text-xl block">
                            {lessonFields.filter((_, index) => watch(`lessons.${index}.difficulty`) === 'intermediate').length}
                          </span>
                          <span className="text-gray-600 text-sm">🟡 Intermediate</span>
                        </div>
                        <div className="text-center">
                          <span className="text-red-600 font-bold text-xl block">
                            {lessonFields.filter((_, index) => watch(`lessons.${index}.difficulty`) === 'advanced').length}
                          </span>
                          <span className="text-gray-600 text-sm">🔴 Advanced</span>
                        </div>
                        <div className="text-center">
                          <span className="text-orange-600 font-bold text-xl block">
                            {lessonFields.filter((_, index) => watch(`lessons.${index}.isLocked`)).length}
                          </span>
                          <span className="text-gray-600 text-sm">🔒 Locked</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {lessonFields.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                      <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <h4 className="text-xl font-semibold text-gray-600 mb-2">No lessons yet</h4>
                      <p className="text-gray-500 mb-6">Add lessons to make your course more comprehensive</p>
                      <Button
                        type="button"
                        onClick={handleAddLesson}
                        variant="secondary"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Add First Lesson
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {lessonFields.map((field, index) => {
                        const difficultyOption = getDifficultyOption(watch(`lessons.${index}.difficulty`));
                        const isExistingLesson = !!(field as any).id;

                        return (
                          <div key={field.id} className={`border rounded-xl p-5 shadow-sm transition-all ${isExistingLesson
                            ? 'bg-white border-gray-200'
                            : 'bg-green-50 border-green-300 shadow-md'
                            }`}>
                            <div className="flex items-start justify-between mb-5">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${isExistingLesson
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-green-100 text-green-700'
                                    }`}>
                                    #{index + 1} {isExistingLesson ? '' : '(New)'}
                                  </span>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${difficultyOption.bg} ${difficultyOption.color}`}>
                                  {difficultyOption.label}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ⏱️ {watch(`lessons.${index}.estimatedTime`) || 0}min
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleMoveLesson(index, 'up')}
                                  disabled={index === 0}
                                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-blue-50"
                                >
                                  <ArrowUp className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMoveLesson(index, 'down')}
                                  disabled={index === lessonFields.length - 1}
                                  className="p-2 text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-lg hover:bg-blue-50"
                                >
                                  <ArrowDown className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeLesson(index)}
                                  className="p-2 text-red-500 hover:text-red-700 transition-colors rounded-lg hover:bg-red-50"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                name={`lessons.${index}.title`}
                                label="Lesson Title *"
                                placeholder="e.g., Introduction to React"
                              />
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                                <select
                                  {...register(`lessons.${index}.difficulty`)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-white"
                                >
                                  {difficultyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="mt-4">
                              <FormField
                                name={`lessons.${index}.description`}
                                label="Description"
                                placeholder="Brief lesson description..."
                                type="textarea"
                                rows={3}
                              />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
                                <input
                                  type="number"
                                  {...register(`lessons.${index}.orderNo`)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                  min="1"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Time (min)</label>
                                <input
                                  type="number"
                                  {...register(`lessons.${index}.estimatedTime`)}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                                  min="1"
                                  placeholder="30"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Access</label>
                                <div className="flex items-center h-12">
                                  <input
                                    type="checkbox"
                                    {...register(`lessons.${index}.isLocked`)}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                  />
                                  <span className="ml-3 text-base text-gray-700">🔒 Locked</span>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Learning Objectives</label>
                              <textarea
                                {...register(`lessons.${index}.objectives`)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                                rows={3}
                                placeholder="Enter objectives (one per line)..."
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

            {/* Footer Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky bottom-6">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  📊 Course with {lessonFields.length} lesson{lessonFields.length !== 1 ? 's' : ''} • {totalEstimatedTime} minutes total
                </div>
                <div className="flex space-x-3">
                  <Button type="button" variant="secondary" onClick={() => navigate('/courses')}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    isLoading={editMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    Update Course & Lessons
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default EditCoursePage;
