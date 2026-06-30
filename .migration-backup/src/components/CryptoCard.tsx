import { motion } from "framer-motion";

export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  icon: string;
  iconBg: string;
}

interface Props {
  coin: CryptoData;
  index: number;
  loading?: boolean;
}

const formatPrice = (n: number) => {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(2);
  return n.toFixed(4);
};

export const CryptoCard = ({ coin, index, loading }: Props) => {
  const isUp = coin.change24h >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative overflow-hidden rounded-3xl bg-gradient-card border border-border p-6 shadow-glow hover:border-muted-foreground/30 transition-colors"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
           style={{ background: "radial-gradient(circle at 50% 0%, hsl(0 0% 18%) 0%, transparent 70%)" }} />

      <div className="relative flex items-center justify-between mb-8">
        <div
          className="h-12 w-12 rounded-2xl flex items-center justify-center font-display font-bold text-lg"
          style={{ background: coin.iconBg, color: "#fff" }}
        >
          {coin.icon}
        </div>
        <span className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {coin.symbol}
        </span>
      </div>

      <div className="relative">
        <p className="text-sm text-muted-foreground mb-2 font-medium">{coin.name}</p>
        <div className="flex items-baseline gap-1 mb-3">
          <span className="text-xs text-muted-foreground font-display">$</span>
          <motion.span
            key={coin.price}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="font-display text-3xl md:text-4xl font-semibold tracking-tight"
          >
            {loading ? "—" : formatPrice(coin.price)}
          </motion.span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              background: isUp ? "hsl(142 71% 55% / 0.12)" : "hsl(0 84% 62% / 0.12)",
              color: isUp ? "hsl(var(--success))" : "hsl(var(--danger))",
            }}
          >
            <span className="text-[10px]">{isUp ? "▲" : "▼"}</span>
            {loading ? "—" : `${Math.abs(coin.change24h).toFixed(2)}%`}
          </span>
          <span className="text-xs text-muted-foreground">24s</span>
        </div>
      </div>
    </motion.div>
  );
};
