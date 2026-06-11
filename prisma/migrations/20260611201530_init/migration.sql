-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'ADMIN');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'HIDDEN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'PAID', 'COMPLETED', 'CANCELLED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('TOPUP', 'ACCOUNT');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('KBZPAY', 'WAVE_MONEY', 'PROMPTPAY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "username" TEXT,
    "telegram" TEXT,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon_url" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topup_products" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MMK',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "topup_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "game_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "rank" TEXT,
    "level" INTEGER,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MMK',
    "status" "ListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "specs" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "account_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MMK',
    "note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "type" "OrderItemType" NOT NULL,
    "topup_product_id" UUID,
    "account_listing_id" UUID,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unit_price" INTEGER NOT NULL,
    "game_player_id" TEXT,
    "game_server_id" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "amount" INTEGER NOT NULL,
    "slip_path" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "reject_reason" TEXT,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_item_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "extra" JSONB,
    "delivered_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "order_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "games_slug_key" ON "games"("slug");

-- CreateIndex
CREATE INDEX "topup_products_game_id_active_idx" ON "topup_products"("game_id", "active");

-- CreateIndex
CREATE INDEX "account_listings_game_id_status_idx" ON "account_listings"("game_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "orders_code_key" ON "orders"("code");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "payments_order_id_idx" ON "payments"("order_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "credentials_order_item_id_key" ON "credentials"("order_item_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_id_key" ON "reviews"("order_id");

-- AddForeignKey
ALTER TABLE "topup_products" ADD CONSTRAINT "topup_products_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account_listings" ADD CONSTRAINT "account_listings_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_topup_product_id_fkey" FOREIGN KEY ("topup_product_id") REFERENCES "topup_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_account_listing_id_fkey" FOREIGN KEY ("account_listing_id") REFERENCES "account_listings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credentials" ADD CONSTRAINT "credentials_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Integrity constraints (run everywhere, including shadow DB)
-- ============================================================

-- An order item must reference exactly one product of its declared type
ALTER TABLE "public"."order_items"
  ADD CONSTRAINT "order_item_exactly_one_product" CHECK (
    ("type" = 'TOPUP' AND "topup_product_id" IS NOT NULL AND "account_listing_id" IS NULL) OR
    ("type" = 'ACCOUNT' AND "account_listing_id" IS NOT NULL AND "topup_product_id" IS NULL)
  );

ALTER TABLE "public"."reviews"
  ADD CONSTRAINT "reviews_rating_range" CHECK ("rating" BETWEEN 1 AND 5);

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."games" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."topup_products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."account_listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."credentials" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."reviews" ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Supabase wiring: auth trigger, RLS policies, storage buckets.
-- Wrapped in a guard so Prisma's shadow database (which has no
-- auth/storage schemas) can replay this migration as a no-op.
-- The app's own queries run through Prisma as the table owner
-- and bypass RLS; these policies govern the publishable-key path
-- (PostgREST, Realtime, Storage from the browser).
-- ============================================================

DO $supabase$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth')
     OR NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
    RAISE NOTICE 'auth/storage schemas missing (shadow database) - skipping Supabase wiring';
    RETURN;
  END IF;

  -- profiles.id mirrors auth.users
  EXECUTE $sql$
    ALTER TABLE "public"."profiles"
      ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE
  $sql$;

  -- Auto-create a profile row on signup
  EXECUTE $sql$
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER SET search_path = ''
    AS $fn$
    BEGIN
      INSERT INTO public.profiles (id, username)
      VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)))
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $fn$
  $sql$;

  EXECUTE $sql$
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user()
  $sql$;

  -- Helper used by RLS policies
  EXECUTE $sql$
    CREATE OR REPLACE FUNCTION public.is_admin()
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER SET search_path = ''
    AS $fn$
      SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = (SELECT auth.uid()) AND role = 'ADMIN'
      );
    $fn$
  $sql$;

  -- Catalog is public
  EXECUTE $sql$ CREATE POLICY "games_public_read" ON "public"."games" FOR SELECT USING (true) $sql$;
  EXECUTE $sql$ CREATE POLICY "topup_products_public_read" ON "public"."topup_products" FOR SELECT USING (true) $sql$;
  EXECUTE $sql$ CREATE POLICY "account_listings_public_read" ON "public"."account_listings" FOR SELECT USING (true) $sql$;

  -- Profiles: own row (admins see all)
  EXECUTE $sql$
    CREATE POLICY "profiles_own_read" ON "public"."profiles"
      FOR SELECT USING (id = (SELECT auth.uid()) OR public.is_admin())
  $sql$;
  EXECUTE $sql$
    CREATE POLICY "profiles_own_update" ON "public"."profiles"
      FOR UPDATE USING (id = (SELECT auth.uid()))
  $sql$;

  -- Orders and children: buyer sees own, admin sees all
  EXECUTE $sql$
    CREATE POLICY "orders_own_read" ON "public"."orders"
      FOR SELECT USING (user_id = (SELECT auth.uid()) OR public.is_admin())
  $sql$;
  EXECUTE $sql$
    CREATE POLICY "order_items_own_read" ON "public"."order_items"
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND (o.user_id = (SELECT auth.uid()) OR public.is_admin())
      ))
  $sql$;
  EXECUTE $sql$
    CREATE POLICY "payments_own_read" ON "public"."payments"
      FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND (o.user_id = (SELECT auth.uid()) OR public.is_admin())
      ))
  $sql$;

  -- Credentials: only the buyer, and only once the order is completed
  EXECUTE $sql$
    CREATE POLICY "credentials_owner_completed_read" ON "public"."credentials"
      FOR SELECT USING (
        public.is_admin() OR EXISTS (
          SELECT 1 FROM public.order_items oi
          JOIN public.orders o ON o.id = oi.order_id
          WHERE oi.id = order_item_id
            AND o.user_id = (SELECT auth.uid())
            AND o.status = 'COMPLETED'
        )
      )
  $sql$;

  -- Reviews: public wall, buyers review their own completed orders
  EXECUTE $sql$ CREATE POLICY "reviews_public_read" ON "public"."reviews" FOR SELECT USING (true) $sql$;
  EXECUTE $sql$
    CREATE POLICY "reviews_own_insert" ON "public"."reviews"
      FOR INSERT WITH CHECK (
        user_id = (SELECT auth.uid()) AND EXISTS (
          SELECT 1 FROM public.orders o
          WHERE o.id = order_id
            AND o.user_id = (SELECT auth.uid())
            AND o.status = 'COMPLETED'
        )
      )
  $sql$;

  -- Storage buckets
  EXECUTE $sql$
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('screenshots', 'screenshots', true), ('payment-slips', 'payment-slips', false)
    ON CONFLICT (id) DO NOTHING
  $sql$;

  -- Listing screenshots: anyone can view, only admins manage
  EXECUTE $sql$ CREATE POLICY "screenshots_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'screenshots') $sql$;
  EXECUTE $sql$ CREATE POLICY "screenshots_admin_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'screenshots' AND public.is_admin()) $sql$;
  EXECUTE $sql$ CREATE POLICY "screenshots_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'screenshots' AND public.is_admin()) $sql$;
  EXECUTE $sql$ CREATE POLICY "screenshots_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'screenshots' AND public.is_admin()) $sql$;

  -- Payment slips: buyers upload into their own folder ({user_id}/...),
  -- read back their own; admins see all for verification
  EXECUTE $sql$
    CREATE POLICY "slips_own_upload" ON storage.objects
      FOR INSERT WITH CHECK (
        bucket_id = 'payment-slips'
        AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
      )
  $sql$;
  EXECUTE $sql$
    CREATE POLICY "slips_own_or_admin_read" ON storage.objects
      FOR SELECT USING (
        bucket_id = 'payment-slips'
        AND ((SELECT auth.uid())::text = (storage.foldername(name))[1] OR public.is_admin())
      )
  $sql$;
END
$supabase$;
