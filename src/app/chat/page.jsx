"use client";

import { useEffect, useRef } from "react";
import Topbar from "@/components/shared/Topbar";
import EmptyState from "@/components/chat/EmptyState";
import ChatInput from "@/components/chat/ChatInput";
import MessageBubble from "@/components/chat/MessageBubble";
import { useChat } from "@/hooks/useChat";

export default function ChatPage() {
  const { messages, isStreaming, sendMessage, stopGeneration } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) sendMessage(lastUser.content);
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
                <MessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  isLast={i === messages.length - 1}
                  isStreaming={isStreaming}
                  onRegenerate={handleRegenerate}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          </div>
          <ChatInput
            onSend={sendMessage}
            onStop={stopGeneration}
            isStreaming={isStreaming}
          />
        </>
      ) : (
        <EmptyState>
          <ChatInput
            onSend={sendMessage}
            onStop={stopGeneration}
            isStreaming={isStreaming}
          />
        </EmptyState>
      )}
    </div>
  );
}
