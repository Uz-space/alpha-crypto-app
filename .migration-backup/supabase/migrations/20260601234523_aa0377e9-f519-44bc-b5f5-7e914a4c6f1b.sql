
ALTER TABLE public.exchange_requests ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.exchange_requests ADD COLUMN contact text;
ALTER TABLE public.exchange_requests ADD COLUMN full_name text;

GRANT INSERT ON public.exchange_requests TO anon;

DROP POLICY IF EXISTS "Users insert own exchange request" ON public.exchange_requests;
CREATE POLICY "Anyone can submit exchange request"
  ON public.exchange_requests FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Storage: allow anon uploads too
DROP POLICY IF EXISTS "Anyone authenticated can upload exchange screenshots" ON storage.objects;
CREATE POLICY "Anyone can upload exchange screenshots"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'exchange-screenshots');
