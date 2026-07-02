"use client";

import Link from "next/link";
import { Menu, Settings } from "lucide-react";

export default function Topbar({ title = "New chat", onMenuClick }) {
  return (
    <div className="flex h-14 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-text transition-colors md:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <span className="truncate text-sm font-medium text-text">{title}</span>
      </div>

      <Link
        href="/settings"
        className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-text transition-colors"
        aria-label="Settings"
      >
        <Settings size={18} />
      </Link>
    </div>
  );
}
