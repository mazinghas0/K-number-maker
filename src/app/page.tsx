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
}

interface WinningResult {
  drwNo: number;
  drwtNo1: number;
  drwtNo2: number;
  drwtNo3: number;
  drwtNo4: number;
  drwtNo5: number;
  drwtNo6: number;
  bnusNo: number;
  drwNoDate: string;
}

type AppMode = "Quick" | "Smart" | "Rules";
type TabType = "generate" | "history" | "agent";

const getBallColor = (num: number) => {
  if (num <= 10) return "bg-yellow-400 text-yellow-900";
  if (num <= 20) return "bg-blue-400 text-blue-900";
  if (num <= 30) return "bg-red-400 text-red-900";
  if (num <= 40) return "bg-gray-400 text-gray-900";
  return "bg-green-400 text-green-900";
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastWin, setLastWin] = useState<WinningResult | null>(null);

  // 설정값
  const [count, setCount] = useState(6);
  const [maxNum, setMaxNum] = useState(45);
  const [genMode, setGenMode] = useState<AppMode>("Quick");

  useEffect(() => {
    fetchHistory();
    fetchLastWinningNumbers();
  }, []);

  // 실제 로또 당첨 번호 가져오기 (임시 샘플 데이터, 향후 API 연동)
  const fetchLastWinningNumbers = () => {
    // 실제 운영 시에는 프록시 서버나 API를 통해 가져옵니다.
    // 여기서는 최신 회차(예: 1200회)의 샘플 데이터를 세팅합니다.
    setLastWin({
      drwNo: 1210,
      drwtNo1: 3,
      drwtNo2: 7,
      drwtNo3: 14,
      drwtNo4: 25,
      drwtNo5: 31,
      drwtNo6: 42,
      bnusNo: 8,
      drwNoDate: "2026-02-28"
    });
  };

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
        })
      }));
      setHistory(formattedData);
    }
  };

  const generateNumbers = async () => {
    setIsGenerating(true);
    
    setTimeout(async () => {
      const min = 1;
      const generatedSet = new Set<number>();

      // Smart 모드일 때 가중치 로직 (예시: 이전 당첨 번호 중 하나를 포함할 확률 부여 등)
      if (genMode === "Smart" && lastWin) {
        // 스마트 모드 맛보기: 이전 회차 당첨 번호 중 1개를 30% 확률로 포함
        if (Math.random() < 0.3) {
          const winNums = [lastWin.drwtNo1, lastWin.drwtNo2, lastWin.drwtNo3, lastWin.drwtNo4, lastWin.drwtNo5, lastWin.drwtNo6];
          generatedSet.add(winNums[Math.floor(Math.random() * 6)]);
        }
      }

      while (generatedSet.size < count) {
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        const randomNumber = (randomBuffer[0] % (maxNum - min + 1)) + min;
        generatedSet.add(randomNumber);
      }

      const sortedNumbers = Array.from(generatedSet).sort((a, b) => a - b);
      setNumbers(sortedNumbers);

      const { data, error } = await supabase
        .from("lotto_history")
        .insert([{ numbers: sortedNumbers, mode: genMode }])
        .select();

      if (!error && data) {
        const newItem: HistoryItem = {
          ...data[0],
          timestamp: new Date(data[0].created_at).toLocaleString("ko-KR", { 
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" 
          })
        };
        setHistory([newItem, ...history].slice(0, 50));
      }
      
      setIsGenerating(false);
    }, 500);
  };

  const deleteHistoryItem = async (id: string) => {
    const { error } = await supabase.from("lotto_history").delete().match({ id });
    if (!error) setHistory(history.filter(item => item.id !== id));
  };

  return (
    <>
      <header className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/90 dark:bg-black/90 backdrop-blur-md z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight">K-number maker</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            2026.03.05 <span className="text-blue-500 font-semibold ml-2">D-3</span>
          </p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        
        {activeTab === "generate" && (
          <div className="flex flex-col gap-6 animate-in fade-in duration-300">
            
            {/* 최신 당첨 번호 배너 */}
            {lastWin && (
              <section className="bg-neutral-900 text-white p-5 rounded-[2rem] shadow-xl overflow-hidden relative group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-bold bg-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Latest Win</span>
                    <h3 className="text-lg font-bold mt-1">{lastWin.drwNo}회 당첨 번호</h3>
                  </div>
                  <span className="text-[10px] text-gray-400">{lastWin.drwNoDate}</span>
                </div>
                <div className="flex gap-2 justify-between items-center">
                  <div className="flex gap-1.5">
                    {[lastWin.drwtNo1, lastWin.drwtNo2, lastWin.drwtNo3, lastWin.drwtNo4, lastWin.drwtNo5, lastWin.drwtNo6].map((num, i) => (
                      <div key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${getBallColor(num)}`}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-500 text-xs">+</span>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${getBallColor(lastWin.bnusNo)}`}>
                      {lastWin.bnusNo}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 설정 섹션 */}
            <section className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-2 p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">숫자 개수</span>
                  <span className="text-lg font-bold text-blue-500">{count}개</span>
                </div>
                <input 
                  type="range" min="3" max="10" value={count} 
                  onChange={(e) => setCount(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setMaxNum(maxNum === 45 ? 50 : 45)} className="flex flex-col gap-1 p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl text-left border-2 border-transparent active:border-blue-500 transition-all">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">범위</span>
                  <span className="text-lg font-bold">1 ~ {maxNum}</span>
                </button>
                <button onClick={() => setGenMode(genMode === "Quick" ? "Smart" : genMode === "Smart" ? "Rules" : "Quick")} className="flex flex-col gap-1 p-4 bg-gray-50 dark:bg-neutral-800 rounded-2xl text-left border-2 border-transparent active:border-blue-500 transition-all">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-tighter">모드</span>
                  <span className="text-lg font-bold text-blue-500">{genMode}</span>
                </button>
              </div>
            </section>

            {/* 결과 표시 */}
            <section className="flex flex-col items-center justify-center min-h-[220px] bg-blue-50/30 dark:bg-blue-900/10 rounded-[2.5rem] p-6 border-2 border-blue-100 dark:border-blue-900/30 shadow-inner">
              {numbers.length === 0 ? (
                <div className="text-center text-gray-400">
                  <div className="text-5xl mb-4">✨</div>
                  <p className="text-sm font-medium">행운의 번호가 준비되었습니다</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-6 w-full animate-in zoom-in duration-300">
                  <div className="flex justify-center gap-2.5 flex-wrap">
                    {numbers.map((num, idx) => (
                      <div key={idx} className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold shadow-lg ${getBallColor(num)}`}>
                        {num}
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                    {genMode} Generation
                  </div>
                </div>
              )}
            </section>

            <button
              onClick={generateNumbers}
              disabled={isGenerating}
              className={`w-full text-white font-bold py-5 rounded-[1.5rem] shadow-xl flex items-center justify-center gap-2 text-xl transition-all active:scale-[0.95] ${
                isGenerating ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isGenerating ? "클라우드 저장 중..." : "번호 생성하기"}
            </button>
          </div>
        )}

        {/* 히스토리 탭 */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-lg font-bold px-2">나의 행운 기록 (클라우드)</h2>
            {history.length === 0 ? (
              <div className="text-center py-20 text-gray-400">저장된 기록이 없습니다.</div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-gray-700 p-4 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{item.mode}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-400 font-medium">{item.timestamp}</span>
                        <button onClick={() => deleteHistoryItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {item.numbers.map((num, nIdx) => (
                        <div key={nIdx} className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${getBallColor(num)}`}>
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

        {/* AI 에이전트 탭 */}
        {activeTab === "agent" && (
          <div className="flex flex-col items-center justify-center py-20 animate-in slide-in-from-right-4 duration-300 text-center gap-6">
            <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/30 animate-bounce">🤖</div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">K-Agent</h2>
              <p className="text-gray-500 text-sm mt-2 px-10 leading-relaxed">
                사용자님의 패턴을 분석하고 있습니다.<br/>
                곧 인공지능이 이번 주 행운을 상담해 드립니다.
              </p>
            </div>
            <div className="px-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.3em] mt-4">
              AI Analysis in progress
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 flex justify-around items-center py-4 z-20 rounded-t-[2rem] shadow-2xl">
        <button onClick={() => setActiveTab("generate")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "generate" ? "text-blue-600 scale-110 font-bold" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m10-10H2"/></svg>
          <span className="text-[9px] uppercase tracking-tighter">Generate</span>
        </button>
        <button onClick={() => setActiveTab("history")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "history" ? "text-blue-600 scale-110 font-bold" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span className="text-[9px] uppercase tracking-tighter">History</span>
        </button>
        <button onClick={() => setActiveTab("agent")} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === "agent" ? "text-blue-600 scale-110 font-bold" : "text-gray-400"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 1 1 0 011 1V5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1 1 1 0 011 1v.5a1 1 0 011 1v.5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1z"/></svg>
          <span className="text-[9px] uppercase tracking-tighter">K-Agent</span>
        </button>
      </nav>
    </>
  );
}
