import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListingCard } from "@/components/site/listing-card";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { gameArt } from "@/lib/game-art";

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
  // Real key art per game (local), falls back to stock art for others.
  const bannerArt = (
    {
      "mobile-legends": { src: "/hero/mlbb_hero.png" },
      "pubg-mobile": { src: "/hero/pubg_page.jpeg" },
    } as Record<string, { src: string }>
  )[game.slug];
  const availableCount = game.accountListings.filter(
    (listing) => listing.status === "AVAILABLE"
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        All games
      </Link>

      {/* Banner header */}
      <div className="relative mt-5 overflow-hidden rounded-2xl border border-border">
        <div className="relative min-h-[200px]">
          <Image
            src={bannerArt?.src ?? art.cover}
            alt={bannerArt ? game.name : art.alt}
            fill
            priority
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/75 to-background/30" />
          <div className="relative flex min-h-[200px] flex-col justify-center gap-2 p-7 sm:p-10">
            <h1 className="text-3xl font-extrabold sm:text-4xl">{game.name}</h1>
            <p className="text-sm text-muted-foreground">
              {game.topupProducts.length} top-up packages ·{" "}
              {availableCount === 1
                ? "1 account available"
                : `${availableCount} accounts available`}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="topup" className="mt-8">
        <TabsList>
          <TabsTrigger value="topup">Top-up</TabsTrigger>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
        </TabsList>

        <TabsContent value="topup" className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {game.topupProducts.map((product) => (
              <Link
                key={product.id}
                href={`/checkout/topup/${product.id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-5 py-4 transition-colors hover:border-primary/50"
              >
                <div>
                  <span className="block text-[15px] font-medium">
                    {product.name}
                  </span>
                  <span className="block text-xs font-bold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    Buy now →
                  </span>
                </div>
                <span className="font-bold">
                  {formatPrice(product.price, product.currency)}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-6 rounded-xl border border-dashed border-border bg-card/50 p-4 text-sm text-muted-foreground">
            Pick a package, enter your game ID, pay by QR and upload the slip.
            Questions first? Ask on{" "}
            <a
              href="https://t.me/ggmartmm"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-primary hover:underline"
            >
              Telegram
            </a>
            .
          </p>
        </TabsContent>

        <TabsContent value="accounts" className="mt-6">
          {game.accountListings.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground">
              No accounts listed for {game.name} yet; check back soon.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
