import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, ChevronLeft, KeyRound } from "lucide-react";
import { OrderStatusBadge } from "@/components/site/order-status-badge";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { paymentMethodLabels } from "@/lib/payment-methods";
import { OrderRealtime } from "./order-realtime";
import { SlipUpload } from "./slip-upload";

export const metadata = { title: "Order" };

const steps = [
  { key: "PENDING_PAYMENT", label: "Order placed" },
  { key: "PAYMENT_SUBMITTED", label: "Slip submitted" },
  { key: "PAID", label: "Payment verified" },
  { key: "COMPLETED", label: "Delivered" },
];

function stepIndex(status: string) {
  if (status === "COMPLETED") return 3;
  if (status === "PAID") return 2;
  if (status === "PAYMENT_SUBMITTED") return 1;
  return 0;
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/orders/${code}`)}`);

  const order = await prisma.order.findFirst({
    where: { code, userId: user.id },
    include: {
      items: {
        include: {
          credential: true,
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  const active = stepIndex(order.status);
  const cancelled = order.status === "CANCELLED";
  const rejected = order.status === "REJECTED";
  const needsPayment = ["PENDING_PAYMENT", "REJECTED"].includes(order.status);
  const latestPayment = order.payments[0];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <OrderRealtime orderId={order.id} />

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        My orders
      </Link>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">{order.code}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed {order.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Progress stepper */}
      {!cancelled && (
        <ol className="mt-7 grid grid-cols-4 gap-2">
          {steps.map((step, index) => {
            const done = index <= active && !rejected;
            return (
              <li key={step.key} className="text-center">
                <div
                  className={`mx-auto flex size-8 items-center justify-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
                </div>
                <div
                  className={`mt-2 h-1 rounded-full ${
                    done ? "bg-primary" : "bg-secondary"
                  }`}
                />
                <p
                  className={`mt-2 text-[11px] font-semibold ${
                    done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>
      )}

      {rejected && latestPayment?.rejectReason && (
        <p className="mt-6 rounded-xl bg-destructive/15 px-4 py-3 text-sm font-medium">
          Your slip was rejected: {latestPayment.rejectReason}. Please pay and
          upload a new slip, or contact us on Telegram.
        </p>
      )}

      {/* Items */}
      <div className="mt-7 overflow-hidden rounded-2xl border border-border">
        {order.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="font-semibold">{item.name}</p>
              {item.gamePlayerId && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Game ID: {item.gamePlayerId}
                  {item.gameServerId ? ` (${item.gameServerId})` : ""}
                </p>
              )}
            </div>
            <p className="font-bold">
              {formatPrice(item.unitPrice * item.quantity, order.currency)}
            </p>
          </div>
        ))}
        <div className="flex items-center justify-between bg-background px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Total
          </p>
          <p className="text-lg font-extrabold">
            {formatPrice(order.total, order.currency)}
          </p>
        </div>
      </div>

      {/* Credentials reveal for completed account orders */}
      {order.status === "COMPLETED" &&
        order.items.some((item) => item.credential) && (
          <div className="mt-7 rounded-2xl border border-primary/40 bg-card p-5 sm:p-6">
            <h2 className="flex items-center gap-2 font-bold">
              <KeyRound className="size-4 text-primary" aria-hidden="true" />
              Your account credentials
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Change the password and bind your own email immediately after
              logging in.
            </p>
            {order.items
              .filter((item) => item.credential)
              .map((item) => (
                <dl
                  key={item.id}
                  className="mt-4 overflow-hidden rounded-xl border border-border text-sm"
                >
                  <div className="flex justify-between gap-4 bg-background/50 px-4 py-2.5">
                    <dt className="text-muted-foreground">Item</dt>
                    <dd className="font-semibold">{item.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4 px-4 py-2.5">
                    <dt className="text-muted-foreground">Login</dt>
                    <dd className="font-mono font-semibold">
                      {item.credential!.username}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 bg-background/50 px-4 py-2.5">
                    <dt className="text-muted-foreground">Password</dt>
                    <dd className="font-mono font-semibold">
                      {item.credential!.password}
                    </dd>
                  </div>
                </dl>
              ))}
          </div>
        )}

      {/* Payment */}
      {needsPayment && !cancelled && (
        <div className="mt-7">
          <SlipUpload
            orderCode={order.code}
            total={order.total}
            currency={order.currency}
          />
        </div>
      )}

      {order.status === "PAYMENT_SUBMITTED" && (
        <p className="mt-7 rounded-2xl border border-border bg-card px-5 py-4 text-sm text-muted-foreground">
          Your slip is in the review queue. This page updates by itself the
          moment our admin verifies it — usually within minutes during open
          hours.
        </p>
      )}

      {/* Payment history */}
      {order.payments.length > 0 && (
        <div className="mt-7">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Payment history
          </h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-border text-sm">
            {order.payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3 last:border-b-0"
              >
                <span className="font-medium">
                  {paymentMethodLabels[payment.method] ?? payment.method}
                </span>
                <span className="text-muted-foreground">
                  {payment.createdAt.toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span
                  className={`font-bold ${
                    payment.status === "APPROVED"
                      ? "text-[#5ee49a]"
                      : payment.status === "REJECTED"
                        ? "text-[#ff8d85]"
                        : "text-muted-foreground"
                  }`}
                >
                  {payment.status.toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
