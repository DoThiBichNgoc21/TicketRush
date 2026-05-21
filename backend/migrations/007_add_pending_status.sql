-- Add 'pending' status to allow email verification workflow
-- Drop the old constraint and create new one with 'pending' status

ALTER TABLE users 
DROP CONSTRAINT IF EXISTS users_status_check;

ALTER TABLE users 
ADD CONSTRAINT users_status_check 
CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));
