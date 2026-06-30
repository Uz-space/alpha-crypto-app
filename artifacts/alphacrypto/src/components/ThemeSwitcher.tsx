import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { THEMES, applyTheme, getStoredTheme } from "@/lib/themes";

export const ThemeSwitcher = () => {
  const [current, setCurrent] = useState<string>(getStoredTheme());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    applyTheme(current);
  }, [current]);

  const pick = (id: string) => {
    setCurrent(id);
    applyTheme(id);
    setTimeout(() => setOpen(false), 200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          aria-label="Theme"
          className="h-11 w-11 rounded-full bg-foreground flex items-center justify-center transition"
        >
          <Palette className="h-5 w-5 text-background" strokeWidth={2.5} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-sm rounded-3xl border-white/10 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-base">Mavzu tanlang</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {THEMES.map((t) => {
            const active = t.id === current;
            return (
              <button
                key={t.id}
                onClick={() => pick(t.id)}
                className={`relative rounded-2xl border p-3 text-left transition ${
                  active ? "border-foreground/60 bg-white/[0.06]" : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex gap-1 mb-2">
                  {t.preview.map((c, i) => (
                    <span
                      key={i}
                      className="h-5 w-5 rounded-full ring-1 ring-white/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-tight">{t.name}</span>
                  {active && <Check className="h-3.5 w-3.5 text-foreground" strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
