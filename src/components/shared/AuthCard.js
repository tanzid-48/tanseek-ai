
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { assets } from "@/assets/assets";

export default function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerLinkText,
  footerLinkHref,
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[420px] w-[420px] rounded-full bg-primary/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-sm rounded-xl border border-border bg-surface p-8"
      >
        <div className="flex flex-col items-center gap-2 mb-6">
          <Image
            src={assets.logo_icon}
            alt="TanSeek AI"
            width={44}
            height={44}
          />
          <h1 className="text-lg font-semibold text-text">{title}</h1>
          <p className="text-sm text-muted text-center">{subtitle}</p>
        </div>

        {children}

        <p className="mt-6 text-center text-sm text-muted">
          {footerText}{" "}
          <Link href={footerLinkHref} className="text-primary hover:underline">
            {footerLinkText}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
