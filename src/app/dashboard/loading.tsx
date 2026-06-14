import { Skeleton } from "@/components/ui/skeleton";
import { RowsSkeleton } from "@/components/site/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <Skeleton className="h-5 w-32" />
          <div className="mt-6">
            <RowsSkeleton count={4} />
          </div>
        </div>
        <div>
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-6 h-56 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
