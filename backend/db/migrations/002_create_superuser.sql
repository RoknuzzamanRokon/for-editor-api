-- ============================================
-- PDF Converter API - Create Super User
-- Migration: 002_create_superuser
-- Created: 2026-02-23
-- ============================================

-- Insert super user
-- Username: rokon123rokon
-- Email: rokon123rokon@example.com
-- Password: rokon123rokon
-- Note: Run the Python script create_superuser.py instead for automatic password hashing

-- To use this SQL directly, first generate the bcrypt hash:
-- python -c "from backend.core.security import get_password_hash; print(get_password_hash('rokon123rokon'))"

-- Example insert (replace HASHED_PASSWORD with actual bcrypt hash):
-- INSERT INTO users (email, username, hashed_password, role, is_active)
-- VALUES (
--     'rokon123rokon@example.com',
--     'rokon123rokon',
--     'HASHED_PASSWORD',
--     'super_user',
--     TRUE
-- )
-- ON CONFLICT (email) DO NOTHING;

-- RECOMMENDED: Use the Python script instead:
-- python backend/create_superuser.py
