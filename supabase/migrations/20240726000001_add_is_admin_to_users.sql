-- Add is_admin column to users table
ALTER TABLE public.users
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create a policy to allow admins to update any sitter's certification
-- This policy will be checked within the Edge Function
-- Note: We are not creating a specific RLS policy for the function here,
-- as the check will be performed in the function's code.
-- However, we need a way to identify admins.

-- Optional: Create a policy to allow only admins to see the is_admin flag
-- For now, we will assume the function handles this logic.