-- ============================================
-- PDF Converter API - In-app notifications (MySQL)
-- Migration: 004_notifications_mysql
-- ============================================
--
-- Backs services/notifications.py. Two tables: `notifications` holds the message
-- once, `notification_recipients` holds one row per targeted user so read state
-- is per-user and the unread badge is a single indexed COUNT.
--
-- Recipients are resolved and frozen at send time (super_user -> every user,
-- admin_user -> only users they created), so later changes to a user's
-- created_by_user_id never retroactively expose an older message.
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_user_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'info',
    audience VARCHAR(32) NOT NULL DEFAULT 'selected',
    recipient_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notifications_sender_user_id (sender_user_id),
    INDEX idx_notifications_category (category),
    INDEX idx_notifications_created_at (created_at),

    CONSTRAINT fk_notifications_sender_user_id
        FOREIGN KEY (sender_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_recipients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    notification_id INT NOT NULL,
    user_id INT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_notification_recipients (notification_id, user_id),
    INDEX idx_notification_recipients_notification_id (notification_id),
    INDEX idx_notification_recipients_user_id (user_id),
    -- Serves the two hot reads: unread badge count, and the paginated inbox.
    INDEX ix_notification_recipients_inbox (user_id, is_read),

    CONSTRAINT fk_notification_recipients_notification_id
        FOREIGN KEY (notification_id) REFERENCES notifications (id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_recipients_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
