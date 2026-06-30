-- Exchange-only wallets (separate from donate wallets)
CREATE TABLE public.exchange_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  network TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.exchange_wallets TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exchange_wallets TO authenticated;
GRANT ALL ON public.exchange_wallets TO service_role;

ALTER TABLE public.exchange_wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exchange wallets are public" ON public.exchange_wallets FOR SELECT USING (true);
CREATE POLICY "Admins manage exchange wallets" ON public.exchange_wallets FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_exchange_wallets_updated_at BEFORE UPDATE ON public.exchange_wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Exchange rates (UZS per 1 unit of symbol)
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  price_uzs NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.exchange_rates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exchange_rates TO authenticated;
GRANT ALL ON public.exchange_rates TO service_role;

ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Exchange rates are public" ON public.exchange_rates FOR SELECT USING (true);
CREATE POLICY "Admins manage exchange rates" ON public.exchange_rates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_exchange_rates_updated_at BEFORE UPDATE ON public.exchange_rates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed default rates (admin can edit)
INSERT INTO public.exchange_rates (symbol, price_uzs) VALUES
  ('UZS', 1),
  ('BTC', 850000000),
  ('ETH', 45000000),
  ('BNB', 8000000),
  ('SOL', 2000000),
  ('LTC', 1300000),
  ('TON', 65000),
  ('TRX', 3500),
  ('DOGE', 5000);
