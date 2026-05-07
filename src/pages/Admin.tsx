import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LogOut, Trash2, Plus, Save, Eye } from "lucide-react";

interface Wallet {
  id: string;
  name: string;
  symbol: string;
  address: string;
  color: string;
  sort_order: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
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
    const [{ data: w }, { count: total }, { count: today }, { count: week }] = await Promise.all([
      supabase.from("wallets").select("*").order("sort_order"),
      supabase.from("visits").select("*", { count: "exact", head: true }),
      supabase.from("visits").select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 86400000).toISOString()),
      supabase.from("visits").select("*", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    ]);
    setWallets((w as Wallet[]) ?? []);
    setStats({ total: total ?? 0, today: today ?? 0, week: week ?? 0 });
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

  if (loading || !authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-sm text-muted-foreground">Yuklanmoqda…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-gradient-hero">
      <div className="mx-auto max-w-3xl w-full px-5 py-6">
        <header className="flex items-center justify-between mb-6">
          <h1 className="font-display text-2xl font-semibold tracking-tight">Admin Panel</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}>
              <Eye className="h-4 w-4 mr-1" /> Sayt
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" /> Chiqish
            </Button>
          </div>
        </header>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Jami tashriflar", value: stats.total },
            { label: "Bugun", value: stats.today },
            { label: "7 kunda", value: stats.week },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70">{s.label}</div>
              <div className="font-display text-2xl font-semibold tabular-nums mt-1">{s.value}</div>
            </div>
          ))}
        </section>

        {/* Wallets */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Donate manzillari</h2>
            <Button size="sm" onClick={add}>
              <Plus className="h-4 w-4 mr-1" /> Qoʻshish
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
                  <Button variant="outline" size="sm" onClick={() => remove(w.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" onClick={() => save(w)}>
                    <Save className="h-4 w-4 mr-1" /> Saqlash
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Admin;
