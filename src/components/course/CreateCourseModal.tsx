import { createCourse } from '@/apis/course';
import { useTeachers } from '@/hooks/useTeacher';
import { Course } from '@/interface/course.interface';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, GripVertical, Plus, Trash2 } from 'lucide-react';
import { LibraryBooks, MenuBook, Person, CheckCircle, BarChart, Lock, TrackChanges } from '@mui/icons-material';
import { useState } from 'react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import * as yup from 'yup';
import FormField from '../forms/FormField';
import Button from '../ui/Button';
import Modal from '../ui/Modal';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LessonFormData {
  title: string;
  description: string;
  orderNo: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  isLocked: boolean;
  objectives: string;
}

interface CreateCourseFormValues {
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
  title: yup.string().required('Vui lòng nhập tiêu đề bài học'),
  description: yup.string().optional(),
  orderNo: yup.number().min(1).required(),
  difficulty: yup.string().oneOf(['beginner', 'intermediate', 'advanced']).required(),
  estimatedTime: yup.number().min(1).optional(),
  isLocked: yup.boolean().default(true),
  objectives: yup.string().optional(),
});

const schema = yup.object({
  title: yup.string().required('Vui lòng nhập tiêu đề khóa học'),
  description: yup.string().required('Vui lòng nhập mô tả'),
  price: yup.number().min(0).required('Vui lòng nhập giá'),
  instructorId: yup.string().required('Vui lòng chọn giáo viên'),
  difficulty: yup.string().required('Vui lòng chọn độ khó'),
  language: yup.string().required('Vui lòng chọn ngôn ngữ'),
  isPublished: yup.boolean().default(false),
  lessons: yup.array().of(lessonSchema).default([]),
});

