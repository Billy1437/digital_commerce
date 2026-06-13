import { NextResponse } from "next/server";
import { getScreenshot, isScreenshotKey } from "@/lib/s3";

// Streams a listing screenshot from the private S3 bucket. Keys are
// uuid-based and immutable, so cache aggressively.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const fullKey = key.map(decodeURIComponent).join("/");

  if (!isScreenshotKey(fullKey)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const { bytes, contentType } = await getScreenshot(fullKey);
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
