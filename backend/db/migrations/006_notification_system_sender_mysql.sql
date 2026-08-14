-- ============================================
-- PDF Converter API - System-generated notifications (MySQL)
-- Migration: 006_notification_system_sender_mysql
-- ============================================
--
-- Point credits and declined top-up requests raise notifications on their own,
-- with no human author. Those rows carry sender_user_id = NULL, which also keeps
-- them out of every admin's "Sent" list (that view filters on sender_user_id).
-- ============================================

ALTER TABLE notifications
    MODIFY COLUMN sender_user_id INT NULL;
