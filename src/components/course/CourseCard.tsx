import { Course } from '@/interface/course.interface';
import { formatVND } from '@/utils/currency.utils';
import {
  BookOpen,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Trash2,
  User,
  XCircle
} from 'lucide-react';
import React from 'react';

interface CourseCardProps {
  course: Course;
  onView: (course: Course) => void;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
  formatDate: (dateString: string | Date | null | undefined) => string;
  isSelected?: boolean;
  onSelect?: (courseId: string, selected: boolean) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onView,
  onEdit,
  onDelete,
  formatDate,
  isSelected = false,
  onSelect,
}) => {
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500/90 text-white';
      case 'intermediate':
        return 'bg-yellow-500/90 text-white';
      case 'advanced':
        return 'bg-red-500/90 text-white';
      default:
        return 'bg-gray-500/90 text-white';
    }
  };

  return (
    <div className={`group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border ${isSelected ? 'border-indigo-500 border-2' : 'border-gray-100 hover:border-indigo-200'} transform hover:-translate-y-1 relative`}>
      {/* Checkbox for selection */}
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(course.id, e.target.checked)}
            className="w-5 h-5 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {/* Image/Header Section */}
      <div className="relative h-36 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
        {course.imageUrl ? (
          <img
            src={course.imageUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400">
            <BookOpen className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Difficulty Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${getDifficultyColor(course.difficulty)}`}>
            {course.difficulty?.toUpperCase() || 'N/A'}
          </span>
        </div>

        {/* Published/Draft Badge */}
        <div className="absolute top-2 left-2">
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm ${course.isPublished
            ? 'bg-green-500/90 text-white'
            : 'bg-gray-500/90 text-white'
            }`}>
            {course.isPublished ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Published</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                <span>Draft</span>
              </>
            )}
          </div>
        </div>

        {/* Price Badge */}
        <div className="absolute bottom-2 left-2">
          <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg">
            <span className="text-sm font-bold text-indigo-600">
              {formatVND(course.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors min-h-[40px]">
          {course.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-2">
          <User className="w-3.5 h-3.5" />
          <span className="truncate">
            {course.instructor?.firstName} {course.instructor?.lastName || 'Unknown'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDate(course.createdAt)}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(course)}
            className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-medium transition-colors"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>
          <button
            onClick={() => onEdit(course)}
            className="flex items-center justify-center px-2 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
            title="Edit Course"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(course)}
            className="flex items-center justify-center px-2 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
            title="Delete Course"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;


