ALTER TABLE public.exchange_rates 
  ADD COLUMN IF NOT EXISTS min_buy numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_sell numeric NOT NULL DEFAULT 0;