import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRightLeft, Upload, Copy, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import btcLogo from "@/assets/coins/btc.png";
import ethLogo from "@/assets/coins/eth.png";
import bnbLogo from "@/assets/coins/bnb.png";
import solLogo from "@/assets/coins/sol.jpeg";
import ltcLogo from "@/assets/coins/ltc.png";
import tonLogo from "@/assets/coins/ton.png";
import trxLogo from "@/assets/coins/trx.png";
import dogeLogo from "@/assets/coins/doge.jpeg";

interface Asset { symbol: string; name: string; logo?: string; isFiat?: boolean; }
const ASSETS: Asset[] = [
  { symbol: "UZS",  name: "Soʻm",     isFiat: true },
  { symbol: "BTC",  name: "Bitcoin",  logo: btcLogo },
  { symbol: "ETH",  name: "Ethereum", logo: ethLogo },
  { symbol: "BNB",  name: "BNB",      logo: bnbLogo },
  { symbol: "SOL",  name: "Solana",   logo: solLogo },
  { symbol: "LTC",  name: "Litecoin", logo: ltcLogo },
  { symbol: "TON",  name: "Toncoin",  logo: tonLogo },
  { symbol: "TRX",  name: "TRON",     logo: trxLogo },
  { symbol: "DOGE", name: "Dogecoin", logo: dogeLogo },
];

interface ExchWallet { symbol: string; name: string; address: string; network: string | null; }

