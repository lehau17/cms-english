import { CreateCourseDto, SessionActivityDto } from "@/interface/course.interface";
import { ChevronDown, ChevronUp, Clock, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Control, FieldErrors, Path, useFieldArray, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";

interface ActivityOption {
    id: string;
    title: string;
    type: string;
    lessonTitle?: string;
    lessonIndex?: number;
}

const asPath = (s: string) => s as Path<CreateCourseDto>;

export interface SessionSchedulesProps {
    control: Control<CreateCourseDto>;
    register: UseFormRegister<CreateCourseDto>;
    errors: FieldErrors<CreateCourseDto>;
    setValue: UseFormSetValue<CreateCourseDto>;
    watch: UseFormWatch<CreateCourseDto>;
}

const SessionSchedules = ({ control, register, errors, setValue, watch }: SessionSchedulesProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedSession, setExpandedSession] = useState<number | null>(null);
    const [plannedSessions, setPlannedSessions] = useState(8); // Mặc định 8 buổi
    const [activityOptions, setActivityOptions] = useState<ActivityOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Sử dụng useFieldArray để quản lý danh sách sessionSchedules
    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "sessionSchedules"
    });

    // Theo dõi thay đổi của plannedSessions từ form
    const watchPlannedSessions = watch("plannedSessions");

    // Khi plannedSessions thay đổi, cập nhật state local
    useEffect(() => {
        if (watchPlannedSessions) {
            setPlannedSessions(watchPlannedSessions);
        }
    }, [watchPlannedSessions]);

    // Tự động tạo danh sách buổi học khi watchPlannedSessions thay đổi
    useEffect(() => {
        // Tạo danh sách hoạt động từ tất cả các bài học
        const lessons = watch("lessons") || [];
        const options: ActivityOption[] = [];

        lessons.forEach((lesson, lessonIndex) => {
            const activities = lesson.activities || [];
            activities.forEach((activity, activityIndex) => {
                // Tạo temporary ID từ lessonIndex và activityIndex
                const tempId = `temp_${lessonIndex}_${activityIndex}`;
                options.push({
                    id: tempId,
                    title: activity.title || 'Unnamed Activity',
                    type: activity.type,
                    lessonTitle: lesson.title,
                    lessonIndex
                });
            });
        });

        setActivityOptions(options);

        // Cập nhật số lượng buổi học dựa trên plannedSessions
        const currentSessions = fields.length;
        const targetSessions = watchPlannedSessions || 8;

        if (currentSessions < targetSessions) {
            // Thêm các buổi học còn thiếu
            for (let i = currentSessions; i < targetSessions; i++) {
                append({
                    sessionNumber: i + 1,
                    title: `Buổi ${i + 1}`,
                    description: '',
                    activities: []
                });
            }
        } else if (currentSessions > targetSessions) {
            // Xóa các buổi học thừa từ cuối danh sách
            for (let i = currentSessions - 1; i >= targetSessions; i--) {
                remove(i);
            }
        }
    }, [watchPlannedSessions, watch, append, remove, fields.length]);

    // Lọc hoạt động dựa trên từ khóa tìm kiếm
    const filteredActivities = searchTerm
        ? activityOptions.filter(
            act =>
                act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                act.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (act.lessonTitle && act.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : activityOptions;

    // Thêm hoạt động vào buổi học
    const addActivityToSession = (sessionIndex: number, activity: ActivityOption) => {
        const currentActivities = watch(`sessionSchedules.${sessionIndex}.activities`) || [];

        // Kiểm tra xem hoạt động đã có trong buổi học chưa
        const exists = currentActivities.some((act: SessionActivityDto) => act.activityId === activity.id);

        if (!exists) {
            const updatedActivities = [
                ...currentActivities,
                {
                    activityId: activity.id,
                    orderNo: currentActivities.length + 1
                }
            ];

            setValue(`sessionSchedules.${sessionIndex}.activities`, updatedActivities);
        }
    };

    // Xóa hoạt động khỏi buổi học
    const removeActivityFromSession = (sessionIndex: number, activityIndex: number) => {
        const currentActivities = [...(watch(`sessionSchedules.${sessionIndex}.activities`) || [])];
        currentActivities.splice(activityIndex, 1);

        // Cập nhật lại orderNo
        const updatedActivities = currentActivities.map((act, idx) => ({
            ...act,
            orderNo: idx + 1
        }));

        setValue(`sessionSchedules.${sessionIndex}.activities`, updatedActivities);
    };

    // Lấy thông tin chi tiết của hoạt động từ ID
    const getActivityDetails = (activityId: string): ActivityOption | undefined => {
        return activityOptions.find(act => act.id === activityId);
    };

    // Chuyển đổi từ tempId sang thông tin lesson và activity
    const getInfoFromTempId = (tempId: string) => {
        if (tempId && tempId.startsWith('temp_')) {
            const parts = tempId.split('_');
            if (parts.length === 3 && parts[1] !== undefined && parts[2] !== undefined) {
                const lessonIndex = parseInt(parts[1]);
                const activityIndex = parseInt(parts[2]);
                return { lessonIndex, activityIndex };
            }
        }
        return null;
    };

    return (
        <div className="bg-white p-6 rounded border border-gray-200 mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <Clock className="mr-2 w-5 h-5 text-gray-600" />
                Lộ trình buổi học
            </h3>

            <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Số buổi học dự kiến</label>
                <input
                    type="number"
                    min="1"
                    {...register("plannedSessions", {
                        valueAsNumber: true,
                        onChange: (e) => setPlannedSessions(parseInt(e.target.value) || 8)
                    })}
                    className="w-full md:w-1/3 px-4 py-3 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Số buổi học"
                />
                <p className="text-sm text-gray-500 mt-2">
                    Chỉ định số buổi học dự kiến cho khóa học này. Mặc định là 8 buổi.
                </p>
                {errors.plannedSessions && (
                    <p className="text-red-500 text-sm mt-1">{errors.plannedSessions.message}</p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Danh sách session schedules */}
                {fields.map((session, index) => (
                    <div key={session.id} className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
                        <div
                            className="flex justify-between items-center px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setExpandedSession(expandedSession === index ? null : index)}
                        >
                            <div className="flex items-center">
                                <span className="bg-gray-100 text-gray-700 text-sm font-medium px-3 py-1 rounded mr-3">
                                    Buổi #{session.sessionNumber}
                                </span>
                                <h4 className="font-medium">
                                    {watch(`sessionSchedules.${index}.title`) || `Buổi học ${index + 1}`}
                                </h4>
                                <span className="ml-3 text-gray-400 text-sm">
                                    {watch(`sessionSchedules.${index}.activities`)?.length || 0} hoạt động
                                </span>
                            </div>
                            <div className="flex items-center">
                                <button type="button" className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                    {expandedSession === index ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </button>
                            </div>
                        </div>

                        {expandedSession === index && (
                            <div className="px-5 py-4 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tiêu đề buổi học</label>
                                        <input
                                            {...register(`sessionSchedules.${index}.title`)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Ví dụ: Buổi 1 - Giới thiệu ngữ pháp cơ bản"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả buổi học</label>
                                        <input
                                            {...register(`sessionSchedules.${index}.description`)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                            placeholder="Mô tả ngắn gọn về nội dung buổi học"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Các hoạt động trong buổi học</label>

                                    {/* Danh sách hoạt động đã chọn */}
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                                        <h5 className="text-sm font-medium text-gray-700 mb-3">Hoạt động đã chọn</h5>
                                        {watch(`sessionSchedules.${index}.activities`)?.length ? (
                                            <div className="space-y-2">
                                                {watch(`sessionSchedules.${index}.activities`)?.map((activity: SessionActivityDto, actIdx: number) => {
                                                    const activityDetail = getActivityDetails(activity.activityId);
                                                    return (
                                                        <div key={actIdx} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                                            <div className="flex items-center">
                                                                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2">
                                                                    {activity.orderNo}
                                                                </span>
                                                                <span className="font-medium">{activityDetail?.title || 'Unknown Activity'}</span>
                                                                {activityDetail?.lessonTitle && (
                                                                    <span className="ml-2 text-xs text-gray-500">
                                                                        from {activityDetail.lessonTitle}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeActivityFromSession(index, actIdx)}
                                                                className="text-gray-500 hover:text-red-600 transition-colors p-1"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-gray-500">Chưa có hoạt động nào được thêm vào buổi học này</p>
                                        )}
                                    </div>

                                    {/* Tìm kiếm và thêm hoạt động */}
                                    <div className="border border-gray-200 rounded-lg">
                                        <div className="p-3 border-b border-gray-200">
                                            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                                                <Search size={16} className="text-gray-400" />
                                                <input
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    placeholder="Tìm kiếm hoạt động..."
                                                    className="ml-2 bg-transparent border-none focus:outline-none focus:ring-0 w-full text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-60 overflow-y-auto p-2">
                                            {isLoading ? (
                                                <div className="text-center py-4">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                                    <p className="text-sm text-gray-500 mt-2">Đang tải hoạt động...</p>
                                                </div>
                                            ) : filteredActivities.length > 0 ? (
                                                <div className="space-y-1">
                                                    {filteredActivities.map((activity) => (
                                                        <div
                                                            key={activity.id}
                                                            onClick={() => addActivityToSession(index, activity)}
                                                            className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                                                        >
                                                            <div>
                                                                <span className="font-medium">{activity.title}</span>
                                                                <div className="text-xs text-gray-500 flex items-center mt-1">
                                                                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                                        {activity.type}
                                                                    </span>
                                                                    {activity.lessonTitle && (
                                                                        <span className="ml-2">
                                                                            Từ: {activity.lessonTitle}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500 p-3 text-center">
                                                    {searchTerm ? 'Không tìm thấy hoạt động phù hợp' : 'Tạo bài học và hoạt động trước khi thêm vào buổi học'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p>Lưu ý: Nếu chỉnh sửa số buổi học, danh sách buổi học sẽ được tự động điều chỉnh.</p>
            </div>
        </div>
    );
};

export default SessionSchedules;
