import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

const statusColors: Record<string, string> = {
  AVAILABLE: "text-[#5ee49a]",
  RESERVED: "text-[#f0c75e]",
  SOLD: "text-muted-foreground",
  HIDDEN: "text-muted-foreground",
};

export default async function AdminListingsPage() {
  const listings = await prisma.accountListing.findMany({
    orderBy: { createdAt: "desc" },
    include: { game: { select: { name: true } } },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {listings.length} listings
        </p>
        <Button size="sm" render={<Link href="/admin/listings/new" />}>
          <Plus data-slot="icon" aria-hidden="true" />
          New listing
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/admin/listings/${listing.id}/edit`}
            className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-3.5 transition-colors last:border-b-0 hover:bg-muted"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold">{listing.title}</p>
              <p className="text-xs text-muted-foreground">
                {listing.game.name}
                {listing.rank ? ` · ${listing.rank}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <span
                className={`text-xs font-bold ${statusColors[listing.status] ?? ""}`}
              >
                {listing.status}
              </span>
              <span className="font-bold">
                {formatPrice(listing.price, listing.currency)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
