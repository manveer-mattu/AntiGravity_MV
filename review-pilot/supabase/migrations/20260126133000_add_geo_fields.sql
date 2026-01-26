-- Add GEO platform fields to businesses table
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS brand_voice JSONB DEFAULT '{"tone_score": 5}'::jsonb;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS safety_settings JSONB DEFAULT '{"crisis_keywords": []}'::jsonb;

-- Add comment to document knowledge_base geo_targets structure
COMMENT ON COLUMN public.businesses.knowledge_base IS 'Structured knowledge base. Schema: { general: { about?, alwaysMention?, geo_targets?: string[], hours?, services?, policies?, legacy? }, playbook?: [{ trigger, response }] }';
COMMENT ON COLUMN public.businesses.brand_voice IS 'Brand voice settings. Schema: { tone_score: 1-10, description?: string }';
COMMENT ON COLUMN public.businesses.safety_settings IS 'Safety settings. Schema: { crisis_keywords: string[] }';
