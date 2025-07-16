-- 1. Create pets table
CREATE TABLE public.pets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT,
  breed TEXT,
  birth_date DATE,
  gender TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ
);

-- 2. Add comments to the columns
COMMENT ON COLUMN public.pets.name IS 'The name of the pet.';
COMMENT ON COLUMN public.pets.species IS 'The species of the pet (e.g., Dog, Cat).';
COMMENT ON COLUMN public.pets.breed IS 'The breed of the pet.';
COMMENT ON COLUMN public.pets.birth_date IS 'The birth date of the pet.';
COMMENT ON COLUMN public.pets.gender IS 'The gender of the pet.';
COMMENT ON COLUMN public.pets.avatar_url IS 'URL for the pet''s avatar image.';

-- 3. Set up RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pets." 
ON public.pets FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own pets." 
ON public.pets FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets." 
ON public.pets FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pets." 
ON public.pets FOR DELETE
USING (auth.uid() = owner_id);

-- 4. Set up Storage for pet avatars
INSERT INTO storage.buckets (id, name, public)
  VALUES ('pet-avatars', 'pet-avatars', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Pet avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'pet-avatars');

CREATE POLICY "Users can upload an avatar for their pets." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'pet-avatars' AND auth.uid() IN (SELECT owner_id FROM public.pets WHERE id = (storage.foldername(name))[1]::uuid));

CREATE POLICY "Users can update the avatar for their pets." ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'pet-avatars' AND auth.uid() IN (SELECT owner_id FROM public.pets WHERE id = (storage.foldername(name))[1]::uuid));