import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { gameArt } from "@/lib/game-art";

type ListingCardProps = {
  listing: {
    id: string;
    title: string;
    rank: string | null;
    price: number;
    currency: string;
    status: string;
    specs: unknown;
  };
  game: { slug: string; name: string };
};

export function ListingCard({ listing, game }: ListingCardProps) {
  const art = gameArt(game.slug);
  const specs =
    listing.specs && typeof listing.specs === "object"
      ? Object.entries(listing.specs as Record<string, unknown>).slice(0, 3)
      : [];
  const available = listing.status === "AVAILABLE";

  return (
    <Link
      href={`/accounts/${listing.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_8px_40px_-12px] hover:shadow-primary/25"
    >
      <div
        className={`relative flex h-36 items-center justify-center overflow-hidden bg-gradient-to-br ${art.tile}`}
      >
        <span className="select-none font-heading text-4xl font-bold uppercase tracking-widest text-foreground/15 transition-transform duration-300 group-hover:scale-105">
          {listing.rank ?? game.name}
        </span>
        <Badge
          variant="outline"
          className={`absolute right-3 top-3 font-heading text-[10px] tracking-wider backdrop-blur-sm ${
            available
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border bg-background/60 text-muted-foreground"
          }`}
        >
          {available ? "AVAILABLE" : listing.status}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {game.name}
        </p>
        <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug">
          {listing.title}
        </h3>
        {specs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {specs.map(([key, value]) => (
              <span
                key={key}
                className="rounded border border-border bg-secondary/60 px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {key}: {String(value)}
              </span>
            ))}
          </div>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-heading text-lg font-bold text-gold text-glow-gold">
            {formatPrice(listing.price, listing.currency)}
          </span>
          <span className="text-xs font-semibold text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
