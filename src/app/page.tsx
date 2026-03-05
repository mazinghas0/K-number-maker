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
  if (percent <= 20) return "bg-yellow-400 text-yellow-900";
  if (percent <= 40) return "bg-blue-400 text-blue-900";
  if (percent <= 60) return "bg-red-400 text-red-900";
  if (percent <= 80) return "bg-gray-400 text-gray-900";
  return "bg-green-400 text-green-900";
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLotto, setSelectedLotto] = useState<LotteryPreset>(LOTTERY_PRESETS[0]);

  // 설정값 (Custom용) - 다시 활성화
  const [customCount, setCustomCount] = useState(6);
  const [customMax, setCustomMax] = useState(45);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({
    name: "", birthDate: "", birthTime: "", gender: "male"
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("k-fortune-profile");
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    fetchHistory();
  }, []);

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
    const count = selectedLotto.id === "custom" ? customCount : selectedLotto.count;
    const max = selectedLotto.id === "custom" ? customMax : selectedLotto.max;

    setTimeout(async () => {
      const generatedSet = new Set<number>();
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
        setHistory([{ ...data[0], timestamp: "방금 생성", lottery_name: selectedLotto.name }, ...history].slice(0, 50));
      }
      setIsGenerating(false);
    }, 800);
  };

  const getFortuneElement = () => {
    if (!userProfile) return ELEMENTS[2];
    const day = new Date(userProfile.birthDate).getDate();
    return ELEMENTS[day % 5];
  };

  const luckyElement = getFortuneElement();

  return (
    <>
      <header className="px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-black tracking-tighter italic">K-number <span className="text-blue-600">Fortune</span></h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5">Global Destiny Tool</p>
        </div>
        {userProfile && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-blue-500 uppercase">{userProfile.name}</span>
            <span className="text-[9px] text-gray-400">Master of Luck</span>
          </div>
        )}
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 pb-32">
        
        {/* [1] 번호 생성 탭 */}
        {activeTab === "generate" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            {/* 복권 종류 선택 */}
            <section className="space-y-3">
              <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Select Mode</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
                {LOTTERY_PRESETS.map((lotto) => (
                  <button
                    key={lotto.id}
                    onClick={() => setSelectedLotto(lotto)}
                    className={`flex-shrink-0 px-5 py-3 rounded-2xl border-2 transition-all flex items-center gap-2 ${
                      selectedLotto.id === lotto.id ? "bg-blue-600 border-blue-600 text-white shadow-lg" : "bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-400"
                    }`}
                  >
                    <span>{lotto.country}</span>
                    <span className="text-xs font-bold uppercase whitespace-nowrap">{lotto.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 사용자 설정 (Custom일 때만 표시) */}
            {selectedLotto.id === "custom" && (
              <section className="bg-gray-50 dark:bg-neutral-900/50 p-6 rounded-3xl space-y-4 animate-in slide-in-from-top-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-400">NUMBERS</span>
                    <span className="text-blue-500">{customCount}개</span>
                  </div>
                  <input 
                    type="range" min="3" max="10" value={customCount} 
                    onChange={(e) => setCustomCount(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-400">RANGE</span>
                    <span className="text-blue-500">1 ~ {customMax}</span>
                  </div>
                  <input 
                    type="range" min="30" max="60" value={customMax} 
                    onChange={(e) => setCustomMax(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </section>
            )}

            {/* 현재 설정 요약 */}
            <section className="bg-neutral-900 text-white p-7 rounded-[2.5rem] shadow-xl relative overflow-hidden border border-blue-900/30">
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">{selectedLotto.name} Mode</span>
                  <span className="text-2xl">☯️</span>
                </div>
                
                {numbers.length === 0 ? (
                  <div className="py-8 flex flex-col items-center gap-4">
                    <div className="text-5xl opacity-20">✨</div>
                    <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Click the button below</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-6 animate-in zoom-in duration-500">
                    <div className="flex justify-center gap-2.5 flex-wrap">
                      {numbers.map((num, idx) => (
                        <div key={idx} className={`w-11 h-11 flex items-center justify-center rounded-full text-lg font-black shadow-lg ${getBallColor(num, selectedLotto.id === "custom" ? customMax : selectedLotto.max)}`}>
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <button
              onClick={generateNumbers}
              disabled={isGenerating}
              className={`w-full text-white font-black py-6 rounded-[2rem] shadow-2xl flex flex-col items-center justify-center transition-all active:scale-[0.95] ${
                isGenerating ? "bg-blue-400 animate-pulse" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30"
              }`}
            >
              <span className="tracking-widest uppercase text-base">{isGenerating ? "Consulting Oracle..." : "Generate Luck"}</span>
              <span className="text-[9px] opacity-60 uppercase tracking-[0.2em] mt-1">번호 생성하기</span>
            </button>
          </div>
        )}

        {/* [2] 기록 확인 탭 */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300">
            <div className="flex justify-between items-center px-1">
              <h2 className="text-xl font-black tracking-tight">Luck Records</h2>
              <span className="text-[10px] text-gray-400 font-bold uppercase">최근 기록</span>
            </div>
            {history.length === 0 ? (
              <div className="text-center py-24 text-gray-400 font-medium italic bg-gray-50 dark:bg-neutral-900 rounded-[3rem]">No records found.</div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-5 rounded-[2rem] shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-white uppercase bg-blue-600 px-2.5 py-1 rounded-full">{item.lottery_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{item.timestamp}</span>
                      </div>
                      <button onClick={() => deleteHistoryItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {item.numbers.map((num, nIdx) => (
                        <div key={nIdx} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black ${getBallColor(num, 69)}`}>
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

        {/* [3] 운세 상담 탭 */}
        {activeTab === "agent" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
            {!userProfile ? (
              <section className="bg-white dark:bg-neutral-900 p-8 rounded-[3rem] shadow-xl border border-gray-100 dark:border-neutral-800">
                <div className="text-center space-y-2 mb-8">
                  <div className="text-5xl mb-4">☯️</div>
                  <h2 className="text-2xl font-black tracking-tighter">Destiny Oracle</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">사주 정보를 입력해 주세요</p>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); localStorage.setItem("k-fortune-profile", JSON.stringify(tempProfile)); setUserProfile(tempProfile); }} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 ml-2">NAME</label>
                    <input type="text" placeholder="이름을 입력하세요" className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none font-bold" value={tempProfile.name} onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 ml-2">BIRTH DATE</label>
                      <input type="date" className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none font-bold" value={tempProfile.birthDate} onChange={(e) => setTempProfile({...tempProfile, birthDate: e.target.value})} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 ml-2">TIME</label>
                      <input type="time" className="w-full px-4 py-4 rounded-2xl bg-gray-50 dark:bg-neutral-800 border-none font-bold" value={tempProfile.birthTime} onChange={(e) => setTempProfile({...tempProfile, birthTime: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl hover:bg-blue-700 transition-all">START ORACLE</button>
                </form>
              </section>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black italic tracking-tighter">Your Fortune Report</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{userProfile.name}'s Lucky Aura</p>
                </div>
                
                <div className={`p-8 rounded-[3rem] shadow-xl ${luckyElement.bg} border-2 border-transparent relative overflow-hidden`}>
                  <div className="flex justify-between items-center relative z-10">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${luckyElement.color}`}>Main Element</span>
                      <h3 className="text-4xl font-black mt-1">{luckyElement.name}</h3>
                    </div>
                    <span className={`text-7xl font-serif opacity-30 ${luckyElement.color}`}>{luckyElement.symbol}</span>
                  </div>
                  <p className="mt-6 text-sm font-medium leading-relaxed text-gray-600 dark:text-gray-300">
                    오늘 사용자님의 기운은 <span className="font-bold underline">{luckyElement.name}</span>와 강력하게 연결되어 있습니다. 이 에너지가 담긴 번호를 추천해 드릴게요.
                  </p>
                </div>

                <div className="bg-neutral-900 text-white p-7 rounded-[2.5rem] shadow-xl">
                  <p className="text-lg font-bold leading-tight italic">
                    "오늘의 운세 기운이 번호 생성에 반영되었습니다. 행운을 믿고 버튼을 눌러보세요!"
                  </p>
                </div>

                <button onClick={() => { localStorage.removeItem("k-fortune-profile"); setUserProfile(null); }} className="w-full text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] hover:text-red-500">프로필 초기화</button>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-gray-100 dark:border-neutral-800 flex justify-around items-center py-4 z-20 rounded-[2.5rem] shadow-2xl">
        <button onClick={() => setActiveTab("generate")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "generate" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m10-10H2"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">번호 생성</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "history" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">행운 기록</span>
        </button>
        <button onClick={() => setActiveTab("agent")} className={`flex flex-col items-center gap-1 transition-all ${activeTab === "agent" ? "text-blue-600 scale-110" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 1 1 0 011 1V5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1 1 1 0 011 1v.5a1 1 0 011 1v.5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter mt-1">운세 상담</span>
        </button>
      </nav>

      <style jsx global>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
