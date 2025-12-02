/**
 * API Report Page - Wrapper
 *
 * This file re-exports the refactored AiReportPage from features/ai-report
 * The original 1400+ line file has been refactored into:
 *
 * /features/ai-report/
 *   ├── AiReportPage.tsx        (~120 lines - main page)
 *   ├── index.ts                (exports)
 *   ├── types/
 *   │   └── index.ts            (all TypeScript interfaces)
 *   ├── services/
 *   │   └── agent.service.ts    (API layer)
 *   ├── hooks/
 *   │   ├── index.ts
 *   │   ├── useStreamChat.ts    (streaming logic)
 *   │   ├── useConversations.ts (conversation management)
 *   │   ├── useChatStats.ts     (analytics calculation)
 *   │   └── useDocumentUpload.ts(document upload)
 *   └── components/
 *       ├── index.ts
 *       ├── chat/
 *       │   ├── ChatHeader.tsx
 *       │   ├── ChatEmptyState.tsx
 *       │   ├── ChatInput.tsx
 *       │   ├── ChatList.tsx
 *       │   ├── ChatMessageItem.tsx
 *       │   └── StreamingMessage.tsx
 *       ├── analytics/
 *       │   └── AnalyticsPanels.tsx
 *       ├── documents/
 *       │   └── DocumentsManager.tsx
 *       └── ui/
 *           ├── Card.tsx
 *           ├── MessageBubble.tsx
 *           └── FileDownloadButton.tsx
 */

export { AiReportPage as default } from '../features/ai-report';
