"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// --- Types ---
type Lang = "en" | "ko" | "ja" | "es";
type TabType = "generate" | "history" | "agent" | "board";

interface Translation {
  title: string; subtitle: string; invoke: string; records: string; oracle: string; board: string;
  login: string; logout: string; generateLuck: string; invoking: string;
  selectMode: string; numCount: string; range: string; connected: string;
  noRecords: string; resetProfile: string; awakenDestiny: string; oracleGuide: string;
  nameLabel: string; dateLabel: string; startOracle: string; luckyArea: string;
  luckIndex: string; shareTitle: string; close: string; elementAnalysis: string;
  postBoard: string; boardTitle: string; writeMessage: string; send: string;
}

const TRANSLATIONS: Record<Lang, Translation> = {
  en: {
    title: "K-number", subtitle: "Mystic Oracle", invoke: "Invoke", records: "Records", oracle: "Oracle", board: "Board",
    login: "Login", logout: "Logout", generateLuck: "GENERATE LUCK", invoking: "INVOKING...",
    selectMode: "Select Mode", numCount: "Numbers", range: "Range", connected: "Destiny Connected",
    noRecords: "The scrolls are empty.", resetProfile: "Reset Destiny", awakenDestiny: "Awaken Destiny",
    oracleGuide: "The Oracle requires your birth alignment", nameLabel: "Name",
    dateLabel: "Birth Date", startOracle: "ACTIVATE ORACLE", luckyArea: "Lucky Area",
    luckIndex: "Luck Index", shareTitle: "Destiny Card", close: "Close", elementAnalysis: "Element Balance",
    postBoard: "Post to Square", boardTitle: "Fortune Square", writeMessage: "Leave a luck message...", send: "Send",
  },
  ko: {
    title: "K-포춘", subtitle: "신비로운 운세 상담소", invoke: "번호 생성", records: "행운 기록", oracle: "운세 상담", board: "행운 광장",
    login: "로그인", logout: "로그아웃", generateLuck: "행운 불러오기", invoking: "기운 모으는 중...",
    selectMode: "운명의 모드 선택", numCount: "숫자 개수", range: "번호 범위", connected: "운명이 연결됨",
    noRecords: "아직 기록이 없습니다.", resetProfile: "프로필 초기화", awakenDestiny: "운명을 깨우세요",
    oracleGuide: "사주 정보를 입력해 주세요", nameLabel: "이름",
    dateLabel: "생년월일", startOracle: "분석 시작", luckyArea: "행운의 영역",
    luckIndex: "오늘의 행운", shareTitle: "운명의 카드", close: "닫기", elementAnalysis: "오행 기운 밸런스",
    postBoard: "광장에 자랑하기", boardTitle: "행운 광장", writeMessage: "행운의 한마디...", send: "전송",
  },
  ja: {
    title: "K-運勢", subtitle: "神秘的な占いの館", invoke: "番号生成", records: "幸運の記録", oracle: "運勢診断", board: "幸運広場",
    login: "ログイン", logout: "ログアウト", generateLuck: "幸運を呼ぶ", invoking: "パワー集中中...",
    selectMode: "モード選択", numCount: "数字の数", range: "範囲", connected: "運命が繋がった",
    noRecords: "記録がありません。", resetProfile: "リセット", awakenDestiny: "運命を呼び覚ます",
    oracleGuide: "生年月日を入力してください", nameLabel: "名前",
    dateLabel: "生年月日", startOracle: "診断開始", luckyArea: "ラッキーエリア",
    luckIndex: "今日の運勢", shareTitle: "運命のカード", close: "閉じる", elementAnalysis: "五行バランス",
    postBoard: "広場でシェア", boardTitle: "幸運広場", writeMessage: "メッセージ...", send: "送信",
  },
  es: {
    title: "K-Fortuna", subtitle: "Oráculo Místico", invoke: "Invocar", records: "Registros", oracle: "Oráculo", board: "Plaza",
    login: "Entrar", logout: "Salir", generateLuck: "GENERAR SUERTE", invoking: "INVOCANDO...",
    selectMode: "Modo de Destino", numCount: "Números", range: "Rango", connected: "Destino Conectado",
    noRecords: "Los pergaminos están vacíos.", resetProfile: "Reiniciar", awakenDestiny: "Despierta tu Destino",
    oracleGuide: "El Oráculo requiere tu alineación", nameLabel: "Nombre",
    dateLabel: "Fecha de Nacimiento", startOracle: "ACTIVAR ORÁCULO", luckyArea: "Zona de Suerte",
    luckIndex: "Índice de Suerte", shareTitle: "Carta de Destino", close: "Cerrar", elementAnalysis: "Balance de Elementos",
    postBoard: "Publicar en Plaza", boardTitle: "Plaza de Fortuna", writeMessage: "Mensaje de suerte...", send: "Enviar",
  }
};

