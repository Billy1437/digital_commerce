import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "../../listing-form";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, games] = await Promise.all([
    prisma.accountListing.findUnique({ where: { id } }).catch(() => null),
    prisma.game.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!listing) notFound();

  return (
    <div>
      <h2 className="text-lg font-extrabold">Edit listing</h2>
      <div className="mt-5">
        <ListingForm games={games} listing={listing} />
      </div>
    </div>
  );
}
