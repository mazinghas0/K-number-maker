"use client";

import React from "react";
import { Lang, LotteryPreset, ThemeColors, Translation } from "@/lib/types";
import { LOTTERY_PRESETS } from "@/lib/constants";
import { getBallColor } from "@/lib/fortuneEngine";

interface Props {
  lang: Lang;
  selectedLotto: LotteryPreset;
  onLottoChange: (lotto: LotteryPreset) => void;
  customSettings: { count: number; max: number };
  onCustomChange: (settings: { count: number; max: number }) => void;
  numbers: number[];
  visibleCount: number;
  isGenerating: boolean;
  activeTheme: ThemeColors;
  t: Translation;
  onGenerate: () => void;
}

export default function GenerateTab({
  selectedLotto, onLottoChange, customSettings, onCustomChange,
  numbers, visibleCount, isGenerating, activeTheme, t, onGenerate,
}: Props) {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 gap-5">
        {LOTTERY_PRESETS.map(l => (
          <button
            key={l.id}
            onClick={() => onLottoChange(l)}
            className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.03] shadow-lg flex flex-col items-center gap-3 ${
              selectedLotto.id === l.id
                ? activeTheme.primary + " border-transparent text-white shadow-blue-500/20"
                : "bg-white/5 border-white/10 text-gray-500"
            }`}
          >
            <span className="text-5xl drop-shadow-md">{l.country}</span>
            <p className="text-sm font-black uppercase tracking-widest">{l.name}</p>
          </button>
        ))}
      </div>

      {selectedLotto.id === "custom" && (
        <div className={`${activeTheme.card} p-10 rounded-[3rem] border border-white/5 space-y-10 animate-in zoom-in duration-300`}>
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{t.numCount}</span>
              <span className="text-3xl font-black italic">{customSettings.count}</span>
            </div>
            <input
              type="range" min="1" max="10" step="1" value={customSettings.count}
              onChange={e => onCustomChange({ ...customSettings, count: parseInt(e.target.value) })}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{t.range} (MAX)</span>
              <span className="text-3xl font-black italic">{customSettings.max}</span>
            </div>
            <input
              type="range" min="10" max="99" step="1" value={customSettings.max}
              onChange={e => onCustomChange({ ...customSettings, max: parseInt(e.target.value) })}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      )}

      <section className={`${activeTheme.card} rounded-[4rem] p-14 min-h-[360px] flex flex-col items-center justify-center border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.2)] relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]" />
        {numbers.length === 0 ? (
          <div className="text-[120px] opacity-10 animate-float drop-shadow-2xl">☯️</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 relative z-10">
            {numbers.map((n, i) => (
              <div
                key={i}
                className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-2xl transition-all duration-500 ${
                  i < visibleCount ? "animate-pop-bounce scale-100 opacity-100" : "scale-0 opacity-0 hidden"
                } ${getBallColor(n)}`}
                style={{ boxShadow: "inset -4px -4px 10px rgba(0,0,0,0.3), 0 15px 30px rgba(0,0,0,0.4)" }}
              >
                {n}
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`w-full py-10 rounded-[3rem] font-black text-3xl ${activeTheme.primary} text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em]`}
      >
        {isGenerating ? t.invoking : t.generateLuck}
      </button>
    </div>
  );
}
