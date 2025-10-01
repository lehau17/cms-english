## Audio Generation Feature Implementation

### Tính năng mới đã thêm:

1. **Hook `useGenerateAudio`** (`/src/hooks/useGenerateAudio.ts`):
   - Sử dụng TanStack Query để gọi API text-to-speech
   - Endpoint: `/public/v1/google-translate/free/text-to-speech`
   - Hỗ trợ ngôn ngữ English và Vietnamese
   - Toast notifications cho success/error

2. **Component `AudioGenerationOptions`** (`/src/components/AudioGenerationOptions.tsx`):
   - UI component cho phép chọn giữa Upload file hoặc Generate audio
   - Text input để nhập nội dung cần chuyển thành audio
   - Language selection (English/Vietnamese)
   - Audio preview functionality
   - File upload fallback option

3. **Tích hợp vào `CreateAssignmentPage`**:
   - Tự động hiển thị audio options cho activities loại "listening" và "pronunciation"
   - Lưu audio URL vào `activity.mediaUrls.audio`
   - Required validation cho listening activities

### Cách sử dụng:

1. Khi tạo Assignment, thêm activity với type "Listening" hoặc "Pronunciation"
2. Phần "Audio Content" sẽ tự động hiển thị
3. Chọn "Generate Audio" thay vì "Upload File"
4. Nhập text cần chuyển thành audio
5. Chọn ngôn ngữ (English/Vietnamese)
6. Click "Generate Audio"
7. Có thể preview audio trước khi lưu
8. Audio URL sẽ được lưu vào `mediaUrls.audio` của activity

### API Payload:
```json
{
  "text": "Hello, this is a listening exercise",
  "language": "en"
}
```

### Response:
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": {
    "url": "https://generated-audio-url.mp3"
  }
}
```

### Files Modified:
- `src/hooks/useGenerateAudio.ts` (NEW)
- `src/components/AudioGenerationOptions.tsx` (NEW)
- `src/pages/CreateAssignmentPage.tsx` (UPDATED)
  - Added AudioGenerationOptions import
  - Added mediaUrls to Activity interface
  - Added audio generation UI for listening/pronunciation activities
  - Fixed toast.warning -> toast.error

### Test Steps:
1. Start CMS app: `npm run dev`
2. Navigate to Create Assignment page
3. Add a "Listening" activity
4. Scroll down to see "Audio Content" section
5. Select "Generate Audio" option
6. Enter sample text and generate audio
7. Preview generated audio
8. Save assignment

Tính năng này cho phép giáo viên dễ dàng tạo audio content cho bài tập nghe mà không cần phải upload file audio riêng biệt.
