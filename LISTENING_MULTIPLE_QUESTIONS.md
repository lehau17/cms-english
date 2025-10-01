# Listening Activity với Multiple Questions - Hoàn thành ✅

## Cấu trúc mới của Listening Activity

### Backend Changes:

1. **Updated `ListeningContent` DTO** (activity + assignment):
```typescript
export class ListeningQuestion {
  question!: string;
  options!: string[];
  correctIndex!: number;
  explanation?: string;
}

export class ListeningContent {
  audioUrl!: string;           // 1 audio duy nhất cho tất cả questions
  instructions?: string;       // Hướng dẫn chung
  questions!: ListeningQuestion[]; // Nhiều câu hỏi
}
```

2. **Validation Logic**:
   - Assignment: Kiểm tra `audioUrl` + `questions[]`
   - Activity: Cùng format với assignment

3. **Default Content**:
   - `{ audioUrl: '', instructions: '', questions: [] }`

### Frontend Changes:

1. **Listening Activity UI**:
   - 1 AudioGenerationOptions component cho toàn bộ listening
   - Danh sách questions có thể thêm/xóa
   - Mỗi question có: question text + 4 options + correct answer

2. **Data Structure**:
   - Audio URL lưu trong `activity.content.audioUrl`
   - Questions lưu trong `activity.content.questions[]`
   - Không sử dụng `mediaUrls` nữa

## Cách hoạt động:

1. **Tạo Listening Activity**:
   - Chọn type "Listening"
   - Upload/Generate 1 file audio duy nhất
   - Thêm nhiều questions dựa trên audio đó

2. **Structure trong DB**:
```json
{
  "type": "listening",
  "content": {
    "audioUrl": "https://example.com/audio.mp3",
    "instructions": "Listen to the audio and answer the questions",
    "questions": [
      {
        "question": "What is the main topic?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctIndex": 0,
        "explanation": "The speaker mentions..."
      },
      {
        "question": "When did this happen?",
        "options": ["Yesterday", "Last week", "Last month", "Last year"],
        "correctIndex": 1
      }
    ]
  }
}
```

## Tính năng hoàn thành:

✅ **Backend DTO đồng nhất** giữa Course và Assignment domains
✅ **Frontend UI** hỗ trợ 1 audio + nhiều questions
✅ **Validation** cho format mới
✅ **Audio Generation** tích hợp với TanStack Query
✅ **Backward compatibility** đã loại bỏ (clean implementation)

## Test Flow:

1. Vào CreateAssignmentPage
2. Add Activity → chọn "Listening"
3. Upload/Generate audio file
4. Click "Add Question" để thêm questions
5. Fill in questions, options, correct answers
6. Save assignment

Listening activity bây giờ có thể có **1 audio file** với **nhiều câu hỏi** như yêu cầu! 🎵📝
