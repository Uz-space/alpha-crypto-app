import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { LogOut, Trash2, Plus, Save, Eye, Users, Wallet as WalletIcon, BarChart3 } from "lucide-react";

interface Wallet {
  id: string;
  name: string;
  symbol: string;
  address: string;
  color: string;
  sort_order: number;
}

interface AppUser {
  id: string;
  username: string;
  email: string;
  last_sign_in_at: string | null;
  created_at: string;
  total_logins: number;
  today_logins: number;
  roles: string[];
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [stats, setStats] = useState({ total: 0, today: 0, week: 0 });

  useEffect(() => {
    const init = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/auth", { replace: true });
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: sess.session.user.id,
        _role: "admin",
      });
      if (!isAdmin) {
        toast.error("Sizda admin huquqi yoʻq");
        await supabase.auth.signOut();
        navigate("/auth", { replace: true });
        return;
      }
      setAuthorized(true);
      await loadAll();
      setLoading(false);
    };
    init();
  }, [navigate]);

  const loadAll = async () => {
    const [{ data: w }, { count: total }, { count: today }, { count: week }, usersRes] = await Promise.all([
      supabase.from("wallets").select("*").order("sort_order"),
      supabase.from("visits").select("*", { count: "exact", head: true }),
      supabase.from("visits").select("*", { count: "exact", head: true })
        .gte("created_at", new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
      supabase.from("visits").select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
      supabase.functions.invoke("admin-users"),
    ]);
    setWallets((w as Wallet[]) ?? []);
    setStats({ total: total ?? 0, today: today ?? 0, week: week ?? 0 });
    if (usersRes.data?.users) setUsers(usersRes.data.users);
  };

  const updateField = (id: string, field: keyof Wallet, value: string | number) => {
    setWallets((ws) => ws.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  const save = async (w: Wallet) => {
    const { error } = await supabase
      .from("wallets")
      .update({ name: w.name, symbol: w.symbol, address: w.address, color: w.color, sort_order: w.sort_order })
      .eq("id", w.id);
    if (error) toast.error(error.message);
    else toast.success(`${w.symbol} saqlandi`);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("wallets").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Oʻchirildi");
      await loadAll();
    }
  };

  const add = async () => {
    const { error } = await supabase.from("wallets").insert({
      name: "Yangi",
      symbol: "NEW",
      address: "address-here",
      color: "#888888",
      sort_order: wallets.length + 1,
    });
    if (error) toast.error(error.message);
    else await loadAll();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  const fmtDate = (s: string | null) =>
    s ? new Date(s).toLocaleString("uz-UZ", { dateStyle: "short", timeStyle: "short" }) : "—";

  if (loading || !authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-sm text-muted-foreground">Yuklanmoqda…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-hero">
      <div className="mx-auto max-w-4xl w-full px-5 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Admin</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Boshqaruv paneli</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid grid-cols-3 w-full bg-white/[0.04] border border-white/10 mb-6">
            <TabsTrigger value="stats"><BarChart3 className="h-3.5 w-3.5 mr-1.5" />Statistika</TabsTrigger>
            <TabsTrigger value="users"><Users className="h-3.5 w-3.5 mr-1.5" />Userlar</TabsTrigger>
            <TabsTrigger value="wallets"><WalletIcon className="h-3.5 w-3.5 mr-1.5" />Wallets</TabsTrigger>
          </TabsList>

          {/* STATS */}
          <TabsContent value="stats" className="space-y-4 mt-0">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Jami tashriflar", value: stats.total },
                { label: "Bugun", value: stats.today },
                { label: "7 kun", value: stats.week },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">{s.label}</div>
                  <div className="font-display text-3xl font-semibold tabular-nums mt-2">{s.value}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* USERS */}
          <TabsContent value="users" className="mt-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Foydalanuvchilar ({users.length})</h2>
              </div>
              <div className="divide-y divide-white/5">
                {users.length === 0 && (
                  <div className="p-5 text-center text-xs text-muted-foreground">Foydalanuvchilar yoʻq</div>
                )}
                {users.map((u) => (
                  <div key={u.id} className="px-5 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-semibold uppercase shrink-0">
                      {u.username[0] ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate">{u.username}</span>
                        {u.roles.includes("admin") && (
                          <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-success/20 text-success font-semibold">admin</span>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground truncate">{u.email}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                        Oxirgi kirish: {fmtDate(u.last_sign_in_at)}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Jami / Bugun</div>
                      <div className="font-display text-sm font-semibold tabular-nums">
                        {u.total_logins} <span className="text-muted-foreground/50">/</span> {u.today_logins}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-white/5 text-[10px] text-muted-foreground/60">
                Parollar bcrypt bilan shifrlangan va qaytarib boʻlmaydi — bu xavfsizlik talabi.
              </div>
            </div>
          </TabsContent>

          {/* WALLETS */}
          <TabsContent value="wallets" className="mt-0">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Donate manzillari</h2>
                <Button size="sm" variant="outline" onClick={add}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Qoʻshish
                </Button>
              </div>
              <div className="space-y-3">
                {wallets.map((w) => (
                  <div key={w.id} className="rounded-xl border border-white/5 bg-background/30 p-3 space-y-2">
                    <div className="grid grid-cols-12 gap-2">
                      <Input className="col-span-5" placeholder="Nomi" value={w.name} onChange={(e) => updateField(w.id, "name", e.target.value)} />
                      <Input className="col-span-3" placeholder="Symbol" value={w.symbol} onChange={(e) => updateField(w.id, "symbol", e.target.value)} />
                      <Input className="col-span-2" type="color" value={w.color} onChange={(e) => updateField(w.id, "color", e.target.value)} />
                      <Input className="col-span-2" type="number" value={w.sort_order} onChange={(e) => updateField(w.id, "sort_order", Number(e.target.value))} />
                    </div>
                    <Input placeholder="Manzil" value={w.address} onChange={(e) => updateField(w.id, "address", e.target.value)} className="font-mono text-xs" />
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => remove(w.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => save(w)}>
                        <Save className="h-3.5 w-3.5 mr-1" /> Saqlash
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;
