-- Enable Row Level Security on public.categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Optional: Create a default policy that allows no access
CREATE POLICY "No access by default" ON public.categories
FOR ALL USING (false);