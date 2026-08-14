-- ============================================
-- PDF Converter API - System-generated notifications
-- Migration: 006_notification_system_sender
-- ============================================
--
-- Point credits and declined top-up requests raise notifications on their own,
-- with no human author. Those rows carry sender_user_id = NULL, which also keeps
-- them out of every admin's "Sent" list (that view filters on sender_user_id).
--
-- PostgreSQL / SQLite variant. MySQL: see 006_notification_system_sender_mysql.sql
-- ============================================

ALTER TABLE notifications
    ALTER COLUMN sender_user_id DROP NOT NULL;
