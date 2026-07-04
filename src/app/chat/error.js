"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function ChatError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-base font-medium text-text">Something went wrong.</p>
      <p className="max-w-sm text-sm text-muted">
        This conversation ran into an unexpected error. You can try again, or
        start a new chat.
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-text hover:bg-primary-hover transition-colors"
      >
        <RotateCcw size={15} />
        Try again
      </button>
    </div>
  );
}
