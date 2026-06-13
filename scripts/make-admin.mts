// Promote a user to admin: npm run make-admin -- you@example.com
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run make-admin -- <email>");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL! }),
});

const users = await prisma.$queryRaw<{ id: string }[]>`
  select id from auth.users where email = ${email}`;
if (users.length === 0) {
  console.error(`No user with email ${email} — sign up on the site first.`);
  process.exit(1);
}

const userId = users[0].id;

// profiles.role stays canonical (used by RLS is_admin()); also mirror it into
// auth app_metadata so it rides in the JWT and the app authorizes from the
// token, not a DB lookup. Takes effect on the user's next token refresh.
await prisma.profile.update({
  where: { id: userId },
  data: { role: "ADMIN" },
});
await prisma.$executeRaw`
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'ADMIN')
  WHERE id = ${userId}::uuid`;

console.log(`${email} is now an admin (sign out/in to refresh the token).`);
await prisma.$disconnect();