const Exchange = () => {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [wallets, setWallets] = useState<ExchWallet[]>([]);
  const [from, setFrom] = useState("UZS");
  const [to, setTo] = useState("BTC");
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [receiveAddr, setReceiveAddr] = useState("");
  const [fullName, setFullName] = useState("");
  const [contact, setContact] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.from("exchange_wallets").select("symbol,name,address,network").then(({ data }) => {
      setWallets((data ?? []) as ExchWallet[]);
    });
    supabase.from("exchange_rates").select("symbol,price_uzs").then(({ data }) => {
      const m: Record<string, number> = {};
      (data ?? []).forEach((r: any) => { m[r.symbol] = Number(r.price_uzs); });
      setRates(m);
    });
  }, []);

  useEffect(() => {
    const amt = parseFloat(fromAmount);
    const pf = rates[from], pt = rates[to];
    if (!isFinite(amt) || amt <= 0 || !pf || !pt) { setToAmount(""); return; }
    const out = (amt * pf) / pt;
    setToAmount(to === "UZS" ? out.toFixed(0) : out.toFixed(8));
  }, [fromAmount, from, to, rates]);

  const swap = () => { setFrom(to); setTo(from); setFromAmount(toAmount); };
  const validPair = (from === "UZS") !== (to === "UZS");
  const sendToWallet = useMemo(() => wallets.find((w) => w.symbol === from), [wallets, from]);

  const copy = async () => {
    if (!sendToWallet?.address) return;
    await navigator.clipboard.writeText(sendToWallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const submit = async () => {
    if (!validPair) return toast.error("Faqat crypto ↔ UZS");
    if (!fromAmount || !toAmount) return toast.error("Summalarni kiriting");
    if (!receiveAddr.trim()) return toast.error("Qabul qilish manzilini kiriting");
    if (!fullName.trim()) return toast.error("Ism familiyangizni kiriting");
    if (!contact.trim()) return toast.error("Aloqa maʼlumotini kiriting");
    if (!file) return toast.error("Toʻlov screenshotini yuklang");
    if (!sendToWallet) return toast.error(`${from} uchun manzil yoʻq. Admin bilan bogʻlaning`);

    setSubmitting(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `anon/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("exchange-screenshots")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("exchange-screenshots").getPublicUrl(path);

      const { error } = await supabase.from("exchange_requests").insert({
        from_currency: from,
        to_currency: to,
        from_amount: Number(fromAmount),
        to_amount: Number(toAmount),
        sent_to_address: sendToWallet.address,
        receive_to_address: receiveAddr.trim(),
        screenshot_url: pub.publicUrl,
        full_name: fullName.trim(),
        contact: contact.trim(),
      });
      if (error) throw error;
      toast.success("Ariza qabul qilindi! Admin tez orada koʻrib chiqadi.");
      setFromAmount(""); setToAmount(""); setReceiveAddr("");
      setFullName(""); setContact(""); setFile(null);
    } catch (e: any) {
      toast.error(e.message ?? "Xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const AssetPicker = ({ value, onChange, exclude }: { value: string; onChange: (s: string) => void; exclude?: string }) => (
    <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
      {ASSETS.map((a) => {
        const active = a.symbol === value;
        const disabled = exclude === a.symbol;
        return (
          <button
            key={a.symbol}
            type="button"
            disabled={disabled}
            onClick={() => onChange(a.symbol)}
            className={`shrink-0 flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold border transition ${
              active ? "bg-foreground text-background border-foreground"
                     : "bg-white/[0.03] border-white/10 hover:border-white/30"
            } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
          >
            {a.logo ? (
              <img src={a.logo} alt={a.symbol} className="h-4 w-4 rounded-full" />
            ) : (
              <span className="h-4 w-4 rounded-full bg-success/30 grid place-items-center text-[8px] font-bold">UZ</span>
            )}
            {a.symbol}
          </button>
        );
      })}
    </div>
  );

  return (
    <main className="min-h-screen w-full bg-gradient-hero flex">
      <div className="mx-auto max-w-2xl w-full flex flex-col px-5 py-6">
        <header className="flex items-center justify-between mb-4">
          <Link to="/" className="h-9 w-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-lg font-semibold tracking-tight">Exchange</h1>
          <div className="h-9 w-9" />
        </header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)] p-4 space-y-4"
        >
          {/* From */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">Yuboraman</div>
            <AssetPicker value={from} onChange={(s) => { if (s === to) setTo(from); setFrom(s); }} exclude={to !== "UZS" && from !== "UZS" ? to : undefined} />
            <Input type="number" inputMode="decimal" placeholder="0.00" value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)} className="mt-2 h-12 text-lg font-display tabular-nums" />
          </div>

          <div className="flex justify-center">
            <button onClick={swap} className="h-9 w-9 rounded-full bg-foreground/10 border border-white/10 hover:bg-foreground/20 flex items-center justify-center transition">
              <ArrowRightLeft className="h-4 w-4 rotate-90" />
            </button>
          </div>

          {/* To */}
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-2">Olaman</div>
            <AssetPicker value={to} onChange={(s) => { if (s === from) setFrom(to); setTo(s); }} exclude={from !== "UZS" && to !== "UZS" ? from : undefined} />
            <Input type="number" inputMode="decimal" placeholder="0.00" value={toAmount} readOnly
              className="mt-2 h-12 text-lg font-display tabular-nums opacity-90" />
          </div>

          {!validPair && (
            <div className="rounded-xl border border-danger/30 bg-danger/10 p-3 text-xs text-danger">
              Faqat <b>crypto ↔ UZS</b> almashtirish mumkin.
            </div>
          )}

          {validPair && sendToWallet && (
            <>
              <div className="h-px bg-white/5" />

              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground/70 mb-1.5">
                  {from === "UZS" ? "Karta raqamiga toʻlang" : `${from} manziliga yuboring`}
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-background/40 px-3 py-2.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-muted-foreground/70">
                      {sendToWallet.name}{sendToWallet.network ? ` · ${sendToWallet.network}` : ""}
                    </div>
                    <div className="font-mono text-xs truncate">{sendToWallet.address}</div>
                  </div>
                  <button onClick={copy} className="h-8 w-8 rounded-lg bg-foreground/10 hover:bg-foreground/20 flex items-center justify-center shrink-0">
                    {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                  Qabul qilish {to === "UZS" ? "karta raqami" : `${to} manzili`}
                </Label>
                <Input value={receiveAddr} onChange={(e) => setReceiveAddr(e.target.value)}
                  placeholder={to === "UZS" ? "8600 .... .... ...." : "Wallet address"}
                  className="mt-1 font-mono text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Ism familiya</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ali Valiyev" className="mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Telegram / Tel</Label>
                  <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="@username" className="mt-1" />
                </div>
              </div>

              <div>
                <Label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Toʻlov screenshoti</Label>
                <label className="mt-1 flex items-center gap-2 rounded-xl border border-dashed border-white/15 bg-background/30 px-3 py-3 cursor-pointer hover:border-white/30 transition">
                  <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">
                    {file ? file.name : "Tasvirni tanlang (PNG/JPG)"}
                  </span>
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              <Button onClick={submit} disabled={submitting} className="w-full h-11 font-semibold">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Arizani yuborish"}
              </Button>
            </>
          )}

          {validPair && !sendToWallet && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
              {from} uchun admin manzilni hali sozlamagan. Iltimos boshqa valyutani tanlang.
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
};

export default Exchange;
