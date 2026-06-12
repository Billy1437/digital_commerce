import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SubmitButton } from "@/components/site/submit-button";
import { createAccountOrder } from "@/app/actions/orders";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";
import { gameArt } from "@/lib/game-art";
import { screenshotUrl } from "@/lib/storage";

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
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Link
        href={`/games/${listing.game.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        {listing.game.name}
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Gallery: real screenshots when uploaded, stock art otherwise */}
        <div>
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border">
            <Image
              src={
                listing.images[0] ? screenshotUrl(listing.images[0]) : art.cover
              }
              alt={listing.images[0] ? listing.title : art.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            {listing.rank && (
              <span className="absolute left-4 top-4 rounded-md bg-background/80 px-3 py-1.5 text-sm font-bold backdrop-blur-sm">
                {listing.rank}
              </span>
            )}
            <span
              className={`absolute right-4 top-4 rounded-md px-3 py-1.5 text-xs font-bold ${
                available
                  ? "bg-card/80 text-foreground backdrop-blur-sm"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {available ? "AVAILABLE" : listing.status}
            </span>
          </div>
          {listing.images.length > 1 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {listing.images.slice(1).map((path, index) => (
                <a
                  key={path}
                  href={screenshotUrl(path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border transition-opacity hover:opacity-80"
                >
                  <Image
                    src={screenshotUrl(path)}
                    alt={`${listing.title} — screenshot ${index + 2}`}
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {listing.game.name}
          </p>
          <h1 className="mt-2 text-2xl font-extrabold leading-snug sm:text-3xl">
            {listing.title}
          </h1>
          <p className="mt-4 text-3xl font-extrabold">
            {formatPrice(listing.price, listing.currency)}
          </p>

          {listing.description && (
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              {listing.description}
            </p>
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            {available ? (
              <form action={createAccountOrder}>
                <input type="hidden" name="listingId" value={listing.id} />
                <SubmitButton size="lg" className="w-full" pendingLabel="Reserving…">
                  Buy now · {formatPrice(listing.price, listing.currency)}
                </SubmitButton>
              </form>
            ) : (
              <Button size="lg" disabled className="w-full">
                {listing.status === "RESERVED" ? "Reserved" : "Sold out"}
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="w-full"
             render={<a href="https://t.me/ggmartmm" target="_blank" rel="noopener noreferrer" />}>
                <Send data-slot="icon" aria-hidden="true" />
                Ask about this account
              </Button>
            <p className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden="true" />
              Credentials delivered only after admin verifies your payment
            </p>
          </div>

          {specs.length > 0 && (
            <>
              <Separator className="my-6" />
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Account specs
              </h2>
              <dl className="mt-3 overflow-hidden rounded-xl border border-border">
                {specs.map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between gap-4 px-4 py-2.5 text-sm ${
                      index % 2 === 0 ? "bg-card" : "bg-background/40"
                    }`}
                  >
                    <dt className="capitalize text-muted-foreground">{key}</dt>
                    <dd className="font-semibold">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
