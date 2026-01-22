-- Add knowledge_base column to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS knowledge_base JSONB DEFAULT '{}'::jsonb;
