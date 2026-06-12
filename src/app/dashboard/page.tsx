import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, PackageOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrderStatusBadge } from "@/components/site/order-status-badge";
import { SubmitButton } from "@/components/site/submit-button";
import { updateProfile } from "@/app/actions/orders";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [profile, orders] = await Promise.all([
    prisma.profile.findUnique({ where: { id: user.id } }),
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-extrabold">
        Hey {profile?.username || "there"} 👋
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Orders */}
        <section>
          <h2 className="heading-bar text-lg font-extrabold">Your orders</h2>
          {orders.length === 0 ? (
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
              <PackageOpen className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 font-semibold">No orders yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Your top-ups and account purchases will show up here.
              </p>
              <Button className="mt-5" render={<Link href="/#top-up" />}>
                Browse top-ups
                <ArrowRight data-slot="icon" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <div className="mt-6 overflow-hidden rounded-2xl border border-border">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.code}`}
                  className="flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-4 transition-colors last:border-b-0 hover:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="font-bold">{order.code}</p>
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {order.items.map((item) => item.name).join(", ")}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {order.createdAt.toLocaleDateString("en-GB", {
                        dateStyle: "medium",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-bold">
                      {formatPrice(order.total, order.currency)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Profile */}
        <section>
          <h2 className="heading-bar text-lg font-extrabold">Profile</h2>
          <form
            action={updateProfile}
            className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5"
          >
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                defaultValue={profile?.username ?? ""}
                placeholder="Your display name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram</Label>
              <Input
                id="telegram"
                name="telegram"
                defaultValue={profile?.telegram ?? ""}
                placeholder="@username — for order updates"
              />
            </div>
            <SubmitButton className="w-full" pendingLabel="Saving…">
              Save profile
            </SubmitButton>
          </form>
        </section>
      </div>
    </div>
  );
}
