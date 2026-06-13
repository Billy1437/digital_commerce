import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Active games for the navbar. Cached so it isn't re-queried on every page
 *  render; admin catalog edits revalidate path "/" which clears this too. */
export const getNavGames = unstable_cache(
  () =>
    prisma.game.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    }),
  ["nav-games"],
  { revalidate: 300, tags: ["games"] }
);
