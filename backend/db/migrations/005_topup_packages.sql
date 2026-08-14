-- ============================================
-- PDF Converter API - Top-up package terms
-- Migration: 005_topup_packages
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
--
-- PostgreSQL / SQLite variant. MySQL: see 005_topup_packages_mysql.sql
-- ============================================

ALTER TABLE points_topup_requests
    ADD COLUMN package_key VARCHAR(32) NOT NULL DEFAULT 'custom';

ALTER TABLE points_topup_requests
    ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 0;

ALTER TABLE points_topup_requests
    ADD COLUMN grants_admin_access BOOLEAN NOT NULL DEFAULT FALSE;
