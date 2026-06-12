import { KeyRound, PackageCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/site/submit-button";
import { attachCredential, completeOrder } from "@/app/actions/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/format";

export default async function AdminFulfillmentPage() {
  const orders = await prisma.order.findMany({
    where: { status: "PAID" },
    orderBy: { updatedAt: "asc" },
    include: {
      user: { select: { username: true, telegram: true } },
      items: { include: { credential: true } },
    },
  });

  if (orders.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center text-muted-foreground">
        Nothing to fulfill. Approved orders land here until you deliver them.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => {
        const ready = order.items.every(
          (item) => item.type !== "ACCOUNT" || item.credential
        );
        return (
          <div key={order.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold">{order.code}</p>
                <p className="text-sm text-muted-foreground">
                  {order.user.username ?? "Unnamed buyer"}
                  {order.user.telegram ? ` · ${order.user.telegram}` : ""}
                </p>
              </div>
              <p className="text-lg font-extrabold">
                {formatPrice(order.total, order.currency)}
              </p>
            </div>

            <div className="mt-4 space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border bg-background/50 p-4"
                >
                  <p className="font-semibold">{item.name}</p>
                  {item.type === "TOPUP" && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      Deliver to game ID{" "}
                      <span className="font-bold text-foreground">
                        {item.gamePlayerId}
                        {item.gameServerId ? ` (${item.gameServerId})` : ""}
                      </span>
                    </p>
                  )}
                  {item.type === "ACCOUNT" &&
                    (item.credential ? (
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#5ee49a]">
                        <KeyRound className="size-3.5" aria-hidden="true" />
                        Credentials attached ({item.credential.username})
                      </p>
                    ) : (
                      <form
                        action={attachCredential}
                        className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]"
                      >
                        <input type="hidden" name="orderItemId" value={item.id} />
                        <Input name="username" required placeholder="Account login" />
                        <Input name="password" required placeholder="Password" />
                        <Input name="notes" placeholder="Notes (server, email...)" />
                        <SubmitButton size="sm" variant="outline" pendingLabel="Saving…">
                          Attach
                        </SubmitButton>
                      </form>
                    ))}
                </div>
              ))}
            </div>

            <form action={completeOrder} className="mt-4">
              <input type="hidden" name="orderId" value={order.id} />
              <SubmitButton disabled={!ready} pendingLabel="Completing…">
                <PackageCheck data-slot="icon" aria-hidden="true" />
                {ready
                  ? "Mark delivered · complete order"
                  : "Attach credentials first"}
              </SubmitButton>
            </form>
          </div>
        );
      })}
    </div>
  );
}
