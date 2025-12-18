import holidayApi, { HolidayItem } from '@/apis/holiday';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Save, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const HolidayManagement: React.FC = () => {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const [newHolidayName, setNewHolidayName] = useState('');

    // Local state for edits before saving
    const [localHolidays, setLocalHolidays] = useState<HolidayItem[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    const queryClient = useQueryClient();

    const { data: holidayData, isLoading } = useQuery({
        queryKey: ['holidays', selectedYear],
        queryFn: async () => {
            const response = await holidayApi.getHolidays(selectedYear);
            setLocalHolidays(response.data.data.holidays || []);
            setIsDirty(false);
            return response.data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    console.log("Check holidayData", holidayData)

    const updateMutation = useMutation({
        mutationFn: (holidays: HolidayItem[]) => {
            return holidayApi.updateHolidays(selectedYear, { holidays });
        },
        onSuccess: () => {
            toast.success('Cập nhật ngày lễ thành công');
            setIsDirty(false);
            queryClient.invalidateQueries({ queryKey: ['holidays', selectedYear] });
        },
        onError: (error) => {
            console.error(error);
            toast.error('Có lỗi xảy ra khi cập nhật');
        },
    });

    const handleAddHoliday = () => {
        if (!newHolidayDate || !newHolidayName.trim()) {
            toast.error('Vui lòng nhập đầy đủ ngày và tên ngày lễ');
            return;
        }

        // Check duplicate date
        if (localHolidays.some(h => h.date === newHolidayDate)) {
            toast.error('Ngày này đã tồn tại trong danh sách');
            return;
        }

        const newHoliday: HolidayItem = {
            date: newHolidayDate,
            name: newHolidayName.trim(),
        };

        // Add and sort by date
        const updated = [...localHolidays, newHoliday].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setLocalHolidays(updated);
        setIsDirty(true);
        setNewHolidayDate('');
        setNewHolidayName('');
    };

    const handleDeleteHoliday = (date: string) => {
        const updated = localHolidays.filter(h => h.date !== date);
        setLocalHolidays(updated);
        setIsDirty(true);
    };

    const handleSave = () => {
        updateMutation.mutate(localHolidays);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (isDirty) {
            if (!window.confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn chuyển năm không?')) {
                return;
            }
        }
        setSelectedYear(parseInt(e.target.value));
    };

    // Generate simple year options (current - 2 to current + 5)
    const yearOptions = Array.from({ length: 8 }, (_, i) => currentYear - 2 + i);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        Quản lý ngày lễ
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Cấu hình các ngày nghỉ lễ để hệ thống tự động tránh xếp lịch</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={selectedYear}
                        onChange={handleYearChange}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        {yearOptions.map(year => (
                            <option key={year} value={year}>Năm {year}</option>
                        ))}
                    </select>

                    <button
                        onClick={handleSave}
                        disabled={!isDirty || updateMutation.isPending}
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isDirty
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {updateMutation.isPending ? (
                            <span className="animate-spin mr-2">⏳</span>
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Lưu thay đổi
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Add Form */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                        <div className="flex-1 w-full">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tên ngày lễ</label>
                            <input
                                type="text"
                                value={newHolidayName}
                                onChange={(e) => setNewHolidayName(e.target.value)}
                                placeholder="Ví dụ: Giỗ tổ Hùng Vương"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddHoliday()}
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Ngày (YYYY-MM-DD)</label>
                            <input
                                type="date"
                                value={newHolidayDate}
                                onChange={(e) => setNewHolidayDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                        <button
                            onClick={handleAddHoliday}
                            className="w-full sm:w-auto px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Thêm
                        </button>
                    </div>

                    {/* List */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên ngày lễ</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {localHolidays.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                                            Chưa có ngày lễ nào được cấu hình cho năm này.
                                        </td>
                                    </tr>
                                ) : (
                                    holidayData?.data.holidays.map((holiday) => (
                                        <tr key={holiday.date} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {new Date(holiday.date).toLocaleDateString('vi-VN', {
                                                    weekday: 'short',
                                                    year: 'numeric',
                                                    month: 'numeric',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {holiday.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteHoliday(holiday.date)}
                                                    className="text-red-600 hover:text-red-900 transition-colors p-1 rounded-full hover:bg-red-50"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Tổng cộng: {localHolidays.length} ngày nghỉ lễ</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HolidayManagement;
