import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function AdminOverviewPage() {
  const [pendingPayments, toFulfill, availableListings, completed, revenue] =
    await Promise.all([
      prisma.payment.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.accountListing.count({ where: { status: "AVAILABLE" } }),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.aggregate({
        where: { status: "COMPLETED" },
        _sum: { total: true },
      }),
    ]);

  const cards = [
    {
      href: "/admin/payments",
      label: "Slips waiting for review",
      value: String(pendingPayments),
      urgent: pendingPayments > 0,
    },
    {
      href: "/admin/fulfillment",
      label: "Paid orders to fulfill",
      value: String(toFulfill),
      urgent: toFulfill > 0,
    },
    {
      href: "/admin/listings",
      label: "Accounts available",
      value: String(availableListings),
      urgent: false,
    },
    {
      href: "/admin/fulfillment",
      label: "Orders completed",
      value: `${completed} · ${formatPrice(revenue._sum.total ?? 0)}`,
      urgent: false,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Link
          key={card.label}
          href={card.href}
          className={`group rounded-xl border bg-card p-5 transition-colors hover:border-white/20 ${
            card.urgent ? "border-primary/50" : "border-border"
          }`}
        >
          <p className="text-2xl font-extrabold">{card.value}</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            {card.label}
            <ArrowRight
              className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </p>
        </Link>
      ))}
    </div>
  );
}
