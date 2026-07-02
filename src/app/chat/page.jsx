"use client";

import { useState } from "react";
import Topbar from "@/components/shared/Topbar";
import EmptyState from "@/components/chat/EmptyState";
import ChatInput from "@/components/chat/ChatInput";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);

  const handleSend = (text) => {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    // AI streaming wired in Phase 3
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-full flex-col">
      <Topbar title="New chat" />

      {hasMessages ? (
        <>
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-3xl px-4 py-6">
              {messages.map((m, i) => (
                <div key={i} className="mb-4 text-sm text-text">
                  <span className="font-medium text-muted">You: </span>
                  {m.content}
                </div>
              ))}
            </div>
          </div>
          <ChatInput onSend={handleSend} />
        </>
      ) : (
        <EmptyState>
          <ChatInput onSend={handleSend} />
        </EmptyState>
      )}
    </div>
  );
}
