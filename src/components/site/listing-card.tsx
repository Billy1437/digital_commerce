import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { gameArt } from "@/lib/game-art";
import { screenshotUrl } from "@/lib/storage";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    rank: string | null;
    price: number;
    currency: string;
    status: string;
    specs: unknown;
    images?: string[];
  };
  game: { slug: string; name: string };
};

export function ListingCard({ listing, game }: ListingCardProps) {
  const art = gameArt(game.slug);
  const cover = listing.images?.[0]
    ? { src: screenshotUrl(listing.images[0]), alt: listing.title }
    : { src: art.image, alt: art.alt };
  const specs =
    listing.specs && typeof listing.specs === "object"
      ? Object.entries(listing.specs as Record<string, unknown>).slice(0, 2)
      : [];
  const available = listing.status === "AVAILABLE";

  return (
    <Link
      href={`/accounts/${listing.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_16px_40px_-16px_rgba(0,0,0,0.7)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        {listing.rank && (
          <span className="absolute left-3 top-3 rounded-md bg-background/80 px-2.5 py-1 text-xs font-bold backdrop-blur-sm">
            {listing.rank}
          </span>
        )}
        {!available && (
          <span className="absolute right-3 top-3 rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            {listing.status === "SOLD" ? "SOLD" : listing.status}
          </span>
        )}
      </div>

      <div className="space-y-2.5 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {game.name}
        </p>
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug">
          {listing.title}
        </h3>
        {specs.length > 0 && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {specs.map(([key, value]) => `${key}: ${String(value)}`).join(" · ")}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          <span className="text-lg font-bold">
            {formatPrice(listing.price, listing.currency)}
          </span>
          <span className="text-xs font-bold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
