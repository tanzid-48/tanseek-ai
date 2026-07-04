"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
  Search,
  X,
} from "lucide-react";
import { assets } from "@/assets/assets";
import { useChatList } from "@/hooks/useChatList";
import ChatListItem from "./ChatListItem";
import UserMenu from "./UserMenu";
import Skeleton from "../ui/Skeleton";

const COLLAPSE_KEY = "tanseek:sidebar-collapsed";

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const [collapsed, setCollapsed] = useState(false);
  const [query, setQuery] = useState("");
  const { chats, loading, renameChat, togglePin, removeChat } = useChatList();

  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved === "true") setCollapsed(true);
  }, []);

  const handleCollapse = (value) => {
    setCollapsed(value);
    localStorage.setItem(COLLAPSE_KEY, String(value));
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase()),
  );
  const pinnedChats = filteredChats.filter((c) => c.pinned);
  const otherChats = filteredChats.filter((c) => !c.pinned);

  const sidebarContent = (
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
            style={{ height: "auto" }}
          />
        </div>
        <button
          onClick={onCloseMobile}
          className="rounded-md p-1.5 text-muted hover:bg-background hover:text-text transition-colors md:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
        <button
          onClick={() => handleCollapse(true)}
          className="hidden rounded-md p-1.5 text-muted hover:bg-background hover:text-text transition-colors md:block"
          aria-label="Collapse sidebar"
        >
          <PanelLeftClose size={18} />
        </button>
      </div>

      <div className="px-3">
        <Link
          href="/chat"
          onClick={onCloseMobile}
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
        {loading ? (
          <div className="flex flex-col gap-2 px-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-4/6" />
          </div>
        ) : (
          <>
            {pinnedChats.length > 0 && (
              <>
                <p className="px-2 pb-1 text-xs font-medium text-muted">
                  Pinned
                </p>
                <div className="flex flex-col gap-0.5 pb-2">
                  {pinnedChats.map((chat) => (
                    <ChatListItem
                      key={chat.id}
                      chat={chat}
                      onNavigate={onCloseMobile}
                      onRename={renameChat}
                      onTogglePin={togglePin}
                      onDelete={removeChat}
                    />
                  ))}
                </div>
              </>
            )}

            <p className="px-2 pb-1 pt-3 text-xs font-medium text-muted">
              Recent
            </p>
            {otherChats.length > 0 ? (
              <div className="flex flex-col gap-0.5 pb-2">
                {otherChats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    onNavigate={onCloseMobile}
                    onRename={renameChat}
                    onTogglePin={togglePin}
                    onDelete={removeChat}
                  />
                ))}
              </div>
            ) : (
              <p className="px-2 py-2 text-sm text-muted">No chats yet.</p>
            )}
          </>
        )}
      </div>

      <div className="border-t border-border p-3">
        <UserMenu />
      </div>
    </div>
  );

  const collapsedRail = (
    <div className="hidden h-full w-16 flex-col items-center gap-3 border-r border-border bg-surface py-4 md:flex">
      <button
        onClick={() => handleCollapse(false)}
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

  return (
    <>
      {/* Desktop: collapsed rail or full sidebar, controlled by `collapsed` */}
      <div className="hidden h-full md:flex">
        {collapsed ? collapsedRail : sidebarContent}
      </div>

      {/* Mobile drawer: always uses full sidebarContent, independent of
          the desktop collapsed state */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
