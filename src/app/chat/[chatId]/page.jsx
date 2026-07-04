"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Topbar from "@/components/shared/Topbar";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";

export default function ChatConversationPage() {
  const { chatId } = useParams();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/chats/${chatId}`, {
        credentials: "include",
      });
      if (!res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setInitialData(data);
      setLoading(false);
    }
    load();
  }, [chatId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <p className="text-sm">Loading chat...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-full items-center justify-center text-muted">
        <p className="text-sm">Chat not found.</p>
      </div>
    );
  }

  return (
    <ChatConversation
      chatId={chatId}
      title={initialData.chat.title}
      initialMessages={initialData.messages}
    />
  );
}

function ChatConversation({ chatId, title, initialMessages }) {
  const { messages, isStreaming, sendMessage, stopGeneration } = useChat(
    chatId,
    initialMessages,
  );
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleRegenerate = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (lastUser) sendMessage(lastUser.content);
  };

  return (
    <div className="flex h-full flex-col">
      <Topbar title={title} />
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
    </div>
  );
}
