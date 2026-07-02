// src/app/(auth)/signup/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AuthCard from "@/components/shared/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";


export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.signUp.email({
      name: form.name,
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Sign up failed. Try again.");
      return;
    }

    toast.success("Account created!");
    router.push("/chat");
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/chat",
    });

    if (error) {
      setGoogleLoading(false);
      toast.error(error.message || "Google sign-in failed.");
    }
  };

  return (
    <AuthCard
      title="Create your account"
      subtitle="Start chatting with TanSeek AI."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkHref="/login"
    >
      <div className="flex flex-col gap-4">
        <GoogleButton onClick={handleGoogleSignIn} loading={googleLoading} />

        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border" />
          or continue with email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <AuthInput
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
          />
          <AuthInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
          />
          <AuthInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="At least 6 characters"
          />
          <AuthButton loading={loading}>Sign up</AuthButton>
        </form>
      </div>
    </AuthCard>
  );
}