const difficultyOptions = [
  { value: 'beginner', label: '🟢 Beginner', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  { value: 'intermediate', label: '🟡 Intermediate', color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  { value: 'advanced', label: '🔴 Advanced', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
];

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { data: teachersData, isLoading: isLoadingTeachers } = useTeachers({ limit: 1000 });
  const [showLessons, setShowLessons] = useState(true);
  const [activeTab, setActiveTab] = useState<'course' | 'lessons'>('course');

  const methods = useForm<CreateCourseFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      isPublished: false,
      instructorId: '',
      difficulty: 'beginner',
      language: 'en',
      lessons: [],
    },
  });

  const { register, handleSubmit, formState: { errors }, control, watch } = methods;
  const { fields: lessonFields, append: addLesson, remove: removeLesson, move: moveLesson } = useFieldArray({
    control,
    name: 'lessons',
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Course>) => {
      const courseData = {
        ...data,
        lessons: data.lessons?.map(lesson => ({
          ...lesson,
          objectives: lesson.objectives ? lesson?.objectives?.filter(obj => obj.trim()) : [],
        })),
      };
      return createCourse(courseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      methods.reset();
      onClose();
    },
  });

  const onSubmit = (data: CreateCourseFormValues) => {
    createMutation.mutate(data);
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

  const getDifficultyOption = (difficulty: string) => {
    return difficultyOptions.find(opt => opt.value === difficulty) || difficultyOptions[0];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tạo khóa học mới"
      description="Tạo khóa học đầy đủ với các bài học"
      icon={<BookOpen className="w-6 h-6 text-purple-600" />}
      maxWidthClass="max-w-5xl"
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
              <LibraryBooks sx={{ fontSize: 16, mr: 0.5 }} /> Chi tiết khóa học
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('lessons')}
              className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors relative ${activeTab === 'lessons'
                ? 'bg-white text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <MenuBook sx={{ fontSize: 16, mr: 0.5 }} /> Bài học ({lessonFields.length})
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
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-1"><LibraryBooks fontSize="small" /> Thông tin cơ bản</h3>
                  <div className="space-y-4">
                    <FormField name="title" label="Tiêu đề khóa học *" placeholder="Nhập tiêu đề khóa học" />
                    <FormField name="description" label="Mô tả *" placeholder="Nhập mô tả khóa học" type="textarea" />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl border border-blue-100">
                  <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-1"><Person fontSize="small" /> Giáo viên & Cài đặt</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">Giáo viên *</label>
                      <select
                        {...register('instructorId')}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none bg-white"
                        disabled={isLoadingTeachers}
                      >
                        <option value="">{isLoadingTeachers ? 'Đang tải danh sách giáo viên...' : 'Chọn giáo viên'}</option>
                        {teachersData?.data.data.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName} - {teacher.email}
                          </option>
                        ))}
                      </select>
                      {errors.instructorId && <p className="text-red-500 text-sm mt-1">{errors.instructorId.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name="price" label="Giá ($)" type="number" placeholder="0" />
                      <FormField name="difficulty" label="Độ khó" placeholder="beginner" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField name="language" label="Ngôn ngữ" placeholder="en" />
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">Trạng thái xuất bản</label>
                        <div className="flex items-center h-10 bg-gray-50 rounded-xl px-3 border border-gray-200">
                          <input
                            type="checkbox"
                            {...register('isPublished')}
                            className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                          <span className="ml-3 text-sm font-medium text-gray-700 flex items-center gap-1"><CheckCircle fontSize="small" color="success" /> Xuất bản ngay</span>
                        </div>
                      </div>
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
                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-1"><MenuBook fontSize="small" /> Bài học khóa học</h3>
                    <p className="text-xs text-gray-500">Thêm và sắp xếp các bài học cho khóa học của bạn</p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddLesson}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm bài học
                  </Button>
                </div>

                {lessonFields.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                    <BookOpen className="w-14 h-14 mx-auto text-gray-400 mb-3" />
                    <h4 className="text-base font-semibold text-gray-600 mb-1.5">Chưa có bài học nào</h4>
                    <p className="text-gray-500 text-sm mb-3">Bắt đầu xây dựng khóa học bằng cách thêm bài học đầu tiên</p>
                    <Button
                      type="button"
                      onClick={handleAddLesson}
                      variant="secondary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Thêm bài học đầu tiên
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {lessonFields.map((field, index) => {
                      const difficultyOption = getDifficultyOption(watch(`lessons.${index}.difficulty`));
                      return (
                        <div key={field.id} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-1 rounded-full">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className={`px-2 py-1 rounded-full text-xs font-medium border ${difficultyOption?.bg} ${difficultyOption?.color}`}>
                                {difficultyOption?.label}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLesson(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                              name={`lessons.${index}.title`}
                              label="Tiêu đề bài học *"
                              placeholder="e.g., Introduction to React"
                            />
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Độ khó</label>
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

                          <div className="mt-4">
                            <FormField
                              name={`lessons.${index}.description`}
                              label="Mô tả"
                              placeholder="Mô tả ngắn gọn về bài học..."
                              type="textarea"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Thứ tự</label>
                              <input
                                type="number"
                                {...register(`lessons.${index}.orderNo`)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                min="1"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Thời gian (phút)</label>
                              <input
                                type="number"
                                {...register(`lessons.${index}.estimatedTime`)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors text-sm"
                                min="1"
                                placeholder="30"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1.5">Truy cập</label>
                              <div className="flex items-center h-10">
                                <input
                                  type="checkbox"
                                  {...register(`lessons.${index}.isLocked`)}
                                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                />
                                <span className="ml-2 text-sm text-gray-700 flex items-center gap-1"><Lock fontSize="small" /> Đã khóa</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1"><TrackChanges fontSize="small" /> Mục tiêu bài học</label>
                            <textarea
                              {...register(`lessons.${index}.objectives`)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none text-sm"
                              rows={2}
                              placeholder="Nhập mục tiêu (mỗi dòng một mục)..."
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
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <BarChart fontSize="small" /> Khóa học có {lessonFields.length} bài học
              </div>
              <div className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={onClose}>
                  Hủy
                </Button>
                <Button
                  type="submit"
                  isLoading={createMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo khóa học
                </Button>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};

export default CreateCourseModal;
