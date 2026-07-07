"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

  // Typewriter buffer: raw text arrives from the network in bursts, but we
  // reveal it to the UI at a steady pace so it doesn't look "chunky"
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

  // Flush any remaining buffered text instantly (used when stream ends or
  // is stopped, so nothing gets left un-displayed)
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

  useEffect(() => stopTypewriter, [stopTypewriter]);

  const sendMessage = useCallback(
    async (text) => {
      const userMessage = { role: "user", content: text };
      setMessages((prev) => [
        ...prev,
        userMessage,
        { role: "assistant", content: "" },
      ]);
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

  const stopGeneration = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isStreaming, sendMessage, stopGeneration, chatId };
}
