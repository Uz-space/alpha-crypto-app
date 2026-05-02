import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CryptoCard, type CryptoData } from "@/components/CryptoCard";

const COINS: Omit<CryptoData, "price" | "change24h">[] = [
  { id: "bitcoin",      symbol: "BTC",  name: "Bitcoin",   icon: "₿", iconBg: "linear-gradient(135deg, #F7931A, #FFB347)" },
  { id: "ethereum",     symbol: "ETH",  name: "Ethereum",  icon: "Ξ", iconBg: "linear-gradient(135deg, #627EEA, #8FA4F3)" },
  { id: "binancecoin",  symbol: "BNB",  name: "BNB",       icon: "B", iconBg: "linear-gradient(135deg, #F3BA2F, #FCD535)" },
  { id: "solana",       symbol: "SOL",  name: "Solana",    icon: "S", iconBg: "linear-gradient(135deg, #9945FF, #14F195)" },
  { id: "litecoin",     symbol: "LTC",  name: "Litecoin",  icon: "Ł", iconBg: "linear-gradient(135deg, #345D9D, #5A8FD6)" },
  { id: "the-open-network", symbol: "TON", name: "Toncoin", icon: "T", iconBg: "linear-gradient(135deg, #0098EA, #4AC8FF)" },
  { id: "tron",         symbol: "TRX",  name: "TRON",      icon: "T", iconBg: "linear-gradient(135deg, #FF060A, #FF5C5F)" },
  { id: "dogecoin",     symbol: "DOGE", name: "Dogecoin",  icon: "Ð", iconBg: "linear-gradient(135deg, #C2A633, #E8C547)" },
];

const Index = () => {
  const [data, setData] = useState<Record<string, { price: number; change24h: number }>>({});
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ids = COINS.map((c) => c.id).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    const fetchPrices = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Network");
        const json = await res.json();
        const next: typeof data = {};
        for (const c of COINS) {
          const v = json[c.id];
          if (v) next[c.id] = { price: v.usd, change24h: v.usd_24h_change ?? 0 };
        }
        setData(next);
        setUpdatedAt(new Date());
        setError(null);
      } catch {
        setError("Narxlarni yuklab bo‘lmadi");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const id = setInterval(fetchPrices, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-hero">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        {/* Hero */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="inline-block text-xs font-medium tracking-[0.2em] uppercase text-muted-foreground mb-5">
            Live Market
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-semibold tracking-tight mb-5">
            Crypto.<span className="text-muted-foreground">Simple.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Eng yirik kriptovalyutalar narxi. Toza, tez va real vaqtda.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
            {error
              ? error
              : updatedAt
              ? `Yangilandi ${updatedAt.toLocaleTimeString("uz-UZ")}`
              : "Yuklanmoqda…"}
          </div>
        </motion.header>

        {/* Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {COINS.map((c, i) => {
            const live = data[c.id];
            return (
              <CryptoCard
                key={c.id}
                index={i}
                loading={loading && !live}
                coin={{
                  ...c,
                  price: live?.price ?? 0,
                  change24h: live?.change24h ?? 0,
                }}
              />
            );
          })}
        </section>

        <footer className="mt-20 text-center text-xs text-muted-foreground">
          Ma’lumotlar manbai: CoinGecko · Har 30 soniyada yangilanadi
        </footer>
      </div>
    </main>
  );
};

export default Index;
