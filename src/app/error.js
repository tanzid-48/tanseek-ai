"use client";

import { useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <Image src={assets.logo_icon} alt="TanSeek AI" width={40} height={40} />
      <p className="text-base font-medium text-text">Something went wrong.</p>
      <button
        onClick={reset}
        className="rounded-md bg-primary px-4 py-2 text-sm text-text hover:bg-primary-hover transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
