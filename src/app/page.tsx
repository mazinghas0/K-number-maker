"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// --- Types ---
interface HistoryItem {
  id: string;
  numbers: number[];
  mode: string;
  created_at: string;
  timestamp: string;
  lottery_name: string;
}

interface LotteryPreset {
  id: string;
  name: string;
  count: number;
  max: number;
  country: string;
}

interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
  gender: string;
}

interface ElementInfo {
  name: string;
  symbol: string;
  color: string;
  bg: string;
  desc: string;
  range: [number, number];
}

// --- Constants ---
const LOTTERY_PRESETS: LotteryPreset[] = [
  { id: "k-lotto", name: "K-Lotto", count: 6, max: 45, country: "🇰🇷" },
  { id: "powerball", name: "Powerball", count: 5, max: 69, country: "🇺🇸" },
  { id: "euromillions", name: "EuroMillions", count: 5, max: 50, country: "🇪🇺" },
  { id: "loto6", name: "Loto 6", count: 6, max: 43, country: "🇯🇵" },
  { id: "custom", name: "Custom", count: 6, max: 45, country: "⚙️" },
];

const ELEMENTS: ElementInfo[] = [
  { name: "Wood", symbol: "木", color: "text-green-500", bg: "bg-green-500/10", desc: "성장과 활력의 기운", range: [1, 10] },
  { name: "Fire", symbol: "火", color: "text-red-500", bg: "bg-red-500/10", desc: "열정과 확산의 기운", range: [11, 20] },
  { name: "Earth", symbol: "土", color: "text-yellow-600", bg: "bg-yellow-600/10", desc: "안정과 균형의 기운", range: [21, 30] },
  { name: "Metal", symbol: "金", color: "text-gray-400", bg: "bg-gray-400/10", desc: "결단과 결실의 기운", range: [31, 40] },
  { name: "Water", symbol: "水", color: "text-blue-500", bg: "bg-blue-500/10", desc: "지혜와 유연함의 기운", range: [41, 50] },
];

type TabType = "generate" | "history" | "agent";

// --- Helper Functions ---
const getBallColor = (num: number, max: number): string => {
  const percent = (num / max) * 100;
  if (percent <= 20) return "bg-yellow-400 text-yellow-900";
  if (percent <= 40) return "bg-blue-400 text-blue-900";
  if (percent <= 60) return "bg-red-400 text-red-900";
  if (percent <= 80) return "bg-gray-400 text-gray-900";
  return "bg-green-400 text-green-900";
};

