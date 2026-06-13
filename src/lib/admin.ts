import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Gate for every admin page and action. Authorization comes from the JWT, not
 * the database: the user's role is mirrored into auth app_metadata (see
 * scripts/make-admin.mts) and rides in the signed token, so getClaims() reads
 * it locally — no auth-server round trip, no profiles query per render.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/login?next=/admin");

  const role = (claims.app_metadata as { role?: string } | undefined)?.role;
  if (role !== "ADMIN") redirect("/");

  return { userId: claims.sub as string };
}
