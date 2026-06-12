import { prisma } from "@/lib/prisma";
import { ListingForm } from "../listing-form";

export default async function NewListingPage() {
  const games = await prisma.game.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div>
      <h2 className="text-lg font-extrabold">New listing</h2>
      <div className="mt-5">
        <ListingForm games={games} />
      </div>
    </div>
  );
}
