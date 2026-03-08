"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Lang, TabType, ThemeType, HistoryItem, BoardItem, UserProfile, AlarmsState, AnimPhase, PostBoardPayload } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { analyzeDestiny } from "@/lib/fortuneEngine";
import { calcFortuneType } from "@/lib/mbtiEngine";
import { LOTTERY_PRESETS, THEMES } from "@/lib/constants";
import Sidebar from "@/components/Sidebar";
import GenerateTab from "@/components/GenerateTab";
import HistoryTab from "@/components/HistoryTab";
import AgentTab from "@/components/AgentTab";
import FortuneBoard from "@/components/FortuneBoard";
import AlarmSettings from "@/components/AlarmSettings";
import ShareModal from "@/components/ShareModal";

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [alarms, setAlarms] = useState<AlarmsState>({ lottoDay: false, resultCheck: false, time: "18:00" });

  const t = TRANSLATIONS[lang];
  const activeTheme = THEMES[theme];
  const luckyElement = useMemo(() => analyzeDestiny(userProfile?.birthDate || ""), [userProfile]);
  const fortuneType = useMemo(
    () => (numbers.length > 0 ? calcFortuneType(luckyElement, numbers) : null),
    [luckyElement, numbers]
  );

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

      // 번호 생성 완료 후 공유 버튼 활성화 (애니메이션 끝난 뒤)
      setTimeout(() => {
        setShowShareModal(false); // 이전 모달 닫힘 상태 유지 (자동 오픈 원치 않으면)
      }, (count + 4) * 180);
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

  const handlePostBoard = async (payload: PostBoardPayload): Promise<string | null> => {
    triggerHaptic();
    const { data, error } = await supabase
      .from("fortune_board")
      .insert([payload])
      .select("id")
      .single();
    if (error || !data) return null;
    fetchBoard();
    return data.id as string;
  };

  const handleDeleteBoard = async (id: string) => {
    triggerHaptic();
    await supabase.from("fortune_board").delete().eq("id", id);
    setBoard((prev) => prev.filter((b) => b.id !== id));
  };

  const handleWinCert = async (id: string) => {
    triggerHaptic();
    await supabase.from("fortune_board").update({ is_winner: true }).eq("id", id);
    setBoard((prev) => prev.map((b) => b.id === id ? { ...b, is_winner: true } : b));
  };

  const handleProfileSubmit = (p: UserProfile) => {
    localStorage.setItem("k-fortune-profile", JSON.stringify(p));
    setUserProfile(p);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    localStorage.setItem("k-fortune-tab", tab);
  };

  const handleLogin = () => {
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: typeof window !== "undefined" ? window.location.origin : "" },
    });
    triggerHaptic();
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    triggerHaptic();
  };

  const handleDeleteHistory = async (id: string) => {
    await supabase.from("lotto_history").delete().eq("id", id);
    setHistory(prev => prev.filter(h => h.id !== id));
    triggerHaptic();
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
          lang={lang}
          fortuneType={fortuneType}
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
          t={t}
          user={user}
          onLogin={handleLogin}
        />
      )}
      {activeTab === "board" && (
        <FortuneBoard
          board={board}
          activeTheme={activeTheme}
          t={t}
          onBless={handleBless}
          onPost={handlePostBoard}
          onDelete={handleDeleteBoard}
          onWinCert={handleWinCert}
          user={user}
          numbers={numbers}
        />
      )}
      {activeTab === "history" && (
        <HistoryTab history={history} activeTheme={activeTheme} t={t} user={user} onLogin={handleLogin} onDelete={handleDeleteHistory} />
      )}
      {activeTab === "alarms" && (
        <AlarmSettings lang={lang} alarms={alarms} setAlarms={setAlarms} activeTheme={activeTheme} />
      )}
    </>
  );

  return (
    <div className={`w-full min-h-screen transition-all duration-700 ${activeTheme.bg} ${activeTheme.text}`}>
      {/* ── Desktop: permanent sidebar (lg+) ───────────────────────── */}
      <aside className={`hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-72 ${activeTheme.card} border-r border-white/10 z-40`}>
        <Sidebar
          mode="permanent"
          activeTab={activeTab}
          onTabChange={handleTabChange}
          theme={theme}
          onThemeChange={setTheme}
          activeTheme={activeTheme}
          t={t}
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
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
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* ── Main content (shifts right on desktop) ──────────────────── */}
      <div className="md:ml-72 flex flex-col min-h-screen">

        {/* Header */}
        <header className={`px-6 md:px-10 py-5 md:py-6 flex justify-between items-center sticky top-0 ${activeTheme.bg}/90 backdrop-blur-xl z-30`}>
          {/* Mobile: hamburger */}
          <button
            onClick={() => setShowSidebar(true)}
            className={`md:hidden p-3 bg-white/10 rounded-full hover:scale-110 transition-transform`}
          >
            <span className="text-2xl">☰</span>
          </button>

          {/* Mobile: centered title */}
          <div className="md:hidden flex flex-col items-center">
            <h1 className="text-4xl font-black italic tracking-tighter">{t.title}</h1>
            <p className={`text-xs font-bold uppercase tracking-[0.3em] ${activeTheme.accent}`}>{t.subtitle}</p>
          </div>

          {/* Desktop: current page indicator */}
          <div className="hidden md:flex items-center gap-3 min-w-0">
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
        <main className="flex-1 px-6 md:px-12 py-8 pb-40 md:pb-12">
          {tabContent}
        </main>

        {/* Mobile bottom nav (hidden on desktop) */}
        <nav className={`md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[92%] max-w-[480px] ${activeTheme.card}/95 backdrop-blur-3xl border border-white/10 flex justify-around items-center py-6 z-20 rounded-[3.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)]`}>
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

      {/* 플로팅 공유 버튼 — 번호 생성 후 generate 탭에서 노출 */}
      {numbers.length > 0 && activeTab === "generate" && !showShareModal && (
        <button
          onClick={() => { setShowShareModal(true); triggerHaptic(); }}
          className="fixed bottom-44 md:bottom-14 right-6 md:right-8 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-black text-xs uppercase tracking-widest shadow-[0_8px_30px_rgba(212,175,55,0.4)] active:scale-95 transition-all hover:shadow-[0_8px_40px_rgba(212,175,55,0.6)] animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          <span className="text-base">↗</span> {t.shareCard}
        </button>
      )}

      {/* ShareModal */}
      {showShareModal && (
        <ShareModal
          numbers={numbers}
          onClose={() => setShowShareModal(false)}
          luckyElement={luckyElement}
          userProfile={userProfile}
          activeTheme={activeTheme}
          t={t}
          onShareReward={() => {/* 보상은 ShareModal 내부에서 localStorage 직접 처리 */}}
        />
      )}
    </div>
  );
}
