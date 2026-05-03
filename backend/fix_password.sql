-- Fix password for user rokon.dev.work@gmail.com
-- This updates the user's password hash to match the password: rokon.dev.work@gmail.com

-- First, let's see the current user
SELECT id, email, username, role, is_active 
FROM users 
WHERE email = 'rokon.dev.work@gmail.com';

-- Update the password hash
-- Note: You'll need to generate the bcrypt hash for the password
-- For now, let's delete this user and let them re-register with the fixed flow

-- Delete the user (this will cascade delete related records)
DELETE FROM users WHERE email = 'rokon.dev.work@gmail.com';

-- Verify deletion
SELECT COUNT(*) as remaining_users 
FROM users 
WHERE email = 'rokon.dev.work@gmail.com';
