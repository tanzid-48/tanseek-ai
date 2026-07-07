"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, RotateCcw, Pencil } from "lucide-react";
import CodeBlock from "./CodeBlock";
import TypingIndicator from "./TypingIndicator";
import { assets } from "@/assets/assets";

function cleanBackticks(text) {
  const parts = text.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part) => {
      if (part.startsWith("```")) {
        return part;
      }
      return part.replace(/\\`/g, "`").replace(/`/g, "");
    })
    .join("");
}

export default function MessageBubble({
  role,
  content,
  onRegenerate,
  onEdit,
  isLast,
  isStreaming,
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(content);
  const isUser = role === "user";

  const cleanContent = cleanBackticks(content || "");
  const isActivelyStreaming = isLast && isStreaming;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submitEdit = () => {
    const trimmed = editValue.trim();
    setEditing(false);
    if (trimmed && trimmed !== content) {
      onEdit?.(trimmed);
    }
  };

  if (isUser) {
    if (editing) {
      return (
        <div className="mb-6 w-full">
          <div className="ml-auto w-full max-w-[75%] rounded-xl border border-primary bg-surface p-2">
            <textarea
              autoFocus
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              rows={3}
              className="w-full resize-none bg-transparent text-sm text-text outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  setEditValue(content);
                  setEditing(false);
                }}
                className="rounded-md px-3 py-1.5 text-xs text-muted hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEdit}
                className="rounded-md bg-primary px-3 py-1.5 text-xs text-text hover:bg-primary-hover transition-colors"
              >
                Save & Submit
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="group mb-6 w-full"
      >
        <div className="ml-auto flex w-fit max-w-[75%] flex-col items-end gap-1">
          <div className="rounded-xl bg-primary px-4 py-2.5 text-sm text-text">
            {content}
          </div>
          {onEdit && !isStreaming && (
            <button
              onClick={() => setEditing(true)}
              className="rounded p-1 text-muted opacity-0 transition-opacity hover:bg-surface hover:text-text group-hover:opacity-100"
              aria-label="Edit message"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mb-6 flex items-start gap-3"
    >
      <Image
        src={assets.logo_icon}
        alt="TanSeek AI"
        width={24}
        height={24}
        className="mt-0.5 shrink-0 rounded-full"
      />

      <div className="min-w-0 flex-1">
        {!cleanContent && isStreaming ? (
          <TypingIndicator />
        ) : isActivelyStreaming ? (
          <div className="whitespace-pre-wrap text-sm text-text">
            {cleanContent}
          </div>
        ) : (
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
                  if (match?.[1] === "markdown") {
                    return (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {codeString}
                      </ReactMarkdown>
                    );
                  }
                  return <CodeBlock language={match?.[1]} value={codeString} />;
                },
              }}
            >
              {cleanContent}
            </ReactMarkdown>
          </div>
        )}

        {content && !isActivelyStreaming && (
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
      </div>
    </motion.div>
  );
}
