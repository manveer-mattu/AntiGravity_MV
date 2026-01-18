-- Add settings columns to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS auto_reply_threshold integer DEFAULT 4,
ADD COLUMN IF NOT EXISTS ai_tone text DEFAULT 'professional';

-- Comment: This allows storing the user's preference for when to auto-reply and what tone to use.
