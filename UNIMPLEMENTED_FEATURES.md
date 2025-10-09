# 🔴 CMS-ENGLISH - Chức Năng Chưa Implement

**Module:** Admin/Teacher Portal
**Last Updated:** 2025-01-05

---

## ⭐⭐⭐⭐⭐ **CRITICAL - Làm ngay**

### 1. DashboardPage - Dữ Liệu Giả
**File:** `src/pages/DashboardPage.tsx`
**Priority:** CRITICAL
**Effort:** 3-4 ngày

**Vấn đề:**
- Tất cả thống kê đang dùng mock data
- Lớp sắp diễn ra dùng dữ liệu giả
- Thông báo không có data thực

**Code locations:**
```typescript
// Line 308: Chưa có dữ liệu đăng ký gần đây
// Line 342: Chưa có dữ liệu phân bố khóa học
// Line 402: cls.roomName ?? 'Chưa phân phòng'
```

**Cần làm:**
- [ ] API call: `GET /api/dashboard/stats` → thống kê tổng quan
- [ ] API call: `GET /api/classrooms/upcoming` → lớp sắp diễn ra
- [ ] API call: `GET /api/dashboard/recent-registrations` → đăng ký gần đây
- [ ] API call: `GET /api/dashboard/course-distribution` → phân bố khóa học
- [ ] Replace tất cả mock data với API responses
- [ ] Add loading states
- [ ] Add error handling

**API Response Format:**
```typescript
// GET /api/dashboard/stats
{
  totalStudents: number
  activeClasses: number
  totalRevenue: number
  completionRate: number
}

// GET /api/classrooms/upcoming
{
  data: Array<{
    id: string
    name: string
    startTime: Date
    teacher: string
    roomName: string | null
  }>
}
```

---

### 2. ClassroomDetailPage - Missing Edit Functionality
**File:** `src/pages/ClassroomDetailPage.tsx:362`
**Priority:** HIGH
**Effort:** 1-2 ngày

**Vấn đề:**
```typescript
onClick={() => {/* TODO: Add edit functionality */ }}
```

**Cần làm:**
- [ ] Wire up EditClassroomModal (đã có component)
- [ ] Add state để control modal open/close
- [ ] Pass classroom data to modal
- [ ] Handle update success → refetch data
- [ ] Add toast notification

**Code:**
```typescript
const [isEditModalOpen, setIsEditModalOpen] = useState(false)

// Line 362 - Replace TODO
onClick={() => setIsEditModalOpen(true)}

// Add modal at bottom
{isEditModalOpen && (
  <EditClassroomModal
    isOpen={isEditModalOpen}
    onClose={() => setIsEditModalOpen(false)}
    classroom={classroom}
    onSuccess={() => {
      toast.success('Classroom updated!')
      refetch()
    }}
  />
)}
```

---

## ⭐⭐⭐ **MEDIUM Priority**

### 3. Parent Features - Missing Phone Number
**Files:**
- `src/pages/ParentPage.tsx:166`
- `src/components/parent/ViewParentModal.tsx:63`

**Priority:** MEDIUM
**Effort:** 1 ngày

**Vấn đề:**
- Hiển thị "Chưa có" khi không có phone number
- Phone number không bắt buộc khi tạo parent

**Cần làm:**
- [ ] **Option A:** Make phone required trong CreateParentModal
  - Add validation: `required: 'Phone number is required'`
  - Update API schema

- [ ] **Option B:** Add flow yêu cầu parent update sau
  - Show banner "Please complete your profile"
  - Link to edit profile page

**Recommended:** Option A (simpler, better data quality)

---

### 4. Session Schedules - Missing Activities
**File:** `src/components/course/SessionSchedules.tsx:264`
**Priority:** MEDIUM
**Effort:** 2-3 ngày

**Vấn đề:**
- Sessions được tạo nhưng không có activities
- Message: "Chưa có hoạt động nào được thêm vào buổi học này"

