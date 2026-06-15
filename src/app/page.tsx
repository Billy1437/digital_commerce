import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  Headset,
  QrCode,
  Send,
  ShoppingCart,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/site/listing-card";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { gameArt } from "@/lib/game-art";

export const revalidate = 30;

const trustItems = [
  {
    icon: Zap,
    title: "Fast delivery",
    body: "Top-ups land in minutes during open hours",
  },
  {
    icon: QrCode,
    title: "Pay by QR",
    body: "KBZPay, Wave Money and PromptPay",
  },
  {
    icon: BadgeCheck,
    title: "Human-verified",
    body: "A real admin checks every payment slip",
  },
  {
    icon: Headset,
    title: "Telegram support",
    body: "@ggmartmm answers fast, before and after",
  },
];

export default async function HomePage() {
  const [games, featuredListings] = await Promise.all([
    prisma.game.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        topupProducts: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          take: 4,
        },
      },
    }),
    prisma.accountListing.findMany({
      where: { status: "AVAILABLE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { game: { select: { slug: true, name: true } } },
    }),
  ]);

  const featuredGame = games[0];
  const cheapest = featuredGame?.topupProducts[0];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
      {/* ============ Hero banner ============ */}
      {featuredGame && (
        <section
          className="animate-rise relative mt-6 overflow-hidden rounded-2xl border border-border"
          style={{ "--rise-index": 0 } as React.CSSProperties}
        >
          <div className="relative min-h-[380px] sm:min-h-[420px]">
            <Image
              src="/hero/mlbb_hero.png"
              alt="Mobile Legends: Bang Bang"
              fill
              priority
              sizes="(max-width: 1152px) 100vw, 1152px"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

            <div className="relative flex min-h-[380px] flex-col justify-center gap-5 p-7 sm:min-h-[420px] sm:max-w-lg sm:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Featured game
              </p>
              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                {featuredGame.name}
              </h1>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Diamonds delivered straight to your game ID. Pay by QR with the
                wallet you already use; a real admin verifies every order.
              </p>
              {cheapest && (
                <p className="text-2xl font-bold">
                  from {formatPrice(cheapest.price, cheapest.currency)}
                </p>
              )}
              <div className="flex flex-wrap gap-3">
                <Button size="lg" render={<Link href={`/games/${featuredGame.slug}`} />}>
                  <ShoppingCart data-slot="icon" aria-hidden="true" />
                  Top up now
                </Button>
                <Button size="lg" variant="outline" render={<Link href="/#accounts" />}>
                  Shop accounts
                </Button>
              </div>
            </div>

            {/* Game thumbnail strip, like the reference carousel */}
            <div className="absolute bottom-5 right-5 hidden gap-3 md:flex">
              {games.map((game) => {
                const art = gameArt(game.slug);
                return (
                  <Link
                    key={game.id}
                    href={`/games/${game.slug}`}
                    className="group relative h-16 w-28 overflow-hidden rounded-lg border border-white/15 transition-transform duration-200 hover:scale-105"
                  >
                    <Image
                      src={art.image}
                      alt={art.alt}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-2 text-[10px] font-bold leading-tight">
                      {game.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ============ Trust bar ============ */}
      <section
        className="animate-rise mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4"
        style={{ "--rise-index": 1 } as React.CSSProperties}
      >
        {trustItems.map((item) => (
          <div key={item.title} className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <item.icon className="size-4 text-primary" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* ============ Trending top-ups ============ */}
      <section id="top-up" className="mt-14 scroll-mt-28">
        <h2 className="heading-bar text-2xl font-extrabold">Trending top-ups</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {games.flatMap((game) => {
            const art = gameArt(game.slug);
            return game.topupProducts.map((product) => (
              <Link
                key={product.id}
                href={`/games/${game.slug}`}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <Image
                    src={art.image}
                    alt={art.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>
                <div className="space-y-1.5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {game.name}
                  </p>
                  <h3 className="text-[15px] font-semibold">{product.name}</h3>
                  <p className="pt-1 text-lg font-bold">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </div>
              </Link>
            ));
          })}
        </div>
      </section>

      {/* ============ Featured accounts ============ */}
      <section id="accounts" className="mt-14 scroll-mt-28">
        <h2 className="heading-bar text-2xl font-extrabold">
          Accounts for sale
        </h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} game={listing.game} />
          ))}
        </div>
      </section>

      {/* ============ How it works ============ */}
      <section id="how-it-works" className="mt-14 scroll-mt-28">
        <h2 className="heading-bar text-2xl font-extrabold">How it works</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            {
              step: "1",
              title: "Pick and order",
              body: "Choose a top-up package or account and enter your game ID. No sign-up needed to browse.",
            },
            {
              step: "2",
              title: "Pay by QR",
              body: "Scan our KBZPay, Wave Money or PromptPay code, then upload your payment slip.",
            },
            {
              step: "3",
              title: "Verified, then delivered",
              body: "A real admin checks your slip and delivers: diamonds to your ID, credentials to your dashboard.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-xl border border-border bg-card p-6"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-extrabold text-primary-foreground">
                {item.step}
              </span>
              <h3 className="mt-4 font-bold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row">
          <div>
            <p className="font-bold">Questions before you buy?</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Message us on Telegram; we reply fast during open hours.
            </p>
          </div>
          <Button render={<a href="https://t.me/ggmartmm" target="_blank" rel="noopener noreferrer" />}>
            <Send data-slot="icon" aria-hidden="true" />
            @ggmartmm
          </Button>
        </div>
      </section>
    </div>
  );
}
