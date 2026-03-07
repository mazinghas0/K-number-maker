"use client";

import React from "react";
import { HistoryItem, ThemeColors, Translation } from "@/lib/types";
import { getBallColor } from "@/lib/fortuneEngine";

interface Props {
  history: HistoryItem[];
  activeTheme: ThemeColors;
  t: Translation;
  user: import("@supabase/supabase-js").User | null;
  onLogin: () => void;
}

export default function HistoryTab({ history, activeTheme, t, user, onLogin }: Props) {
  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500">
      <h2 className="text-4xl font-black italic px-4">{t.records}</h2>
      {!user ? (
        <div className="text-center py-20 bg-white/5 rounded-[3.5rem] p-10 space-y-8 border border-dashed border-white/10">
          <div className="text-7xl opacity-20">🔒</div>
          <p className="text-base font-bold text-gray-500 leading-relaxed">
            로그인하시면 클라우드에 영구적으로{"\n"}기록을 보관할 수 있습니다.
          </p>
          <button
            onClick={onLogin}
            className={`w-full py-5 ${activeTheme.primary} text-white font-black rounded-3xl uppercase text-sm tracking-widest hover:opacity-90 transition-all`}
          >
            Sign in with Google
          </button>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-40 text-gray-500 font-black italic bg-white/5 rounded-[3.5rem] border border-white/5 text-xl">
          {t.noRecords}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {history.map(h => (
            <div key={h.id} className={`${activeTheme.card} p-10 rounded-[3.5rem] border border-white/5 shadow-xl hover:shadow-2xl transition-all`}>
              <div className="flex justify-between items-center mb-8">
                <span className={`text-xs font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] ${activeTheme.primary} text-white shadow-md`}>
                  {h.lottery_name}
                </span>
                <span className="text-sm text-gray-500 font-bold">{h.timestamp}</span>
              </div>
              <div className="flex gap-4 flex-wrap">
                {h.numbers.map((n, idx) => (
                  <div key={idx} className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black shadow-lg ${getBallColor(n)}`}>
                    {n}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
