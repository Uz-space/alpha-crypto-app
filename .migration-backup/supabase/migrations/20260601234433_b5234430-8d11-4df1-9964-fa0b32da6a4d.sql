
-- Exchange requests table
CREATE TABLE public.exchange_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  from_amount numeric NOT NULL,
  to_amount numeric NOT NULL,
  rate numeric,
  sent_to_address text NOT NULL,
  receive_to_address text NOT NULL,
  screenshot_url text,
  status text NOT NULL DEFAULT 'pending',
  admin_note text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exchange_requests_pair_chk CHECK (
    (from_currency = 'UZS' AND to_currency <> 'UZS')
    OR (to_currency = 'UZS' AND from_currency <> 'UZS')
  ),
  CONSTRAINT exchange_requests_status_chk CHECK (status IN ('pending','approved','rejected'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.exchange_requests TO authenticated;
GRANT ALL ON public.exchange_requests TO service_role;

ALTER TABLE public.exchange_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own exchange request"
  ON public.exchange_requests FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own exchange requests"
  ON public.exchange_requests FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update exchange requests"
  ON public.exchange_requests FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete exchange requests"
  ON public.exchange_requests FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER exchange_requests_updated_at
  BEFORE UPDATE ON public.exchange_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('exchange-screenshots', 'exchange-screenshots', true);

CREATE POLICY "Anyone authenticated can upload exchange screenshots"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'exchange-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can read exchange screenshots"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'exchange-screenshots');

CREATE POLICY "Users can delete own exchange screenshots"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'exchange-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);
