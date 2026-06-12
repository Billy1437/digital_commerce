import Link from "next/link";
import { Gamepad2, Send, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

const links = [
  { href: "/#top-up", label: "Top-up" },
  { href: "/#accounts", label: "Accounts" },
  { href: "/#how-it-works", label: "How it works" },
];

export async function Navbar() {
  const games = await prisma.game.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary shadow-[0_6px_18px_-6px] shadow-primary/70">
            <span className="text-sm font-extrabold text-primary-foreground">
              GG
            </span>
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-extrabold uppercase tracking-wide">
              GG&nbsp;Mart
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Game Store MM
            </span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" render={<a href="https://t.me/ggmartmm"
              target="_blank"
              rel="noopener noreferrer" />}>
              <Send data-slot="icon" aria-hidden="true" />
              <span className="hidden sm:inline">Telegram</span>
            </Button>
          <Button size="sm" render={<Link href="/login" />}>
            <UserRound data-slot="icon" aria-hidden="true" />
            Sign in
          </Button>
        </div>
      </div>

      {/* Game quick-nav pill bar, like the platform bar in the reference */}
      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
          <span className="hidden items-center gap-1.5 pr-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:flex">
            <Gamepad2 className="size-3.5" aria-hidden="true" />
            Games
          </span>
          {games.map((game) => (
            <Link
              key={game.slug}
              href={`/games/${game.slug}`}
              className="shrink-0 rounded-full bg-card px-4 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {game.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
