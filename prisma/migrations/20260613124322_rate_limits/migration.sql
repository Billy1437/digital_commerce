-- Fixed-window rate limiting, centralized in Postgres so it works across
-- serverless instances. One row per key, reused via upsert.
CREATE TABLE "public"."rate_limits" (
  "bucket" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("bucket")
);

-- App-only table (accessed by the postgres role via check_rate_limit). Deny
-- the publishable-key path entirely; RLS on with no policies = no access.
ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;

-- Atomically count a hit against a key. Returns true if still within p_max
-- for the current window, false if the limit is exceeded.
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_max integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
  cur integer;
BEGIN
  INSERT INTO public.rate_limits (bucket, count, expires_at)
  VALUES (p_key, 1, now() + make_interval(secs => p_window_seconds))
  ON CONFLICT (bucket) DO UPDATE
    SET count = CASE WHEN public.rate_limits.expires_at < now() THEN 1
                     ELSE public.rate_limits.count + 1 END,
        expires_at = CASE WHEN public.rate_limits.expires_at < now()
                          THEN now() + make_interval(secs => p_window_seconds)
                          ELSE public.rate_limits.expires_at END
  RETURNING count INTO cur;
  RETURN cur <= p_max;
END;
$fn$;
