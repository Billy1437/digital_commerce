-- Drop the cross-schema FK to auth.users: Prisma migrate dev cannot
-- introspect databases with cross-schema references (P4002), and pulling
-- the whole auth schema under Prisma management is not an option.
-- Profile rows are still created/synced by the on_auth_user_created
-- trigger; orphaned profiles on user deletion are acceptable.
ALTER TABLE "public"."profiles" DROP CONSTRAINT IF EXISTS "profiles_id_fkey";

-- Realtime: let the order page subscribe to status changes.
-- Guarded so Prisma's shadow database (no supabase_realtime publication)
-- replays this as a no-op.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.orders';
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.payments';
  END IF;
END
$$;
