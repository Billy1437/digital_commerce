import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/site/submit-button";
import { createTopupOrder } from "@/app/actions/orders";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { gameArt } from "@/lib/game-art";

export const metadata = { title: "Checkout" };

export default async function TopupCheckoutPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/checkout/topup/${productId}`)}`);
  }

  const product = await prisma.topupProduct
    .findFirst({ where: { id: productId, active: true }, include: { game: true } })
    .catch(() => null);
  if (!product) notFound();

  const art = gameArt(product.game.slug);
  const isMobileLegends = product.game.slug === "mobile-legends";

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6">
      <Link
        href={`/games/${product.game.slug}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        {product.game.name}
      </Link>

      <h1 className="mt-5 text-2xl font-extrabold">Checkout</h1>

      {/* Order summary */}
      <div className="mt-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg">
          <Image src={art.image} alt={art.alt} fill sizes="64px" className="object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {product.game.name}
          </p>
          <p className="font-semibold">{product.name}</p>
        </div>
        <p className="text-lg font-extrabold">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>

      <form action={createTopupOrder} className="mt-6 space-y-5">
        <input type="hidden" name="productId" value={product.id} />
        <div className="space-y-2">
          <Label htmlFor="gamePlayerId">
            Your {product.game.name} ID <span className="text-primary">*</span>
          </Label>
          <Input
            id="gamePlayerId"
            name="gamePlayerId"
            required
            inputMode="numeric"
            placeholder={isMobileLegends ? "e.g. 123456789" : "e.g. 5123456789"}
          />
        </div>
        {isMobileLegends && (
          <div className="space-y-2">
            <Label htmlFor="gameServerId">
              Server ID <span className="text-primary">*</span>
            </Label>
            <Input
              id="gameServerId"
              name="gameServerId"
              required
              inputMode="numeric"
              placeholder="e.g. 2345 — the number in brackets next to your ID"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="note">Note (optional)</Label>
          <Input id="note" name="note" placeholder="Anything we should know" />
        </div>

        <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Next step: you&apos;ll get our payment QR codes and upload your
          payment slip. Nothing is charged automatically.
        </div>

        <SubmitButton size="lg" className="w-full" pendingLabel="Creating order…">
          Place order · {formatPrice(product.price, product.currency)}
        </SubmitButton>
      </form>
    </div>
  );
}
