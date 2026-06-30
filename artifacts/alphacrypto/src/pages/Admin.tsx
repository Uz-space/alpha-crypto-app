import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  LogOut, Trash2, Plus, Save, Eye, Users, Wallet as WalletIcon,
  BarChart3, Inbox, Check, X, ArrowRightLeft, Gauge,
} from "lucide-react";

interface Wallet { id: string; name: string; symbol: string; address: string; color: string; sort_order: number; }
interface ExchWallet { id: string; name: string; symbol: string; address: string; network: string | null; sort_order: number; }
interface Rate { id: string; symbol: string; buy_uzs: number; sell_uzs: number; min_buy: number; min_sell: number; sort_order: number; }
interface AppUser {
  id: string; username: string; email: string; last_sign_in_at: string | null;
  created_at: string; total_logins: number; today_logins: number; roles: string[];
}
interface ExchangeRequest {
  id: string; from_currency: string; to_currency: string; from_amount: number; to_amount: number;
  sent_to_address: string; receive_to_address: string; screenshot_url: string | null;
  status: "pending" | "approved" | "rejected"; full_name: string | null; contact: string | null;
  admin_note: string | null; created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [exchWallets, setExchWallets] = useState<ExchWallet[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0 });

  useEffect(() => {
    const init = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) { navigate("/auth", { replace: true }); return; }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: sess.session.user.id, _role: "admin",
      });
      if (!isAdmin) {
        toast.error("Sizda admin huquqi yoʻq");
        navigate("/", { replace: true });
        return;
      }
      setAuthorized(true);
      await loadAll();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const loadAll = async () => {
    const [w, ew, r, total, today, week, usersRes, reqs] = await Promise.all([
      supabase.from("wallets").select("*").order("sort_order"),
      supabase.from("exchange_wallets").select("*").order("sort_order"),
      supabase.from("exchange_rates").select("*").order("sort_order"),
      supabase.from("visits").select("*", { count: "exact", head: true }),
      supabase.from("visits").select("*", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0,0,0,0)).toISOString()),
      supabase.from("visits").select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7*86400000).toISOString()),
      supabase.functions.invoke("admin-users"),
      supabase.from("exchange_requests").select("*").order("created_at", { ascending: false }),
    ]);
    setWallets((w.data as Wallet[]) ?? []);
    setExchWallets((ew.data as ExchWallet[]) ?? []);
    setRates((r.data as Rate[]) ?? []);
    setStats({ total: total.count ?? 0, today: today.count ?? 0, week: week.count ?? 0 });
    if (usersRes.data?.users) setUsers(usersRes.data.users);
    setRequests((reqs.data as ExchangeRequest[]) ?? []);
  };

  // ----- Requests -----
  const reviewRequest = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("exchange_requests")
      .update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(status === "approved" ? "Tasdiqlandi" : "Rad etildi");
    await loadAll();
  };
  const deleteRequest = async (id: string) => {
    await supabase.from("exchange_requests").delete().eq("id", id);
    await loadAll();
  };

  // ----- Donate wallets -----
  const upW = (id: string, f: keyof Wallet, v: any) => setWallets(ws => ws.map(w => w.id===id ? {...w,[f]:v}:w));
  const saveW = async (w: Wallet) => {
    const { error } = await supabase.from("wallets").update({
      name: w.name, symbol: w.symbol, address: w.address, color: w.color, sort_order: w.sort_order,
    }).eq("id", w.id);
    error ? toast.error(error.message) : toast.success("Saqlandi");
  };
  const delW = async (id: string) => { await supabase.from("wallets").delete().eq("id", id); await loadAll(); };
  const addW = async () => {
    await supabase.from("wallets").insert({ name: "Yangi", symbol: "NEW", address: "address", color: "#888", sort_order: wallets.length+1 });
    await loadAll();
  };

  // ----- Exchange wallets -----
  const upEW = (id: string, f: keyof ExchWallet, v: any) => setExchWallets(xs => xs.map(x => x.id===id ? {...x,[f]:v}:x));
  const saveEW = async (x: ExchWallet) => {
    const { error } = await supabase.from("exchange_wallets").update({
      name: x.name, symbol: x.symbol, address: x.address, network: x.network, sort_order: x.sort_order,
    }).eq("id", x.id);
    error ? toast.error(error.message) : toast.success("Saqlandi");
  };
  const delEW = async (id: string) => { await supabase.from("exchange_wallets").delete().eq("id", id); await loadAll(); };
  const addEW = async () => {
    const { error } = await supabase.from("exchange_wallets").insert({
      name: "Yangi", symbol: "NEW", address: "address", network: null, sort_order: exchWallets.length+1,
    });
    if (error) toast.error(error.message);
    else await loadAll();
  };

  // ----- Rates -----
  const upR = (id: string, f: "buy_uzs" | "sell_uzs" | "min_buy" | "min_sell", v: number) =>
    setRates(rs => rs.map(r => r.id===id ? {...r, [f]: v}:r));
  const saveR = async (r: Rate) => {
    const { error } = await supabase.from("exchange_rates")
      .update({ buy_uzs: r.buy_uzs, sell_uzs: r.sell_uzs, min_buy: r.min_buy, min_sell: r.min_sell }).eq("id", r.id);
    error ? toast.error(error.message) : toast.success(`${r.symbol} yangilandi`);
  };
  const addR = async () => {
    const sym = prompt("Valyuta belgisi (masalan: BTC)")?.trim().toUpperCase();
    if (!sym) return;
    const { error } = await supabase.from("exchange_rates")
      .insert({ symbol: sym, buy_uzs: 0, sell_uzs: 0, min_buy: 0, min_sell: 0, price_uzs: 0, sort_order: 99 });
    if (error) toast.error(error.message);
    else await loadAll();
  };
  const delR = async (id: string) => { await supabase.from("exchange_rates").delete().eq("id", id); await loadAll(); };

  const logout = async () => { await supabase.auth.signOut(); navigate("/", { replace: true }); };
  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleString("uz-UZ", { dateStyle:"short", timeStyle:"short" }) : "—";

  if (loading || !authorized) {
    return <main className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-sm text-muted-foreground">Yuklanmoqda…</div>
    </main>;
  }

  const pendingCount = requests.filter(r => r.status === "pending").length;

  return (
    <main className="min-h-screen w-full bg-gradient-hero">
      <div className="mx-auto max-w-4xl w-full px-5 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Boshqaruv paneli</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}><Eye className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" /></Button>
          </div>
        </header>

        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid grid-cols-6 w-full bg-white/[0.04] border border-white/10 mb-6 h-auto">
            <TabsTrigger value="requests" className="flex-col gap-0.5 py-2 text-[10px]">
              <div className="relative">
                <Inbox className="h-4 w-4" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-2 inline-flex h-3.5 min-w-3.5 px-1 items-center justify-center rounded-full bg-danger text-[8px] font-bold text-white">
                    {pendingCount}
                  </span>
                )}
              </div>
              Arizalar
            </TabsTrigger>
            <TabsTrigger value="rates" className="flex-col gap-0.5 py-2 text-[10px]"><Gauge className="h-4 w-4" />Kurslar</TabsTrigger>
            <TabsTrigger value="exch" className="flex-col gap-0.5 py-2 text-[10px]"><ArrowRightLeft className="h-4 w-4" />Exchange</TabsTrigger>
            <TabsTrigger value="wallets" className="flex-col gap-0.5 py-2 text-[10px]"><WalletIcon className="h-4 w-4" />Donate</TabsTrigger>
            <TabsTrigger value="users" className="flex-col gap-0.5 py-2 text-[10px]"><Users className="h-4 w-4" />Userlar</TabsTrigger>
            <TabsTrigger value="stats" className="flex-col gap-0.5 py-2 text-[10px]"><BarChart3 className="h-4 w-4" />Statistika</TabsTrigger>
          </TabsList>

          {/* REQUESTS */}
          <TabsContent value="requests" className="mt-0 space-y-3">
            {requests.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-xs text-muted-foreground">Arizalar yoʻq</div>
            )}
            {requests.map((r) => (
              <div key={r.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display text-base font-semibold tabular-nums">{r.from_amount} {r.from_currency}</span>
                      <span className="text-muted-foreground/50">→</span>
                      <span className="font-display text-base font-semibold tabular-nums">{r.to_amount} {r.to_currency}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 mt-1">{fmtDate(r.created_at)} · {r.full_name ?? "—"} · {r.contact ?? "—"}</div>
                  </div>
                  <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold shrink-0 ${
                    r.status==="pending" ? "bg-amber-500/20 text-amber-400"
                    : r.status==="approved" ? "bg-success/20 text-success"
                    : "bg-danger/20 text-danger"}`}>{r.status}</span>
                </div>

                <div className="grid grid-cols-1 gap-2 text-xs mb-3">
                  <div className="rounded-lg bg-background/40 border border-white/5 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60">User yuborgan manzil ({r.from_currency})</div>
                    <div className="font-mono text-[11px] break-all mt-0.5">{r.sent_to_address}</div>
                  </div>
                  <div className="rounded-lg bg-background/40 border border-white/5 p-2">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60">User qabul qilmoqchi ({r.to_currency})</div>
                    <div className="font-mono text-[11px] break-all mt-0.5">{r.receive_to_address}</div>
                  </div>
                </div>

                {r.screenshot_url && (
                  <a href={r.screenshot_url} target="_blank" rel="noreferrer" className="block mb-3">
                    <img src={r.screenshot_url} alt="screenshot" className="w-full max-h-64 object-contain rounded-lg border border-white/10 bg-background/50" />
                  </a>
                )}

                {r.status === "pending" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => reviewRequest(r.id, "rejected")} className="flex-1">
                      <X className="h-3.5 w-3.5 mr-1" /> Rad etish
                    </Button>
                    <Button size="sm" onClick={() => reviewRequest(r.id, "approved")} className="flex-1 bg-success text-background hover:bg-success/90">
                      <Check className="h-3.5 w-3.5 mr-1" /> Tasdiqlash
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <Button size="sm" variant="ghost" onClick={() => deleteRequest(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                )}
              </div>
            ))}
          </TabsContent>

          {/* RATES */}
          <TabsContent value="rates" className="mt-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold">Valyuta kurslari</h2>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                    Har bir valyuta uchun olish/sotish kursi va minimal miqdor
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={addR}><Plus className="h-3.5 w-3.5 mr-1" /> Qoʻshish</Button>
              </div>
              <div className="space-y-3">
                {rates.map((r) => (
                  <div key={r.id} className="rounded-xl border border-white/5 bg-background/30 p-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="px-2.5 py-1 rounded-lg bg-foreground/10 text-xs font-bold">{r.symbol}</div>
                        <span className="text-[10px] text-muted-foreground/60">1 {r.symbol} = UZS</span>
                      </div>
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => saveR(r)}><Save className="h-3.5 w-3.5" /></Button>
                        {r.symbol !== "UZS" && (
                          <Button size="sm" variant="ghost" onClick={() => delR(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1">Olish kursi (buy)</div>
                        <Input type="number" value={r.buy_uzs} onChange={(e) => upR(r.id, "buy_uzs", Number(e.target.value))} className="tabular-nums h-9" />
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1">Sotish kursi (sell)</div>
                        <Input type="number" value={r.sell_uzs} onChange={(e) => upR(r.id, "sell_uzs", Number(e.target.value))} className="tabular-nums h-9" />
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1">Min. olish</div>
                        <Input type="number" value={r.min_buy} onChange={(e) => upR(r.id, "min_buy", Number(e.target.value))} className="tabular-nums h-9" />
                      </div>
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground/60 mb-1">Min. sotish</div>
                        <Input type="number" value={r.min_sell} onChange={(e) => upR(r.id, "min_sell", Number(e.target.value))} className="tabular-nums h-9" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>


          {/* EXCHANGE WALLETS */}
          <TabsContent value="exch" className="mt-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold">Exchange manzillari</h2>
                  <p className="text-[10px] text-muted-foreground/70 mt-0.5">User shu manzillarga pul yuboradi</p>
                </div>
                <Button size="sm" variant="outline" onClick={addEW}><Plus className="h-3.5 w-3.5 mr-1" /> Qoʻshish</Button>
              </div>
              <div className="space-y-3">
                {exchWallets.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground py-6">Hali manzil qoʻshilmagan</div>
                )}
                {exchWallets.map((x) => (
                  <div key={x.id} className="rounded-xl border border-white/5 bg-background/30 p-3 space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <Input className="col-span-5" placeholder="Nomi (UZCARD/HUMO yoki BTC)" value={x.name} onChange={(e) => upEW(x.id,"name",e.target.value)} />
                      <Input className="col-span-3" placeholder="Symbol" value={x.symbol} onChange={(e) => upEW(x.id,"symbol",e.target.value.toUpperCase())} />
                      <Input className="col-span-3" placeholder="Network" value={x.network ?? ""} onChange={(e) => upEW(x.id,"network",e.target.value || null)} />
                      <Input className="col-span-1" type="number" value={x.sort_order} onChange={(e) => upEW(x.id,"sort_order",Number(e.target.value))} />
                    </div>
                    <Input placeholder="Manzil / Karta raqami" value={x.address} onChange={(e) => upEW(x.id,"address",e.target.value)} className="font-mono text-xs" />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => delEW(x.id)}><Trash2 className="h-4 w-4" /></Button>
                      <Button size="sm" onClick={() => saveEW(x)}><Save className="h-3.5 w-3.5 mr-1" /> Saqlash</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* DONATE WALLETS */}
          <TabsContent value="wallets" className="mt-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Donate manzillari</h2>
                <Button size="sm" variant="outline" onClick={addW}><Plus className="h-3.5 w-3.5 mr-1" /> Qoʻshish</Button>
              </div>
              <div className="space-y-3">
                {wallets.map((w) => (
                  <div key={w.id} className="rounded-xl border border-white/5 bg-background/30 p-3 space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <Input className="col-span-6" placeholder="Nomi" value={w.name} onChange={(e) => upW(w.id,"name",e.target.value)} />
                      <Input className="col-span-3" placeholder="Symbol" value={w.symbol} onChange={(e) => upW(w.id,"symbol",e.target.value)} />
                      <Input className="col-span-2" type="color" value={w.color} onChange={(e) => upW(w.id,"color",e.target.value)} />
                      <Input className="col-span-1" type="number" value={w.sort_order} onChange={(e) => upW(w.id,"sort_order",Number(e.target.value))} />
                    </div>
                    <Input placeholder="Manzil" value={w.address} onChange={(e) => upW(w.id,"address",e.target.value)} className="font-mono text-xs" />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => delW(w.id)}><Trash2 className="h-4 w-4" /></Button>
                      <Button size="sm" onClick={() => saveW(w)}><Save className="h-3.5 w-3.5 mr-1" /> Saqlash</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="mt-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5">
                <h2 className="text-sm font-semibold">Foydalanuvchilar ({users.length})</h2>
              </div>
              <div className="divide-y divide-white/5">
                {users.map((u) => (
                  <div key={u.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-semibold uppercase shrink-0">{u.username[0] ?? "?"}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{u.username}</span>
                        {u.roles.includes("admin") && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/20 text-success font-semibold">admin</span>}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">Oxirgi kirish: {fmtDate(u.last_sign_in_at)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Jami / Bugun</div>
                      <div className="font-display text-sm font-semibold tabular-nums">{u.total_logins} <span className="text-muted-foreground/50">/</span> {u.today_logins}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* STATS */}
          <TabsContent value="stats" className="space-y-4 mt-0">
            <div className="grid grid-cols-3 gap-3">
              {[{label:"Jami tashriflar",value:stats.total},{label:"Bugun",value:stats.today},{label:"7 kun",value:stats.week}].map(s => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">{s.label}</div>
                  <div className="font-display text-3xl font-semibold tabular-nums mt-2">{s.value}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;
