-- ============================================
-- PDF Converter API - In-app notifications
-- Migration: 004_notifications
-- ============================================
--
-- Backs services/notifications.py. Two tables: `notifications` holds the message
-- once, `notification_recipients` holds one row per targeted user so read state
-- is per-user and the unread badge is a single indexed COUNT.
--
-- Recipients are resolved and frozen at send time (super_user -> every user,
-- admin_user -> only users they created), so later changes to a user's
-- created_by_user_id never retroactively expose an older message.
--
-- PostgreSQL / SQLite variant. MySQL: see 004_notifications_mysql.sql
-- ============================================

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    sender_user_id INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(2000) NOT NULL,
    category VARCHAR(32) NOT NULL DEFAULT 'info',
    audience VARCHAR(32) NOT NULL DEFAULT 'selected',
    recipient_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_sender_user_id
        FOREIGN KEY (sender_user_id) REFERENCES users (id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_sender_user_id
    ON notifications (sender_user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_category
    ON notifications (category);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at
    ON notifications (created_at);

CREATE TABLE IF NOT EXISTS notification_recipients (
    id SERIAL PRIMARY KEY,
    notification_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uq_notification_recipients UNIQUE (notification_id, user_id),
    CONSTRAINT fk_notification_recipients_notification_id
        FOREIGN KEY (notification_id) REFERENCES notifications (id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_recipients_user_id
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_recipients_notification_id
    ON notification_recipients (notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_recipients_user_id
    ON notification_recipients (user_id);
-- Serves the two hot reads: unread badge count, and the paginated inbox.
CREATE INDEX IF NOT EXISTS ix_notification_recipients_inbox
    ON notification_recipients (user_id, is_read);
