-- ============================================
-- PDF Converter API - Initial Database Schema
-- Migration: 001_initial_schema
-- Created: 2026-02-23
-- ============================================

-- Create user role enum type (PostgreSQL)
-- For MySQL, this will be handled as VARCHAR with CHECK constraint
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_user', 'admin_user', 'general_user', 'demo_user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- Table: users
-- Description: Stores user account information
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'general_user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);

-- ============================================
-- Table: refresh_tokens
-- Description: Stores JWT refresh tokens for authentication
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token_jti VARCHAR(36) NOT NULL UNIQUE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_refresh_tokens_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    -- Unique constraint
    CONSTRAINT refresh_tokens_token_jti_key UNIQUE (token_jti)
);

-- Create indexes for refresh_tokens table
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_jti ON refresh_tokens(token_jti);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_id ON refresh_tokens(id);

-- ============================================
-- Table: conversion_history (Optional - for tracking conversions)
-- Description: Tracks file conversion operations
-- ============================================
CREATE TABLE IF NOT EXISTS conversion_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    conversion_type VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    converted_filename VARCHAR(255) NOT NULL,
    file_size_bytes INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_conversion_history_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);

-- Create indexes for conversion_history table
CREATE INDEX IF NOT EXISTS idx_conversion_history_user_id ON conversion_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_history_created_at ON conversion_history(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_history_conversion_type ON conversion_history(conversion_type);

-- ============================================
-- Insert default admin user (optional)
-- Password: admin123 (hashed with bcrypt)
-- ============================================
-- Note: Update the hashed_password with actual bcrypt hash
-- INSERT INTO users (email, username, hashed_password, role, is_active)
-- VALUES (
--     'admin@example.com',
--     'admin',
--     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqVr/1jrPK',
--     'super_user',
--     TRUE
-- )
-- ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE users IS 'Stores user account information for authentication and authorization';
COMMENT ON TABLE refresh_tokens IS 'Stores JWT refresh tokens with expiration and revocation status';
COMMENT ON TABLE conversion_history IS 'Tracks file conversion operations for analytics and history';

COMMENT ON COLUMN users.role IS 'User role: super_user, admin_user, general_user, or demo_user';
COMMENT ON COLUMN users.is_active IS 'Flag to enable/disable user account';
COMMENT ON COLUMN refresh_tokens.token_jti IS 'JWT ID (jti) claim for token identification';
COMMENT ON COLUMN refresh_tokens.revoked IS 'Flag to mark token as revoked/invalid';
