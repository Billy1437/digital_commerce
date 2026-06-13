"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import type { ListingStatus } from "@/generated/prisma/enums";

export async function approvePayment(formData: FormData) {
  const { userId } = await requireAdmin();
  const paymentId = String(formData.get("paymentId") ?? "");

  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
  });
  if (payment.status !== "PENDING") throw new Error("Already reviewed.");

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: "APPROVED", verifiedById: userId, verifiedAt: new Date() },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "PAID" },
    }),
  ]);

  // Approved order moves from the queue into fulfillment.
  revalidatePath("/admin/payments");
  revalidatePath("/admin/fulfillment");
}

export async function rejectPayment(formData: FormData) {
  const { userId } = await requireAdmin();
  const paymentId = String(formData.get("paymentId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("Give the buyer a reason.");

  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
  });
  if (payment.status !== "PENDING") throw new Error("Already reviewed.");

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "REJECTED",
        rejectReason: reason,
        verifiedById: userId,
        verifiedAt: new Date(),
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: "REJECTED" },
    }),
  ]);

  revalidatePath("/admin/payments");
}

export async function attachCredential(formData: FormData) {
  await requireAdmin();
  const orderItemId = String(formData.get("orderItemId") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  if (!username || !password) throw new Error("Login and password required.");

  const item = await prisma.orderItem.findUniqueOrThrow({
    where: { id: orderItemId },
    include: { order: true },
  });
  if (item.type !== "ACCOUNT") throw new Error("Not an account item.");
  if (item.order.status !== "PAID") throw new Error("Order is not paid yet.");

  await prisma.$transaction([
    prisma.credential.upsert({
      where: { orderItemId },
      create: {
        orderItemId,
        username,
        password,
        extra: notes ? { notes } : undefined,
        deliveredAt: new Date(),
      },
      update: {
        username,
        password,
        extra: notes ? { notes } : undefined,
      },
    }),
    ...(item.accountListingId
      ? [
          prisma.accountListing.update({
            where: { id: item.accountListingId },
            data: { status: "SOLD" },
          }),
        ]
      : []),
  ]);

  revalidatePath("/admin/fulfillment");
}

export async function completeOrder(formData: FormData) {
  await requireAdmin();
  const orderId = String(formData.get("orderId") ?? "");

  // Single guarded write: completes only if PAID and every account item already
  // has credentials. Happy path is one query; we only read to explain failures.
  const affected = await prisma.$executeRaw`
    UPDATE "public"."orders" AS o
    SET "status" = 'COMPLETED'::"public"."OrderStatus", "updated_at" = now()
    WHERE o."id" = ${orderId}::uuid
      AND o."status" = 'PAID'::"public"."OrderStatus"
      AND NOT EXISTS (
        SELECT 1 FROM "public"."order_items" oi
        WHERE oi."order_id" = o."id"
          AND oi."type" = 'ACCOUNT'::"public"."OrderItemType"
          AND NOT EXISTS (
            SELECT 1 FROM "public"."credentials" c
            WHERE c."order_item_id" = oi."id"
          )
      )`;

  if (affected === 0) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });
    if (!order) throw new Error("Order not found.");
    if (order.status !== "PAID") throw new Error("Order is not paid.");
    throw new Error("Attach credentials to all account items first.");
  }

  revalidatePath("/admin/fulfillment");
}

function parseSpecs(raw: string) {
  const entries = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf(":");
      if (index === -1) return null;
      return [line.slice(0, index).trim(), line.slice(index + 1).trim()];
    })
    .filter((entry): entry is [string, string] => !!entry && !!entry[0]);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}

export async function upsertListing(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    gameId: String(formData.get("gameId") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim() || null,
    rank: String(formData.get("rank") ?? "").trim() || null,
    level: Number(formData.get("level")) || null,
    price: Math.max(0, Math.round(Number(formData.get("price")) || 0)),
    status: String(formData.get("status") ?? "AVAILABLE") as ListingStatus,
    specs: parseSpecs(String(formData.get("specs") ?? "")),
    images: formData
      .getAll("images")
      .map(String)
      .filter((key) => /^accounts_screenshots\/[\w-]+\.(jpg|jpeg|png|webp)$/.test(key)),
  };
  if (!data.gameId || !data.title || data.price <= 0) {
    throw new Error("Game, title and a positive price are required.");
  }

  if (id) {
    await prisma.accountListing.update({ where: { id }, data });
  } else {
    await prisma.accountListing.create({ data });
  }

  revalidatePath("/admin/listings");
  revalidatePath("/");
  redirect("/admin/listings");
}

export async function upsertProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const data = {
    gameId: String(formData.get("gameId") ?? ""),
    name: String(formData.get("name") ?? "").trim(),
    price: Math.max(0, Math.round(Number(formData.get("price")) || 0)),
    sortOrder: Number(formData.get("sortOrder")) || 0,
    active: formData.get("active") === "on",
  };
  if (!data.gameId || !data.name || data.price <= 0) {
    throw new Error("Game, name and a positive price are required.");
  }

  if (id) {
    await prisma.topupProduct.update({ where: { id }, data });
  } else {
    await prisma.topupProduct.create({ data });
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
}
