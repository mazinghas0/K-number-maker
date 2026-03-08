"use client";

import React from "react";
import { LotteryPreset, ThemeColors, Translation, AnimPhase, FortuneType, Lang, IlginData } from "@/lib/types";
import { LOTTERY_PRESETS } from "@/lib/constants";
import { getBallColor } from "@/lib/fortuneEngine";
import FortuneMBTI from "@/components/FortuneMBTI";
import LuckyTwins from "@/components/LuckyTwins";
import TimeCapsule from "@/components/TimeCapsule";
import IlginCard from "@/components/IlginCard";

interface Props {
  selectedLotto: LotteryPreset;
  onLottoChange: (lotto: LotteryPreset) => void;
  customSettings: { count: number; max: number };
  onCustomChange: (settings: { count: number; max: number }) => void;
  numbers: number[];
  shuffledNums: number[];
  revealCount: number;
  animPhase: AnimPhase;
  isGenerating: boolean;
  activeTheme: ThemeColors;
  t: Translation;
  lang: Lang;
  fortuneType: FortuneType | null;
  ilginData: IlginData | null;
  onGenerate: () => void;
}

export default function GenerateTab({
  selectedLotto, onLottoChange, customSettings, onCustomChange,
  numbers, shuffledNums, revealCount, animPhase, isGenerating, activeTheme, t, lang, fortuneType, ilginData, onGenerate,
}: Props) {
  const displayNums: number[] = animPhase === "sort" ? numbers : shuffledNums.slice(0, revealCount);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* 복권 종류 선택 — 가로 스크롤 pill */}
      <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide -mx-1 px-1">
        {LOTTERY_PRESETS.map(l => {
          const isSelected = selectedLotto.id === l.id;
          return (
            <button
              key={l.id}
              onClick={() => onLottoChange(l)}
              className={`flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full border transition-all duration-300 ${
                isSelected
                  ? activeTheme.primary + " border-transparent text-white"
                  : "bg-white/8 border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200"
              }`}
              style={{
                boxShadow: isSelected
                  ? "0 8px 24px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"
                  : "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              <span className="text-xl leading-none">{l.country}</span>
              <span className="text-sm font-black uppercase tracking-wider whitespace-nowrap">{l.name}</span>
            </button>
          );
        })}
      </div>

      {/* 커스텀 설정 */}
      {selectedLotto.id === "custom" && (
        <div
          className={`${activeTheme.card} p-8 rounded-[2.5rem] border border-white/5 space-y-8 animate-in zoom-in duration-300`}
          style={{
            boxShadow: "0 10px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{t.numCount}</span>
              <span className="text-2xl font-black italic">{customSettings.count}</span>
            </div>
            <input
              type="range" min="1" max="10" step="1" value={customSettings.count}
              onChange={e => onCustomChange({ ...customSettings, count: parseInt(e.target.value) })}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{t.range} (MAX)</span>
              <span className="text-2xl font-black italic">{customSettings.max}</span>
            </div>
            <input
              type="range" min="10" max="99" step="1" value={customSettings.max}
              onChange={e => onCustomChange({ ...customSettings, max: parseInt(e.target.value) })}
              className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      )}

      {/* 공 표시 영역 */}
      <section
        className={`${activeTheme.card} rounded-[3rem] p-10 min-h-[200px] flex flex-col items-center justify-center border border-white/5 relative overflow-hidden`}
        style={{
          boxShadow:
            "inset 0 3px 30px rgba(0,0,0,0.35), inset 0 -1px 0 rgba(255,255,255,0.03), 0 20px 50px rgba(0,0,0,0.2)",
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.08) 0%, transparent 65%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.12) 0%, transparent 100%)" }}
        />

        {displayNums.length === 0 ? (
          <div className="text-[90px] opacity-15 animate-float drop-shadow-2xl select-none">🔮</div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 relative z-10">
            {displayNums.map((num) => {
              const sortedIdx = numbers.indexOf(num);
              const animStyle: React.CSSProperties =
                animPhase === "sort"
                  ? { animation: `ballBounce 0.55s cubic-bezier(0.34,1.56,0.64,1) ${sortedIdx * 0.07}s both` }
                  : { animation: "ballPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both" };

              const ballStyle: React.CSSProperties = {
                boxShadow:
                  "inset -5px -7px 14px rgba(0,0,0,0.38), inset 3px 4px 8px rgba(255,255,255,0.32), 0 18px 38px rgba(0,0,0,0.48), 0 5px 10px rgba(0,0,0,0.22)",
                ...animStyle,
              };

              return (
                <div
                  key={num}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center ${getBallColor(num)}`}
                  style={ballStyle}
                >
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 34% 27%, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.18) 38%, transparent 62%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 66% 73%, rgba(0,0,0,0.32) 0%, transparent 52%)",
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 18% 55%, rgba(255,255,255,0.12) 0%, transparent 35%)",
                    }}
                  />
                  <span className="relative z-10 text-lg font-black drop-shadow-sm select-none">
                    {num}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 오늘의 일진 카드 */}
      {animPhase === "sort" && numbers.length > 0 && ilginData && (
        <IlginCard
          ilginData={ilginData}
          lang={lang}
          activeTheme={activeTheme}
          t={t}
        />
      )}

      {/* 운명 MBTI 카드 */}
      {animPhase === "sort" && numbers.length > 0 && fortuneType && (
        <FortuneMBTI
          fortuneType={fortuneType}
          lang={lang}
          numbers={numbers}
          activeTheme={activeTheme}
          t={t}
        />
      )}

      {/* 운명의 쌍둥이 (Phase 4) */}
      {animPhase === "sort" && numbers.length > 0 && (
        <LuckyTwins numbers={numbers} t={t} />
      )}

      {/* 타임캡슐 (Phase 3) */}
      {numbers.length > 0 && (
        <TimeCapsule numbers={numbers} t={t} activeTheme={activeTheme} />
      )}

      {/* 생성 버튼 */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`w-full py-8 rounded-[2.5rem] font-black text-2xl ${activeTheme.primary} text-white hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em]`}
        style={{
          boxShadow: isGenerating
            ? "none"
            : "0 16px 40px rgba(37,99,235,0.38), 0 6px 16px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -2px 0 rgba(0,0,0,0.15)",
          transform: isGenerating ? "scale(0.98)" : "scale(1)",
        }}
      >
        {isGenerating ? t.invoking : t.generateLuck}
      </button>
    </div>
  );
}
