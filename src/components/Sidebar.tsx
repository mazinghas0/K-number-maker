"use client";

import React from "react";
import { User } from "@supabase/supabase-js";
import { TabType, ThemeType, ThemeColors, Translation } from "@/lib/types";
import { THEMES, THEME_PREVIEWS } from "@/lib/constants";

type DisplayedTab = "generate" | "history" | "agent" | "board" | "alarms";

interface SidebarProps {
  show?: boolean;
  onClose?: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  activeTheme: ThemeColors;
  t: Translation;
  mode?: "overlay" | "permanent";
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const DISPLAYED_TABS: DisplayedTab[] = ["generate", "history", "agent", "board", "alarms"];

const TAB_ICONS: Record<DisplayedTab, string> = {
  generate: "🎲",
  history: "📜",
  agent: "🔮",
  board: "🏛️",
  alarms: "⏰",
};

const THEME_LIST: ThemeType[] = ["dark", "gold", "paper", "aurora"];

export default function Sidebar({
  show,
  onClose,
  activeTab,
  onTabChange,
  theme,
  onThemeChange,
  activeTheme,
  t,
  mode = "overlay",
  user,
  onLogin,
  onLogout,
}: SidebarProps) {
  if (mode === "overlay" && !show) return null;

  const TAB_LABELS: Record<DisplayedTab, string> = {
    generate: t.invoke,
    history: t.records,
    agent: t.oracle,
    board: t.board,
    alarms: t.alarms,
  };

  const handleTab = (tab: DisplayedTab) => {
    onTabChange(tab);
    localStorage.setItem("k-fortune-tab", tab);
    if (mode === "overlay") onClose?.();
  };

  const navItems = (
    <div className="flex-1 space-y-2 px-4 overflow-y-auto py-2">
      {DISPLAYED_TABS.map(tab => (
        <button
          key={tab}
          onClick={() => handleTab(tab)}
          className={`w-full flex items-center gap-4 px-6 py-4 rounded-[2rem] font-black text-lg transition-all ${
            activeTab === tab
              ? `${activeTheme.primary} text-white shadow-2xl scale-[1.03]`
              : "hover:bg-white/5 opacity-60 hover:opacity-100"
          }`}
        >
          <span className="text-2xl">{TAB_ICONS[tab]}</span>
          <span>{TAB_LABELS[tab]}</span>
        </button>
      ))}
    </div>
  );

  const themeSelector = (
    <div className="pt-6 border-t border-white/10 px-4 pb-6">
      <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-4 px-2">{t.themeLabel}</p>
      <div className="grid grid-cols-4 gap-3 bg-white/5 p-4 rounded-[2rem] border border-white/10">
        {THEME_LIST.map(th => (
          <button
            key={th}
            onClick={() => { onThemeChange(th); localStorage.setItem("k-fortune-theme", th); }}
            className="flex flex-col items-center gap-2 transition-all group"
          >
            <div
              className={`w-12 h-12 rounded-full border-4 shadow-xl transition-all flex items-center justify-center ${
                theme === th ? "border-blue-500 scale-110" : "border-transparent opacity-60 group-hover:opacity-100"
              }`}
              style={{ backgroundColor: THEMES[th].bg.match(/#[a-f0-9]+/i)?.[0] ?? "#222" }}
            >
              <div className="w-5 h-5 rounded-full shadow-md" style={{ backgroundColor: THEME_PREVIEWS[th] }} />
            </div>
            <span className={`text-[9px] font-black uppercase tracking-tighter ${theme === th ? "opacity-100" : "opacity-40"}`}>{th}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const authSection = (
    <div className="px-4 pb-6 pt-4 border-t border-white/10">
      {user ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <span className={`text-xs font-black uppercase truncate ${activeTheme.accent}`}>
              {user.user_metadata?.name ?? user.email?.split("@")[0] ?? "Seeker"}
            </span>
            <span className="text-[10px] text-gray-500 tracking-tight">{t.connected}</span>
          </div>
          <button
            onClick={onLogout}
            className="flex-shrink-0 w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center text-base hover:bg-red-500/20 hover:scale-105 transition-all"
            title={t.logout}
          >
            🚪
          </button>
        </div>
      ) : (
        <button
          onClick={onLogin}
          className={`w-full py-3 ${activeTheme.primary} text-white text-xs font-black rounded-2xl uppercase tracking-widest hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg`}
        >
          {t.login}
        </button>
      )}
    </div>
  );

  // --- Permanent (desktop) mode ---
  if (mode === "permanent") {
    return (
      <div className="flex flex-col h-full">
        <div className="px-8 pt-10 pb-6 flex-shrink-0">
          <h1 className="text-3xl font-black italic tracking-tighter">{t.title}</h1>
          <p className={`text-xs font-bold uppercase tracking-[0.3em] mt-1 ${activeTheme.accent}`}>{t.subtitle}</p>
        </div>
        {navItems}
        {themeSelector}
        {authSection}
      </div>
    );
  }

  // --- Overlay (mobile) mode ---
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-80 ${activeTheme.card} h-full shadow-2xl flex flex-col overflow-hidden`}>
        <div className="flex justify-between items-center px-8 pt-10 pb-6 flex-shrink-0">
          <span className="text-3xl font-black italic">{t.menu}</span>
          <button onClick={onClose} className="text-3xl hover:text-red-500 transition-colors">✕</button>
        </div>
        {navItems}
        {themeSelector}
        {authSection}
      </div>
    </div>
  );
}
