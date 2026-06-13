import "server-only";
import { prisma } from "@/lib/prisma";

/** Counts a hit against `key`. Returns true if allowed, false if over `max`
 *  within the window. Fails open: a limiter glitch never blocks a real buyer. */
export async function checkRateLimit(
  key: string,
  max: number,
  windowSeconds: number
) {
  try {
    const rows = await prisma.$queryRaw<{ allowed: boolean }[]>`
      SELECT public.check_rate_limit(${key}::text, ${max}::int, ${windowSeconds}::int) AS allowed`;
    return rows[0]?.allowed ?? true;
  } catch {
    return true;
  }
}

export async function enforceRateLimit(
  key: string,
  max: number,
  windowSeconds: number,
  message = "You're doing that too quickly. Wait a moment and try again."
) {
  if (!(await checkRateLimit(key, max, windowSeconds))) {
    throw new Error(message);
  }
}
