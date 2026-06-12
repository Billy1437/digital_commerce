import Link from "next/link";
import { ArrowRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/site/listing-card";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { gameArt, gameInitials } from "@/lib/game-art";

export const revalidate = 30;

export default async function HomePage() {
  const [games, featuredListings, packageCount] = await Promise.all([
    prisma.game.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            topupProducts: { where: { active: true } },
            accountListings: { where: { status: "AVAILABLE" } },
          },
        },
        topupProducts: {
          where: { active: true },
          orderBy: { price: "asc" },
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
    prisma.topupProduct.count({ where: { active: true } }),
  ]);

  return (
    <>
      {/* ============ Hero ============ */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-grid-faint [mask-image:radial-gradient(ellipse_60%_60%_at_50%_40%,black,transparent)] opacity-60" />
        <div className="absolute -top-32 right-[-8%] size-[28rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-6%] size-80 rounded-full bg-gold/[0.07] blur-[100px]" />
        <div className="absolute right-[14%] top-28 hidden size-20 rotate-45 border border-primary/15 lg:block" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-24 sm:px-6 md:py-32">
          <div className="max-w-2xl">
            <p
              className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium tracking-wide text-muted-foreground"
              style={{ "--rise-index": 0 } as React.CSSProperties}
            >
              <span className="size-1.5 rounded-full bg-primary" />
              Every order verified by a real admin
            </p>
            <h1
              className="animate-rise mt-7 font-heading text-5xl font-bold leading-[1.02] tracking-tight sm:text-7xl"
              style={{ "--rise-index": 1 } as React.CSSProperties}
            >
              Level up
              <br />
              <span className="text-primary text-glow">for less.</span>
            </h1>
            <p
              className="animate-rise mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground"
              style={{ "--rise-index": 2 } as React.CSSProperties}
            >
              ML diamonds, PUBG UC and ranked accounts. Pay by QR with the
              wallet you already use; we check every slip and deliver straight
              to your game ID.
            </p>
            <div
              className="animate-rise mt-9 flex flex-wrap gap-3"
              style={{ "--rise-index": 3 } as React.CSSProperties}
            >
              <Button size="lg" className="font-heading font-semibold tracking-wide" render={<Link href="/#top-up" />}>
                  Browse top-ups
                  <ArrowRight data-slot="icon" />
                </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary/25 font-heading font-medium tracking-wide"
               render={<Link href="/#accounts" />}>Shop accounts</Button>
            </div>
            <p
              className="animate-rise mt-12 text-sm text-muted-foreground"
              style={{ "--rise-index": 4 } as React.CSSProperties}
            >
              {packageCount} top-up packages across {games.length} games ·
              KBZPay · Wave Money · PromptPay
            </p>
          </div>
        </div>
      </section>

      {/* ============ Games ============ */}
      <section id="games" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/70">
          Pick your game
        </p>
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">Games</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {games.map((game) => {
            const art = gameArt(game.slug);
            return (
              <Link
                key={game.id}
                href={`/games/${game.slug}`}
                className="group relative flex items-center gap-5 overflow-hidden rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_40px_-12px] hover:shadow-primary/25"
              >
                <div
                  className={`flex size-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${art.tile} border border-border`}
                >
                  <span className="font-heading text-2xl font-bold text-foreground/80">
                    {gameInitials(game.name)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading text-xl font-semibold">{game.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {game._count.topupProducts} top-up packs ·{" "}
                    {game._count.accountListings}{" "}
                    {game._count.accountListings === 1 ? "account" : "accounts"}
                  </p>
                </div>
                <ArrowRight className="ml-auto size-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* ============ Top-up shortcuts ============ */}
      <section className="border-y border-border/60 bg-card/30">
        <div id="top-up" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/70">
            Fast lane
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Popular top-ups
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {games.map((game) => (
              <div key={game.id}>
                <p className="font-heading text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {game.name}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {game.topupProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/games/${game.slug}`}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-background/60 px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent"
                    >
                      <span className="text-sm font-medium">{product.name}</span>
                      <span className="font-heading text-sm font-bold text-gold">
                        {formatPrice(product.price, product.currency)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ Featured accounts ============ */}
      <section id="accounts" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/70">
            Ready to play
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            Featured accounts
          </h2>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} game={listing.game} />
          ))}
        </div>
      </section>

      {/* ============ How it works ============ */}
      <section className="border-t border-border/60 bg-card/30">
        <div id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-primary/70">
            Ordering, start to finish
          </p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="mt-8 grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-3 md:divide-x divide-y md:divide-y-0 divide-border">
            {[
              {
                step: "01",
                title: "Pick and order",
                body: "Choose a top-up package or account and enter your game ID. No sign-up needed to browse.",
              },
              {
                step: "02",
                title: "Pay by QR",
                body: "Scan our KBZPay, Wave Money or PromptPay QR, then upload your payment slip.",
              },
              {
                step: "03",
                title: "Verified, then delivered",
                body: "A real admin checks your slip and delivers: diamonds to your ID, credentials to your dashboard.",
              },
            ].map((item) => (
              <div key={item.step} className="p-7">
                <span className="font-heading text-sm font-semibold text-primary/80">
                  {item.step}
                </span>
                <h3 className="mt-3 font-heading text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 rounded-xl border border-primary/25 bg-primary/5 p-6 sm:flex-row">
            <div>
              <p className="font-heading text-lg font-semibold">
                Questions before you buy?
              </p>
              <p className="text-sm text-muted-foreground">
                Message us on Telegram; we reply fast during open hours.
              </p>
            </div>
            <Button className="font-heading font-bold uppercase tracking-wider" render={<a href="https://t.me/ggmartmm" target="_blank" rel="noopener noreferrer" />}>
                <Send data-slot="icon" />
                @ggmartmm
              </Button>
          </div>
        </div>
      </section>
    </>
  );
}
