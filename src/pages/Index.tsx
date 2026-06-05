import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRightLeft, LogIn, LogOut } from "lucide-react";
import { DonateDialog } from "@/components/DonateDialog";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`, { cache: "no-store", signal });
  if (!res.ok) throw new Error("Binance price request failed");
  const json: Array<{ symbol: string; lastPrice: string; priceChangePercent: string }> = await res.json();
  const bySymbol = new Map(json.map((item) => [item.symbol, item]));
  return COINS.reduce<CoinData>((acc, coin) => {
    const item = bySymbol.get(coin.binanceSymbol);
    const price = Number(item?.lastPrice);
    const change24h = Number(item?.priceChangePercent);
    if (Number.isFinite(price)) acc[coin.id] = { price, change24h: Number.isFinite(change24h) ? change24h : 0 };
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
    if (Number.isFinite(price)) acc[coin.id] = { price, change24h: Number.isFinite(change24h) ? change24h : 0 };
    return acc;
  }, {});
};

const Index = () => {
  const [data, setData] = useState<CoinData>({});
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [authed, setAuthed] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const lastClick = useRef<number>(0);

  useEffect(() => {
    supabase.from("visits").insert({
      path: window.location.pathname,
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(() => {});

    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setAuthChecked(true);
      if (!data.session) navigate("/auth", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setAuthed(!!s);
      setAuthChecked(true);
      if (!s) navigate("/auth", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleShieldClick = () => {
    const now = Date.now();
    if (now - lastClick.current < 500) {
      lastClick.current = 0;
      navigate("/auth?admin=1");
    } else {
      lastClick.current = now;
    }
  };

  const handleAuthClick = async () => {
    if (authed) {
      await supabase.auth.signOut();
      toast.success("Tizimdan chiqdingiz");
    } else {
      navigate("/auth");
    }
  };

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
          setData((cur) => ({ ...cur, ...next }));
          setUpdatedAt(new Date());
        }
      } catch (error) {
        if (!alive || (error instanceof DOMException && error.name === "AbortError")) return;
        try {
          const fc = new AbortController();
          const next = await fetchCoinGeckoPrices(fc.signal);
          if (alive && Object.keys(next).length) {
            setData((cur) => ({ ...cur, ...next }));
            setUpdatedAt(new Date());
          }
        } catch { return; }
      }
    };
    run();
    const id = setInterval(run, 10000);
    return () => { alive = false; controller?.abort(); clearInterval(id); };
  }, []);

  if (!authChecked || !authed) {
    return <main className="min-h-screen w-full bg-gradient-hero" />;
  }

  return (
    <main className="min-h-screen w-full bg-gradient-hero flex">
      <div className="mx-auto max-w-2xl w-full flex flex-col px-5 py-6">
        <header className="grid grid-cols-3 items-center pb-4 gap-3">
          <div className="flex items-center gap-2 relative z-10">
            <button
              onClick={handleShieldClick}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Shield"
              className="relative h-9 w-9 rounded-full bg-foreground flex items-center justify-center select-none touch-none"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <Shield className="h-5 w-5 text-background" strokeWidth={2.5} />
            </button>
            <button
              onClick={handleAuthClick}
              aria-label={authed ? "Logout" : "Login"}
              className="h-9 w-9 rounded-full bg-foreground flex items-center justify-center transition"
            >
              {authed ? (
                <LogOut className="h-5 w-5 text-background" strokeWidth={2.5} />
              ) : (
                <LogIn className="h-5 w-5 text-background" strokeWidth={2.5} />
              )}
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ borderRadius: "14px" }}
            className="flex flex-col items-center justify-self-center leading-tight px-3 py-1.5 border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_4px_20px_-8px_rgba(0,0,0,0.5)]"
          >
            <span className="text-[8px] uppercase tracking-[0.2em] text-muted-foreground/70 font-medium">Yangilandi</span>
            <span className="flex items-center gap-1 text-[12px] font-semibold tabular-nums tracking-tight text-foreground/90 mt-0.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
              </span>
              {updatedAt ? updatedAt.toLocaleTimeString("uz-UZ") : "…"}
            </span>
          </motion.div>

          <div className="flex items-center gap-2 justify-end relative z-10">
            <Link
              to="/exchange"
              aria-label="Exchange"
              className="h-9 w-9 rounded-full bg-foreground flex items-center justify-center transition"
            >
              <ArrowRightLeft className="h-5 w-5 text-background" strokeWidth={2.5} />
            </Link>
            <DonateDialog />
          </div>
        </header>

        <section className="flex-1 flex flex-col justify-around rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] px-4 py-2">
          {COINS.map((c, i) => {
            const live = data[c.id];
            const isUp = (live?.change24h ?? 0) >= 0;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 24, scale: 0.92, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.25 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                className={`relative py-3 flex items-center gap-3 ${i !== COINS.length - 1 ? "border-b border-white/5" : ""}`}
              >
                <img src={c.logo} alt={`${c.name} logo`} loading="lazy" className="h-9 w-9 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold tracking-tight leading-none">{c.name}</div>
                  <div className="text-[10px] text-muted-foreground tracking-wider mt-1">{c.symbol}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-display text-sm font-semibold tracking-tight tabular-nums leading-none">
                    ${live ? fmt(live.price) : "—"}
                  </div>
                  <div className="text-[10px] font-semibold tabular-nums mt-1"
                    style={{ color: isUp ? "hsl(var(--success))" : "hsl(var(--danger))" }}>
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
