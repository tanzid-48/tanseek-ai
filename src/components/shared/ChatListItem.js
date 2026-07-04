"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  Pin,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Trash2,
  PinOff,
} from "lucide-react";

export default function ChatListItem({
  chat,
  onNavigate,
  onRename,
  onTogglePin,
  onDelete,
}) {
  const router = useRouter();
  const params = useParams();
  const isActive = params?.chatId === chat.id;

  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chat.title);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setConfirmingDelete(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const submitRename = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== chat.title) {
      onRename(chat.id, trimmed);
    } else {
      setTitle(chat.title);
    }
    setEditing(false);
  };

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    onDelete(chat.id);
    setMenuOpen(false);
    if (isActive) router.push("/chat");
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={submitRename}
        onKeyDown={(e) => {
          if (e.key === "Enter") submitRename();
          if (e.key === "Escape") {
            setTitle(chat.title);
            setEditing(false);
          }
        }}
        className="w-full rounded-md border border-primary bg-background px-2 py-2 text-sm text-text outline-none"
      />
    );
  }

  return (
    <div
      className={`group relative flex items-center rounded-md ${isActive ? "bg-background" : "hover:bg-background"} transition-colors`}
    >
      <Link
        href={`/chat/${chat.id}`}
        onClick={onNavigate}
        className="flex flex-1 items-center gap-2 px-2 py-2 text-sm text-text min-w-0"
      >
        {chat.pinned ? (
          <Pin size={14} className="shrink-0 text-muted" />
        ) : (
          <MessageSquare size={14} className="shrink-0 text-muted" />
        )}
        <span className="truncate">{chat.title}</span>
      </Link>

      <div ref={menuRef} className="relative shrink-0">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className={`rounded p-1 mr-1 text-muted hover:text-text hover:bg-surface transition-colors ${
            menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
          aria-label="Chat options"
        >
          <MoreHorizontal size={15} />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-border bg-surface py-1 shadow-lg">
            <button
              onClick={() => {
                setEditing(true);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-background transition-colors"
            >
              <Pencil size={14} /> Rename
            </button>
            <button
              onClick={() => {
                onTogglePin(chat.id, !chat.pinned);
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-background transition-colors"
            >
              {chat.pinned ? <PinOff size={14} /> : <Pin size={14} />}
              {chat.pinned ? "Unpin" : "Pin"}
            </button>
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-background transition-colors"
            >
              <Trash2 size={14} />
              {confirmingDelete ? "Confirm delete?" : "Delete"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
