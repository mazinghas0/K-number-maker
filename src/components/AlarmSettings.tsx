"use client";

import React from "react";
import { Lang, AlarmsState, ThemeColors } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";

interface Props {
  lang: Lang;
  alarms: AlarmsState;
  activeTheme: ThemeColors;
  setAlarms: React.Dispatch<React.SetStateAction<AlarmsState>>;
}

export default function AlarmSettings({ lang, alarms, activeTheme, setAlarms }: Props) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
      <div className="px-4 space-y-2">
        <h2 className="text-4xl font-black italic tracking-tighter drop-shadow-md">{t.alarms}</h2>
        <p className="text-sm text-blue-500 uppercase font-black tracking-widest">Routine & Notifications</p>
      </div>

      <div className="space-y-6">
        <div className={`p-10 rounded-[3.5rem] ${activeTheme.card} border border-white/5 flex justify-between items-center shadow-xl`}>
          <div className="space-y-2">
            <p className="text-xl font-black text-white italic">Lotto Day Alarm</p>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Notify on drawing days</p>
          </div>
          <button 
            onClick={() => setAlarms(prev => ({ ...prev, lottoDay: !prev.lottoDay }))}
            className={`w-20 h-10 rounded-full transition-all relative ${alarms.lottoDay ? activeTheme.primary : 'bg-white/10'}`}
          >
            <div className={`absolute top-1 w-8 h-8 rounded-full bg-white transition-all ${alarms.lottoDay ? 'left-11' : 'left-1 shadow-md'}`}></div>
          </button>
        </div>

        <div className={`p-10 rounded-[3.5rem] ${activeTheme.card} border border-white/5 space-y-8 shadow-xl`}>
          <div className="flex justify-between items-center border-b border-white/5 pb-6">
            <div className="space-y-2">
              <p className="text-xl font-black text-white italic">Winning Check</p>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Daily result alert</p>
            </div>
            <button 
              onClick={() => setAlarms(prev => ({ ...prev, resultCheck: !prev.resultCheck }))}
              className={`w-20 h-10 rounded-full transition-all relative ${alarms.resultCheck ? activeTheme.primary : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-8 h-8 rounded-full bg-white transition-all ${alarms.resultCheck ? 'left-11' : 'left-1 shadow-md'}`}></div>
            </button>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-xs font-black text-blue-500 uppercase tracking-[0.2em]">Notification Time</p>
            <input 
              type="time" 
              className="w-full bg-black/20 border border-white/10 rounded-2xl p-6 font-black text-3xl text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all appearance-none"
              value={alarms.time}
              onChange={(e) => setAlarms(prev => ({ ...prev, time: e.target.value }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
