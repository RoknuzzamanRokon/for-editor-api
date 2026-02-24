-- ============================================
-- PDF Converter API - Initial Database Schema (MySQL)
-- Migration: 001_initial_schema_mysql
-- Created: 2026-02-23
-- ============================================

-- ============================================
-- Table: users
-- Description: Stores user account information
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role ENUM('super_user', 'admin_user', 'general_user', 'demo_user') NOT NULL DEFAULT 'general_user',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_users_email (email),
    INDEX idx_users_id (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: refresh_tokens
-- Description: Stores JWT refresh tokens for authentication
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_jti VARCHAR(36) NOT NULL UNIQUE,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_refresh_tokens_token_jti (token_jti),
    INDEX idx_refresh_tokens_user_id (user_id),
    INDEX idx_refresh_tokens_id (id),
    
    CONSTRAINT fk_refresh_tokens_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: conversion_history (Optional - for tracking conversions)
-- Description: Tracks file conversion operations
-- ============================================
CREATE TABLE IF NOT EXISTS conversion_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    conversion_type VARCHAR(50) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    converted_filename VARCHAR(255) NOT NULL,
    file_size_bytes INT,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_conversion_history_user_id (user_id),
    INDEX idx_conversion_history_created_at (created_at),
    INDEX idx_conversion_history_conversion_type (conversion_type),
    
    CONSTRAINT fk_conversion_history_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
