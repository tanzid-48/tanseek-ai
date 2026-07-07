"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { emitChatsChanged } from "@/lib/events";

const TYPEWRITER_CHARS_PER_TICK = 3;
const TYPEWRITER_INTERVAL_MS = 16;

export function useChat(initialChatId = null, initialMessages = []) {
  const router = useRouter();
  const [chatId, setChatId] = useState(initialChatId);
  const [messages, setMessages] = useState(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef(null);

  const rawTextRef = useRef("");
  const revealedLengthRef = useRef(0);
  const tickRef = useRef(null);

  const startTypewriter = useCallback(() => {
    if (tickRef.current) return;
    tickRef.current = setInterval(() => {
      const raw = rawTextRef.current;
      if (revealedLengthRef.current < raw.length) {
        revealedLengthRef.current = Math.min(
          raw.length,
          revealedLengthRef.current + TYPEWRITER_CHARS_PER_TICK,
        );
        const visibleText = raw.slice(0, revealedLengthRef.current);
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: visibleText,
          };
          return updated;
        });
      }
    }, TYPEWRITER_INTERVAL_MS);
  }, []);

  const stopTypewriter = useCallback(() => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const flushTypewriter = useCallback(() => {
    stopTypewriter();
    const raw = rawTextRef.current;
    revealedLengthRef.current = raw.length;
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = { role: "assistant", content: raw };
      return updated;
    });
  }, [stopTypewriter]);

  // Core streaming logic, shared by both sendMessage and editMessage
  const runStream = useCallback(
    async (text) => {
      setIsStreaming(true);
      rawTextRef.current = "";
      revealedLengthRef.current = 0;

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

        if (res.status === 401) {
          toast.error("Your session has expired. Redirecting to login...");
          setTimeout(() => router.push("/login"), 1500);
          setMessages((prev) => prev.slice(0, -1));
          return;
        }

        if (!res.ok || !res.body) {
          throw new Error("Failed to get response");
        }

        const newChatId = res.headers.get("X-Chat-Id");
        const isNewChat = res.headers.get("X-Is-New-Chat") === "true";
        const userMessageId = res.headers.get("X-User-Message-Id");

        // Attach the DB id to the user message we just sent, so it can be
        // edited later without needing a page refresh first
        if (userMessageId) {
          setMessages((prev) => {
            const updated = [...prev];
            const userIdx = updated.length - 2; // message before the assistant placeholder
            if (updated[userIdx]) {
              updated[userIdx] = { ...updated[userIdx], id: userMessageId };
            }
            return updated;
          });
        }

        startTypewriter();

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          rawTextRef.current += decoder.decode(value, { stream: true });
        }

        flushTypewriter();

        if (newChatId && newChatId !== chatId) {
          setChatId(newChatId);
          router.replace(`/chat/${newChatId}`);
        }

        emitChatsChanged();
        if (isNewChat) {
          setTimeout(emitChatsChanged, 1500);
        }
      } catch (err) {
        stopTypewriter();
        if (err.name !== "AbortError") {
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: "Something went wrong. Please try again.",
            };
            return updated;
          });
        } else {
          flushTypewriter();
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [chatId, router, startTypewriter, stopTypewriter, flushTypewriter],
  );

  const sendMessage = useCallback(
    async (text) => {
      setMessages((prev) => [
        ...prev,
        { role: "user", content: text },
        { role: "assistant", content: "" },
      ]);
      await runStream(text);
    },
    [runStream],
  );

  // Edit a previously-sent user message: removes it + everything after
  // (both in the DB and locally), then resends the edited text fresh.
  const editMessage = useCallback(
    async (index, newText) => {
      const target = messages[index];
      if (!target) return;

      if (target.id && chatId) {
        try {
          await fetch(`/api/chats/${chatId}/messages/${target.id}`, {
            method: "DELETE",
            credentials: "include",
          });
        } catch {
          // best-effort; continue even if DB cleanup fails
        }
      }

      setMessages((prev) => [
        ...prev.slice(0, index),
        { role: "user", content: newText },
        { role: "assistant", content: "" },
      ]);

      await runStream(newText);
    },
    [messages, chatId, runStream],
  );

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    editMessage,
    stopGeneration,
    chatId,
  };
}
