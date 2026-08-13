-- ============================================
-- PDF Converter API - Per-user page access control (MySQL)
-- Migration: 003_user_page_permissions_mysql
-- ============================================
--
-- Backs core/pages.py. Absence of a row means "allowed" — see the module
-- docstring — so this migration deliberately backfills nothing. Existing
-- users keep full page access until an admin explicitly revokes a page.
-- ============================================

CREATE TABLE IF NOT EXISTS user_page_permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    page_key VARCHAR(64) NOT NULL,
    is_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT,
    updated_by INT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE KEY uq_user_page_permissions (user_id, page_key),
    INDEX idx_user_page_permissions_user_id (user_id),
    INDEX idx_user_page_permissions_page_key (page_key),

    CONSTRAINT fk_user_page_permissions_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_user_page_permissions_created_by
        FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_user_page_permissions_updated_by
        FOREIGN KEY (updated_by) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
