ALTER TABLE public.exchange_rates
  ADD COLUMN IF NOT EXISTS buy_uzs numeric,
  ADD COLUMN IF NOT EXISTS sell_uzs numeric;

UPDATE public.exchange_rates SET buy_uzs = COALESCE(buy_uzs, price_uzs) WHERE buy_uzs IS NULL;
UPDATE public.exchange_rates SET sell_uzs = COALESCE(sell_uzs, price_uzs) WHERE sell_uzs IS NULL;

ALTER TABLE public.exchange_rates ALTER COLUMN buy_uzs SET NOT NULL;
ALTER TABLE public.exchange_rates ALTER COLUMN sell_uzs SET NOT NULL;
ALTER TABLE public.exchange_rates ALTER COLUMN buy_uzs SET DEFAULT 0;
ALTER TABLE public.exchange_rates ALTER COLUMN sell_uzs SET DEFAULT 0;

ALTER TABLE public.exchange_rates ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE public.exchange_rates SET sort_order = CASE symbol
  WHEN 'UZS' THEN 0
  WHEN 'BTC' THEN 1 WHEN 'ETH' THEN 2 WHEN 'BNB' THEN 3 WHEN 'SOL' THEN 4
  WHEN 'LTC' THEN 5 WHEN 'TON' THEN 6 WHEN 'TRX' THEN 7 WHEN 'DOGE' THEN 8
  ELSE 99 END;