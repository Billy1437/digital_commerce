import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-xl border border-primary/30 bg-primary/10">
        <Lock className="size-6 text-primary" />
      </span>
      <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight">
        Sign in is coming
      </h1>
      <p className="mt-3 text-muted-foreground">
        Accounts, checkout and order tracking arrive in Phase 3. Until then you
        can browse everything without signing in.
      </p>
      <Button className="mt-8 font-heading font-semibold" render={<Link href="/" />}>Back to the store</Button>
    </div>
  );
}
