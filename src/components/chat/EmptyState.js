import Image from "next/image";
import { assets } from "@/assets/assets";

export default function EmptyState({ children }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-4">
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src={assets.logo_icon} alt="TanSeek AI" width={48} height={48} />
        <h2 className="text-lg font-medium text-text">
          How can I help you today?
        </h2>
      </div>
      <div className="w-full max-w-2xl">{children}</div>
    </div>
  );
}
