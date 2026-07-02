"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AuthCard from "@/components/shared/AuthCard";
import GoogleButton from "@/components/auth/GoogleButton";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await authClient.signIn.email({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message || "Login failed. Check your credentials.");
      return;
    }

    toast.success("Welcome back!");
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
      title="Log in to TanSeek AI"
      subtitle="Pick up where you left off."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/signup"
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
            placeholder="••••••••"
          />
          <AuthButton loading={loading}>Log in</AuthButton>
        </form>
      </div>
    </AuthCard>
  );
}
