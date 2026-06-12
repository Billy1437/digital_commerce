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

await prisma.profile.update({
  where: { id: users[0].id },
  data: { role: "ADMIN" },
});
console.log(`${email} is now an admin.`);
await prisma.$disconnect();
