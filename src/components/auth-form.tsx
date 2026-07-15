"use client";

import { useState, type FormEvent } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="animate-fade-in text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold">Check your inbox</h2>
        <p className="mt-1.5 text-sm text-foreground-muted">
          We sent a magic link to <span className="text-foreground">{email}</span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-semibold tracking-tight">
        {mode === "login" ? "Welcome back" : "Create your account"}
      </h1>
      <p className="mt-1.5 text-sm text-foreground-muted">
        {mode === "login"
          ? "Log in with a magic link — no password needed."
          : "Start free. Claim your link in under two minutes."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-3">
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          <Input
            type="email"
            required
            placeholder="you@example.com"
            className="pl-9"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={status === "loading"}>
          {status === "loading" ? "Sending link…" : "Continue with email"}
        </Button>
        {error && <p className="text-[13px] text-danger">{error}</p>}
      </form>
    </div>
  );
}
