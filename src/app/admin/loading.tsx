import { Skeleton } from "@/components/ui/skeleton";

// Renders inside the admin layout (nav stays), only the page area swaps.
export default function Loading() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 rounded-xl" />
      ))}
    </div>
  );
}
