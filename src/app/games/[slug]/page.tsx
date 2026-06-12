import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard } from "@/components/site/listing-card";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { gameArt, gameInitials } from "@/lib/game-art";

export const revalidate = 30;

export default async function GamePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await prisma.game.findUnique({
    where: { slug, active: true },
    include: {
      topupProducts: { where: { active: true }, orderBy: { sortOrder: "asc" } },
      accountListings: {
        where: { status: { in: ["AVAILABLE", "SOLD"] } },
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!game) notFound();

  const art = gameArt(game.slug);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        All games
      </Link>

      <div className="mt-6 flex items-center gap-5">
        <div
          className={`flex size-20 shrink-0 items-center justify-center rounded-lg border border-border bg-gradient-to-br ${art.tile}`}
        >
          <span className="font-heading text-2xl font-bold text-foreground/80">
            {gameInitials(game.name)}
          </span>
        </div>
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">{game.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {game.topupProducts.length} top-up packages ·{" "}
            {game.accountListings.filter((l) => l.status === "AVAILABLE").length ===
            1
              ? "1 account available"
              : `${
                  game.accountListings.filter((l) => l.status === "AVAILABLE")
                    .length
                } accounts available`}
          </p>
        </div>
      </div>

      <Tabs defaultValue="topup" className="mt-8">
        <TabsList className="font-heading">
          <TabsTrigger value="topup">Top-up</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="topup" className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {game.topupProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-primary/40"
              >
                <span className="font-medium">{product.name}</span>
                <span className="font-heading font-bold text-gold">
                  {formatPrice(product.price, product.currency)}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-lg border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
            Checkout opens in Phase 3 — for now, order via{" "}
            <a
              href="https://t.me/ggmartmm"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Telegram
            </a>
            .
          </p>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          {game.accountListings.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
              No accounts listed for {game.name} yet — check back soon.
            </p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {game.accountListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  game={{ slug: game.slug, name: game.name }}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
