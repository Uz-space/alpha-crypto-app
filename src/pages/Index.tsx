import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { DonateDialog } from "@/components/DonateDialog";

interface Coin {
  id: string;
  symbol: string;
  name: string;
  color: string;
  icon: string;
}

const COINS: Coin[] = [
  { id: "bitcoin",          symbol: "BTC",  name: "Bitcoin",   icon: "₿", color: "#F7931A" },
  { id: "ethereum",         symbol: "ETH",  name: "Ethereum",  icon: "Ξ", color: "#627EEA" },
  { id: "binancecoin",      symbol: "BNB",  name: "BNB",       icon: "B", color: "#F3BA2F" },
  { id: "solana",           symbol: "SOL",  name: "Solana",    icon: "S", color: "#9945FF" },
  { id: "litecoin",         symbol: "LTC",  name: "Litecoin",  icon: "Ł", color: "#345D9D" },
  { id: "the-open-network", symbol: "TON",  name: "Toncoin",   icon: "T", color: "#0098EA" },
  { id: "tron",             symbol: "TRX",  name: "TRON",      icon: "T", color: "#FF060A" },
  { id: "dogecoin",         symbol: "DOGE", name: "Dogecoin",  icon: "Ð", color: "#C2A633" },
];

const fmt = (n: number) =>
  n >= 1000 ? n.toLocaleString("en-US", { maximumFractionDigits: 0 })
: n >= 1   ? n.toFixed(2)
: n.toFixed(4);

const Index = () => {
  const [data, setData] = useState<Record<string, { price: number; change24h: number }>>({});
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const ids = COINS.map((c) => c.id).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    const run = async () => {
      try {
        const res = await fetch(url);
        const json = await res.json();
        const next: typeof data = {};
        for (const c of COINS) {
          const v = json[c.id];
          if (v) next[c.id] = { price: v.usd, change24h: v.usd_24h_change ?? 0 };
        }
        setData(next);
        setUpdatedAt(new Date());
      } catch {}
    };

    run();
    const id = setInterval(run, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="h-screen w-full overflow-hidden bg-gradient-hero flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 md:px-10 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
            <span className="text-background text-xs font-bold">◆</span>
          </div>
          <span className="font-display font-semibold tracking-tight text-sm">Crypto Live</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
            </span>
            {updatedAt ? updatedAt.toLocaleTimeString("uz-UZ") : "Yuklanmoqda…"}
          </div>
          <DonateDialog />
        </div>
      </header>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center px-6 pt-2 pb-4 shrink-0"
      >
        <h1 className="font-display text-2xl md:text-4xl font-semibold tracking-tight">
          Live Crypto Prices
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Real vaqtda yangilanadi · CoinGecko
        </p>
      </motion.div>

      {/* Grid (fills remaining viewport) */}
      <section className="flex-1 min-h-0 px-4 md:px-10 pb-5">
        <div className="h-full grid grid-cols-2 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-2 md:gap-3">
          {COINS.map((c, i) => {
            const live = data[c.id];
            const isUp = (live?.change24h ?? 0) >= 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-2xl bg-gradient-card border border-border p-3 md:p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="h-7 w-7 md:h-9 md:w-9 rounded-lg md:rounded-xl flex items-center justify-center font-display font-bold text-xs md:text-sm text-white"
                    style={{ background: c.color }}
                  >
                    {c.icon}
                  </div>
                  <span className="text-[10px] md:text-xs font-medium tracking-wider text-muted-foreground">
                    {c.symbol}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{c.name}</p>
                  <div className="flex items-baseline gap-0.5 mt-0.5">
                    <span className="text-[10px] md:text-xs text-muted-foreground">$</span>
                    <span className="font-display text-base md:text-2xl font-semibold tracking-tight tabular-nums">
                      {live ? fmt(live.price) : "—"}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-semibold"
                      style={{
                        background: isUp ? "hsl(142 71% 55% / 0.12)" : "hsl(0 84% 62% / 0.12)",
                        color: isUp ? "hsl(var(--success))" : "hsl(var(--danger))",
                      }}
                    >
                      <span className="text-[8px]">{isUp ? "▲" : "▼"}</span>
                      {live ? `${Math.abs(live.change24h).toFixed(2)}%` : "—"}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </main>
  );
};

export default Index;