**Cần làm:**
- [ ] Check logic để add activities vào session (Line 106)
- [ ] Verify API integration với backend
- [ ] Add default activities khi tạo session mới từ lesson
- [ ] UI để manually add activities vào session
- [ ] Drag-and-drop reorder activities

**Related code:**
```typescript
// Line 106: Kiểm tra xem hoạt động đã có trong buổi học chưa
const isActivityInSession = (sessionId: string, activityId: string) => {
  // Implementation needed
}
```

---

## ⭐⭐ **LOW Priority**

### 5. IntegratedScheduleModal - Empty State
**File:** `src/components/schedule/IntegratedScheduleModal.tsx:237`
**Priority:** LOW
**Effort:** 1 ngày

**Vấn đề:**
- Empty state chỉ hiển thị text "Chưa có lịch"
- Không có action để tạo schedule mới

**Cần làm:**
- [ ] Add "Create Schedule" button trong empty state
- [ ] Open create modal khi click
- [ ] Add helpful message/illustration

**Code:**
```typescript
// Line 237 - Replace
{schedules.length === 0 ? (
  <div className="text-center py-12">
    <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
    <p className="text-gray-500 mb-4">Chưa có lịch học nào</p>
    <Button onClick={() => setShowCreateModal(true)}>
      Tạo lịch học mới
    </Button>
  </div>
) : (
  // ... existing schedule list
)}
```

---

### 6. Audio Generation Options - Testing
**File:** `src/components/AudioGenerationOptions.tsx`
**Priority:** LOW
**Effort:** 1 ngày (testing only)

**Status:** UI đã có, cần verify

**Cần test:**
- [ ] Try all voice types (male, female, etc.)
- [ ] Test speech speed adjustment (0.5x - 2.0x)
- [ ] Verify audio quality
- [ ] Test error scenarios:
  - Text too long
  - Network failure
  - Invalid voice type
- [ ] Add loading state improvements
- [ ] Add retry logic

---

## 📋 **CHECKLIST TỔNG HỢP**

### Critical Path (Week 1-2):
- [ ] DashboardPage real data (3-4 ngày)
- [ ] ClassroomDetailPage edit button (1-2 ngày)

### Medium Priority (Week 3-4):
- [ ] Parent phone number requirement (1 ngày)
- [ ] Session activities management (2-3 ngày)

### Polish (Week 5+):
- [ ] IntegratedScheduleModal empty state (1 ngày)
- [ ] Audio generation testing (1 ngày)

**Total Effort:** 9-13 ngày

---

## 🔗 **RELATED FILES**

### API Files:
- `src/apis/dashboard.ts` - Cần tạo hoặc update
- `src/apis/classroom.ts` - Đã có, cần thêm methods
- `src/apis/parent.ts` - Đã có

### Component Files:
- `src/pages/DashboardPage.tsx`
- `src/pages/ClassroomDetailPage.tsx`
- `src/components/parent/*`
- `src/components/course/SessionSchedules.tsx`
- `src/components/schedule/IntegratedScheduleModal.tsx`

### Hook Files:
- `src/hooks/useDashboard.ts` - Cần tạo
- `src/hooks/useClassroom.ts` - Đã có

---

## 🚀 **QUICK START**

### Để bắt đầu ngay:

1. **DashboardPage** (Priority #1):
```bash
# Tạo dashboard hook
touch src/hooks/useDashboard.ts

# Tạo dashboard API
touch src/apis/dashboard.ts

# Edit DashboardPage.tsx
code src/pages/DashboardPage.tsx
```

2. **ClassroomDetailPage Edit** (Priority #2):
```bash
# Chỉ cần edit 1 file
code src/pages/ClassroomDetailPage.tsx
# Search for TODO và wire up modal
```

---

## 📞 **SUPPORT**

- Backend API cần: Dashboard stats, upcoming classes
- Design needed: Empty state illustrations
- QA needed: Audio generation testing

---

**Document Owner:** Dev Team
**Status:** 🔴 Active Development Required
