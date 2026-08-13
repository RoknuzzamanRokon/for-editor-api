-- ============================================
-- PDF Converter API - Per-user page access control
-- Migration: 003_user_page_permissions
-- ============================================
--
-- Backs core/pages.py. Absence of a row means "allowed" — see the module
-- docstring — so this migration deliberately backfills nothing. Existing
-- users keep full page access until an admin explicitly revokes a page.
--
-- PostgreSQL / SQLite variant. MySQL: see 003_user_page_permissions_mysql.sql
-- ============================================

CREATE TABLE IF NOT EXISTS user_page_permissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    page_key VARCHAR(64) NOT NULL,
    is_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INTEGER,
    updated_by INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_user_page_permissions UNIQUE (user_id, page_key),
    CONSTRAINT fk_user_page_permissions_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_page_permissions_created_by
        FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_user_page_permissions_updated_by
        FOREIGN KEY (updated_by) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_user_page_permissions_user_id
    ON user_page_permissions (user_id);
CREATE INDEX IF NOT EXISTS idx_user_page_permissions_page_key
    ON user_page_permissions (page_key);
