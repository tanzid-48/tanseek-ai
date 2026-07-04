"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { emitChatsChanged } from "@/lib/events";

export function useChat(initialChatId = null, initialMessages = []) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const sendMessage = useCallback(
    async (text) => {
      const userMessage = { role: "user", content: text };
      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: "" },
      ]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatId, message: text }),
          credentials: "include",
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          throw new Error("Failed to get response");
        }

        const newChatId = res.headers.get("X-Chat-Id");
        const isNewChat = res.headers.get("X-Is-New-Chat") === "true";

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let assistantText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          assistantText += decoder.decode(value, { stream: true });

          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantText,
            };
            return updated;
          });
        }

        if (newChatId && newChatId !== chatId) {
          setChatId(newChatId);
          router.replace(`/chat/${newChatId}`);
        }

        // Refresh sidebar list: covers new chat creation, updatedAt reorder,
        // and the auto-generated title landing shortly after (small delay
        // since title generation happens server-side after this response ends)
        emitChatsChanged();
        if (isNewChat) {
          setTimeout(emitChatsChanged, 1500);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "Something went wrong. Please try again.",
            };
            return updated;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [chatId, router],
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, stopGeneration, chatId };
}
