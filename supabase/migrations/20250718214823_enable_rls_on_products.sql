-- Enable Row Level Security on the products table
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create a default policy that initially denies all access
CREATE POLICY "Deny all access by default" ON public.products
FOR ALL USING (false);