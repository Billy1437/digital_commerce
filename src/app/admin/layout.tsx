import Link from "next/link";
import { requireAdmin } from "@/lib/admin";

const tabs = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/payments", label: "Payment queue" },
  { href: "/admin/fulfillment", label: "Fulfillment" },
  { href: "/admin/listings", label: "Listings" },
  { href: "/admin/products", label: "Top-up products" },
];

export const metadata = { title: "Admin" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Admin</h1>
        <span className="rounded-md bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
          Staff only
        </span>
      </div>
      <nav className="mt-5 flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch={false}
            className="shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <div className="mt-7">{children}</div>
    </div>
  );
}
