
-- Create blogs table with correct schema
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  tag TEXT,
  image_url TEXT,
  price TEXT, -- Kept as text per your request
  rating TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);


