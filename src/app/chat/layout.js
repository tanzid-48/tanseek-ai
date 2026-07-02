// src/app/chat/layout.js
import Sidebar from "@/components/shared/Sidebar";

export default function ChatLayout({ children }) {
  return (
    <div className="flex h-screen w-full bg-background">
      <Sidebar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
