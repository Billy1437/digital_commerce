"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateOrderCode } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";
import type { PaymentMethod } from "@/generated/prisma/enums";

const PAYMENT_METHODS: PaymentMethod[] = ["KBZPAY", "WAVE_MONEY", "PROMPTPAY"];

async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function createTopupOrder(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const gamePlayerId = String(formData.get("gamePlayerId") ?? "").trim();
  const gameServerId = String(formData.get("gameServerId") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/checkout/topup/${productId}`)}`);
  if (!productId || !gamePlayerId) {
    throw new Error("Your in-game ID is required.");
  }

  const product = await prisma.topupProduct.findFirst({
    where: { id: productId, active: true },
    include: { game: true },
  });
  if (!product) throw new Error("This package is no longer available.");

  const order = await prisma.order.create({
    data: {
      code: generateOrderCode(),
      userId: user.id,
      total: product.price,
      currency: product.currency,
      note: note || null,
      items: {
        create: [
          {
            type: "TOPUP",
            topupProductId: product.id,
            name: `${product.game.name} · ${product.name}`,
            unitPrice: product.price,
            gamePlayerId,
            gameServerId: gameServerId || null,
          },
        ],
      },
    },
  });

  redirect(`/orders/${order.code}`);
}

export async function createAccountOrder(formData: FormData) {
  const listingId = String(formData.get("listingId") ?? "");

  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/accounts/${listingId}`)}`);
  if (!listingId) throw new Error("Missing listing.");

  // Self-heal: free any listings held by abandoned unpaid orders before we try
  // to reserve, so a buyer is never blocked by a stale reservation between the
  // pg_cron sweeps. Cheap, indexed, and reuses the same logic the cron runs.
  await prisma.$executeRaw`SELECT public.release_stale_reservations(30)`;

  const code = await prisma.$transaction(async (tx) => {
    const reserved = await tx.accountListing.updateMany({
      where: { id: listingId, status: "AVAILABLE" },
      data: { status: "RESERVED" },
    });
    if (reserved.count === 0) {
      throw new Error("This account was just reserved by someone else.");
    }

    const listing = await tx.accountListing.findUniqueOrThrow({
      where: { id: listingId },
      include: { game: true },
    });

    const order = await tx.order.create({
      data: {
        code: generateOrderCode(),
        userId: user.id,
        total: listing.price,
        currency: listing.currency,
        items: {
          create: [
            {
              type: "ACCOUNT",
              accountListingId: listing.id,
              name: `${listing.game.name} · ${listing.title}`,
              unitPrice: listing.price,
            },
          ],
        },
      },
    });
    return order.code;
  });

  revalidatePath(`/accounts/${listingId}`);
  redirect(`/orders/${code}`);
}

export async function submitPaymentSlip(formData: FormData) {
  const orderCode = String(formData.get("orderCode") ?? "");
  const method = String(formData.get("method") ?? "") as PaymentMethod;
  const slipPath = String(formData.get("slipPath") ?? "");

  const user = await getUser();
  if (!user) redirect("/login");
  if (!PAYMENT_METHODS.includes(method)) throw new Error("Pick a payment method.");
  if (!slipPath.startsWith(`${user.id}/`)) throw new Error("Slip upload failed.");

  const order = await prisma.order.findFirst({
    where: { code: orderCode, userId: user.id },
  });
  if (!order) throw new Error("Order not found.");
  if (!["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "REJECTED"].includes(order.status)) {
    throw new Error("This order is already being processed.");
  }

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        orderId: order.id,
        method,
        amount: order.total,
        slipPath,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "PAYMENT_SUBMITTED" },
    }),
  ]);

  revalidatePath(`/orders/${orderCode}`);
}

export async function updateProfile(formData: FormData) {
  const user = await getUser();
  if (!user) redirect("/login");

  const username = String(formData.get("username") ?? "").trim();
  const telegram = String(formData.get("telegram") ?? "").trim();

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      username: username || null,
      telegram: telegram || null,
    },
  });

  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
