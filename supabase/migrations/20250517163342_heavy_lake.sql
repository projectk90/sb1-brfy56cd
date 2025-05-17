/*
  # Initial schema for CineFam content management

  1. New Tables
    - `films`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `release_year` (integer)
      - `poster_url` (text)
      - `genre` (text[])
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)
    
    - `series`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `seasons` (integer)
      - `poster_url` (text)
      - `genre` (text[])
      - `created_at` (timestamp with time zone)
      - `updated_at` (timestamp with time zone)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read/write data
*/

-- Create films table
CREATE TABLE films (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  release_year integer,
  poster_url text,
  genre text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create series table
CREATE TABLE series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  seasons integer,
  poster_url text,
  genre text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Create policies for films
CREATE POLICY "Allow read access to authenticated users for films"
  ON films FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow write access to authenticated users for films"
  ON films FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policies for series
CREATE POLICY "Allow read access to authenticated users for series"
  ON series FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow write access to authenticated users for series"
  ON series FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Insert initial data for films
INSERT INTO films (title, description, release_year, poster_url, genre)
VALUES 
  ('The Last Journey', 'An epic adventure across unknown lands.', 2023, 'https://images.pexels.com/photos/1117132/pexels-photo-1117132.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', ARRAY['Adventure', 'Drama']),
  ('Midnight Shadows', 'A thriller that keeps you on the edge of your seat.', 2022, 'https://images.pexels.com/photos/2873486/pexels-photo-2873486.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', ARRAY['Thriller', 'Mystery']);

-- Insert initial data for series
INSERT INTO series (title, description, seasons, poster_url, genre)
VALUES 
  ('Dark Waters', 'A coastal town harbors dark secrets beneath the surface.', 3, 'https://images.pexels.com/photos/1770809/pexels-photo-1770809.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', ARRAY['Drama', 'Mystery']),
  ('Future Frontiers', 'Exploring the boundaries of human potential in a sci-fi universe.', 2, 'https://images.pexels.com/photos/3052361/pexels-photo-3052361.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', ARRAY['Sci-Fi', 'Adventure']);