"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Topbar from "@/components/shared/Topbar";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import { useChat } from "@/hooks/useChat";
import Skeleton from "@/components/ui/Skeleton";
import Link from "next/link";

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
      <div className="flex h-full flex-col">
        <div className="h-14 border-b border-border" />
        <div className="mx-auto w-full max-w-3xl px-4 py-6 space-y-4">
          <Skeleton className="ml-auto h-10 w-2/5" />
          <Skeleton className="h-24 w-4/5" />
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-base font-medium text-text">Chat not found</p>
        <p className="max-w-sm text-sm text-muted">
          This conversation may have been deleted, or you do not have access to
          it.
        </p>
        <Link
          href="/chat"
          className="rounded-md border border-border px-4 py-2 text-sm text-text hover:bg-surface transition-colors"
        >
          Start a new chat
        </Link>
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
  const { messages, isStreaming, sendMessage, stopGeneration, editMessage } =
    useChat(chatId, initialMessages);
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
              onEdit={
                m.role === "user"
                  ? (newText) => editMessage(i, newText)
                  : undefined
              }
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