interface HistoryItem {
  id: string; numbers: number[]; mode: string; created_at: string;
  timestamp: string; lottery_name: string;
}

interface BoardItem {
  id: string; user_name: string; content: string; lucky_numbers: number[]; created_at: string;
}

interface LotteryPreset {
  id: string; name: string; count: number; max: number; country: string; defaultLang: Lang;
}

interface UserProfile { name: string; birthDate: string; birthTime: string; }

interface ElementInfo {
  name: string; symbol: string; color: string; bg: string;
  desc: string; range: [number, number];
  messages: { en: string; ko: string; ja: string; es: string }[];
}

const LOTTERY_PRESETS: LotteryPreset[] = [
  { id: "k-lotto", name: "K-Lotto", count: 6, max: 45, country: "🇰🇷", defaultLang: "ko" },
  { id: "powerball", name: "Powerball", count: 5, max: 69, country: "🇺🇸", defaultLang: "en" },
  { id: "euromillions", name: "EuroMillions", count: 5, max: 50, country: "🇪🇺", defaultLang: "en" },
  { id: "loto6", name: "Loto 6", count: 6, max: 43, country: "🇯🇵", defaultLang: "ja" },
  { id: "custom", name: "Custom", count: 6, max: 45, country: "⚙️", defaultLang: "en" },
];

const ELEMENTS: ElementInfo[] = [
  { 
    name: "Wood", symbol: "木", color: "text-green-500", bg: "bg-green-500/10", desc: "성장과 활력", range: [1, 10],
    messages: [
      { en: "Energy flows like a tree. Low numbers bring luck.", ko: "나무의 기운이 흐릅니다. 낮은 번호대에 행운이 있습니다.", ja: "木のエネルギーが流れています。低い番号が吉です。", es: "La energía fluye como un árbol. Números bajos traen suerte." },
      { en: "Spread your branches. Broad selection is key.", ko: "가지를 뻗으세요. 넓은 선택이 핵심입니다.", ja: "枝を広げましょう。広い選択が重要です。", es: "Extiende tus ramas. Una selección amplia es clave." }
    ]
  },
  { 
    name: "Fire", symbol: "火", color: "text-red-500", bg: "bg-red-500/10", desc: "열정과 확산", range: [11, 20],
    messages: [
      { en: "Passion lights your way. Mid-range energy is high.", ko: "열정이 길을 밝힙니다. 중간 번호대의 에너지가 높습니다.", ja: "情熱が道を照らします。中間の番号に力が宿ります。", es: "La pasión ilumina tu camino. Energía media es alta." },
      { en: "The sun peaks. Hot numbers are calling you.", ko: "태양이 정점입니다. 뜨거운 번호들이 당신을 부릅니다.", ja: "太陽が頂点です. 熱い数字가 당신을 呼んでいます.", es: "El sol está en su cenit. Los números calientes te llaman." }
    ]
  },
  { 
    name: "Earth", symbol: "土", color: "text-yellow-600", bg: "bg-yellow-600/10", desc: "안정과 균형", range: [21, 30],
    messages: [
      { en: "Stability brings luck. Core numbers are strong.", ko: "안정이 행운을 부릅니다. 중심 번호들이 강력합니다.", ja: "安定が幸運を呼びます. 中心の番号が強いです.", es: "La estabilidad trae suerte. Los números centrales son fuertes." },
      { en: "Firm foundation today. Balance is your weapon.", ko: "기초가 탄튼한 날입니다. 균형이 당신의 무기입니다.", ja: "土台がしっかりした日です. バランスが武器です.", es: "Cimientos firmos hoy. El equilibrio es tu arma." }
    ]
  },
  { 
    name: "Metal", symbol: "金", color: "text-gray-400", bg: "bg-gray-400/10", desc: "결단과 결실", range: [31, 40],
    messages: [
      { en: "Intuition leads to gold. Aim for high precision.", ko: "직관이 금빛 결실을 맺습니다. 높은 번호대를 공략하세요.", ja: "直感が実を結びます. 高い番号帯を狙ってください.", es: "La intuición lleva al oro. Apunta a números altos." },
      { en: "Sharpness is strength. Solid choices bring victory.", ko: "날카로움이 힘입니다. 단단한 선택이 승리를 부릅니다.", ja: "鋭さが力です. 堅実な選択が勝利を呼びます.", es: "La agudeza es fuerza. Decisiones sólidas traen victoria." }
    ]
  },
  { 
    name: "Water", symbol: "水", color: "text-blue-500", bg: "bg-blue-500/10", desc: "지혜와 유연함", range: [41, 50],
    messages: [
      { en: "Wisdom flows deep. Highest range carries power.", ko: "지혜가 깊게 흐릅니다. 가장 높은 번호대에 힘이 있습니다.", ja: "知恵が深く流れています. 最高位の番号に力があります.", es: "La sabiduría fluye profundo. El rango más alto tiene poder." },
      { en: "Adaptability is key. Let luck drift naturally.", ko: "유연함이 핵심입니다. 행운이 자연스럽게 흐르게 두세요.", ja: "柔軟さが鍵です. 運の流れに身を任せましょう.", es: "La adaptabilidad es clave. Deja que la suerte fluya." }
    ]
  },
];

