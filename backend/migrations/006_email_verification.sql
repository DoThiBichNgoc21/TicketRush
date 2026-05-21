-- Add email verification columns to users table
ALTER TABLE users
ADD COLUMN email_verified boolean NOT NULL DEFAULT false,
ADD COLUMN verification_token_hash text,
ADD COLUMN verification_token_expires timestamp;

-- Create index for faster token lookup
CREATE INDEX idx_users_verification_token_hash ON users(verification_token_hash) WHERE verification_token_hash IS NOT NULL;

-- Add index for email_verified to help with login queries
CREATE INDEX idx_users_email_verified ON users(email_verified);

-- Add index for status + email_verified (common query pattern)
CREATE INDEX idx_users_status_verified ON users(status, email_verified);

-- Update existing users to verified (assume they are already verified if they exist)
UPDATE users SET email_verified = true WHERE email_verified IS NULL;
