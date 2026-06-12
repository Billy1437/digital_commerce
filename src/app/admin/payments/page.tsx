import Image from "next/image";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/site/submit-button";
import { approvePayment, rejectPayment } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabels } from "@/lib/payment-methods";

export default async function AdminPaymentsPage() {
  const payments = await prisma.payment.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      order: {
        include: {
          user: { select: { username: true, telegram: true } },
          items: { select: { name: true, gamePlayerId: true, gameServerId: true } },
        },
      },
    },
  });

  // Signed URLs for the private slip bucket (admin RLS policy grants read)
  const supabase = await createClient();
  const slipUrls = new Map<string, string>();
  for (const payment of payments) {
    if (!payment.slipPath) continue;
    const { data } = await supabase.storage
      .from("payment-slips")
      .createSignedUrl(payment.slipPath, 3600);
    if (data?.signedUrl) slipUrls.set(payment.id, data.signedUrl);
  }

  if (payments.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
        Queue is clear. New slips appear here the moment buyers upload them.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {payments.map((payment) => {
        const slipUrl = slipUrls.get(payment.id);
        return (
          <div
            key={payment.id}
            className="grid gap-5 rounded-xl border border-border bg-card p-5 lg:grid-cols-[220px_1fr]"
          >
            {/* Slip */}
            <div>
              {slipUrl ? (
                <a href={slipUrl} target="_blank" rel="noopener noreferrer">
                  <span className="relative block aspect-[3/4] overflow-hidden rounded-lg border border-border bg-background">
                    <Image
                      src={slipUrl}
                      alt="Payment slip"
                      fill
                      sizes="220px"
                      className="object-contain"
                    />
                  </span>
                  <span className="mt-1.5 block text-center text-xs text-muted-foreground">
                    Click to open full size
                  </span>
                </a>
              ) : (
                <p className="flex aspect-[3/4] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                  No slip image
                </p>
              )}
            </div>

            {/* Details + actions */}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <p className="font-bold">{payment.order.code}</p>
                <span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold">
                  {paymentMethodLabels[payment.method] ?? payment.method}
                </span>
                <span className="text-lg font-extrabold">
                  {formatPrice(payment.amount, payment.order.currency)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {payment.order.user.username ?? "Unnamed buyer"}
                {payment.order.user.telegram
                  ? ` · ${payment.order.user.telegram}`
                  : ""}{" "}
                · {payment.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
              </p>
              <ul className="mt-3 space-y-1 text-sm">
                {payment.order.items.map((item, index) => (
                  <li key={index} className="text-muted-foreground">
                    {item.name}
                    {item.gamePlayerId && (
                      <span className="font-semibold text-foreground">
                        {" "}
                        → ID {item.gamePlayerId}
                        {item.gameServerId ? ` (${item.gameServerId})` : ""}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
                <form action={approvePayment}>
                  <input type="hidden" name="paymentId" value={payment.id} />
                  <SubmitButton pendingLabel="Approving…">
                    <Check data-slot="icon" aria-hidden="true" />
                    Approve · mark paid
                  </SubmitButton>
                </form>
                <form action={rejectPayment} className="flex flex-1 gap-2">
                  <input type="hidden" name="paymentId" value={payment.id} />
                  <Input
                    name="reason"
                    required
                    placeholder="Rejection reason (shown to buyer)"
                    className="flex-1"
                  />
                  <SubmitButton variant="outline" pendingLabel="Rejecting…">
                    <X data-slot="icon" aria-hidden="true" />
                    Reject
                  </SubmitButton>
                </form>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
