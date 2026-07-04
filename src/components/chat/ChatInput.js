"use client";

import { useState } from "react";
import { ArrowUp, Square } from "lucide-react";

export default function ChatInput({ onSend, onStop, isStreaming }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim() || isStreaming) return;
    onSend?.(value.trim());
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-3xl px-4 pb-4"
    >
      <div className="flex items-end gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message TanSeek AI..."
          rows={1}
          className="max-h-40 flex-1 resize-none bg-transparent text-sm text-text placeholder:text-muted outline-none"
        />
        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-text text-background transition-opacity"
            aria-label="Stop generating"
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-text disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            aria-label="Send message"
          >
            <ArrowUp size={16} />
          </button>
        )}
      </div>
    </form>
  );
}