// --- Component ---
export default function Home() {
  const [lang, setLang] = useState<Lang>("ko");
  const [activeTab, setActiveTab] = useState<TabType>("generate");
  const [numbers, setNumbers] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [board, setBoard] = useState<BoardItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLotto, setSelectedLotto] = useState<LotteryPreset>(LOTTERY_PRESETS[0]);
  const [user, setUser] = useState<User | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [boardMessage, setBoardMessage] = useState("");

  const [customCount, setCustomCount] = useState(6);
  const [customMax, setCustomMax] = useState(45);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [tempProfile, setTempProfile] = useState<UserProfile>({ name: "", birthDate: "", birthTime: "" });

  const t = TRANSLATIONS[lang];
  const luckScore = useMemo(() => Math.floor(Math.random() * 31) + 70, []);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(10);
  }, []);

  // --- Persistence Handlers ---
  useEffect(() => {
    const savedLang = localStorage.getItem("k-fortune-lang") as Lang;
    const savedTab = localStorage.getItem("k-fortune-tab") as TabType;
    if (savedLang) setLang(savedLang);
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    localStorage.setItem("k-fortune-lang", lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem("k-fortune-tab", activeTab);
  }, [activeTab]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from("lotto_history").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error && data) {
      setHistory(data.map((item) => ({
        id: item.id as string, numbers: item.numbers as number[], mode: item.mode as string, created_at: item.created_at as string,
        timestamp: new Date(item.created_at).toLocaleString(lang === "ko" ? "ko-KR" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        lottery_name: item.mode
      })));
    }
  }, [user, lang]);

  const fetchBoard = useCallback(async () => {
    const { data, error } = await supabase.from("fortune_board").select("*").order("created_at", { ascending: false }).limit(30);
    if (!error && data) setBoard(data as BoardItem[]);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem("k-fortune-profile");
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));
    if (user) fetchHistory();
    fetchBoard();
  }, [user, fetchHistory, fetchBoard]);

  const luckyElement = useMemo((): ElementInfo => {
    if (!userProfile) return ELEMENTS[2];
    const day = new Date(userProfile.birthDate).getDate();
    return ELEMENTS[day % 5];
  }, [userProfile]);

  const oracleMessage = useMemo(() => {
    const today = new Date().getDate();
    const msgIdx = today % luckyElement.messages.length;
    return luckyElement.messages[msgIdx][lang];
  }, [luckyElement, lang]);

  const generateNumbers = async () => {
    triggerHaptic();
    setIsGenerating(true);
    setVisibleCount(0);
    setNumbers([]);
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
      for (let i = 1; i <= sortedNumbers.length; i++) { setTimeout(() => { setVisibleCount(i); triggerHaptic(); }, i * 150); }
      if (user) {
        const { data, error } = await supabase.from("lotto_history").insert([{ numbers: sortedNumbers, mode: selectedLotto.name, user_id: user.id }]).select();
        if (!error && data) {
          const newItem: HistoryItem = { id: data[0].id, numbers: data[0].numbers, mode: data[0].mode, created_at: data[0].created_at, timestamp: lang === "ko" ? "방금 생성" : "Just Now", lottery_name: selectedLotto.name };
          setHistory([newItem, ...history].slice(0, 50));
        }
      }
      setIsGenerating(false);
    }, 800);
  };

  const handleLottoSelect = (lotto: LotteryPreset) => {
    triggerHaptic();
    setSelectedLotto(lotto);
    // 국가 카드 클릭 시 해당 국가의 기본 언어로 자동 전환
    if (lotto.id !== "custom") {
      setLang(lotto.defaultLang);
    }
  };

  const handlePostToBoard = async () => {
    if (!user || numbers.length === 0) return;
    triggerHaptic();
    const { error } = await supabase.from("fortune_board").insert([{
      user_id: user.id, user_name: userProfile?.name || "Seeker",
      content: boardMessage || "Luck shared!", lucky_numbers: numbers
    }]);
    if (!error) {
      setBoardMessage("");
      setShowShareModal(false);
      fetchBoard();
      setActiveTab("board");
    }
  };

  const finalShareLuck = async () => {
    triggerHaptic();
    const text = `🍀 ${t.title} Fortune 🍀\n\n[${selectedLotto.name}]\n${numbers.join(", ")}\n\n${t.subtitle}\n${window.location.origin}`;
    if (navigator.share) {
      await navigator.share({ title: t.title, text: text });
    } else {
      await navigator.clipboard.writeText(text);
      alert(lang === "ko" ? "메시지가 복사되었습니다!" : "Luck message copied!");
    }
  };

  return (
    <>
      <header className="px-6 py-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tighter italic leading-none">{t.title}</h1>
            <div className="flex gap-1">
              {(["ko", "en", "ja", "es"] as Lang[]).map((l) => (
                <button key={l} onClick={() => { setLang(l); triggerHaptic(); }} className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase transition-all ${lang === l ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-neutral-800 text-gray-400"}`}>{l}</button>
              ))}
            </div>
          </div>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-2">{t.subtitle}</p>
        </div>
        <div className="flex flex-col items-end">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end"><span className="text-sm font-black text-blue-500 uppercase">{userProfile?.name || "Seeker"}</span><span className="text-[9px] text-gray-400 tracking-tighter">{t.connected}</span></div>
              <button onClick={() => { supabase.auth.signOut(); triggerHaptic(); }} className="w-9 h-9 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm shadow-sm">🚪</button>
            </div>
          ) : (
            <button onClick={() => { supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); triggerHaptic(); }} className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20">{t.login}</button>
          )}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 pb-40">
        {activeTab === "generate" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <section className="grid grid-cols-2 gap-3">
              {LOTTERY_PRESETS.map((lotto) => (
                <button key={lotto.id} onClick={() => handleLottoSelect(lotto)} className={`px-6 py-5 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedLotto.id === lotto.id ? "bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]" : "bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-400 hover:border-blue-200"}`}>
                  <span className="text-3xl">{lotto.country}</span><span className="text-sm font-black uppercase tracking-tighter">{lotto.name}</span>
                </button>
              ))}
            </section>

            {selectedLotto.id === "custom" && (
              <section className="bg-gray-50 dark:bg-neutral-900/50 p-8 rounded-[2.5rem] space-y-8 border border-gray-100 dark:border-neutral-800">
                <div className="space-y-4">
                  <div className="flex justify-between items-center font-black text-gray-400 uppercase tracking-widest text-xs"><span>{t.numCount}</span><span className="text-blue-600 text-base">{customCount}</span></div>
                  <input type="range" min="3" max="10" value={customCount} onChange={(e) => setCustomCount(parseInt(e.target.value))} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center font-black text-gray-400 uppercase tracking-widest text-xs"><span>{t.range}</span><span className="text-blue-600 text-base">1 ~ {customMax}</span></div>
                  <input type="range" min="30" max="70" value={customMax} onChange={(e) => setCustomMax(parseInt(e.target.value))} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </section>
            )}

            <section className="bg-neutral-950 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden border border-blue-900/20 text-center min-h-[340px] flex flex-col items-center justify-center group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12)_0%,transparent_70%)] opacity-50"></div>
              {numbers.length === 0 ? (
                <div className="space-y-4 opacity-30"><div className="text-8xl animate-float">☯️</div><p className="text-xs font-black uppercase tracking-[0.4em] text-blue-400">Awaiting Alignment</p></div>
              ) : (
                <div className="flex flex-col items-center gap-12 w-full relative z-10">
                  <div className="flex justify-center gap-4 flex-wrap max-w-xs">
                    {numbers.map((num, idx) => ( <div key={idx} className={`w-14 h-14 flex items-center justify-center rounded-full text-xl font-black shadow-2xl transform transition-all duration-500 ${idx < visibleCount ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 rotate-180"} ${getBallColor(num, selectedLotto.id === "custom" ? customMax : selectedLotto.max)}`} style={{ boxShadow: "inset -4px -4px 10px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.3)" }}>{num}</div> ))}
                  </div>
                  {visibleCount === numbers.length && (
                    <button onClick={() => { triggerHaptic(); setShowShareModal(true); }} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-700">
                      <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">{t.shareTitle}</span>
                    </button>
                  )}
                </div>
              )}
            </section>
            <button onClick={generateNumbers} disabled={isGenerating} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl flex items-center justify-center transition-all active:scale-[0.95] ${isGenerating ? "bg-blue-400 animate-pulse" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/40"}`}><span className="tracking-widest uppercase text-xl font-black">{isGenerating ? t.invoking : t.generateLuck}</span></button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black tracking-tighter px-2">{t.records}</h2>
            {!user ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem] p-10 space-y-8 border-2 border-dashed border-gray-100 dark:border-neutral-800">
                <div className="text-7xl opacity-20">🔒</div><p className="text-base font-bold text-gray-500 leading-relaxed">{lang === "ko" ? "로그인하시면 클라우드에 영구적으로\n기록을 보관할 수 있습니다." : "Log in to keep your records\npermanently in the cloud."}</p>
                <button onClick={() => { supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); triggerHaptic(); }} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl uppercase text-sm tracking-widest">Sign in with Google</button>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-32 text-gray-400 font-black italic bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem]">{t.noRecords}</div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {history.map((item) => (
                  <div key={item.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-7 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="flex justify-between items-center mb-5"><div className="flex items-center gap-3"><span className="text-[10px] font-black text-white uppercase bg-blue-600 px-4 py-1.5 rounded-full">{item.lottery_name}</span><span className="text-xs text-gray-400 font-bold tracking-tight">{item.timestamp}</span></div><button onClick={() => { triggerHaptic(); if(confirm("Delete?")) supabase.from("lotto_history").delete().match({ id: item.id }).then(() => fetchHistory()); }} className="text-gray-300 hover:text-red-500 transition-all p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button></div>
                    <div className="flex gap-3 flex-wrap">{item.numbers.map((num, nIdx) => ( <div key={nIdx} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${getBallColor(num, 70)}`}>{num}</div> ))}</div>
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
                <div className="text-center space-y-4 mb-10"><div className="text-7xl">☯️</div><h2 className="text-3xl font-black tracking-tighter uppercase">{t.awakenDestiny}</h2><p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">{t.oracleGuide}</p></div>
                <form onSubmit={(e) => { e.preventDefault(); localStorage.setItem("k-fortune-profile", JSON.stringify(tempProfile)); setUserProfile(tempProfile); triggerHaptic(); }} className="space-y-8">
                  <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">{t.nameLabel}</label><input type="text" placeholder="Seeker" className="w-full px-8 py-5 rounded-3xl bg-gray-50 dark:bg-neutral-800 border-none font-black text-lg focus:ring-4 focus:ring-blue-500/20 transition-all" value={tempProfile.name} onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} required /></div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">{t.dateLabel}</label><input type="date" className="w-full px-8 py-5 rounded-3xl bg-gray-50 dark:bg-neutral-800 border-none font-black text-lg focus:ring-4 focus:ring-blue-500/20" value={tempProfile.birthDate} onChange={(e) => setTempProfile({...tempProfile, birthDate: e.target.value})} required /></div>
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest">{t.startOracle}</button>
                </form>
              </section>
            ) : (
              <div className="space-y-10">
                <div className="text-center space-y-2"><h2 className="text-4xl font-black italic tracking-tighter">{t.oracle}</h2><p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.4em] underline decoration-2 underline-offset-4">{userProfile.name}'s Soul Alignment</p></div>
                <div className={`p-10 rounded-[4.5rem] shadow-2xl ${luckyElement.bg} border border-white/5 relative overflow-hidden transition-all duration-1000`}>
                  <div className="flex justify-between items-start relative z-10"><div className="space-y-2"><span className={`text-[10px] font-black uppercase tracking-[0.3em] ${luckyElement.color}`}>Primary Element</span><h3 className="text-6xl font-black tracking-tighter">{luckyElement.name}</h3><p className="text-sm font-bold opacity-60 italic">{luckyElement.desc}</p></div><span className={`text-[12rem] font-serif opacity-10 ${luckyElement.color} absolute -right-12 -top-12`}>{luckyElement.symbol}</span></div>
                  <div className="mt-12 p-8 bg-white/40 dark:bg-black/30 rounded-[2.5rem] backdrop-blur-md relative z-10 border border-white/10">
                    <p className="text-xl font-black leading-relaxed text-gray-800 dark:text-gray-100">{oracleMessage}</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-gray-400 uppercase tracking-widest px-2">{t.elementAnalysis}</h3>
                  <div className="bg-white dark:bg-neutral-900 rounded-[3rem] p-10 space-y-10 border border-gray-100 dark:border-neutral-800 shadow-sm">
                    {ELEMENTS.map((el) => {
                      const isActive = el.name === luckyElement.name;
                      return (
                        <div key={el.name} className="space-y-4">
                          <div className="flex justify-between items-end"><span className={`text-xl font-black uppercase tracking-tighter ${el.color}`}>{el.name} {el.symbol}</span><span className="text-xs font-black text-gray-400">{isActive ? "PEAK ENERGY" : "STEADY"}</span></div>
                          <div className="h-4 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden"><div className={`h-full transition-all duration-1000 ${isActive ? "bg-blue-600 w-full" : "bg-gray-300 dark:bg-gray-700 w-1/3"}`}></div></div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button onClick={() => { if(confirm("Reset?")) { localStorage.removeItem("k-fortune-profile"); setUserProfile(null); triggerHaptic(); } }} className="w-full py-5 text-[10px] text-gray-400 font-black uppercase tracking-[0.4em] hover:text-red-500 transition-all border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-3xl">Reset My Destiny</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "board" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300 pb-10">
            <h2 className="text-3xl font-black tracking-tighter px-2">{t.boardTitle}</h2>
            <div className="grid grid-cols-1 gap-6">
              {board.length === 0 ? (
                <div className="text-center py-32 text-gray-400 font-black italic bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem]">The square is quiet.</div>
              ) : (
                board.map((post) => (
                  <div key={post.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-8 rounded-[3rem] shadow-sm space-y-6">
                    <div className="flex justify-between items-center"><span className="text-sm font-black text-blue-600 uppercase tracking-tighter italic">@{post.user_name}</span><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span></div>
                    <p className="text-lg font-bold leading-snug text-gray-800 dark:text-gray-100 italic">"{post.content}"</p>
                    <div className="flex gap-2 flex-wrap">{post.lucky_numbers.map((num, i) => ( <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${getBallColor(num, 70)}`}>{num}</div> ))}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowShareModal(false)}></div>
          <div className="relative w-full max-w-sm bg-gradient-to-b from-neutral-900 to-black rounded-[3.5rem] shadow-[0_0_100px_rgba(37,99,235,0.3)] overflow-hidden border border-white/10 flex flex-col p-10 gap-8 animate-in zoom-in duration-500">
            <div className="text-center space-y-2"><h3 className="text-2xl font-black italic tracking-tight text-white">{t.shareTitle}</h3><p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em]">{t.subtitle}</p></div>
            <div className={`p-8 rounded-[2.5rem] ${luckyElement.bg} border border-white/5 relative overflow-hidden text-center`}><span className={`text-8xl font-serif opacity-20 ${luckyElement.color} absolute left-1/2 -translate-x-1/2 -top-4`}>{luckyElement.symbol}</span><div className="relative z-10 space-y-6"><p className="text-xs font-black text-gray-400 uppercase tracking-widest">{userProfile?.name || "Seeker"}'s Luck</p><div className="flex justify-center gap-3 flex-wrap">{numbers.map((num, i) => ( <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${getBallColor(num, 70)} shadow-lg`}>{num}</div> ))}</div><p className="text-sm font-bold italic text-white/80">"May the cosmos align in your favor."</p></div></div>
            {user ? (
              <div className="space-y-4"><input type="text" placeholder={t.writeMessage} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500" value={boardMessage} onChange={(e) => setBoardMessage(e.target.value)} /><button onClick={handlePostToBoard} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl text-sm uppercase tracking-widest active:scale-95 transition-all">{t.postBoard}</button></div>
            ) : (
              <button onClick={finalShareLuck} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl text-sm uppercase tracking-widest active:scale-95 transition-all">Send Fortune</button>
            )}
            <button onClick={() => setShowShareModal(false)} className="w-full py-4 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{t.close}</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-[460px] bg-white/90 dark:bg-neutral-950/90 backdrop-blur-2xl border border-gray-100 dark:border-white/5 flex justify-around items-center py-5 z-20 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
        <button onClick={() => { setActiveTab("generate"); triggerHaptic(); }} className={`flex flex-col items-center gap-2 transition-all ${activeTab === "generate" ? "text-blue-600 scale-110" : "text-gray-400"}`}><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20m10-10H2"/></svg><span className="text-[9px] font-black uppercase tracking-widest mt-1">{t.invoke}</span></button>
        <button onClick={() => { setActiveTab("history"); triggerHaptic(); }} className={`flex flex-col items-center gap-2 transition-all ${activeTab === "history" ? "text-blue-600 scale-110" : "text-gray-400"}`}><svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg><span className="text-[9px] font-black uppercase tracking-widest mt-1">{t.records}</span></button>
        <button onClick={() => { setActiveTab("agent"); triggerHaptic(); }} className={`flex flex-col items-center gap-2 transition-all ${activeTab === "agent" ? "text-blue-600 scale-110" : "text-gray-400"}`}><svg xmlns="http://www.w3.org/2000/svg" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 11-7.6-11.7 1 1 0 011 1V5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1 1 1 0 011 1v.5a1 1 0 011 1v.5a1 1 0 001 1h.5a1 1 0 001-1v-.5a1 1 0 011-1z"/></svg><span className="text-[9px] font-black uppercase tracking-widest mt-1">{t.oracle}</span></button>
        <button onClick={() => { setActiveTab("board"); triggerHaptic(); }} className={`flex flex-col items-center gap-2 transition-all ${activeTab === "board" ? "text-blue-600 scale-110" : "text-gray-400"}`}><svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span className="text-[9px] font-black uppercase tracking-widest mt-1">{t.board}</span></button>
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
