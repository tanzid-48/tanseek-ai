// src/components/shared/Sidebar.js
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  Search,
  Pin,
  MessageSquare,
} from "lucide-react";
import { assets } from "@/assets/assets";
import { MOCK_CHATS } from "@/constants/mockChats";
import UserMenu from "./UserMenu";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");

  const filteredChats = MOCK_CHATS.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );
  const pinnedChats = filteredChats.filter((c) => c.pinned);
  const otherChats = filteredChats.filter((c) => !c.pinned);

  if (collapsed) {
    return (
      <div className="flex h-full w-16 flex-col items-center gap-3 border-r border-border bg-surface py-4">
        <button
          onClick={() => setCollapsed(false)}
          className="rounded-md p-2 text-muted hover:bg-background hover:text-text transition-colors"
          aria-label="Expand sidebar"
        >
          <PanelLeftOpen size={20} />
        </button>
        <Link
          href="/chat"
          className="rounded-md p-2 text-muted hover:bg-background hover:text-text transition-colors"
          aria-label="New chat"
        >
          <SquarePen size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-2">
          <Image
            src={assets.logo_icon}
            alt="TanSeek AI"
            width={26}
            height={26}
          />
          <Image
            src={assets.logo_text}
            alt="TanSeek AI"
            width={100}
            height={20}
          />
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded-md p-1.5 text-muted hover:bg-background hover:text-text transition-colors"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="px-3">
        <Link
          href="/chat"
          className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-text hover:bg-background transition-colors"
        >
          <SquarePen size={16} />
          New chat
        </Link>
      </div>

      <div className="px-3 pt-3">
        <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
          <Search size={15} className="text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats"
            className="w-full bg-transparent text-sm text-text placeholder:text-muted outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pt-4">
        {pinnedChats.length > 0 && (
          <>
            <p className="px-2 pb-1 text-xs font-medium text-muted">Pinned</p>
            <ChatListGroup chats={pinnedChats} />
          </>
        )}

        <p className="px-2 pb-1 pt-3 text-xs font-medium text-muted">Recent</p>
        {otherChats.length > 0 ? (
          <ChatListGroup chats={otherChats} />
        ) : (
          <p className="px-2 py-2 text-sm text-muted">No chats found.</p>
        )}
      </div>

      <div className="border-t border-border p-3">
        <UserMenu />
      </div>
    </div>
  );
}

function ChatListGroup({ chats }) {
  return (
    <div className="flex flex-col gap-0.5 pb-2">
      {chats.map((chat) => (
        <Link
          key={chat.id}
          href={`/chat/${chat.id}`}
          className="group flex items-center gap-2 rounded-md px-2 py-2 text-sm text-text hover:bg-background transition-colors"
        >
          {chat.pinned ? (
            <Pin size={14} className="shrink-0 text-muted" />
          ) : (
            <MessageSquare size={14} className="shrink-0 text-muted" />
          )}
          <span className="truncate">{chat.title}</span>
        </Link>
      ))}
    </div>
  );
}
