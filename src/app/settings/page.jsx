"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Menu, LogOut } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import { useSidebar } from "@/providers/SidebarProvider";

function getInitials(name) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  const first = parts[0]?.[0] || "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export default function SettingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { openMobile } = useSidebar();
  const [loggingOut, setLoggingOut] = useState(false);

  const user = session?.user;

  const handleLogout = async () => {
    setLoggingOut(true);
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3 md:hidden">
        <button
          onClick={openMobile}
          className="rounded-md p-1.5 text-muted hover:bg-surface hover:text-text transition-colors"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-text">Settings</h1>
      </div>

      <h1 className="mb-6 hidden text-xl font-semibold text-text md:block">
        Settings
      </h1>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-medium text-muted">Account</h2>

        <div className="flex items-center gap-4">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name || "User"}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-medium text-text">
              {getInitials(user?.name)}
            </div>
          )}
          <div>
            <p className="text-base font-medium text-text">
              {user?.name || "—"}
            </p>
            <p className="text-sm text-muted">{user?.email || "—"}</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-4 text-sm font-medium text-muted">Session</h2>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm text-text hover:bg-background disabled:opacity-60 transition-colors"
        >
          <LogOut size={16} />
          {loggingOut ? "Logging out..." : "Log out"}
        </button>
      </div>
    </div>
  );
}
