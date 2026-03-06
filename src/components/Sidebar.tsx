"use client";

import React from "react";
import { Lang, TabType, ThemeType, ThemeColors, Translation } from "@/lib/types";
import { THEMES, THEME_PREVIEWS } from "@/lib/constants";

interface Props {
  show: boolean;
  onClose: () => void;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
  activeTheme: ThemeColors;
  t: Translation;
}

const TAB_ICONS: Record<string, string> = {
  generate: "🎲", history: "📜", agent: "☯️", board: "🏛️", alarms: "⏰",
};

export default function Sidebar({ show, onClose, activeTab, onTabChange, theme, onThemeChange, activeTheme, t }: Props) {
  if (!show) return null;

  const handleTab = (tab: TabType) => {
    onTabChange(tab);
    localStorage.setItem("k-fortune-tab", tab);
    onClose();
  };

  const tabLabel = (tab: string) => {
    const map: Record<string, string> = {
      generate: t.invoke, history: t.records, agent: t.oracle, board: t.board, alarms: t.alarms,
    };
    return map[tab] || tab;
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className={`relative w-80 ${activeTheme.card} h-full shadow-2xl p-10 flex flex-col`}>
        <div className="flex justify-between items-center mb-12">
          <span className="text-3xl font-black italic">{t.menu}</span>
          <button onClick={onClose} className="text-3xl hover:text-red-500">✕</button>
        </div>

        <div className="flex-1 space-y-4">
          {["generate", "history", "agent", "board", "alarms"].map(tab => (
            <button
              key={tab}
              onClick={() => handleTab(tab as TabType)}
              className={`w-full flex items-center gap-5 px-8 py-5 rounded-[2.5rem] font-black text-xl transition-all ${
                activeTab === tab ? activeTheme.primary + " text-white shadow-2xl scale-105" : "hover:bg-white/5 opacity-60"
              }`}
            >
              <span className="text-3xl">{TAB_ICONS[tab]}</span>
              <span>{tabLabel(tab)}</span>
            </button>
          ))}
        </div>

        <div className="pt-10 border-t border-white/10">
          <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-6">{t.themeLabel}</p>
          <div className="grid grid-cols-4 gap-4 bg-black/5 dark:bg-white/5 p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-inner">
            {(["dark", "gold", "paper", "aurora"] as ThemeType[]).map(th => (
              <button
                key={th}
                onClick={() => { onThemeChange(th); localStorage.setItem("k-fortune-theme", th); }}
                className="flex flex-col items-center gap-3 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-full border-4 shadow-xl transition-all relative overflow-hidden flex items-center justify-center ${
                    theme === th ? "border-blue-500 scale-110" : "border-transparent opacity-60 group-hover:opacity-100"
                  }`}
                  style={{ backgroundColor: THEMES[th].bg.includes("#") ? THEMES[th].bg.match(/#[a-f0-9]+/i)?.[0] : "#222" }}
                >
                  <div className="w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: THEME_PREVIEWS[th] }} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-tighter ${theme === th ? "opacity-100" : "opacity-40"}`}>{th}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
