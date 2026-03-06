"use client";

import React from "react";
import { ElementInfo, UserProfile, ThemeColors, Translation } from "@/lib/types";
import { getBallColor } from "@/lib/fortuneEngine";

interface Props {
  numbers: number[];
  onClose: () => void;
  isGenerating: boolean;
  luckyElement: ElementInfo;
  userProfile: UserProfile | null;
  boardMessage: string;
  onBoardMessageChange: (msg: string) => void;
  onPostToBoard: () => void;
  activeTheme: ThemeColors;
  t: Translation;
}

export default function ShareModal({
  numbers, onClose, isGenerating, luckyElement, userProfile,
  boardMessage, onBoardMessageChange, onPostToBoard, activeTheme, t,
}: Props) {
  if (numbers.length === 0 || isGenerating) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={onClose} />
      <div className="relative w-full max-w-md bg-gradient-to-b from-neutral-900 to-black rounded-[4rem] shadow-[0_0_100px_rgba(212,175,55,0.2)] overflow-hidden border border-white/10 flex flex-col p-12 gap-10 animate-in zoom-in duration-500">
        <div className="text-center space-y-3">
          <h3 className="text-3xl font-black italic tracking-tight text-white">{t.shareTitle}</h3>
          <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.5em]">{t.subtitle}</p>
        </div>

        <div className={`relative p-10 rounded-[3rem] ${luckyElement.bg} border border-white/5 overflow-hidden text-center shadow-inner group`}>
          <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${luckyElement.bg}`} />
          <span className={`text-[160px] font-serif opacity-10 ${luckyElement.color} absolute left-1/2 -translate-x-1/2 -top-10 select-none`}>
            {luckyElement.symbol}
          </span>
          <div className="relative z-10 space-y-10">
            <div className="space-y-2">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                {userProfile?.name || "The Seeker"}&apos;s Destiny
              </p>
              <h4 className="text-2xl font-black text-white italic">{luckyElement.ilgan}</h4>
            </div>
            <div className="flex justify-center gap-4 flex-wrap">
              {numbers.map((num, i) => (
                <div
                  key={i}
                  className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black ${getBallColor(num)} shadow-[0_10px_20px_rgba(0,0,0,0.3)] transform transition-transform group-hover:scale-110`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                >
                  {num}
                </div>
              ))}
            </div>
            <p className="text-base font-bold italic text-white/70 leading-relaxed px-4">
              &quot;May the stars align and bring the celestial fortune to your path.&quot;
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <input
            type="text"
            placeholder={t.writeMessage}
            className="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-white text-base font-bold focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all placeholder:text-gray-600"
            value={boardMessage}
            onChange={e => onBoardMessageChange(e.target.value)}
          />
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-5 rounded-full bg-white/5 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              {t.close}
            </button>
            <button
              onClick={onPostToBoard}
              className="flex-[2] bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black py-5 rounded-full shadow-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all"
            >
              {t.postBoard}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
