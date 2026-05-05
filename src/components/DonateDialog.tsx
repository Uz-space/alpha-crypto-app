import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const WALLETS = [
  { name: "Bitcoin",  symbol: "BTC",  address: "bc1qxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", color: "#F7931A" },
  { name: "Ethereum", symbol: "ETH",  address: "0xYourEthereumAddressHere000000000000000000",  color: "#627EEA" },
  { name: "USDT (TRC20)", symbol: "USDT", address: "TYourTronUSDTAddressHere000000000000000",  color: "#26A17B" },
  { name: "TON",      symbol: "TON",  address: "UQYourTonAddressHere000000000000000000000",   color: "#0098EA" },
];

export const DonateDialog = () => {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (addr: string, sym: string) => {
    try {
      await navigator.clipboard.writeText(addr);
      setCopied(sym);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          aria-label="Yordam berish"
          title="Yordam berish"
          className="group relative inline-flex items-center justify-center h-9 w-9 rounded-full bg-foreground text-background shadow-glow transition-shadow hover:shadow-[0_0_30px_hsl(0_0%_100%/0.3)]"
        >
          <span className="text-base leading-none">🎁</span>
        </motion.button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md bg-card border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl tracking-tight text-center">
            Loyihani qo‘llab-quvvatlang
          </DialogTitle>
          <p className="text-center text-sm text-muted-foreground pt-1">
            Ixtiyoriy donate. Manzilni nusxalang va istalgan miqdor yuboring 🙏
          </p>
        </DialogHeader>

        <div className="space-y-2 mt-2">
          {WALLETS.map((w) => (
            <button
              key={w.symbol}
              onClick={() => copy(w.address, w.symbol)}
              className="w-full text-left p-3 rounded-2xl bg-secondary hover:bg-accent border border-border transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: w.color }} />
                  <span className="font-medium text-sm">{w.name}</span>
                  <span className="text-xs text-muted-foreground">{w.symbol}</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={copied === w.symbol ? "ok" : "copy"}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="text-xs font-medium"
                    style={{ color: copied === w.symbol ? "hsl(var(--success))" : "hsl(var(--muted-foreground))" }}
                  >
                    {copied === w.symbol ? "Nusxalandi ✓" : "Nusxalash"}
                  </motion.span>
                </AnimatePresence>
              </div>
              <code className="text-[11px] text-muted-foreground font-mono break-all">{w.address}</code>
            </button>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground text-center mt-2">
          ⚠️ Manzilni saytdagi adminstratorga sozlatib olishingizni unutmang
        </p>
      </DialogContent>
    </Dialog>
  );
};
