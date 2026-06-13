import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { uploadScreenshot, deleteScreenshot, isScreenshotKey } from "@/lib/s3";

const ALLOWED = new Set(["jpg", "jpeg", "png", "webp"]);

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 4 MB." }, { status: 400 });
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  if (!ALLOWED.has(extension)) {
    return NextResponse.json({ error: "Use JPG, PNG or WebP." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = await uploadScreenshot(
    buffer,
    file.type || "image/jpeg",
    extension === "jpeg" ? "jpg" : extension
  );

  return NextResponse.json({ key });
}

export async function DELETE(request: Request) {
  await requireAdmin();

  const key = new URL(request.url).searchParams.get("key") ?? "";
  if (!isScreenshotKey(key)) {
    return NextResponse.json({ error: "Invalid key." }, { status: 400 });
  }

  await deleteScreenshot(key);
  return NextResponse.json({ ok: true });
}
