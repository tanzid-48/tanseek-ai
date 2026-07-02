import Topbar from "@/components/shared/Topbar";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col">
      <Topbar title="New chat" />
      <div className="flex flex-1 items-center justify-center text-muted">
        <p className="text-sm">Chat window coming in the next step 🚀</p>
      </div>
    </div>
  );
}
