import { config } from "dotenv";
config({ path: ".env.local" });

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // CLI commands (migrate, db pull) need a session-mode connection.
    url: env("DIRECT_URL"),
  },
});
