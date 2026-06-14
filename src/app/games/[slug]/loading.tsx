import { Skeleton } from "@/components/ui/skeleton";
import { ListingGridSkeleton } from "@/components/site/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-5 h-[200px] w-full rounded-2xl" />
      <div className="mt-8 flex gap-2">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
      <div className="mt-6">
        <ListingGridSkeleton count={3} />
      </div>
    </div>
  );
}
