import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
}

const COINS: Coin[] = [
  { id: "bitcoin",          symbol: "BTC",  name: "Bitcoin",   logo: btcLogo },
  { id: "ethereum",         symbol: "ETH",  name: "Ethereum",  logo: ethLogo },
  { id: "binancecoin",      symbol: "BNB",  name: "BNB",       logo: bnbLogo },
  { id: "solana",           symbol: "SOL",  name: "Solana",    logo: solLogo },
  { id: "litecoin",         symbol: "LTC",  name: "Litecoin",  logo: ltcLogo },
  { id: "the-open-network", symbol: "TON",  name: "Toncoin",   logo: tonLogo },
  { id: "tron",             symbol: "TRX",  name: "TRON",      logo: trxLogo },
  { id: "dogecoin",         symbol: "DOGE", name: "Dogecoin",  logo: dogeLogo },
];

const fmt = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Index = () => {
  const [data, setData] = useState<Record<string, { price: number; change24h: number }>>({});
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const ids = COINS.map((c) => c.id).join(",");
    const base = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&precision=full`;

    const run = async () => {
      try {
        const res = await fetch(`${base}&_=${Date.now()}`, { cache: "no-store" });
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
    <main className="min-h-screen w-full bg-gradient-hero">
      <div className="mx-auto max-w-2xl w-full flex flex-col px-5 py-6">
        {/* Top bar */}
        <header className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background text-xs font-bold">◆</span>
            </div>
            <span className="font-display font-semibold tracking-tight text-base">Crypto Live</span>
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
