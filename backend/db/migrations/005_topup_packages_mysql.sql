-- ============================================
-- PDF Converter API - Top-up package terms (MySQL)
-- Migration: 005_topup_packages_mysql
-- ============================================
--
-- Backs core/billing_packages.py. Records the commercial terms of each top-up
-- request alongside the points, so editing the package catalogue later never
-- rewrites what was already agreed:
--
--   package_key         custom | small | medium | large
--   price_cents         integer cents (no floats on the money path)
--   grants_admin_access medium/large promote the buyer to admin_user on approval
--
-- Existing rows predate packages, so they backfill as 'custom' with no price
-- recorded and no admin grant.
-- ============================================

ALTER TABLE points_topup_requests
    ADD COLUMN package_key VARCHAR(32) NOT NULL DEFAULT 'custom',
    ADD COLUMN price_cents INT NOT NULL DEFAULT 0,
    ADD COLUMN grants_admin_access BOOLEAN NOT NULL DEFAULT FALSE;
