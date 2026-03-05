"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// 데이터 타입 정의
interface HistoryItem {
  id: string;
  numbers: number[];
  mode: string;
  created_at?: string;
  timestamp?: string;
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

const LOTTERY_PRESETS: LotteryPreset[] = [
  { id: "k-lotto", name: "K-Lotto", count: 6, max: 45, country: "🇰🇷" },
  { id: "powerball", name: "Powerball", count: 5, max: 69, country: "🇺🇸" },
  { id: "euromillions", name: "EuroMillions", count: 5, max: 50, country: "🇪🇺" },
  { id: "loto6", name: "Loto 6", count: 6, max: 43, country: "🇯🇵" },
  { id: "custom", name: "Custom", count: 6, max: 45, country: "⚙️" },
];

const ELEMENTS = [
  { name: "Wood", symbol: "木", color: "text-green-500", bg: "bg-green-500/10" },
  { name: "Fire", symbol: "火", color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Earth", symbol: "土", color: "text-yellow-600", bg: "bg-yellow-600/10" },
  { name: "Metal", symbol: "金", color: "text-gray-400", bg: "bg-gray-400/10" },
  { name: "Water", symbol: "水", color: "text-blue-500", bg: "bg-blue-500/10" },
];

type TabType = "generate" | "history" | "agent";

const getBallColor = (num: number, max: number) => {
  const percent = (num / max) * 100;
  if (percent <= 20) return "bg-yellow-400 text-yellow-900 shadow-yellow-200/50";
  if (percent <= 40) return "bg-blue-400 text-blue-900 shadow-blue-200/50";
  if (percent <= 60) return "bg-red-400 text-red-900 shadow-red-200/50";
  if (percent <= 80) return "bg-gray-400 text-gray-900 shadow-gray-200/50";
  return "bg-green-400 text-green-900 shadow-green-200/50";
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLotto, setSelectedLotto] = useState<LotteryPreset>(LOTTERY_PRESETS[0]);

  // 유저 프로필 상태
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({
    name: "", birthDate: "", birthTime: "", gender: "male"
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("k-fortune-profile");
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    fetchHistory();
  }, []);

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("k-fortune-profile", JSON.stringify(tempProfile));
    setUserProfile(tempProfile);
  };