// --- Component ---
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLotto, setSelectedLotto] = useState<LotteryPreset>(LOTTERY_PRESETS[0]);
  const [user, setUser] = useState<User | null>(null);

  // Custom Settings
  const [customCount, setCustomCount] = useState(6);
  const [customMax, setCustomMax] = useState(45);

  // User Profile
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({
    name: "", birthDate: "", birthTime: "", gender: "male"
  });

  // Luck States
  const luckScore = useMemo(() => Math.floor(Math.random() * 31) + 70, []);

  // Auth State
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from("lotto_history").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error && data) {
      setHistory(data.map((item) => ({
        id: item.id as string, 
        numbers: item.numbers as number[], 
        mode: item.mode as string, 
        created_at: item.created_at as string,
        timestamp: new Date(item.created_at).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        lottery_name: item.mode || "Global Luck"
      })));
    }
  }, [user]);

  useEffect(() => {
    const savedProfile = localStorage.getItem("k-fortune-profile");
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (user) fetchHistory();
  }, [user, fetchHistory]);

  const luckyElement = useMemo((): ElementInfo => {
    if (!userProfile) return ELEMENTS[2];
    const day = new Date(userProfile.birthDate).getDate();
    return ELEMENTS[day % 5];
  }, [userProfile]);

  const generateNumbers = async () => {
    setIsGenerating(true);
    const count = selectedLotto.id === "custom" ? customCount : selectedLotto.count;
    const max = selectedLotto.id === "custom" ? customMax : selectedLotto.max;

    setTimeout(async () => {
      const generatedSet = new Set<number>();
      
      if (userProfile) {
        const [minRange, maxRange] = luckyElement.range;
        const luckySeed = Math.floor(Math.random() * (Math.min(maxRange, max) - minRange + 1)) + minRange;
        if (luckySeed <= max) generatedSet.add(luckySeed);
      }

      while (generatedSet.size < count) {
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        const randomNumber = (randomBuffer[0] % max) + 1;
        generatedSet.add(randomNumber);
      }

      const sortedNumbers = Array.from(generatedSet).sort((a, b) => a - b);
      setNumbers(sortedNumbers);

      if (user) {
        const { data, error } = await supabase.from("lotto_history").insert([{ 
          numbers: sortedNumbers, 
          mode: selectedLotto.name, 
          user_id: user.id 
        }]).select();
        
        if (!error && data) {
          setHistory([{ 
            id: data[0].id, 
            numbers: data[0].numbers, 
            mode: data[0].mode, 
            created_at: data[0].created_at, 
            timestamp: "Just Now", 
            lottery_name: selectedLotto.name 
          }, ...history].slice(0, 50));
        }
      }
      setIsGenerating(false);
    }, 800);
  };

  const shareLuck = async () => {
    if (numbers.length === 0) return;
    const text = `🍀 K-number Fortune Luck! 🍀\n\n[${selectedLotto.name} Numbers]\n${numbers.join(", ")}\n\n"May the Oracle be with you!"\nTry your luck at: ${window.location.origin}`;
    
    if (navigator.share) {
      await navigator.share({ title: "K-number Fortune", text: text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("행운의 카드가 클립보드에 복사되었습니다!");
    }
  };

  return (
    <>
      <header className="px-6 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <h1 className="text-3xl font-black tracking-tighter italic leading-none">K-number <span className="text-blue-600">Fortune</span></h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">The Mystic Oracle</p>
        </div>
        <div className="flex flex-col items-end">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-blue-500 uppercase">{userProfile?.name || "Member"}</span>
                <span className="text-[9px] text-gray-400 tracking-tighter">Destiny Connected</span>
              </div>
              <button onClick={() => supabase.auth.signOut()} className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm shadow-sm active:scale-90 transition-all">🚪</button>
            </div>
          ) : (
            <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Login</button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 pb-40">
        {activeTab === "generate" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <section className="grid grid-cols-2 gap-3">
              {LOTTERY_PRESETS.map((lotto) => (
                <button
                  key={lotto.id}
                  onClick={() => setSelectedLotto(lotto)}
                  className={`px-6 py-5 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                    selectedLotto.id === lotto.id ? "bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]" : "bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-400 hover:border-blue-200"
                  }`}
                >
                  <span className="text-3xl">{lotto.country}</span>
                  <span className="text-sm font-black uppercase tracking-tighter">{lotto.name}</span>
                </button>
              ))}
            </section>

            {selectedLotto.id === "custom" && (
              <section className="bg-gray-50 dark:bg-neutral-900/50 p-8 rounded-[2.5rem] space-y-8 animate-in slide-in-from-top-4 border border-gray-100 dark:border-neutral-800">
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm font-black text-gray-400 uppercase">Number Count</span><span className="text-xl font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 rounded-full">{customCount}</span></div>
                  <input type="range" min="3" max="10" value={customCount} onChange={(e) => setCustomCount(parseInt(e.target.value))} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-sm font-black text-gray-400 uppercase">Max Range</span><span className="text-xl font-black text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 rounded-full">1 ~ {customMax}</span></div>
                  <input type="range" min="30" max="70" value={customMax} onChange={(e) => setCustomMax(parseInt(e.target.value))} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </section>
            )}

            <section className="bg-neutral-950 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden border border-blue-900/20 text-center min-h-[320px] flex flex-col items-center justify-center group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)]"></div>
              {numbers.length === 0 ? (
                <div className="space-y-4 opacity-30">
                  <div className="text-8xl animate-float">☯️</div>
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-blue-400">Awaiting Alignment</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-10 w-full animate-in zoom-in duration-500">
                  <div className="flex justify-center gap-4 flex-wrap">
                    {numbers.map((num, idx) => (
                      <div key={idx} className={`w-14 h-14 flex items-center justify-center rounded-full text-xl font-black shadow-2xl transform hover:scale-110 transition-transform ${getBallColor(num, selectedLotto.id === "custom" ? customMax : selectedLotto.max)}`}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <button onClick={shareLuck} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all flex items-center gap-2 group/share">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Share Destiny Card</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 group-hover/share:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
                  </button>
                </div>
              )}
            </section>

            <button
              onClick={generateNumbers}
              disabled={isGenerating}
              className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center transition-all active:scale-[0.95] ${
                isGenerating ? "bg-blue-400 animate-pulse" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/40"
              }`}
            >
              <span className="tracking-widest uppercase text-xl font-black">{isGenerating ? "INVOKING..." : "INVOKE LUCK"}</span>
              <span className="text-[10px] opacity-60 uppercase tracking-[0.2em] mt-2 font-bold italic">Unfold your true potential</span>
            </button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black tracking-tighter px-2">Destiny Records</h2>
            {!user ? (
              <div className="text-center py-24 bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem] p-10 space-y-8 border-2 border-dashed border-gray-100 dark:border-neutral-800">
                <div className="text-7xl opacity-20">🔒</div>
                <p className="text-base font-bold text-gray-500 leading-relaxed">로그인하시면 클라우드에 영구적으로<br/>행운의 기록을 보관할 수 있습니다.</p>
                <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl uppercase text-sm tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all">Sign in with Google</button>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-32 text-gray-400 font-black italic bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem]">The scrolls are empty.</div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {history.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-7 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-5">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-white uppercase bg-blue-600 px-4 py-1.5 rounded-full">{item.lottery_name}</span>
                        <span className="text-xs text-gray-400 font-bold tracking-tight">{item.timestamp}</span>
                      </div>
                      <button onClick={() => { if(confirm("Delete record?")) supabase.from("lotto_history").delete().match({ id: item.id }).then(() => fetchHistory()); }} className="text-gray-300 hover:text-red-500 transition-all p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {item.numbers.map((num, nIdx) => (
                        <div key={nIdx} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${getBallColor(num, 70)}`}>
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "agent" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300 pb-10">
            {!userProfile ? (
              <section className="bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-neutral-800">
                <div className="text-center space-y-4 mb-10">
                  <div className="text-7xl">☯️</div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase">Activate Destiny</h2>
                  <p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">사주 정보를 입력해 주세요</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); localStorage.setItem("k-fortune-profile", JSON.stringify(tempProfile)); setUserProfile(tempProfile); }} className="space-y-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 ml-2 tracking-widest uppercase">Name</label>
                  <input type="text" placeholder="Fortune Seeker" className="w-full px-8 py-5 rounded-3xl bg-gray-50 dark:bg-neutral-800 border-none font-black text-lg focus:ring-4 focus:ring-blue-500/20 transition-all" value={tempProfile.name} onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} required /></div>
                  <div className="grid grid-cols-1 gap-6"><div className="space-y-3"><label className="text-[10px] font-black text-gray-400 ml-2 tracking-widest uppercase">Birth Date</label>
                  <input type="date" className="w-full px-8 py-5 rounded-3xl bg-gray-50 dark:bg-neutral-800 border-none font-black text-lg focus:ring-4 focus:ring-blue-500/20" value={tempProfile.birthDate} onChange={(e) => setTempProfile({...tempProfile, birthDate: e.target.value})} required /></div></div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all text-xl uppercase tracking-widest">Invoke Oracle</button>
                </form>
              </section>
            ) : (
              <div className="space-y-10">
                <div className="text-center space-y-2">
                  <h2 className="text-4xl font-black italic tracking-tighter">Cosmic Oracle</h2>
                  <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] underline decoration-2 underline-offset-4">{userProfile.name}'s Soul Alignment</p>
                </div>
                
                <div className={`p-10 rounded-[4.5rem] shadow-2xl ${luckyElement.bg} border border-white/5 relative overflow-hidden transition-all duration-1000`}>
                  <div className="flex justify-between items-start relative z-10">
                    <div className="space-y-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${luckyElement.color}`}>Primary Element</span>
                      <h3 className="text-6xl font-black tracking-tighter">{luckyElement.name}</h3>
                      <p className="text-sm font-bold opacity-60 italic">{luckyElement.desc}</p>
                    </div>
                    <span className={`text-[12rem] font-serif opacity-10 ${luckyElement.color} absolute -right-12 -top-12 select-none`}>{luckyElement.symbol}</span>
                  </div>
                  <div className="mt-12 p-8 bg-white/40 dark:bg-black/30 rounded-[2.5rem] backdrop-blur-md relative z-10 border border-white/10">
                    <p className="text-lg font-bold leading-relaxed text-gray-800 dark:text-gray-100">
                      오늘 당신의 수호 기운은 <span className="font-black underline decoration-4 decoration-blue-500">{luckyElement.name}</span>입니다. 
                      생성되는 번호에 이 에너지가 담겨 승리의 진동을 높일 것입니다.
                    </p>
                  </div>
                </div>

                <div className="bg-neutral-950 text-white p-10 rounded-[3rem] shadow-2xl border border-blue-900/30 flex items-start gap-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-all"></div>
                  <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-4xl shadow-lg shrink-0 animate-bounce">🤖</div>
                  <div className="space-y-3 pt-1 relative z-10">
                    <span className="text-[10px] font-black uppercase text-blue-400 tracking-[0.3em]">Oracle's Strategy</span>
                    <p className="text-xl font-bold leading-tight italic text-gray-100">
                      "{luckyElement.symbol}의 기운이 충만합니다. 번호 생성 시 {luckyElement.range[0]}~{luckyElement.range[1]}번 영역에 행운의 씨앗을 심어두었습니다."
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 dark:bg-neutral-900 p-8 rounded-[2.5rem] text-center space-y-1 border border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Luck Index</span>
                    <p className="text-4xl font-black text-blue-600">{luckScore}%</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-900 p-8 rounded-[2.5rem] text-center space-y-1 border border-gray-100 dark:border-neutral-800">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest opacity-60">Fortune Zone</span>
                    <p className="text-4xl font-black text-blue-600">{luckyElement.range[0]}~{luckyElement.range[1]}</p>
                  </div>
                </div>

                <button onClick={() => { if(confirm("Reset Destiny Profile?")) { localStorage.removeItem("k-fortune-profile"); setUserProfile(null); } }} className="w-full py-5 text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] hover:text-red-500 transition-all border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-3xl">Reset My Destiny</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- FLOATING NAVIGATION --- */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[460px] bg-white/90 dark:bg-neutral-950/90 backdrop-blur-2xl border border-gray-100 dark:border-white/5 flex justify-around items-center py-5 z-20 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <button onClick={() => setActiveTab("generate")} className={`flex flex-col items-center gap-2 transition-all ${activeTab === "generate" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m10-10H2"/></svg>
          <span className="text-[9px] font-black uppercase tracking-widest mt-1">Invoke</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-2 transition-all ${activeTab === "history" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-widest mt-1">Records</span>
        </button>
        <button onClick={() => setActiveTab("agent")} className={`flex flex-col items-center gap-2 transition-all ${activeTab === "agent" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 1 1 0 011 1V5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1 1 1 0 011 1v.5a1 1 0 011 1v.5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-widest mt-1">Oracle</span>
        </button>
      </nav>

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-12px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
