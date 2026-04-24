import { supabase } from "../src/integrations/supabase/client";

const migrationSQL = `
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

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own blogs" ON public.blogs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own blogs" ON public.blogs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own blogs" ON public.blogs FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own blogs" ON public.blogs FOR DELETE TO authenticated USING (auth.uid() = user_id);
`;

async function applyMigration() {
  try {
    const { data, error } = await supabase.from('public').rpc('execute_sql', { sql: migrationSQL });
    if (error) {
      console.error('Error applying migration:', error);
      return;
    }
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  }
}

applyMigration();