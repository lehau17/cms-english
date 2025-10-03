# Hướng Dẫn Triển Khai Quản Lý Buổi Học Trên CMS

## Giới Thiệu

Tài liệu này mô tả cách triển khai tính năng quản lý lộ trình buổi học (Session Schedules) trên giao diện CMS. Tính năng này cho phép người quản trị:

- Thiết lập số buổi học dự kiến cho khóa học
- Tạo lịch trình cho từng buổi học với tiêu đề, mô tả
- Gán các hoạt động (activities) từ các bài học vào từng buổi
- Xem trước nội dung từng buổi học trước khi tạo khóa học

## Các File Đã Sửa/Tạo

1. `interface/course.interface.ts` - Thêm các interface liên quan đến session schedules
2. `components/course/SessionSchedules.tsx` - Component chính để quản lý lộ trình buổi học
3. `pages/CreateCoursePage.tsx` - Cập nhật trang tạo khóa học để tích hợp component mới

## Cấu Trúc Dữ Liệu

### SessionActivityDto
```typescript
export interface SessionActivityDto {
  activityId: string;
  orderNo: number;
}
```

### SessionScheduleDto
```typescript
export interface SessionScheduleDto {
  sessionNumber: number;
  title?: string;
  description?: string;
  activities: SessionActivityDto[];
}
```

### Cập nhật Course và CreateCourseDto
```typescript
export interface Course {
  // ...các field hiện có
  plannedSessions?: number;
  sessionSchedules?: SessionScheduleDto[];
}

export interface CreateCourseDto {
  // ...các field hiện có
  plannedSessions?: number;
  sessionSchedules?: SessionScheduleDto[];
}
```

## Luồng Hoạt Động

### Tạo Khóa Học
1. Người dùng nhập thông tin cơ bản về khóa học (Step 1)
2. Người dùng tạo các bài học và hoạt động (Step 2-3)
3. Người dùng cấu hình lộ trình buổi học (Step 4)
   - Nhập số buổi học dự kiến (mặc định là 8)
   - Với mỗi buổi học:
     - Thêm tiêu đề và mô tả
     - Tìm kiếm và thêm các hoạt động từ các bài học
4. Người dùng xem lại thông tin tổng thể và gửi form (Step 5)

### Cơ Chế Temp ID

Do hoạt động mới tạo không có ID thực sự cho đến khi lưu xuống server, chúng ta sử dụng "Temp ID" như sau:
- Mỗi hoạt động được gán một tempId theo format: `temp_{lessonIndex}_{activityIndex}`
- Khi submit form, chúng ta chuyển đổi tempId thành format `{lessonIndex}_{activityIndex}` để backend xử lý

## Các Chức Năng Chính

### 1. Thiết lập Số buổi học

```typescript
// SessionSchedules.tsx
const [plannedSessions, setPlannedSessions] = useState(8);
const watchPlannedSessions = watch("plannedSessions");

// Theo dõi thay đổi từ form
useEffect(() => {
  if (watchPlannedSessions) {
    setPlannedSessions(watchPlannedSessions);
  }
}, [watchPlannedSessions]);
```

### 2. Tự động tạo/xóa buổi học theo số buổi

```typescript
// SessionSchedules.tsx
useEffect(() => {
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
}, [watchPlannedSessions, append, remove, fields.length]);
```

### 3. Thêm/xóa hoạt động vào buổi học

```typescript
// SessionSchedules.tsx
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
```

### 4. Xử lý tempId khi submit

```typescript
// CreateCoursePage.tsx
const convertTempActivityIds = (sessionSchedules: any[]) => {
  return sessionSchedules.map(session => {
    if (!session.activities) return session;

    const convertedActivities = session.activities.map(activity => {
      const { activityId } = activity;

      // Nếu là tempId, chuyển đổi sang format lessonIndex_activityIndex
      if (activityId && activityId.startsWith('temp_')) {
        const parts = activityId.split('_');
        if (parts.length === 3) {
          const lessonIndex = parseInt(parts[1]);
          const activityIndex = parseInt(parts[2]);

          return {
            ...activity,
            activityId: `${lessonIndex}_${activityIndex}`
          };
        }
      }

      return activity;
    });

    return { ...session, activities: convertedActivities };
  });
};
```

## Hướng Dẫn Sử Dụng

1. Truy cập trang "Tạo khóa học"
2. Điền thông tin cơ bản, tạo bài học và hoạt động
3. Ở tab "Lộ trình buổi học":
   - Nhập số buổi học dự kiến
   - Mở từng buổi học bằng cách click vào header
   - Nhập tiêu đề và mô tả cho buổi học
   - Tìm kiếm và thêm các hoạt động vào buổi học
4. Xem lại thông tin tại tab "Review & Submit"
5. Nhấn "Create Course" để hoàn tất

## Lưu ý quan trọng

1. Cần tạo đầy đủ bài học và hoạt động trước khi thiết lập lộ trình buổi học
2. Nếu thay đổi số buổi học, các buổi học sẽ được tự động thêm/xóa
3. Mỗi hoạt động có thể được thêm vào nhiều buổi học khác nhau
4. Hoạt động được thêm vào buổi học theo thứ tự sẽ được hiển thị trên giao diện học viên

## Kế hoạch phát triển tương lai

1. Thêm khả năng kéo/thả để sắp xếp lại thứ tự các hoạt động trong buổi học
2. Tích hợp tính toán thời gian buổi học dựa trên thời lượng các hoạt động
3. Bổ sung giao diện quản lý buổi học cho trang EditCoursePage
4. Thêm tính năng nhân bản buổi học để dễ dàng tạo lộ trình tương tự
