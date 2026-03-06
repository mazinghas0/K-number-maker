"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Lang, TabType, ThemeType, HistoryItem, BoardItem, LotteryPreset, UserProfile, AlarmsState, ThemeColors } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { analyzeDestiny, getBallColor } from "@/lib/fortuneEngine";
import OracleChat from "@/components/OracleChat";
import FortuneBoard from "@/components/FortuneBoard";
import AlarmSettings from "@/components/AlarmSettings";

const LOTTERY_PRESETS: LotteryPreset[] = [
  { id: "k-lotto", name: "K-Lotto", count: 6, max: 45, country: "🇰🇷", defaultLang: "ko" },
  { id: "powerball", name: "Powerball", count: 5, max: 69, country: "🇺🇸", defaultLang: "en" },
  { id: "euromillions", name: "EuroMillions", count: 5, max: 50, country: "🇪🇺", defaultLang: "en" },
  { id: "loto6", name: "Loto 6", count: 6, max: 43, country: "🇯🇵", defaultLang: "ja" },
  { id: "custom", name: "Custom", count: 6, max: 45, country: "⚙️", defaultLang: "en" },
];

const THEMES: Record<ThemeType, ThemeColors> = {
  dark: { bg: "bg-black", text: "text-white", primary: "bg-blue-600", accent: "text-blue-400", card: "bg-neutral-900" },
  gold: { bg: "bg-[#1a0f00]", text: "text-[#f3e5ab]", primary: "bg-[#d4af37]", accent: "text-[#ffd700]", card: "bg-[#2d1b00]" },
  paper: { bg: "bg-[#f4f1ea]", text: "text-[#2c2c2c]", primary: "bg-[#4a5d23]", accent: "text-[#6b8e23]", card: "bg-[#ffffff]" },
  aurora: { bg: "bg-slate-950", text: "text-cyan-50", primary: "bg-fuchsia-600", accent: "text-emerald-400", card: "bg-slate-900/80" }
};

