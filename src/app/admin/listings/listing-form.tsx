import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/site/submit-button";
import { upsertListing } from "@/app/actions/admin";
import type { AccountListing, Game } from "@/generated/prisma/client";

const STATUSES = ["AVAILABLE", "RESERVED", "SOLD", "HIDDEN"] as const;

export function ListingForm({
  games,
  listing,
}: {
  games: Pick<Game, "id" | "name">[];
  listing?: AccountListing;
}) {
  const specsText =
    listing?.specs && typeof listing.specs === "object"
      ? Object.entries(listing.specs as Record<string, unknown>)
          .map(([key, value]) => `${key}: ${value}`)
          .join("\n")
      : "";

  return (
    <form action={upsertListing} className="max-w-2xl space-y-5">
      {listing && <input type="hidden" name="id" value={listing.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="gameId">Game</Label>
          <select
            id="gameId"
            name="gameId"
            required
            defaultValue={listing?.gameId ?? games[0]?.id}
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            {games.map((game) => (
              <option key={game.id} value={game.id}>
                {game.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={listing?.status ?? "AVAILABLE"}
            className="h-10 w-full rounded-lg border border-input bg-card px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={listing?.title ?? ""}
          placeholder="Mythic Glory account, 120 skins, all emblems maxed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={listing?.description ?? ""}
          placeholder="Full access, original email included..."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="rank">Rank</Label>
          <Input
            id="rank"
            name="rank"
            defaultValue={listing?.rank ?? ""}
            placeholder="Mythic Glory"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Level</Label>
          <Input
            id="level"
            name="level"
            type="number"
            defaultValue={listing?.level ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">Price (MMK)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            required
            min={1}
            defaultValue={listing?.price ?? ""}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="specs">Specs (one per line, key: value)</Label>
        <Textarea
          id="specs"
          name="specs"
          rows={4}
          defaultValue={specsText}
          placeholder={"heroes: 110\nskins: 120\nemblems: All maxed"}
        />
      </div>

      <SubmitButton size="lg" pendingLabel="Saving…">
        {listing ? "Save changes" : "Create listing"}
      </SubmitButton>
    </form>
  );
}
