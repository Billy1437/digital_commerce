import Link from "next/link";
import { Send } from "lucide-react";

const paymentMethods = [
  { name: "KBZPay", className: "border-sky-400/30 text-sky-300" },
  { name: "Wave Money", className: "border-yellow-400/30 text-yellow-300" },
  { name: "PromptPay", className: "border-teal-400/30 text-teal-300" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card/40">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="font-heading text-lg font-bold tracking-wide">GG MART</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            Game top-ups and ranked accounts for Myanmar players. Every order is
            checked and delivered by a real admin — no bots, no scams.
          </p>
          <a
            href="https://t.me/ggmartmm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <Send className="size-4" />
            @ggmartmm on Telegram
          </a>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Shop
          </p>
          <nav className="grid gap-2 text-sm">
            <Link href="/#games" className="text-muted-foreground hover:text-foreground">
              Games
            </Link>
            <Link href="/#top-up" className="text-muted-foreground hover:text-foreground">
              Top-up packages
            </Link>
            <Link href="/#accounts" className="text-muted-foreground hover:text-foreground">
              Accounts for sale
            </Link>
            <Link href="/#how-it-works" className="text-muted-foreground hover:text-foreground">
              How ordering works
            </Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            We accept
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method.name}
                className={`rounded-md border bg-background/60 px-3 py-1.5 font-heading text-xs font-semibold ${method.className}`}
              >
                {method.name}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Pay by QR, upload your slip, and your order is verified within
            minutes during open hours.
          </p>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <p>© 2026 GG Mart. All rights reserved.</p>
          <p className="font-heading tracking-wide text-primary/70">
            Verified by humans · delivered fast
          </p>
        </div>
      </div>
    </footer>
  );
}
