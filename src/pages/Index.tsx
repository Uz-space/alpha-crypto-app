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
    <main className="h-screen w-full overflow-hidden bg-gradient-hero flex items-center justify-center p-4">
      <IPhoneFrame>
        <div className="h-full w-full flex flex-col bg-gradient-hero">
          {/* Status bar spacer for Dynamic Island */}
          <div className="h-12 shrink-0" />

          {/* Top bar */}
          <header className="flex items-center justify-between px-4 pb-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-md bg-foreground flex items-center justify-center">
                <span className="text-background text-[9px] font-bold">◆</span>
              </div>
              <span className="font-display font-semibold tracking-tight text-[11px]">Crypto Live</span>
            </div>

            <DonateDialog />
          </header>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center px-4 pt-1 pb-2 shrink-0"
          >
            <h1 className="font-display text-xl font-semibold tracking-tight">
              Live Prices
            </h1>
            <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              {updatedAt ? `Yangilandi ${updatedAt.toLocaleTimeString("uz-UZ")}` : "Yuklanmoqda…"}
            </div>
          </motion.div>

          {/* Coin list (fills remaining viewport) */}
          <section className="flex-1 min-h-0 px-3 pb-4 overflow-hidden">
            <div className="h-full grid grid-cols-2 grid-rows-4 gap-1.5">
              {COINS.map((c, i) => {
                const live = data[c.id];
                const isUp = (live?.change24h ?? 0) >= 0;
                return (
                  <motion.div
                    key={c.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-xl bg-gradient-card border border-border px-2.5 py-2 flex items-center gap-2"
                  >
                    <div
                      className="h-7 w-7 rounded-lg flex items-center justify-center font-display font-bold text-[11px] text-white shrink-0"
                      style={{ background: c.color }}
                    >
                      {c.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-[10px] font-semibold tracking-wider">{c.symbol}</span>
                        <span
                          className="text-[9px] font-semibold tabular-nums"
                          style={{ color: isUp ? "hsl(var(--success))" : "hsl(var(--danger))" }}
                        >
                          {live ? `${isUp ? "▲" : "▼"} ${Math.abs(live.change24h).toFixed(1)}%` : "—"}
                        </span>
                      </div>
                      <div className="font-display text-[13px] font-semibold tracking-tight tabular-nums truncate">
                        ${live ? fmt(live.price) : "—"}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Home indicator */}
          <div className="shrink-0 flex justify-center pb-2">
            <div className="h-[5px] w-28 rounded-full bg-foreground/40" />
          </div>
        </div>
      </IPhoneFrame>
    </main>
  );
};

export default Index;
