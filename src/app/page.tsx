"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Lang, TabType, ThemeType, HistoryItem, BoardItem, UserProfile, AlarmsState, AnimPhase } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { analyzeDestiny } from "@/lib/fortuneEngine";
import { LOTTERY_PRESETS, THEMES } from "@/lib/constants";
import Sidebar from "@/components/Sidebar";
import GenerateTab from "@/components/GenerateTab";
import HistoryTab from "@/components/HistoryTab";
import AgentTab from "@/components/AgentTab";
import FortuneBoard from "@/components/FortuneBoard";
import AlarmSettings from "@/components/AlarmSettings";

const DESKTOP_TAB_ICONS: Partial<Record<TabType, string>> = {
  generate: "🎲", history: "📜", agent: "🔮", board: "🏛️", alarms: "⏰",
};

export default function Home() {
  const [lang, setLang] = useState<Lang>("ko");
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [shuffledNums, setShuffledNums] = useState<number[]>([]);
  const [revealCount, setRevealCount] = useState(0);
  const [animPhase, setAnimPhase] = useState<AnimPhase>("idle");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLotto, setSelectedLotto] = useState(LOTTERY_PRESETS[0]);
  const [customSettings, setCustomSettings] = useState({ count: 6, max: 45 });
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ name: "", birthDate: "", birthTime: "" });
  const [showSidebar, setShowSidebar] = useState(false);
  const [alarms, setAlarms] = useState<AlarmsState>({ lottoDay: false, resultCheck: false, time: "18:00" });

  const t = TRANSLATIONS[lang];
  const activeTheme = THEMES[theme];
  const luckyElement = useMemo(() => analyzeDestiny(userProfile?.birthDate || ""), [userProfile]);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(15);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("k-fortune-lang") as Lang;
    const savedTab = localStorage.getItem("k-fortune-tab") as TabType;
    const savedTheme = localStorage.getItem("k-fortune-theme") as ThemeType;
    const savedAlarms = localStorage.getItem("k-fortune-alarms");
    if (savedLang) setLang(savedLang);
    if (savedTab && ["generate", "history", "agent", "board", "alarms"].includes(savedTab)) setActiveTab(savedTab);
    if (savedTheme) setTheme(savedTheme);
    if (savedAlarms) setAlarms(JSON.parse(savedAlarms));
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

  const handleGenerate = async () => {
    triggerHaptic();
    setIsGenerating(true);
    setNumbers([]);
    setShuffledNums([]);
    setRevealCount(0);
    setAnimPhase("idle");

    setTimeout(async () => {
      const gs = new Set<number>();
      const m = selectedLotto.id === "custom" ? customSettings.max : selectedLotto.max;
      const count = selectedLotto.id === "custom" ? customSettings.count : selectedLotto.count;
      while (gs.size < count) gs.add(Math.floor(Math.random() * m) + 1);
      const sorted = Array.from(gs).sort((a, b) => a - b);
      const shuffled = [...sorted].sort(() => Math.random() - 0.5);

      setNumbers(sorted);
      setShuffledNums(shuffled);
      setAnimPhase("scatter");

      if (user) {
        await supabase.from("lotto_history").insert([{ numbers: sorted, mode: selectedLotto.name, user_id: user.id }]);
        fetchHistory();
      }
      setIsGenerating(false);

      shuffled.forEach((_, i) => {
        setTimeout(() => {
          setRevealCount(c => c + 1);
          triggerHaptic();
        }, (i + 1) * 180);
      });

      setTimeout(() => {
        setAnimPhase("sort");
      }, (count + 3) * 180);
    }, 800);
  };

  const handleOracleGenerate = async () => {
    triggerHaptic(); setIsGenerating(true);
    setTimeout(async () => {
      const gs = new Set<number>();
      const m = selectedLotto.max;
      const [minR, maxR] = luckyElement.range;
      const seed = Math.floor(Math.random() * (Math.min(maxR, m) - minR + 1)) + minR;
      if (seed <= m) gs.add(seed);
      while (gs.size < selectedLotto.count) gs.add(Math.floor(Math.random() * m) + 1);
      const sorted = Array.from(gs).sort((a, b) => a - b);
      setNumbers(sorted);
      if (user) {
        await supabase.from("lotto_history").insert([{ numbers: sorted, mode: `Oracle (${luckyElement.name})`, user_id: user.id }]);
        fetchHistory();
      }
      setIsGenerating(false);
    }, 1500);
  };

  const handleBless = async (id: string) => {
    triggerHaptic();
    await supabase.rpc("increment_blessings", { post_id: id });
    fetchBoard();
  };

  const handleProfileSubmit = (p: UserProfile) => {
    localStorage.setItem("k-fortune-profile", JSON.stringify(p));
    setUserProfile(p);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem("k-fortune-tab", tab);
  };

  const tabContent = (
    <>
      {activeTab === "generate" && (
        <GenerateTab
          selectedLotto={selectedLotto}
          onLottoChange={(l) => { setSelectedLotto(l); setLang(l.defaultLang); }}
          customSettings={customSettings}
          onCustomChange={setCustomSettings}
          numbers={numbers}
          shuffledNums={shuffledNums}
          revealCount={revealCount}
          animPhase={animPhase}
          isGenerating={isGenerating}
          activeTheme={activeTheme}
          t={t}
          onGenerate={handleGenerate}
        />
      )}
      {activeTab === "agent" && (
        <AgentTab
          lang={lang}
          userProfile={userProfile}
          tempProfile={tempProfile}
          onTempProfileChange={setTempProfile}
          onProfileSubmit={handleProfileSubmit}
          luckyElement={luckyElement}
          activeTheme={activeTheme}
          isGenerating={isGenerating}
          onGenerate={handleOracleGenerate}
          t={t}
        />
      )}
      {activeTab === "board" && (
        <FortuneBoard lang={lang} board={board} activeTheme={activeTheme} onBless={handleBless} />
      )}
      {activeTab === "history" && (
        <HistoryTab history={history} activeTheme={activeTheme} t={t} />
      )}
      {activeTab === "alarms" && (
        <AlarmSettings lang={lang} alarms={alarms} setAlarms={setAlarms} activeTheme={activeTheme} />
      )}
    </>
  );

  return (
    <div className={`w-full min-h-screen transition-all duration-700 ${activeTheme.bg} ${activeTheme.text}`}>
      {/* ── Desktop: permanent sidebar (lg+) ───────────────────────── */}
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-72 ${activeTheme.card} border-r border-white/10 z-40`}>
        <Sidebar
          mode="permanent"
          activeTab={activeTab}
          onTabChange={handleTabChange}
          theme={theme}
          onThemeChange={setTheme}
          activeTheme={activeTheme}
          t={t}
        />
      </aside>

      {/* ── Mobile: overlay sidebar ─────────────────────────────────── */}
      <Sidebar
        mode="overlay"
        show={showSidebar}
        onClose={() => setShowSidebar(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        theme={theme}
        onThemeChange={setTheme}
        activeTheme={activeTheme}
        t={t}
      />

      {/* ── Main content (shifts right on desktop) ──────────────────── */}
      <div className="lg:ml-72 flex flex-col min-h-screen">

        {/* Header */}
        <header className={`px-6 lg:px-10 py-5 lg:py-6 flex justify-between items-center sticky top-0 ${activeTheme.bg}/90 backdrop-blur-xl z-30`}>
          {/* Mobile: hamburger */}
          <button
            onClick={() => setShowSidebar(true)}
            className={`lg:hidden p-3 bg-white/10 rounded-full hover:scale-110 transition-transform`}
          >
            <span className="text-2xl">☰</span>
          </button>

          {/* Mobile: centered title */}
          <div className="lg:hidden flex flex-col items-center">
            <h1 className="text-4xl font-black italic tracking-tighter">{t.title}</h1>
            <p className={`text-xs font-bold uppercase tracking-[0.3em] ${activeTheme.accent}`}>{t.subtitle}</p>
          </div>

          {/* Desktop: current page indicator */}
          <div className="hidden lg:flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{DESKTOP_TAB_ICONS[activeTab] ?? "✨"}</span>
            <span className="text-xl font-black uppercase tracking-widest whitespace-nowrap">
              {activeTab === "generate" ? t.invoke
                : activeTab === "history" ? t.records
                : activeTab === "agent" ? t.oracle
                : activeTab === "board" ? t.board
                : t.alarms}
            </span>
          </div>

          {/* Lang selector (always) */}
          <div className="flex gap-2">
            {(["ko", "en", "ja", "es"] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => { setLang(l); localStorage.setItem("k-fortune-lang", l); }}
                className={`px-2 py-1 rounded text-[10px] font-black uppercase ${lang === l ? activeTheme.primary + " text-white shadow-lg" : "bg-white/5 text-gray-500"}`}
              >
                {l}
              </button>
            ))}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 px-6 lg:px-12 py-8 pb-40 lg:pb-12">
          {tabContent}
        </main>

        {/* Mobile bottom nav (hidden on desktop) */}
        <nav className={`lg:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-[480px] ${activeTheme.card}/95 backdrop-blur-3xl border border-white/10 flex justify-around items-center py-6 z-20 rounded-[3.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)]`}>
          {(["generate", "agent", "board", "history"] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => { handleTabChange(tab); triggerHaptic(); }}
              className={`flex flex-col items-center gap-2 transition-all ${activeTab === tab ? activeTheme.accent + " scale-125 -translate-y-2 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" : "text-gray-500 hover:text-gray-300"}`}
            >
              <span className="text-3xl">
                {tab === "generate" ? "🎲" : tab === "agent" ? "🔮" : tab === "board" ? "🏛️" : "📜"}
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest">
                {tab === "generate" ? t.invoke : tab === "agent" ? t.oracle : tab === "board" ? t.board : t.records}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-15px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 5s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes ballPop {
          0%   { transform: scale(0) translateY(-40px); opacity: 0; }
          55%  { transform: scale(1.28) translateY(6px); opacity: 1; }
          75%  { transform: scale(0.88) translateY(-3px); }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes ballBounce {
          0%   { transform: scale(1) translateY(0); }
          30%  { transform: scale(1.32) translateY(-14px); }
          60%  { transform: scale(0.86) translateY(5px); }
          80%  { transform: scale(1.08) translateY(-3px); }
          100% { transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
