"use client";

import React from "react";
import { User } from "@supabase/supabase-js";
import { Lang, UserProfile, ElementInfo, ThemeColors, Translation } from "@/lib/types";
import OracleChat from "./OracleChat";

interface Props {
  lang: Lang;
  userProfile: UserProfile | null;
  tempProfile: UserProfile;
  onTempProfileChange: (p: UserProfile) => void;
  onProfileSubmit: (p: UserProfile) => void;
  luckyElement: ElementInfo;
  activeTheme: ThemeColors;
  t: Translation;
  user: User | null;
  onLogin: () => void;
}

export default function AgentTab({
  lang, userProfile, tempProfile, onTempProfileChange, onProfileSubmit,
  luckyElement, activeTheme, t, user, onLogin,
}: Props) {
  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
        <div className="text-9xl mb-10 drop-shadow-2xl">🔮</div>
        <h2 className="text-3xl font-black mb-10 text-center">{t.oracleGuide}</h2>
        <form
          onSubmit={e => { e.preventDefault(); onProfileSubmit(tempProfile); }}
          className="w-full max-w-sm space-y-6"
        >
          <input
            type="text"
            placeholder={t.nameLabel}
            className="w-full px-8 py-6 rounded-3xl bg-white/5 border border-white/10 font-black text-xl focus:ring-4 focus:ring-blue-500/20 outline-none"
            value={tempProfile.name}
            onChange={e => onTempProfileChange({ ...tempProfile, name: e.target.value })}
            required
          />
          <input
            type="date"
            className="w-full px-8 py-6 rounded-3xl bg-white/5 border border-white/10 font-black text-xl focus:ring-4 focus:ring-blue-500/20 outline-none"
            value={tempProfile.birthDate}
            onChange={e => onTempProfileChange({ ...tempProfile, birthDate: e.target.value })}
            required
          />
          <button
            type="submit"
            className={`w-full py-6 rounded-[2.5rem] ${activeTheme.primary} text-white font-black text-xl uppercase tracking-widest shadow-2xl`}
          >
            {t.startOracle}
          </button>
        </form>
      </div>
    );
  }

  return (
    <OracleChat
      lang={lang}
      userProfile={userProfile}
      luckyElement={luckyElement}
      activeTheme={activeTheme}
      user={user}
      onLogin={onLogin}
    />
  );
}
