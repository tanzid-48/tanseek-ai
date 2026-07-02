// src/components/shared/UserMenu.js
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Settings, LogOut } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function UserMenu() {
  const router = useRouter();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const user = session?.user;

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div ref={menuRef} className="relative">
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 rounded-md border border-border bg-surface py-1 shadow-lg">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-background transition-colors"
          >
            <Settings size={16} /> Settings
          </button>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text hover:bg-background transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 hover:bg-background transition-colors"
      >
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-text">
            {getInitials(user?.name)}
          </div>
        )}
        <span className="truncate text-sm text-text">
          {user?.name || "Account"}
        </span>
      </button>
    </div>
  );
}
