import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { DonateDialog } from "@/components/DonateDialog";


import btcLogo from "@/assets/coins/btc.png";
import ethLogo from "@/assets/coins/eth.png";
import bnbLogo from "@/assets/coins/bnb.png";
import solLogo from "@/assets/coins/sol.jpeg";
import ltcLogo from "@/assets/coins/ltc.png";
import tonLogo from "@/assets/coins/ton.png";
import trxLogo from "@/assets/coins/trx.png";
import dogeLogo from "@/assets/coins/doge.jpeg";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  logo: string;
  binanceSymbol: string;
}

type CoinData = Record<string, { price: number; change24h: number }>;

const COINS: Coin[] = [
  { id: "bitcoin",          symbol: "BTC",  name: "Bitcoin",   logo: btcLogo,  binanceSymbol: "BTCUSDT" },
  { id: "ethereum",         symbol: "ETH",  name: "Ethereum",  logo: ethLogo,  binanceSymbol: "ETHUSDT" },
  { id: "binancecoin",      symbol: "BNB",  name: "BNB",       logo: bnbLogo,  binanceSymbol: "BNBUSDT" },
  { id: "solana",           symbol: "SOL",  name: "Solana",    logo: solLogo,  binanceSymbol: "SOLUSDT" },
  { id: "litecoin",         symbol: "LTC",  name: "Litecoin",  logo: ltcLogo,  binanceSymbol: "LTCUSDT" },
  { id: "the-open-network", symbol: "TON",  name: "Toncoin",   logo: tonLogo,  binanceSymbol: "TONUSDT" },
  { id: "tron",             symbol: "TRX",  name: "TRON",      logo: trxLogo,  binanceSymbol: "TRXUSDT" },
  { id: "dogecoin",         symbol: "DOGE", name: "Dogecoin",  logo: dogeLogo, binanceSymbol: "DOGEUSDT" },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fetchBinancePrices = async (signal: AbortSignal): Promise<CoinData> => {
  const symbols = encodeURIComponent(JSON.stringify(COINS.map((c) => c.binanceSymbol)));
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`, {
    cache: "no-store",
    signal,
  });
  if (!res.ok) throw new Error("Binance price request failed");

  const json: Array<{ symbol: string; lastPrice: string; priceChangePercent: string }> = await res.json();
  const bySymbol = new Map(json.map((item) => [item.symbol, item]));

  return COINS.reduce<CoinData>((acc, coin) => {
    const item = bySymbol.get(coin.binanceSymbol);
    const price = Number(item?.lastPrice);
    const change24h = Number(item?.priceChangePercent);
    if (Number.isFinite(price)) {
      acc[coin.id] = { price, change24h: Number.isFinite(change24h) ? change24h : 0 };
    }
    return acc;
  }, {});
};

const fetchCoinGeckoPrices = async (signal: AbortSignal): Promise<CoinData> => {
  const ids = COINS.map((c) => c.id).join(",");
  const base = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&precision=full`;
  const res = await fetch(`${base}&_=${Date.now()}`, { cache: "no-store", signal });
  if (!res.ok) throw new Error("CoinGecko price request failed");

  const json = await res.json();
  return COINS.reduce<CoinData>((acc, coin) => {
    const item = json[coin.id];
    const price = Number(item?.usd);
    const change24h = Number(item?.usd_24h_change);
    if (Number.isFinite(price)) {
      acc[coin.id] = { price, change24h: Number.isFinite(change24h) ? change24h : 0 };
    }
    return acc;
  }, {});
};

const Index = () => {
  const [data, setData] = useState<CoinData>({});
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let alive = true;
    let controller: AbortController | null = null;

    const run = async () => {
      controller?.abort();
      controller = new AbortController();
      try {
        let next = await fetchBinancePrices(controller.signal);
        if (Object.keys(next).length !== COINS.length) {
          next = { ...next, ...(await fetchCoinGeckoPrices(controller.signal)) };
        }
        if (alive && Object.keys(next).length) {
          setData((current) => ({ ...current, ...next }));
          setUpdatedAt(new Date());
        }
      } catch {
        try {
          const fallbackController = new AbortController();
          const next = await fetchCoinGeckoPrices(fallbackController.signal);
          if (alive && Object.keys(next).length) {
            setData((current) => ({ ...current, ...next }));
            setUpdatedAt(new Date());
          }
        } catch {}
      }
    };

    run();
    const id = setInterval(run, 5000);
    return () => {
      alive = false;
      controller?.abort();
      clearInterval(id);
    };
  }, []);

  return (
    <main className="min-h-screen w-full bg-gradient-hero">
      <div className="mx-auto max-w-2xl w-full flex flex-col px-5 py-6">
        {/* Top bar */}
        <header className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-xl bg-foreground flex items-center justify-center">
              <Shield className="h-7 w-7 text-background" strokeWidth={2.5} />
            </div>
          </div>

          <DonateDialog />
        </header>

        {/* Status indicator */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center gap-2 pb-4 text-xs text-muted-foreground"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          {updatedAt ? `Yangilandi ${updatedAt.toLocaleTimeString("uz-UZ")}` : "Yuklanmoqda…"}
        </motion.div>

        {/* Coin list */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] px-4 py-2">
          {COINS.map((c, i) => {
            const live = data[c.id];
            const isUp = (live?.change24h ?? 0) >= 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24, scale: 0.92, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{
                  duration: 0.7,
                  delay: 0.25 + i * 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`relative py-3 flex items-center gap-3 ${i !== COINS.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <img
                  src={c.logo}
                  alt={`${c.name} logo`}
                  loading="lazy"
                  className="h-9 w-9 rounded-full object-cover shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold tracking-tight leading-none">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground tracking-wider mt-1">{c.symbol}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-display text-sm font-semibold tracking-tight tabular-nums leading-none">
                    ${live ? fmt(live.price) : "—"}
                  </div>
                  <div
                    className="text-[10px] font-semibold tabular-nums mt-1"
                    style={{ color: isUp ? "hsl(var(--success))" : "hsl(var(--danger))" }}
                  >
                    {live ? `${isUp ? "▲" : "▼"} ${Math.abs(live.change24h).toFixed(2)}%` : "—"}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>
      </div>
    </main>
  );
};

export default Index;
