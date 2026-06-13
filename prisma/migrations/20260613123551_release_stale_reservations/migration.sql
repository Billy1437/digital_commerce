-- Cancel unpaid orders older than p_minutes and release any account listings
-- they were holding RESERVED. Only PENDING_PAYMENT orders expire: orders with
-- a submitted slip (PAYMENT_SUBMITTED) wait for admin review, and REJECTED
-- orders stay reserved so the buyer can re-upload. Returns # listings freed.
CREATE OR REPLACE FUNCTION public.release_stale_reservations(p_minutes integer DEFAULT 30)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  freed_count integer;
BEGIN
  WITH stale AS (
    UPDATE public.orders
    SET status = 'CANCELLED', updated_at = now()
    WHERE status = 'PENDING_PAYMENT'
      AND created_at < now() - make_interval(mins => p_minutes)
    RETURNING id
  ),
  freed AS (
    UPDATE public.account_listings al
    SET status = 'AVAILABLE', updated_at = now()
    FROM public.order_items oi
    WHERE oi.order_id IN (SELECT id FROM stale)
      AND oi.account_listing_id = al.id
      AND al.status = 'RESERVED'
    RETURNING al.id
  )
  SELECT count(*) INTO freed_count FROM freed;
  RETURN freed_count;
END;
$fn$;

-- Schedule it with pg_cron (every 5 minutes). Guarded so Prisma's shadow
-- database, which has no pg_cron, replays this as a no-op; best-effort so a
-- missing extension never fails the migration (the app self-heals on buy).
DO $cron$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_available_extensions WHERE name = 'pg_cron') THEN
    CREATE EXTENSION IF NOT EXISTS pg_cron;
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'release-stale-reservations') THEN
      PERFORM cron.unschedule('release-stale-reservations');
    END IF;
    PERFORM cron.schedule(
      'release-stale-reservations',
      '*/5 * * * *',
      $job$ SELECT public.release_stale_reservations(30); $job$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron scheduling skipped: %', SQLERRM;
END
$cron$;
