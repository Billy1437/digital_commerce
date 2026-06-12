import Link from "next/link";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/#games", label: "Games" },
  { href: "/#top-up", label: "Top-up" },
  { href: "/#accounts", label: "Accounts" },
  { href: "/#how-it-works", label: "How it works" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 rotate-45 items-center justify-center rounded-[6px] border border-primary/40 bg-primary/10">
            <span className="-rotate-45 font-heading text-sm font-bold text-primary">
              GG
            </span>
          </span>
          <span className="leading-none">
            <span className="block font-heading text-lg font-bold tracking-wide">
              GG&nbsp;MART
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.28em] text-muted-foreground">
              Game Store MM
            </span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-primary/30" render={<a href="https://t.me/ggmartmm"
              target="_blank"
              rel="noopener noreferrer" />}>
              <Send data-slot="icon" />
              <span className="hidden sm:inline">Telegram</span>
            </Button>
          <Button size="sm" className="font-heading font-semibold" render={<Link href="/login" />}>Sign in</Button>
        </div>
      </div>
    </header>
  );
}
