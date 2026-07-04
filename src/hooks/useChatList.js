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

  return { chats, loading, refresh };
}
