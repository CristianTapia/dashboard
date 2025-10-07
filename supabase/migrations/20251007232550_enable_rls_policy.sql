-- Enable Row Level Security on the products table
ALTER TABLE public.highlights ENABLE ROW LEVEL SECURITY;

-- Create a default policy that initially denies all access
CREATE POLICY "Deny all access by default" ON public.highlights
FOR ALL USING (false);