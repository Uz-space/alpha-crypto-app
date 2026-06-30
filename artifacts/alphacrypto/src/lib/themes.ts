// Theme system — 8 themes. Default: mono (pure black). Colours sourced from user palette.
export interface Theme {
  id: string;
  name: string;
  preview: string[];
  vars: Record<string, string>;
}

export const THEMES: Theme[] = [
  // ── 1. MONO (default) ──────────────────────────────────────────────────────
  {
    id: "mono",
    name: "Mono",
    preview: ["#0a0a0a", "#1c1c1c", "#ffffff"],
    vars: {
      "--background": "0 0% 4%",
      "--foreground": "0 0% 98%",
      "--card": "0 0% 7%",
      "--card-foreground": "0 0% 98%",
      "--popover": "0 0% 7%",
      "--popover-foreground": "0 0% 98%",
      "--primary": "0 0% 98%",
      "--primary-foreground": "0 0% 4%",
      "--secondary": "0 0% 12%",
      "--secondary-foreground": "0 0% 98%",
      "--muted": "0 0% 12%",
      "--muted-foreground": "0 0% 60%",
      "--accent": "0 0% 18%",
      "--accent-foreground": "0 0% 98%",
      "--success": "142 71% 55%",
      "--danger": "0 84% 62%",
      "--border": "0 0% 14%",
      "--input": "0 0% 14%",
      "--ring": "0 0% 80%",
      "--gradient-hero": "radial-gradient(ellipse 200% 100% at 50% 0%, hsl(0 0% 16%) 0%, hsl(0 0% 4%) 70%)",
      "--gradient-card": "linear-gradient(180deg, hsl(0 0% 9%) 0%, hsl(0 0% 6%) 100%)",
      "--shadow-glow": "0 20px 60px -20px hsl(0 0% 0% / 0.7)",
    },
  },

  // ── 2. SILVER ──────────────────────────────────────────────────────────────
  {
    id: "silver",
    name: "Silver",
    preview: ["#1a1e24", "#94a3b8", "#e2e8f0"],
    vars: {
      "--background": "220 18% 10%",
      "--foreground": "210 30% 95%",
      "--card": "220 16% 14%",
      "--card-foreground": "210 30% 95%",
      "--popover": "220 16% 14%",
      "--popover-foreground": "210 30% 95%",
      "--primary": "210 20% 80%",
      "--primary-foreground": "220 18% 10%",
      "--secondary": "220 14% 20%",
      "--secondary-foreground": "210 30% 95%",
      "--muted": "220 14% 20%",
      "--muted-foreground": "210 15% 70%",
      "--accent": "215 25% 65%",
      "--accent-foreground": "220 18% 10%",
      "--success": "142 71% 55%",
      "--danger": "0 84% 62%",
      "--border": "220 14% 24%",
      "--input": "220 14% 24%",
      "--ring": "210 20% 75%",
      "--gradient-hero": "radial-gradient(ellipse 200% 100% at 50% 0%, hsl(215 25% 26%) 0%, hsl(220 18% 8%) 70%)",
      "--gradient-card": "linear-gradient(180deg, hsl(220 16% 16%) 0%, hsl(220 18% 12%) 100%)",
      "--shadow-glow": "0 20px 60px -15px hsl(215 25% 50% / 0.4)",
    },
  },

  // ── 3. DARK CYAN ───────────────────────────────────────────────────────────
  {
    id: "dark-cyan",
    name: "Dark Cyan",
    preview: ["#042a2e", "#00bcd4", "#80deea"],
    vars: {
      "--background": "188 70% 8%",
      "--foreground": "185 60% 97%",
      "--card": "188 60% 12%",
      "--card-foreground": "185 60% 97%",
      "--popover": "188 60% 12%",
      "--popover-foreground": "185 60% 97%",
      "--primary": "187 100% 55%",
      "--primary-foreground": "188 70% 8%",
      "--secondary": "188 48% 18%",
      "--secondary-foreground": "185 60% 97%",
      "--muted": "188 48% 18%",
      "--muted-foreground": "185 38% 82%",
      "--accent": "175 100% 48%",
      "--accent-foreground": "188 70% 8%",
      "--success": "142 85% 58%",
      "--danger": "0 92% 66%",
      "--border": "188 48% 22%",
      "--input": "188 48% 22%",
      "--ring": "187 100% 55%",
      "--gradient-hero": "radial-gradient(ellipse 200% 100% at 50% 0%, hsl(187 95% 28%) 0%, hsl(188 70% 7%) 70%)",
      "--gradient-card": "linear-gradient(180deg, hsl(188 60% 14%) 0%, hsl(188 70% 10%) 100%)",
      "--shadow-glow": "0 20px 60px -15px hsl(187 100% 45% / 0.55)",
    },
  },

  // ── 4. DARK MAGENTA ────────────────────────────────────────────────────────
  {
    id: "dark-magenta",
    name: "Dark Magenta",
    preview: ["#2a0828", "#c000c0", "#f0a0f0"],
    vars: {
      "--background": "302 65% 8%",
      "--foreground": "300 40% 97%",
      "--card": "302 55% 12%",
      "--card-foreground": "300 40% 97%",
      "--popover": "302 55% 12%",
      "--popover-foreground": "300 40% 97%",
      "--primary": "300 100% 58%",
      "--primary-foreground": "302 65% 8%",
      "--secondary": "302 42% 18%",
      "--secondary-foreground": "300 40% 97%",
      "--muted": "302 42% 18%",
      "--muted-foreground": "300 28% 80%",
      "--accent": "320 95% 65%",
      "--accent-foreground": "302 65% 8%",
      "--success": "142 85% 58%",
      "--danger": "0 92% 66%",
      "--border": "302 42% 22%",
      "--input": "302 42% 22%",
      "--ring": "300 100% 58%",
      "--gradient-hero": "radial-gradient(ellipse 200% 100% at 50% 0%, hsl(300 95% 28%) 0%, hsl(302 65% 7%) 70%)",
      "--gradient-card": "linear-gradient(180deg, hsl(302 55% 14%) 0%, hsl(302 65% 10%) 100%)",
      "--shadow-glow": "0 20px 60px -15px hsl(300 100% 50% / 0.55)",
    },
  },

  // ── 5. DARK GREEN ──────────────────────────────────────────────────────────
  {
    id: "dark-green",
    name: "Dark Green",
    preview: ["#042a10", "#00a040", "#80e0a0"],
    vars: {
      "--background": "140 65% 7%",
      "--foreground": "138 50% 97%",
      "--card": "140 55% 11%",
      "--card-foreground": "138 50% 97%",
      "--popover": "140 55% 11%",
      "--popover-foreground": "138 50% 97%",
      "--primary": "138 100% 48%",
      "--primary-foreground": "140 65% 7%",
      "--secondary": "140 45% 17%",
      "--secondary-foreground": "138 50% 97%",
      "--muted": "140 45% 17%",
      "--muted-foreground": "138 32% 80%",
      "--accent": "155 90% 50%",
      "--accent-foreground": "140 65% 7%",
      "--success": "142 85% 60%",
      "--danger": "0 92% 66%",
      "--border": "140 45% 21%",
      "--input": "140 45% 21%",
      "--ring": "138 100% 48%",
      "--gradient-hero": "radial-gradient(ellipse 200% 100% at 50% 0%, hsl(138 90% 24%) 0%, hsl(140 65% 6%) 70%)",
      "--gradient-card": "linear-gradient(180deg, hsl(140 55% 13%) 0%, hsl(140 65% 9%) 100%)",
      "--shadow-glow": "0 20px 60px -15px hsl(138 100% 40% / 0.55)",
    },
  },

  // ── 6. DARK ORANGE ─────────────────────────────────────────────────────────
  {
    id: "dark-orange",
    name: "Dark Orange",
    preview: ["#2a1000", "#e06000", "#ffb060"],
    vars: {
      "--background": "24 80% 7%",
      "--foreground": "28 60% 97%",
      "--card": "24 68% 11%",
      "--card-foreground": "28 60% 97%",
      "--popover": "24 68% 11%",
      "--popover-foreground": "28 60% 97%",
      "--primary": "28 100% 58%",
      "--primary-foreground": "24 80% 7%",
      "--secondary": "24 52% 17%",
      "--secondary-foreground": "28 60% 97%",
      "--muted": "24 52% 17%",
      "--muted-foreground": "28 38% 80%",
      "--accent": "40 100% 58%",
      "--accent-foreground": "24 80% 7%",
      "--success": "142 85% 58%",
      "--danger": "0 92% 66%",
      "--border": "24 52% 21%",
      "--input": "24 52% 21%",
      "--ring": "28 100% 58%",
      "--gradient-hero": "radial-gradient(ellipse 200% 100% at 50% 0%, hsl(28 100% 30%) 0%, hsl(24 80% 6%) 70%)",
      "--gradient-card": "linear-gradient(180deg, hsl(24 68% 13%) 0%, hsl(24 80% 9%) 100%)",
      "--shadow-glow": "0 20px 60px -15px hsl(28 100% 48% / 0.55)",
    },
  },

  // ── 7. DARK BLUE ───────────────────────────────────────────────────────────
  {
    id: "dark-blue",
    name: "Dark Blue",
    preview: ["#040828", "#0000c0", "#6060f0"],
    vars: {
      "--background": "236 75% 8%",
      "--foreground": "232 55% 97%",
      "--card": "236 65% 12%",
      "--card-foreground": "232 55% 97%",
      "--popover": "236 65% 12%",
      "--popover-foreground": "232 55% 97%",
      "--primary": "224 100% 65%",
      "--primary-foreground": "236 75% 8%",
      "--secondary": "236 52% 18%",
      "--secondary-foreground": "232 55% 97%",
      "--muted": "236 52% 18%",
      "--muted-foreground": "232 38% 82%",
      "--accent": "212 100% 62%",
      "--accent-foreground": "236 75% 8%",
      "--success": "142 85% 58%",
      "--danger": "0 92% 66%",
      "--border": "236 52% 22%",
      "--input": "236 52% 22%",
      "--ring": "224 100% 65%",
      "--gradient-hero": "radial-gradient(ellipse 200% 100% at 50% 0%, hsl(224 100% 30%) 0%, hsl(236 75% 7%) 70%)",
      "--gradient-card": "linear-gradient(180deg, hsl(236 65% 14%) 0%, hsl(236 75% 10%) 100%)",
      "--shadow-glow": "0 20px 60px -15px hsl(224 100% 55% / 0.55)",
    },
  },

  // ── 8. DARK RED ────────────────────────────────────────────────────────────
  {
    id: "dark-red",
    name: "Dark Red",
    preview: ["#280404", "#b00000", "#f06060"],
    vars: {
      "--background": "0 70% 7%",
      "--foreground": "0 40% 97%",
      "--card": "0 58% 11%",
      "--card-foreground": "0 40% 97%",
      "--popover": "0 58% 11%",
      "--popover-foreground": "0 40% 97%",
      "--primary": "0 100% 62%",
      "--primary-foreground": "0 70% 7%",
      "--secondary": "0 46% 17%",
      "--secondary-foreground": "0 40% 97%",
      "--muted": "0 46% 17%",
      "--muted-foreground": "0 28% 80%",
      "--accent": "18 95% 60%",
      "--accent-foreground": "0 70% 7%",
      "--success": "142 85% 58%",
      "--danger": "0 92% 66%",
      "--border": "0 46% 21%",
      "--input": "0 46% 21%",
      "--ring": "0 100% 62%",
      "--gradient-hero": "radial-gradient(ellipse 200% 100% at 50% 0%, hsl(0 95% 28%) 0%, hsl(0 70% 6%) 70%)",
      "--gradient-card": "linear-gradient(180deg, hsl(0 58% 13%) 0%, hsl(0 70% 9%) 100%)",
      "--shadow-glow": "0 20px 60px -15px hsl(0 100% 50% / 0.55)",
    },
  },
];

const STORAGE_KEY = "app-theme";

export const getStoredTheme = (): string => {
  if (typeof window === "undefined") return "mono";
  return localStorage.getItem(STORAGE_KEY) || "mono";
};

export const applyTheme = (id: string) => {
  const theme = THEMES.find((t) => t.id === id) ?? THEMES[0];
  const root = document.documentElement;
  Object.entries(theme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  localStorage.setItem(STORAGE_KEY, theme.id);
};
