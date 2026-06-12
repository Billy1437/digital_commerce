import Link from "next/link";
import { Send } from "lucide-react";

const paymentMethods = ["KBZPay", "Wave Money", "PromptPay"];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <p className="text-lg font-extrabold uppercase tracking-wide">
            GG Mart
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Game top-ups and ranked accounts for Myanmar players. Every order
            is checked and delivered by a real admin; no bots, no scams.
          </p>
          <a
            href="https://t.me/ggmartmm"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <Send className="size-4" aria-hidden="true" />
            @ggmartmm on Telegram
          </a>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Shop
          </p>
          <nav className="grid gap-2 text-sm">
            <Link href="/#games" className="text-muted-foreground transition-colors hover:text-foreground">
              Games
            </Link>
            <Link href="/#top-up" className="text-muted-foreground transition-colors hover:text-foreground">
              Top-up packages
            </Link>
            <Link href="/#accounts" className="text-muted-foreground transition-colors hover:text-foreground">
              Accounts for sale
            </Link>
            <Link href="/#how-it-works" className="text-muted-foreground transition-colors hover:text-foreground">
              How ordering works
            </Link>
          </nav>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            We accept
          </p>
          <div className="flex flex-wrap gap-2">
            {paymentMethods.map((method) => (
              <span
                key={method}
                className="rounded-lg bg-secondary px-3.5 py-1.5 text-xs font-semibold"
              >
                {method}
              </span>
            ))}
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Pay by QR, upload your slip, and your order is verified within
            minutes during open hours.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <p>© 2026 GG Mart. All rights reserved.</p>
          <p className="font-semibold uppercase tracking-wider text-primary/90">
            Verified by humans · Delivered fast
          </p>
        </div>
      </div>
    </footer>
  );
}
