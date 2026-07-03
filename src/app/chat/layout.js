"use client";

import Sidebar from "@/components/shared/Sidebar";
import { SidebarProvider, useSidebar } from "@/providers/SidebarProvider";

function LayoutContent({ children }) {
  const { mobileOpen, closeMobile } = useSidebar();

  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={closeMobile} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

export default function ChatLayout({ children }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
