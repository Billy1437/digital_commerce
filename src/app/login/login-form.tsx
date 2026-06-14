"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const destination = next && next.startsWith("/") ? next : "/dashboard";

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSignIn(formData: FormData) {
    setPending(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(destination);
    router.refresh();
  }

  async function handleSignUp(formData: FormData) {
    setPending(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: String(formData.get("email")),
      password: String(formData.get("password")),
      options: {
        data: { username: String(formData.get("username") ?? "").trim() || undefined },
        emailRedirectTo: `${location.origin}/auth/confirm?next=${encodeURIComponent(destination)}`,
      },
    });
    setPending(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (!data.session) {
      setNotice(
        "Almost there: open the confirmation link we just emailed you, then sign in."
      );
      return;
    }
    router.push(destination);
    router.refresh();
  }

  return (
    <Tabs defaultValue="signin" className="mt-8">
      <TabsList className="w-full">
        <TabsTrigger value="signin" className="flex-1">
          Sign in
        </TabsTrigger>
        <TabsTrigger value="signup" className="flex-1">
          Create account
        </TabsTrigger>
      </TabsList>

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/15 px-4 py-3 text-sm font-medium">
          {error}
        </p>
      )}
      {notice && (
        <p className="mt-4 rounded-lg border border-border bg-card px-4 py-3 text-sm">
          {notice}
        </p>
      )}

      <TabsContent value="signin" className="mt-6">
        <form action={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signin-email">Email</Label>
            <Input
              id="signin-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signin-password">Password</Label>
            <Input
              id="signin-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 data-slot="icon" className="animate-spin" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="signup" className="mt-6">
        <form action={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-username">Username</Label>
            <Input
              id="signup-username"
              name="username"
              placeholder="What should we call you?"
              autoComplete="nickname"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 data-slot="icon" className="animate-spin" aria-hidden="true" />
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </TabsContent>
    </Tabs>
  );
}
