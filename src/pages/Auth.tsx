import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = username.includes("@") ? username : `${username}@admin.local`;
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Xatolik");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-gradient-hero flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-5">
          <div className="h-12 w-12 rounded-full bg-foreground flex items-center justify-center mb-3">
            <Shield className="h-6 w-6 text-background" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight">Admin kirish</h1>
          <p className="text-xs text-muted-foreground mt-1">Faqat administratorlar uchun</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="username" className="text-xs">Username</Label>
            <Input id="username" type="text" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Parol</Label>
            <Input id="password" type="password" autoComplete="current-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "..." : "Kirish"}
          </Button>
        </form>

        <button
          onClick={() => navigate("/")}
          className="w-full text-center text-[10px] text-muted-foreground/60 mt-2 hover:text-foreground transition-colors"
        >
          ← Bosh sahifa
        </button>
      </div>
    </main>
  );
};

export default Auth;
