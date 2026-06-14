import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <Skeleton className="h-4 w-24" />
      <div className="mt-5 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="h-6 w-28 rounded-md" />
      </div>
      <div className="mt-7 grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
      <Skeleton className="mt-7 h-32 w-full rounded-2xl" />
      <Skeleton className="mt-7 h-64 w-full rounded-2xl" />
    </div>
  );
}
