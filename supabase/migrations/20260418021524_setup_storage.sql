-- Migration: Setup Supabase Storage for Vehicle Media
-- This migration creates the vehicle-media bucket and sets up RLS policies

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-media', 'vehicle-media', true);

-- 2. Allow public read access (SELECT)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'vehicle-media' );

-- 3. Allow service role to upload (INSERT)
-- Used by ETL/Scraper for image uploads
CREATE POLICY "Service Role Upload"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK ( bucket_id = 'vehicle-media' );

-- 4. Allow service role to update (UPDATE)
-- Used for updating image metadata
CREATE POLICY "Service Role Update"
ON storage.objects FOR UPDATE
TO service_role
WITH CHECK ( bucket_id = 'vehicle-media' );

-- 5. Allow service role to delete (DELETE)
-- Used for removing old images
CREATE POLICY "Service Role Delete"
ON storage.objects FOR DELETE
TO service_role
USING ( bucket_id = 'vehicle-media' );
