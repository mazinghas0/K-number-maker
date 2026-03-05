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

// 글로벌 복권 프리셋 정의
interface LotteryPreset {
  id: string;
  name: string;
  count: number;
  max: number;
  country: string;
}

const LOTTERY_PRESETS: LotteryPreset[] = [
  { id: "k-lotto", name: "K-Lotto", count: 6, max: 45, country: "🇰🇷" },
  { id: "powerball", name: "Powerball", count: 5, max: 69, country: "🇺🇸" },
  { id: "euromillions", name: "EuroMillions", count: 5, max: 50, country: "🇪🇺" },
  { id: "loto6", name: "Loto 6", count: 6, max: 43, country: "🇯🇵" },
  { id: "custom", name: "Custom", count: 6, max: 45, country: "⚙️" },
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

  // 현재 선택된 복권 프리셋
  const [selectedLotto, setSelectedLotto] = useState<LotteryPreset>(LOTTERY_PRESETS[0]);

  // 설정값 (Custom용)
  const [customCount, setCustomCount] = useState(6);
  const [customMax, setCustomMax] = useState(45);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from("lotto_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      const formattedData = data.map(item => ({
        ...item,
        timestamp: new Date(item.created_at).toLocaleString("ko-KR", { 
          month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
        }),
        lottery_name: item.mode || "K-Lotto" // 임시로 mode 필드 재활용
      }));
      setHistory(formattedData);
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

      const { data, error } = await supabase
        .from("lotto_history")
        .insert([{ numbers: sortedNumbers, mode: selectedLotto.name }])
        .select();

      if (!error && data) {
        const newItem: HistoryItem = {
          ...data[0],
          timestamp: new Date(data[0].created_at).toLocaleString("ko-KR", { 
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
          }),
          lottery_name: selectedLotto.name
        };
        setHistory([newItem, ...history].slice(0, 50));
      }
      
      setIsGenerating(false);
    }, 600);
  };

  const deleteHistoryItem = async (id: string) => {
    const { error } = await supabase.from("lotto_history").delete().match({ id });
    if (!error) setHistory(history.filter(item => item.id !== id));
  };

  return (
    <>
      <header className="px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-black tracking-tighter italic">K-number <span className="text-blue-600">Fortune</span></h1>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-0.5 underline decoration-blue-500 decoration-2 underline-offset-4">Global Luck Tool</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        
        {activeTab === "generate" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            
            {/* 글로벌 프리셋 선택기 (가로 스크롤) */}
            <section className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Select Lottery</h2>
                <span className="text-[10px] text-blue-500 font-bold">{selectedLotto.country} Global Preset</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-6 px-6">
                {LOTTERY_PRESETS.map((lotto) => (
                  <button
                    key={lotto.id}
                    onClick={() => setSelectedLotto(lotto)}
                    className={`flex-shrink-0 px-6 py-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1.5 min-w-[120px] ${
                      selectedLotto.id === lotto.id 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105" 
                      : "bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-500 hover:border-blue-200"
                    }`}
                  >
                    <span className="text-xl">{lotto.country}</span>
                    <span className="text-sm font-bold tracking-tight">{lotto.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* 현재 설정 요약 */}
            <section className="bg-gray-50 dark:bg-neutral-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-neutral-800 space-y-4 shadow-inner">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Configuration</span>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-md">{selectedLotto.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-3xl font-black">{selectedLotto.id === "custom" ? customCount : selectedLotto.count} <span className="text-sm font-bold text-gray-400 tracking-tighter">Numbers</span></p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300 tracking-tight">Range: 1 to {selectedLotto.id === "custom" ? customMax : selectedLotto.max}</p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center text-xl">
                  🎲
                </div>
              </div>
            </section>

            {/* 결과 표시 */}
            <section className="flex flex-col items-center justify-center min-h-[220px] bg-neutral-900 dark:bg-blue-900/5 rounded-[3rem] p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-50"></div>
              {numbers.length === 0 ? (
                <div className="text-center text-gray-500 relative z-10">
                  <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">☯️</div>
                  <p className="text-sm font-black uppercase tracking-widest opacity-50">Luck is ready for you</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in duration-500 relative z-10">
                  <div className="flex justify-center gap-2.5 flex-wrap">
                    {numbers.map((num, idx) => (
                      <div key={idx} className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-black shadow-lg transform hover:scale-110 transition-transform ${getBallColor(num, selectedLotto.id === "custom" ? customMax : selectedLotto.max)}`}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <p className="text-white font-black text-xl tracking-tight">Eastern Fortune Card</p>
                    <div className="px-4 py-1.5 bg-white/10 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                      Mystic Generation
                    </div>
                  </div>
                </div>
              )}
            </section>

            <button
              onClick={generateNumbers}
              disabled={isGenerating}
              className={`w-full text-white font-black py-6 rounded-[2rem] shadow-2xl flex items-center justify-center gap-3 text-xl transition-all active:scale-[0.95] ${
                isGenerating ? "bg-blue-400 animate-pulse" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
              }`}
            >
              {isGenerating ? "UNFOLDING LUCK..." : "GENERATE LUCK"}
            </button>
          </div>
        )}

        {/* 히스토리 탭 */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-black px-2 tracking-tight">Luck Records</h2>
            {history.length === 0 ? (
              <div className="text-center py-24 text-gray-400 font-medium">No destiny records yet.</div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-5 rounded-[2rem] shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-white uppercase bg-neutral-900 px-3 py-1 rounded-full">{item.lottery_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{item.timestamp}</span>
                      </div>
                      <button onClick={() => deleteHistoryItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {item.numbers.map((num, nIdx) => (
                        <div key={nIdx} className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black ${getBallColor(num, selectedLotto.max)}`}>
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

        {/* K-Agent 탭 (동양 운세 버전 예고) */}
        {activeTab === "agent" && (
          <div className="flex flex-col items-center justify-center py-20 animate-in slide-in-from-right-4 duration-300 text-center gap-8">
            <div className="relative">
              <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] flex items-center justify-center text-6xl shadow-2xl shadow-blue-500/40 relative z-10 animate-float">☯️</div>
              <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tighter">Eastern Oracle</h2>
              <p className="text-gray-500 text-sm mt-3 px-10 leading-relaxed font-medium">
                K-Agent is analyzing your <span className="text-blue-600 font-bold">Sa-Ju</span> pattern.<br/>
                Soon, the AI Oracle will guide your destiny with Eastern philosophy.
              </p>
            </div>
            <div className="px-6 py-2.5 bg-neutral-900 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mt-2 border border-blue-900/50 shadow-xl shadow-blue-900/20">
              Initializing K-Oracle
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[420px] bg-white/95 dark:bg-black/95 backdrop-blur-3xl border border-gray-100 dark:border-neutral-800 flex justify-around items-center py-4 z-20 rounded-[2.5rem] shadow-2xl shadow-black/10">
        <button onClick={() => setActiveTab("generate")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "generate" ? "text-blue-600 scale-110" : "text-gray-400 hover:text-gray-600"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m10-10H2"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Generate</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "history" ? "text-blue-600 scale-110" : "text-gray-400 hover:text-gray-600"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Destiny</span>
        </button>
        <button onClick={() => setActiveTab("agent")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "agent" ? "text-blue-600 scale-110" : "text-gray-400 hover:text-gray-600"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 1 1 0 011 1V5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1 1 1 0 011 1v.5a1 1 0 011 1v.5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter">Oracle</span>
        </button>
      </nav>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}
