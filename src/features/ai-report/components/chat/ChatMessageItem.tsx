import "highlight.js/styles/github.css";
import { Sparkles } from "lucide-react";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import { ChartRenderer } from "../../../../components/ChartRenderer";
import { ChatMessage } from "../../types";
import { FileList } from "../ui";

interface ChatMessageItemProps {
  chat: ChatMessage;
}

function CodeBlock({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const code = String(children ?? "");
  const lang = (className || "").match(/language-(\w+)/)?.[1];

  if (inline) {
    return (
      <code className="px-1 py-0.5 rounded bg-[#f2f1ec] text-[0.9em]">
        {children}
      </code>
    );
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-[#d4d3ce] bg-white">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#d4d3ce] bg-[#f6f5f1]">
        <span className="text-xs text-[#6b6b6b]">{lang || "code"}</span>
        <button
          className="text-xs px-2 py-1 rounded-md border border-[#d4d3ce] bg-white hover:bg-[#f2f1ec]"
          onClick={() => navigator.clipboard.writeText(code.replace(/\n$/, ""))}
        >
          Copy
        </button>
      </div>
      <pre className="m-0 p-3 overflow-x-auto text-sm leading-relaxed">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ chat }) => {
  return (
    <div className="space-y-6">
      {/* User Message */}
      <div className="flex justify-end">
        <div className="max-w-[85%] bg-[#e8e7e2] rounded-3xl px-5 py-3">
          <p className="text-[#1a1a1a] text-[15px] leading-relaxed">{chat.message}</p>
        </div>
      </div>

      {/* AI Response */}
      <div className="flex gap-3 items-start">
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-[#d97757] flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          {/* Response Text */}
          <div
            className="
              prose prose-sm max-w-none text-[#1a1a1a]
              prose-p:leading-relaxed
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-a:text-[#d97757] prose-a:no-underline hover:prose-a:underline
              prose-hr:border-[#d4d3ce]
              prose-blockquote:border-l-[#d97757] prose-blockquote:bg-[#f6f5f1]
              prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg
              prose-strong:text-[#1a1a1a]
              prose-ul:my-2 prose-ol:my-2
            "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code: (props) => <CodeBlock {...props} />,
                table: (props) => (
                  <div className="my-3 overflow-x-auto">
                    <table className="w-full border-collapse text-sm" {...props} />
                  </div>
                ),
                th: (props) => (
                  <th
                    className="border border-[#d4d3ce] px-3 py-2 bg-[#f6f5f1] text-left"
                    {...props}
                  />
                ),
                td: (props) => (
                  <td className="border border-[#d4d3ce] px-3 py-2 align-top" {...props} />
                ),
              }}
            >
              {chat.response}
            </ReactMarkdown>
          </div>

          {/* Charts */}
          {chat.charts && chat.charts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              {chat.charts.map((chart, idx) => (
                <div key={idx} className="border border-[#d4d3ce] rounded-xl p-4 bg-white">
                  <ChartRenderer chart={chart} />
                </div>
              ))}
            </div>
          )}

          {/* File Downloads */}
          {chat.files && <FileList files={chat.files} />}
        </div>
      </div>
    </div>
  );
};
