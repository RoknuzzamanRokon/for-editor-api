-- ============================================
-- PDF Converter API - Rollback Initial Schema
-- Migration Rollback: 001_initial_schema
-- Created: 2026-02-23
-- ============================================

-- Drop tables in reverse order (respecting foreign key constraints)
DROP TABLE IF EXISTS conversion_history;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;

-- Drop enum type (PostgreSQL only)
DROP TYPE IF EXISTS user_role;
