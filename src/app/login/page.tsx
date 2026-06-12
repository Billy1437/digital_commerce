import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect(next && next.startsWith("/") ? next : "/dashboard");

  return (
    <div className="mx-auto w-full max-w-md px-4 py-16">
      <h1 className="text-2xl font-extrabold">Welcome to GG Mart</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in to order top-ups, track payments and reveal purchased
        accounts.
      </p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}
