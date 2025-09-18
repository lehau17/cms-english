import { updateCourse } from '@/apis/course';
import { useTeachers } from '@/hooks/useTeacher';
import { Course } from '@/interface/course.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowUp, BookOpen, Edit, GripVertical, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface EditCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

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

const EditCourseModal: React.FC<EditCourseModalProps> = ({ isOpen, onClose, course }) => {
  const queryClient = useQueryClient();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ limit: 1000 });
  const [activeTab, setActiveTab] = useState<'course' | 'lessons'>('course');

  const methods = useForm<EditCourseFormValues>({
    resolver: yupResolver(schema),
  });

  const { register, handleSubmit, formState: { errors }, reset, control, watch } = methods;
  const { fields: lessonFields, append: addLesson, remove: removeLesson, move: moveLesson, update: updateLesson } = useFieldArray({
    control,
    name: 'lessons',
  });

  useEffect(() => {
    if (course) {
      reset({
        title: course.title,
        description: course.description || '',
        price: course.price || 0,
        instructorId: course.instructorId,
        difficulty: course.difficulty,
        language: course.language,
        isPublished: course.isPublished,
        lessons: course.lessons?.map(lesson => ({
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
  }, [course, reset]);

  const editMutation = useMutation({
    mutationFn: (data: Partial<Course>) => {
      const courseData = {
        ...data,
        lessons: data.lessons?.map(lesson => ({
          ...lesson,
          objectives: lesson.objectives ? lesson.objectives.split('\n').filter(obj => obj.trim()) : [],
        })),
      };
      return updateCourse(course!.id, courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      onClose();
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

  if (!course) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Course"
      description="Update course details and manage lessons"
      icon={<Edit className="w-6 h-6 text-purple-600" />}
    >
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[calc(90vh-200px)] overflow-hidden flex flex-col">

          {/* Tab Navigation */}
          <div className="flex bg-gray-50 rounded-t-xl border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('course')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${activeTab === 'course'
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              📚 Course Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors relative ${activeTab === 'lessons'
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              📖 Lessons ({lessonFields.length})
              {lessonFields.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] rounded-full w-4.5 h-4.5 flex items-center justify-center">
                  {lessonFields.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Course Details Tab */}
            {activeTab === 'course' && (
              <div className="p-4 space-y-4">
                {/* Course Stats */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-2">📊 Course Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-purple-600 text-lg">{lessonFields.length}</div>
                      <div className="text-gray-600">Lessons</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-600 text-lg">{totalEstimatedTime}min</div>
                      <div className="text-gray-600">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-600 text-lg">{course.isPublished ? '✅' : '❌'}</div>
                      <div className="text-gray-600">Published</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-orange-600 text-lg">${watch('price') || 0}</div>
                      <div className="text-gray-600">Price</div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">📚 Basic Information</h3>
                  <div className="space-y-4">
                    <FormField name="title" label="Course Title *" placeholder="Enter course title" />
                    <FormField name="description" label="Description *" placeholder="Enter course description" type="textarea" rows={3} />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">👨‍🏫 Instructor & Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Instructor *</label>
                      <select
                        {...register('instructorId')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-white"
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
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Publication Status</label>
                        <div className="flex items-center h-10 bg-gray-50 rounded-xl px-3 border border-gray-200">
                          <input
                            type="checkbox"
                            {...register('isPublished')}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700">✅ Publish course</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Course History */}
                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-3 rounded-xl border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-800 mb-2">📅 Course History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Created:</span>
                      <span className="ml-2 font-medium">
                        {new Date(course.createdAt).toLocaleDateString('vi-VN')} at {new Date(course.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Updated:</span>
                      <span className="ml-2 font-medium">
                        {new Date(course.updatedAt).toLocaleDateString('vi-VN')} at {new Date(course.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">📖 Course Lessons</h3>
                    <p className="text-sm text-gray-500">
                      Manage lessons • Total: {lessonFields.length} lessons • Duration: {totalEstimatedTime} minutes
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddLesson}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>

                {/* Lessons Summary */}
                {lessonFields.length > 0 && (
                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-gray-800 mb-2">📊 Lessons Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-blue-600 font-semibold">
                          {lessonFields.filter((_, index) => watch(`lessons.${index}.difficulty`) === 'beginner').length}
                        </span>
                        <span className="text-gray-600 ml-1">🟢 Beginner</span>
                      </div>
                      <div>
                        <span className="text-yellow-600 font-semibold">
                          {lessonFields.filter((_, index) => watch(`lessons.${index}.difficulty`) === 'intermediate').length}
                        </span>
                        <span className="text-gray-600 ml-1">🟡 Intermediate</span>
                      </div>
                      <div>
                        <span className="text-red-600 font-semibold">
                          {lessonFields.filter((_, index) => watch(`lessons.${index}.difficulty`) === 'advanced').length}
                        </span>
                        <span className="text-gray-600 ml-1">🔴 Advanced</span>
                      </div>
                      <div>
                        <span className="text-orange-600 font-semibold">
                          {lessonFields.filter((_, index) => watch(`lessons.${index}.isLocked`)).length}
                        </span>
                        <span className="text-gray-600 ml-1">🔒 Locked</span>
                      </div>
                    </div>
                  </div>
                )}

                {lessonFields.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <BookOpen className="w-14 h-14 mx-auto text-gray-400 mb-3" />
                    <h4 className="text-base font-semibold text-gray-600 mb-1.5">No lessons yet</h4>
                    <p className="text-gray-500 text-sm mb-3">Add lessons to make your course more comprehensive</p>
                    <Button
                      type="button"
                      onClick={handleAddLesson}
                      variant="secondary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Lesson
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {lessonFields.map((field, index) => {
                      const difficultyOption = getDifficultyOption(watch(`lessons.${index}.difficulty`));
                      const isExistingLesson = !!(field as any).id;

                      return (
                        <div key={field.id} className={`border rounded-xl p-3 shadow-sm transition-all ${isExistingLesson
                          ? 'bg-white border-gray-200'
                          : 'bg-green-50 border-green-200 shadow-md'
                          }`}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isExistingLesson
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-green-100 text-green-700'
                                  }`}>
                                  #{index + 1} {isExistingLesson ? '' : '(New)'}
                                </span>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${difficultyOption.bg} ${difficultyOption.color}`}>
                                {difficultyOption.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                ⏱️ {watch(`lessons.${index}.estimatedTime`) || 0}min
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => handleMoveLesson(index, 'up')}
                                disabled={index === 0}
                                className="text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ArrowUp className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveLesson(index, 'down')}
                                disabled={index === lessonFields.length - 1}
                                className="text-gray-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <ArrowDown className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeLesson(index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                              name={`lessons.${index}.title`}
                              label="Lesson Title *"
                              placeholder="e.g., Introduction to React"
                            />
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Difficulty</label>
                              <select
                                {...register(`lessons.${index}.difficulty`)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-white text-sm"
                              >
                                {difficultyOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="mt-3">
                            <FormField
                              name={`lessons.${index}.description`}
                              label="Description"
                              placeholder="Brief lesson description..."
                              type="textarea"
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Order</label>
                              <input
                                type="number"
                                {...register(`lessons.${index}.orderNo`)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Time (min)</label>
                              <input
                                type="number"
                                {...register(`lessons.${index}.estimatedTime`)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                min="1"
                                placeholder="30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Access</label>
                              <div className="flex items-center h-10">
                                <input
                                  type="checkbox"
                                  {...register(`lessons.${index}.isLocked`)}
                                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">🔒 Locked</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1.5">🎯 Learning Objectives</label>
                            <textarea
                              {...register(`lessons.${index}.objectives`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none text-sm"
                              rows={2}
                              placeholder="Enter objectives (one per line)..."
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-purple-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                📊 Course with {lessonFields.length} lesson{lessonFields.length !== 1 ? 's' : ''} • {totalEstimatedTime} minutes total
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={editMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Update Course & Lessons
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default EditCourseModal;
