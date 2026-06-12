import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Send, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { gameArt } from "@/lib/game-art";

export const revalidate = 30;

export default async function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await prisma.accountListing
    .findUnique({ where: { id }, include: { game: true } })
    .catch(() => null);
  if (!listing || listing.status === "HIDDEN") notFound();

  const art = gameArt(listing.game.slug);
  const available = listing.status === "AVAILABLE";
  const specs =
    listing.specs && typeof listing.specs === "object"
      ? Object.entries(listing.specs as Record<string, unknown>)
      : [];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href={`/games/${listing.game.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {listing.game.name}
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Gallery — placeholder until screenshots are uploaded */}
        <div
          className={`relative flex min-h-72 items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br ${art.tile}`}
        >
          <span className="select-none font-heading text-6xl font-bold uppercase tracking-widest text-foreground/15">
            {listing.rank ?? listing.game.name}
          </span>
          <Badge
            variant="outline"
            className={`absolute right-4 top-4 font-heading tracking-wider backdrop-blur-sm ${
              available
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-background/60 text-muted-foreground"
            }`}
          >
            {available ? "AVAILABLE" : listing.status}
          </Badge>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {listing.game.name}
          </p>
          <h1 className="mt-2 font-heading text-2xl font-bold leading-snug sm:text-3xl">
            {listing.title}
          </h1>
          <p className="mt-4 font-heading text-3xl font-bold text-gold text-glow-gold">
            {formatPrice(listing.price, listing.currency)}
          </p>

          {listing.description && (
            <p className="mt-4 text-muted-foreground">{listing.description}</p>
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              size="lg"
              disabled
              className="w-full font-heading font-bold uppercase tracking-wider"
            >
              {available ? "Buy now (checkout opens in Phase 3)" : "Sold out"}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full border-primary/30 font-heading font-semibold"
             render={<a href="https://t.me/ggmartmm" target="_blank" rel="noopener noreferrer" />}>
                <Send data-slot="icon" />
                Ask about this account
              </Button>
            <p className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" />
              Credentials delivered only after admin verifies your payment
            </p>
          </div>

          {specs.length > 0 && (
            <>
              <Separator className="my-6" />
              <h2 className="font-heading text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Account specs
              </h2>
              <dl className="mt-3 overflow-hidden rounded-lg border border-border">
                {specs.map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${
                      index % 2 === 0 ? "bg-card" : "bg-background/40"
                    }`}
                  >
                    <dt className="capitalize text-muted-foreground">{key}</dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
                {listing.rank && (
                  <div
                    className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${
                      specs.length % 2 === 0 ? "bg-card" : "bg-background/40"
                    }`}
                  >
                    <dt className="text-muted-foreground">Rank</dt>
                    <dd className="font-medium text-primary">{listing.rank}</dd>
                  </div>
                )}
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
