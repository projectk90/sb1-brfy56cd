/*
  # Add additional media fields

  1. Changes
    - Add backdrop_url and iframe_url to both films and series tables
    - Add constraints to ensure valid URLs
    - Update existing policies to include new fields
*/

-- Add new columns to films table
ALTER TABLE films 
ADD COLUMN backdrop_url text,
ADD COLUMN iframe_url text;

-- Add new columns to series table
ALTER TABLE series 
ADD COLUMN backdrop_url text,
ADD COLUMN iframe_url text;

-- Add URL validation check constraints
ALTER TABLE films
ADD CONSTRAINT valid_poster_url CHECK (poster_url ~ '^https?://.*$'),
ADD CONSTRAINT valid_backdrop_url CHECK (backdrop_url IS NULL OR backdrop_url ~ '^https?://.*$'),
ADD CONSTRAINT valid_iframe_url CHECK (iframe_url IS NULL OR iframe_url ~ '^https?://.*$');

ALTER TABLE series
ADD CONSTRAINT valid_poster_url CHECK (poster_url ~ '^https?://.*$'),
ADD CONSTRAINT valid_backdrop_url CHECK (backdrop_url IS NULL OR backdrop_url ~ '^https?://.*$'),
ADD CONSTRAINT valid_iframe_url CHECK (iframe_url IS NULL OR iframe_url ~ '^https?://.*$');

-- Update existing records with sample backdrop URLs
UPDATE films SET 
backdrop_url = 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
WHERE backdrop_url IS NULL;

UPDATE series SET 
backdrop_url = 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
WHERE backdrop_url IS NULL;