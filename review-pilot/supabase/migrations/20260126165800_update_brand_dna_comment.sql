-- Update comments to reflect new Brand DNA structure
COMMENT ON COLUMN public.businesses.brand_voice IS 'Brand DNA settings. Schema: { pillars: { personality, formality, enthusiasm, authority }, voiceSettings: { emojiPolicy, perspective, geoIntensity, signOffStyle }, bannedVocabulary: string[] }';