const THEME_PREVIEWS: Record<ThemeType, string> = {
  dark: "#2563eb",
  gold: "#d4af37",
  paper: "#4a5d23",
  aurora: "#c026d3"
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("ko");
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLotto, setSelectedLotto] = useState<LotteryPreset>(LOTTERY_PRESETS[0]);
  const [customSettings, setCustomSettings] = useState({ count: 6, max: 45 });
  const [user, setUser] = useState<User | null>(null);
  const [boardMessage, setBoardMessage] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ name: "", birthDate: "", birthTime: "" });
  const [showSidebar, setShowSidebar] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [alarms, setAlarms] = useState<AlarmsState>({ lottoDay: false, resultCheck: false, time: "18:00" });

  const t = TRANSLATIONS[lang];
  const activeTheme = THEMES[theme];

  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(15);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("k-fortune-lang") as Lang;
    const savedTab = localStorage.getItem("k-fortune-tab") as TabType;
    const savedTheme = localStorage.getItem("k-fortune-theme") as ThemeType;
    const savedAlarms = localStorage.getItem("k-fortune-alarms");
    const hasOnboarded = localStorage.getItem("k-fortune-onboarded");
    
    if (savedLang) setLang(savedLang);
    if (savedTab && ["generate", "history", "agent", "board", "alarms"].includes(savedTab)) setActiveTab(savedTab);
    if (savedTheme) setTheme(savedTheme);
    if (savedAlarms) setAlarms(JSON.parse(savedAlarms));
    if (!hasOnboarded) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("k-fortune-alarms", JSON.stringify(alarms));
  }, [alarms]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("lotto_history").select("*").order("created_at", { ascending: false }).limit(50);
    if (data) setHistory(data.map(i => ({ ...i, timestamp: new Date(i.created_at).toLocaleTimeString(), lottery_name: i.mode })));
  }, [user]);

  const fetchBoard = useCallback(async () => {
    const { data } = await supabase.from("fortune_board").select("*").order("blessings", { ascending: false }).limit(30);
    if (data) setBoard(data as BoardItem[]);
  }, []);

  useEffect(() => {
    const sp = localStorage.getItem("k-fortune-profile");
    if (sp) setUserProfile(JSON.parse(sp));
    if (user) fetchHistory();
    fetchBoard();
  }, [user, fetchHistory, fetchBoard]);

  const luckyElement = useMemo(() => analyzeDestiny(userProfile?.birthDate || ""), [userProfile]);

  const handleGenerate = async () => {
    triggerHaptic(); setIsGenerating(true); setVisibleCount(0); setNumbers([]);
    setTimeout(async () => {
      const gs = new Set<number>(); 
      const m = selectedLotto.id === "custom" ? customSettings.max : selectedLotto.max;
      const count = selectedLotto.id === "custom" ? customSettings.count : selectedLotto.count;
      while (gs.size < count) { gs.add(Math.floor(Math.random() * m) + 1); }
      const sorted = Array.from(gs).sort((a, b) => a - b); setNumbers(sorted);
      for (let i = 1; i <= sorted.length; i++) { setTimeout(() => { setVisibleCount(i); triggerHaptic(); }, i * 150); }
      if (user) {
        await supabase.from("lotto_history").insert([{ numbers: sorted, mode: selectedLotto.name, user_id: user.id }]);
        fetchHistory();
      }
      setIsGenerating(false);
    }, 800);
  };

  const handleOracleGenerate = async () => {
    triggerHaptic(); setIsGenerating(true);
    setTimeout(async () => {
      const gs = new Set<number>(); const m = selectedLotto.max;
      const [minR, maxR] = luckyElement.range; 
      const seed = Math.floor(Math.random() * (Math.min(maxR, m) - minR + 1)) + minR;
      if (seed <= m) gs.add(seed);
      while (gs.size < selectedLotto.count) { gs.add(Math.floor(Math.random() * m) + 1); }
      const sorted = Array.from(gs).sort((a, b) => a - b); setNumbers(sorted);
      if (user) {
        await supabase.from("lotto_history").insert([{ numbers: sorted, mode: `Oracle (${luckyElement.name})`, user_id: user.id }]);
        fetchHistory();
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleBless = async (id: string) => {
    triggerHaptic();
    await supabase.rpc('increment_blessings', { post_id: id });
    fetchBoard();
  };

  const handlePostToBoard = async () => {
    if (!user || numbers.length === 0) return;
    triggerHaptic();
    const { error } = await supabase.from("fortune_board").insert([{ 
      user_id: user.id, 
      user_name: userProfile?.name || "Seeker", 
      content: boardMessage || "May luck be with you!", 
      lucky_numbers: numbers 
    }]);
    if (!error) { 
      setBoardMessage(""); 
      setNumbers([]); 
      fetchBoard(); 
      setActiveTab("board"); 
    }
  };

  return (
    <div 
      className={`flex flex-col min-h-screen transition-all duration-700 ${activeTheme.bg} ${activeTheme.text}`}
    >
      <header className={`px-8 py-8 flex justify-between items-center sticky top-0 ${activeTheme.bg}/90 backdrop-blur-xl z-30`}>
        <button onClick={() => setShowSidebar(true)} className="p-3 bg-white/10 rounded-full hover:scale-110 transition-transform">
          <span className="text-2xl">☰</span>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-black italic tracking-tighter">{t.title}</h1>
          <p className={`text-xs font-bold uppercase tracking-[0.3em] ${activeTheme.accent}`}>{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          {(["ko", "en", "ja", "es"] as Lang[]).map(l => (
            <button key={l} onClick={() => { setLang(l); localStorage.setItem("k-fortune-lang", l); }} className={`px-2 py-1 rounded text-[10px] font-black uppercase ${lang === l ? activeTheme.primary + " text-white shadow-lg" : "bg-white/5 text-gray-500"}`}>{l}</button>
          ))}
        </div>
      </header>

      {/* SIDEBAR */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowSidebar(false)}></div>
          <div className={`relative w-80 ${activeTheme.card} h-full shadow-2xl p-10 flex flex-col`}>
            <div className="flex justify-between items-center mb-12">
              <span className="text-3xl font-black italic">{t.menu}</span>
              <button onClick={() => setShowSidebar(false)} className="text-3xl hover:text-red-500">✕</button>
            </div>
            <div className="flex-1 space-y-4">
              {["generate", "history", "agent", "board", "alarms"].map(tab => (
                <button key={tab} onClick={() => { setActiveTab(tab as TabType); setShowSidebar(false); localStorage.setItem("k-fortune-tab", tab); }} className={`w-full flex items-center gap-5 px-8 py-5 rounded-[2.5rem] font-black text-xl transition-all ${activeTab === tab ? activeTheme.primary + " text-white shadow-2xl scale-105" : "hover:bg-white/5 opacity-60"}`}>
                  <span className="text-3xl">{tab === "generate" ? "🎲" : tab === "history" ? "📜" : tab === "agent" ? "☯️" : tab === "board" ? "🏛️" : "⏰"}</span>
                  <span>{tab === "generate" ? t.invoke : tab === "history" ? t.records : tab === "agent" ? t.oracle : tab === "board" ? t.board : t.alarms}</span>
                </button>
              ))}
            </div>
            <div className="pt-10 border-t border-white/10">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">{t.themeLabel}</p>
              <div className="grid grid-cols-4 gap-4 bg-black/20 p-6 rounded-[2.5rem] border border-white/5">
                {(["dark", "gold", "paper", "aurora"] as ThemeType[]).map(th => (
                  <button 
                    key={th} 
                    onClick={() => { setTheme(th); localStorage.setItem("k-fortune-theme", th); }} 
                    className="flex flex-col items-center gap-3 transition-all"
                  >
                    <div 
                      className={`w-12 h-12 rounded-full border-4 shadow-lg transition-all ${theme === th ? 'border-white scale-110 shadow-white/20' : 'border-transparent opacity-40 hover:opacity-100'}`} 
                      style={{ backgroundColor: THEME_PREVIEWS[th] }}
                    />
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${theme === th ? 'text-white' : 'text-gray-500'}`}>{th}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-8 py-10 pb-48">
        {activeTab === "generate" && (
          <div className="flex flex-col gap-10 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-5">
              {LOTTERY_PRESETS.map(l => (
                <button key={l.id} onClick={() => { setSelectedLotto(l); setLang(l.defaultLang); }} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.03] shadow-lg flex flex-col items-center gap-3 ${selectedLotto.id === l.id ? activeTheme.primary + " border-transparent text-white shadow-blue-500/20" : "bg-white/5 border-white/10 text-gray-500"}`}>
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
                  <input type="range" min="1" max="10" step="1" value={customSettings.count} onChange={(e) => setCustomSettings({ ...customSettings, count: parseInt(e.target.value) })} className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-xs font-black text-blue-500 uppercase tracking-widest">{t.range} (MAX)</span>
                    <span className="text-3xl font-black italic">{customSettings.max}</span>
                  </div>
                  <input type="range" min="10" max="99" step="1" value={customSettings.max} onChange={(e) => setCustomSettings({ ...customSettings, max: parseInt(e.target.value) })} className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
              </div>
            )}
            
            <section className={`${activeTheme.card} rounded-[4rem] p-14 min-h-[360px] flex flex-col items-center justify-center border border-white/5 shadow-[inset_0_0_50px_rgba(0,0,0,0.2)] relative overflow-hidden group`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05)_0%,transparent_70%)]"></div>
              {numbers.length === 0 ? <div className="text-[120px] opacity-10 animate-float drop-shadow-2xl">☯️</div> : (
                <div className="flex flex-wrap justify-center gap-5 relative z-10">
                  {numbers.map((n, i) => (
                    <div key={i} className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-2xl transition-all duration-500 ${i < visibleCount ? "animate-pop-bounce scale-100 opacity-100" : "scale-0 opacity-0 hidden"} ${getBallColor(n)}`} style={{ boxShadow: "inset -4px -4px 10px rgba(0,0,0,0.3), 0 15px 30px rgba(0,0,0,0.4)" }}>
                      {n}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button onClick={handleGenerate} disabled={isGenerating} className={`w-full py-10 rounded-[3rem] font-black text-3xl ${activeTheme.primary} text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-[0.2em]`}>
              {isGenerating ? t.invoking : t.generateLuck}
            </button>
          </div>
        )}

        {activeTab === "agent" && (
          !userProfile ? (
            <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
              <div className="text-9xl mb-10 drop-shadow-2xl">🔮</div>
              <h2 className="text-3xl font-black mb-10 text-center">{t.oracleGuide}</h2>
              <form onSubmit={(e) => { e.preventDefault(); localStorage.setItem("k-fortune-profile", JSON.stringify(tempProfile)); setUserProfile(tempProfile); }} className="w-full max-w-sm space-y-6">
                <input type="text" placeholder={t.nameLabel} className="w-full px-8 py-6 rounded-3xl bg-white/5 border border-white/10 font-black text-xl focus:ring-4 focus:ring-blue-500/20 outline-none" value={tempProfile.name} onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} required />
                <input type="date" className="w-full px-8 py-6 rounded-3xl bg-white/5 border border-white/10 font-black text-xl focus:ring-4 focus:ring-blue-500/20 outline-none" value={tempProfile.birthDate} onChange={(e) => setTempProfile({...tempProfile, birthDate: e.target.value})} required />
                <button type="submit" className={`w-full py-6 rounded-[2.5rem] ${activeTheme.primary} text-white font-black text-xl uppercase tracking-widest shadow-2xl`}>{t.startOracle}</button>
              </form>
            </div>
          ) : (
            <OracleChat lang={lang} userProfile={userProfile} luckyElement={luckyElement} activeTheme={activeTheme} isGenerating={isGenerating} onGenerate={handleOracleGenerate} />
          )
        )}

        {activeTab === "board" && (
          <FortuneBoard lang={lang} board={board} activeTheme={activeTheme} onBless={handleBless} />
        )}

        {activeTab === "alarms" && (
          <AlarmSettings lang={lang} alarms={alarms} setAlarms={setAlarms} activeTheme={activeTheme} />
        )}

        {activeTab === "history" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-4xl font-black italic px-4">{t.records}</h2>
            {history.length === 0 ? <div className="text-center py-40 text-gray-500 font-black italic bg-white/5 rounded-[3.5rem] border border-white/5 text-xl">{t.noRecords}</div> : (
              <div className="grid grid-cols-1 gap-6">
                {history.map(h => (
                  <div key={h.id} className={`${activeTheme.card} p-10 rounded-[3.5rem] border border-white/5 shadow-xl hover:shadow-2xl transition-all`}>
                    <div className="flex justify-between items-center mb-8">
                      <span className={`text-xs font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] ${activeTheme.primary} text-white shadow-md`}>{h.lottery_name}</span>
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
        )}
      </main>

      <nav className={`fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-[480px] ${activeTheme.card}/95 backdrop-blur-3xl border border-white/10 flex justify-around items-center py-6 z-20 rounded-[3.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)]`}>
        {["generate", "agent", "board", "history"].map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab as TabType); triggerHaptic(); localStorage.setItem("k-fortune-tab", tab); }} className={`flex flex-col items-center gap-2 transition-all ${activeTab === tab ? activeTheme.accent + " scale-125 -translate-y-2 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "text-gray-500 hover:text-gray-300"}`}>
            <span className="text-3xl">{tab === "generate" ? "🎲" : tab === "agent" ? "☯️" : tab === "board" ? "🏛️" : "📜"}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{tab === "generate" ? t.invoke : tab === "agent" ? t.oracle : tab === "board" ? t.board : t.records}</span>
          </button>
        ))}
      </nav>

      {/* SHARE MODAL (FORTUNE CARD) */}
      {numbers.length > 0 && !isGenerating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setNumbers([])}></div>
          <div className="relative w-full max-w-md bg-gradient-to-b from-neutral-900 to-black rounded-[4rem] shadow-[0_0_100px_rgba(212,175,55,0.2)] overflow-hidden border border-white/10 flex flex-col p-12 gap-10 animate-in zoom-in duration-500">
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-black italic tracking-tight text-white">{t.shareTitle}</h3>
              <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.5em]">{t.subtitle}</p>
            </div>

            <div className={`relative p-10 rounded-[3rem] ${luckyElement.bg} border border-white/5 overflow-hidden text-center shadow-inner group`}>
              <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-20 ${luckyElement.bg}`}></div>
              <span className={`text-[160px] font-serif opacity-10 ${luckyElement.color} absolute left-1/2 -translate-x-1/2 -top-10 select-none`}>{luckyElement.symbol}</span>
              
              <div className="relative z-10 space-y-10">
                <div className="space-y-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{userProfile?.name || "The Seeker"}'s Destiny</p>
                  <h4 className="text-2xl font-black text-white italic">{luckyElement.ilgan}</h4>
                </div>

                <div className="flex justify-center gap-4 flex-wrap">
                  {numbers.map((num, i) => (
                    <div key={i} className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-black ${getBallColor(num)} shadow-[0_10px_20px_rgba(0,0,0,0.3)] transform transition-transform group-hover:scale-110`} style={{ transitionDelay: `${i * 50}ms` }}>
                      {num}
                    </div>
                  ))}
                </div>

                <p className="text-base font-bold italic text-white/70 leading-relaxed px-4">
                  "May the stars align and bring the celestial fortune to your path."
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <input 
                type="text" 
                placeholder={t.writeMessage} 
                className="w-full px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-white text-base font-bold focus:ring-4 focus:ring-yellow-500/20 outline-none transition-all placeholder:text-gray-600" 
                value={boardMessage} 
                onChange={(e) => setBoardMessage(e.target.value)} 
              />
              <div className="flex gap-4">
                <button onClick={() => setNumbers([])} className="flex-1 py-5 rounded-full bg-white/5 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                  {t.close}
                </button>
                <button onClick={handlePostToBoard} className="flex-[2] bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-black py-5 rounded-full shadow-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all">
                  {t.postBoard}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
