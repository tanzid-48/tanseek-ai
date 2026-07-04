"use client";

import { useState, useEffect, useCallback } from "react";

export function useChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/chats", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setChats(data.chats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const renameChat = useCallback(async (chatId, title) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, title } : c)),
    );
    await fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title }),
    });
  }, []);

  const togglePin = useCallback(async (chatId, pinned) => {
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, pinned } : c)),
    );
    await fetch(`/api/chats/${chatId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ pinned }),
    });
  }, []);

  const removeChat = useCallback(async (chatId) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    await fetch(`/api/chats/${chatId}`, {
      method: "DELETE",
      credentials: "include",
    });
  }, []);

  return { chats, loading, refresh, renameChat, togglePin, removeChat };
}
