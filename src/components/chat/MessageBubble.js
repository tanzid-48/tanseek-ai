"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, RotateCcw } from "lucide-react";
import CodeBlock from "./CodeBlock";
import { motion } from "framer-motion";

// Strip stray single backticks from text OUTSIDE triple-backtick code fences.
// Splitting on the ``` fence pattern keeps actual code blocks untouched.
function cleanBackticks(text) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part) => {
      if (part.startsWith("```")) {
        return part; // leave fenced code blocks untouched
      }
      return part.replace(/\\`/g, "`").replace(/`/g, "");
    })
    .join("");
}

export default function MessageBubble({
  role,
  content,
  onRegenerate,
  isLast,
  isStreaming,
}) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const cleanContent = cleanBackticks(content || "");

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="mb-6 flex justify-end"
      >
        <div className="max-w-[75%] rounded-xl bg-primary px-4 py-2.5 text-sm text-text">
          {content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mb-6"
    >
      <div className="prose prose-invert max-w-none text-sm text-text prose-p:my-2 prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              const isInline = !match && !codeString.includes("\n");
              if (!codeString.trim()) {
                return null;
              }

              if (isInline) {
                return (
                  <code
                    className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return <CodeBlock language={match?.[1]} value={codeString} />;
            },
          }}
        >
          {cleanContent || (isStreaming ? "..." : "")}
        </ReactMarkdown>
      </div>

      {content && !(isLast && isStreaming) && (
        <div className="mt-1 flex items-center gap-2 text-muted">
          <button
            onClick={handleCopy}
            className="rounded p-1 hover:bg-surface hover:text-text transition-colors"
            aria-label="Copy"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          {isLast && (
            <button
              onClick={onRegenerate}
              className="rounded p-1 hover:bg-surface hover:text-text transition-colors"
              aria-label="Regenerate"
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
