  # API Report Dashboard

## Tổng quan

API Report Dashboard là một trang dashboard trong CMS cho phép tương tác với AI Agent để nhận insights và recommendations về việc học tiếng Anh.

## Tính năng

### 🤖 AI Chat Interface

- Chat real-time với AI agent
- Hỗ trợ multiple languages (EN, VI, ES, FR)
- Hiển thị confidence score cho mỗi phản hồi
- Chat history với timestamps

### 📊 Quick Stats

- Tổng số chats đã thực hiện
- Trung bình confidence score
- Ngôn ngữ hiện tại đang sử dụng

### ⚡ Quick Actions

- Get AI Recommendations: Nhận gợi ý từ AI
- Clear History: Xóa lịch sử chat

### 📝 Recent Activity

- Hiển thị 3 tin nhắn gần nhất
- Timestamps và confidence scores

## Cách sử dụng

### 1. Truy cập Dashboard

```bash
http://localhost:3000/api-report
```

### 2. Chat với AI

- Nhập message vào input field
- Chọn ngôn ngữ từ dropdown
- Nhấn Enter hoặc click Send button
- Xem phản hồi từ AI với confidence score

### 3. Nhận Recommendations

- Click "Get Recommendations" button
- AI sẽ phân tích và đưa ra gợi ý cá nhân hóa

### 4. Quản lý Chat History

- Xem lịch sử chat ở phía trên
- Click "Clear History" để xóa tất cả

## API Endpoints

### POST /api/private/v1/agent/chat

```json
{
  "message": "Hello AI, help me learn English",
  "language": "en",
  "context": "optional context"
}
```

**Response:**

```json
{
  "statusCode": 200,
  "message": "AI response generated successfully",
  "data": {
    "response": "That's a great goal! Let me help you...",
    "confidence": 0.85,
    "sources": ["English Grammar Guide"],
    "suggestions": ["Practice daily", "Focus on vocabulary"]
  }
}
```

### GET /api/private/v1/agent/recommendations

**Response:**

```json
{
  "statusCode": 200,
  "message": "Recommendations fetched successfully",
  "data": [
    {
      "id": "1",
      "type": "vocabulary",
      "title": "Expand Your Vocabulary",
      "description": "Focus on learning 10 new words daily",
      "confidence": 0.85
    }
  ]
}
```

## Technical Implementation

### Frontend (cms-english)

- **Framework**: React + TypeScript
- **State Management**: TanStack Query
- **UI**: Tailwind CSS + Material-UI icons
- **Routing**: React Router

### Backend (english-learning)

- **Framework**: NestJS
- **Database**: Prisma + PostgreSQL
- **Authentication**: JWT
- **API Documentation**: Swagger

## File Structure

```bash
cms-english/
├── src/
│   ├── apis/agent.ts              # API client
│   ├── pages/ApiReportPage.tsx    # Main dashboard page
│   ├── components/Sidebar.tsx     # Updated navigation
│   └── App.tsx                    # Updated routing

english-learning/
├── apps/client-api/
│   └── src/domains/agent/
│       ├── controller/            # API endpoints
│       ├── service/               # Business logic
│       ├── dto/                   # Data transfer objects
│       └── agent.module.ts        # NestJS module
```

## Development

### Start Backend

```bash
cd english-learning
npm run start:client-api:dev
```

### Start Frontend

```bash
cd cms-english
npm run dev
```

### Test API

```bash
node test-agent-api.js
```

## Features Roadmap

- [ ] Real AI integration (OpenAI, Google AI)
- [ ] User progress analysis
- [ ] Personalized learning paths
- [ ] Voice chat capabilities
- [ ] Export chat history
- [ ] Advanced analytics dashboard

## Notes

- Hiện tại sử dụng mock responses cho demo
- API endpoints đã sẵn sàng cho integration với real AI services
- UI responsive và mobile-friendly
- Error handling và loading states đã implement
