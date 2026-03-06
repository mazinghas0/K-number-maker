import { LotteryPreset, ThemeType, ThemeColors } from "./types";

export const LOTTERY_PRESETS: LotteryPreset[] = [
  { id: "k-lotto", name: "K-Lotto", count: 6, max: 45, country: "🇰🇷", defaultLang: "ko" },
  { id: "powerball", name: "Powerball", count: 5, max: 69, country: "🇺🇸", defaultLang: "en" },
  { id: "euromillions", name: "EuroMillions", count: 5, max: 50, country: "🇪🇺", defaultLang: "en" },
  { id: "loto6", name: "Loto 6", count: 6, max: 43, country: "🇯🇵", defaultLang: "ja" },
  { id: "custom", name: "Custom", count: 6, max: 45, country: "⚙️", defaultLang: "en" },
];

export const THEMES: Record<ThemeType, ThemeColors> = {
  dark: { bg: "bg-black", text: "text-white", primary: "bg-blue-600", accent: "text-blue-400", card: "bg-neutral-900" },
  gold: { bg: "bg-[#1a0f00]", text: "text-[#f3e5ab]", primary: "bg-[#d4af37]", accent: "text-[#ffd700]", card: "bg-[#2d1b00]" },
  paper: { bg: "bg-[#f4f1ea]", text: "text-[#2c2c2c]", primary: "bg-[#4a5d23]", accent: "text-[#6b8e23]", card: "bg-[#ffffff]" },
  aurora: { bg: "bg-slate-950", text: "text-cyan-50", primary: "bg-fuchsia-600", accent: "text-emerald-400", card: "bg-slate-900/80" },
};

export const THEME_PREVIEWS: Record<ThemeType, string> = {
  dark: "#2563eb",
  gold: "#d4af37",
  paper: "#4a5d23",
  aurora: "#c026d3",
};