  const fetchHistory = async () => {
    const { data, error } = await supabase.from("lotto_history").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error && data) {
      setHistory(data.map(item => ({
        ...item,
        timestamp: new Date(item.created_at).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        lottery_name: item.mode || "Global Luck"
      })));
    }
  };

  const generateNumbers = async () => {
    setIsGenerating(true);
    const count = selectedLotto.count;
    const max = selectedLotto.max;

    setTimeout(async () => {
      const generatedSet = new Set<number>();
      
      // [운세 로직 반영] 프로필이 있으면 특정 기운에 가중치를 줄 수 있음
      while (generatedSet.size < count) {
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        const randomNumber = (randomBuffer[0] % max) + 1;
        generatedSet.add(randomNumber);
      }

      const sortedNumbers = Array.from(generatedSet).sort((a, b) => a - b);
      setNumbers(sortedNumbers);

      const { data, error } = await supabase.from("lotto_history").insert([{ numbers: sortedNumbers, mode: selectedLotto.name }]).select();
      if (!error && data) {
        setHistory([{ ...data[0], timestamp: "Just Now", lottery_name: selectedLotto.name }, ...history].slice(0, 50));
      }
      setIsGenerating(false);
    }, 800);
  };

  // 운세 분석 데이터 도출 (간이 로직)
  const getFortuneElement = () => {
    if (!userProfile) return ELEMENTS[2]; // 기본값: Earth
    const day = new Date(userProfile.birthDate).getDate();
    return ELEMENTS[day % 5];
  };

  const luckyElement = getFortuneElement();

  return (
    <>
      <header className="px-6 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-black tracking-tighter italic">K-number <span className="text-blue-600">Fortune</span></h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">The Mystic Oracle</p>
        </div>
        {userProfile && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-blue-500 uppercase">{userProfile.name}</span>
            <span className="text-[9px] text-gray-400">Master of Luck</span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        
        {/* [1] Generate Tab */}
        {activeTab === "generate" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <section className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
              {LOTTERY_PRESETS.map((lotto) => (
                <button
                  key={lotto.id}
                  onClick={() => setSelectedLotto(lotto)}
                  className={`flex-shrink-0 px-6 py-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-1 min-w-[110px] ${
                    selectedLotto.id === lotto.id ? "bg-blue-600 border-blue-600 text-white shadow-xl scale-105" : "bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-400"
                  }`}
                >
                  <span className="text-xl">{lotto.country}</span>
                  <span className="text-xs font-black uppercase tracking-tighter">{lotto.name}</span>
                </button>
              ))}
            </section>

            <section className="bg-neutral-900 text-white p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group border border-blue-900/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-[60px] -mr-16 -mt-16"></div>
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Current Destiny</span>
                  <span className="text-2xl">☯️</span>
                </div>
                {numbers.length === 0 ? (
                  <div className="py-10 flex flex-col items-center gap-4">
                    <div className="text-5xl opacity-20 animate-pulse">✨</div>
                    <p className="text-xs font-bold text-gray-500 tracking-widest uppercase">Click the button to reveal</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-8 animate-in zoom-in duration-500">
                    <div className="flex justify-center gap-3 flex-wrap">
                      {numbers.map((num, idx) => (
                        <div key={idx} className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-black shadow-lg transform hover:scale-110 transition-transform ${getBallColor(num, selectedLotto.max)}`}>
                          {num}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-xl font-black italic tracking-tight">{selectedLotto.name} Destiny</p>
                      <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.3em]">Based on Eastern Mystic Oracle</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <button
              onClick={generateNumbers}
              disabled={isGenerating}
              className={`w-full text-white font-black py-7 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center gap-1 text-xl transition-all active:scale-[0.95] ${
                isGenerating ? "bg-blue-400 animate-pulse" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
              }`}
            >
              <span className="tracking-widest uppercase text-sm opacity-80">{isGenerating ? "Connecting to Destiny..." : "Invoke Fortune"}</span>
              {!isGenerating && <span className="text-[10px] opacity-50 uppercase tracking-[0.2em]">K-Number Generation</span>}
            </button>
          </div>
        )}

        {/* [2] Oracle Tab (New) */}
        {activeTab === "agent" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300 pb-10">
            {!userProfile ? (
              <section className="bg-white dark:bg-neutral-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-neutral-800">
                <div className="flex flex-col items-center gap-4 mb-8">
                  <div className="text-5xl">☯️</div>
                  <h2 className="text-2xl font-black tracking-tighter">Enter Your Destiny</h2>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed px-6 text-center italic">
                    The Oracle needs your birth alignment to calculate the Five Elements for your luck.
                  </p>
                </div>
                <form onSubmit={saveProfile} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Your Name</label>
                    <input 
                      type="text" placeholder="Fortune Seeker" 
                      className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none focus:ring-2 focus:ring-blue-500 font-bold"
                      value={tempProfile.name} onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Birth Date</label>
                      <input 
                        type="date" className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none font-bold"
                        value={tempProfile.birthDate} onChange={(e) => setTempProfile({...tempProfile, birthDate: e.target.value})} required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Birth Time</label>
                      <input 
                        type="time" className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none font-bold"
                        value={tempProfile.birthTime} onChange={(e) => setTempProfile({...tempProfile, birthTime: e.target.value})}
                      />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all">
                    AWAKEN THE ORACLE
                  </button>
                </form>
              </section>
            ) : (
              <div className="space-y-8 flex flex-col items-center">
                <div className="w-32 h-32 bg-blue-600 rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl animate-float">☯️</div>
                <section className="w-full space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-black italic tracking-tighter">Your Oracle Report</h2>
                    <p className="text-sm text-gray-400 font-bold uppercase mt-1 tracking-widest">{userProfile.name}'s Alignment</p>
                  </div>
                  
                  {/* 행운의 요소 카드 */}
                  <div className={`p-8 rounded-[3rem] border-2 border-transparent transition-all shadow-xl ${luckyElement.bg} relative overflow-hidden`}>
                    <div className="flex justify-between items-center relative z-10">
                      <div>
                        <span className={`text-xs font-black uppercase tracking-widest ${luckyElement.color}`}>Your Lucky Element</span>
                        <h3 className="text-4xl font-black mt-1">{luckyElement.name}</h3>
                      </div>
                      <span className={`text-7xl font-serif opacity-50 ${luckyElement.color}`}>{luckyElement.symbol}</span>
                    </div>
                    <p className="mt-6 text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300 relative z-10">
                      The energy of <span className="font-bold underline">{luckyElement.name}</span> flows strongly within you today. 
                      Your lucky numbers are aligned with these mystical vibration points.
                    </p>
                  </div>

                  {/* K-Agent 조언 */}
                  <div className="bg-neutral-900 text-white p-8 rounded-[3rem] shadow-xl border border-blue-900/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm">🤖</div>
                      <span className="text-xs font-black uppercase tracking-widest text-blue-400">Oracle's Message</span>
                    </div>
                    <p className="text-lg font-bold leading-tight italic">
                      "Seeking harmony between Wood and Metal is your key today. Try 3 sets of 5 numbers for the best spiritual resonance."
                    </p>
                  </div>

                  <button 
                    onClick={() => {if(confirm("Reset destiny profile?")) {localStorage.removeItem("k-fortune-profile"); setUserProfile(null);}}}
                    className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] self-center hover:text-red-500 transition-colors"
                  >
                    Reset My Destiny
                  </button>
                </section>
              </div>
            )}
          </div>
        )}

        {/* [3] History Tab */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-black px-2 tracking-tight">Luck Records</h2>
            {history.length === 0 ? (
              <div className="text-center py-24 text-gray-400 font-medium italic">No destiny records yet.</div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-6 rounded-[2.5rem] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white uppercase bg-blue-600 px-3 py-1 rounded-full">{item.lottery_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.timestamp}</span>
                      </div>
                      <button onClick={() => deleteHistoryItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                    <div className="flex gap-2.5 flex-wrap">
                      {item.numbers.map((num, nIdx) => (
                        <div key={nIdx} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${getBallColor(num, selectedLotto.max)}`}>
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
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[440px] bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-gray-100 dark:border-neutral-800 flex justify-around items-center py-4 z-20 rounded-[2.5rem] shadow-2xl">
        <button onClick={() => setActiveTab("generate")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "generate" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m10-10H2"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Invoke</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "history" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Records</span>
        </button>
        <button onClick={() => setActiveTab("agent")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "agent" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 1 1 0 011 1V5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1 1 1 0 011 1v.5a1 1 0 011 1v.5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Oracle</span>
        </button>
      </nav>

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
