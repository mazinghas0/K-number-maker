"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";

// --- Types ---
type Lang = "en" | "ko" | "ja" | "es";
type TabType = "generate" | "history" | "agent" | "board" | "rules" | "alarms" | "settings";

interface Translation {
  title: string; subtitle: string; invoke: string; records: string; oracle: string; board: string;
  login: string; logout: string; generateLuck: string; invoking: string;
  selectMode: string; numCount: string; range: string; connected: string;
  noRecords: string; resetProfile: string; awakenDestiny: string; oracleGuide: string;
  nameLabel: string; dateLabel: string; startOracle: string; luckyArea: string;
  luckIndex: string; shareTitle: string; close: string; elementAnalysis: string;
  postBoard: string; boardTitle: string; writeMessage: string; send: string;
  menu: string; myRules: string; alarms: string; settings: string;
  onbTitle1: string; onbDesc1: string; onbTitle2: string; onbDesc2: string; onbTitle3: string; onbDesc3: string; next: string; start: string;
  chatWelcome: string; chatAskMood: string; chatActionGen: string; chatReset: string;
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
    menu: "Menu", myRules: "My Rules", alarms: "Alarms & Routines", settings: "Settings",
    onbTitle1: "Welcome to K-Fortune", onbDesc1: "Generate your lucky numbers blending Eastern Oracle with global lotteries.",
    onbTitle2: "Smart Modes", onbDesc2: "Use Quick Random, Custom rules, or let the Oracle guide your destiny.",
    onbTitle3: "Stay in Routine", onbDesc3: "Set alarms for Lotto days and never miss your chance at fortune.",
    next: "Next", start: "Start Destiny",
    chatWelcome: "I sense your aura.", chatAskMood: "How is your mood today?", chatActionGen: "Align Destiny & Generate", chatReset: "Restart Consultation"
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
    menu: "메뉴", myRules: "나만의 규칙", alarms: "알람 및 루틴", settings: "설정",
    onbTitle1: "K-포춘에 오신 것을 환영합니다", onbDesc1: "동양의 운세와 글로벌 복권 시스템이 결합된 나만의 행운 번호를 만들어보세요.",
    onbTitle2: "스마트 모드", onbDesc2: "빠른 생성, 커스텀 규칙, 혹은 운세 엔진(Oracle)의 가이드를 받아보세요.",
    onbTitle3: "루틴 알람", onbDesc3: "로또 데이 알람을 설정하여 행운의 타이밍을 놓치지 마세요.",
    next: "다음", start: "운명 시작하기",
    chatWelcome: "당신의 맑은 기운이 느껴집니다.", chatAskMood: "오늘의 기분은 어떠신가요?", chatActionGen: "운명의 번호 생성하기", chatReset: "상담 다시 시작하기"
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
    menu: "メニュー", myRules: "マイルール", alarms: "アラームとルーチン", settings: "設定",
    onbTitle1: "K-運勢へようこそ", onbDesc1: "東洋の占いとグローバル宝くじを組み合わせたラッキーナンバーを生成します。",
    onbTitle2: "スマートモード", onbDesc2: "クイック生成、カスタム、または占いのガイドに従ってください。",
    onbTitle3: "ルーチンアラーム", onbDesc3: "宝くじの日のアラームを設定して、幸運のタイミングを逃さないようにしましょう。",
    next: "次へ", start: "運命を始める",
    chatWelcome: "あなたのオーラを感じます。", chatAskMood: "今日の気分はどうですか？", chatActionGen: "運命の番号を生成する", chatReset: "相談をやり直す"
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
    menu: "Menú", myRules: "Mis Reglas", alarms: "Alarmas y Rutinas", settings: "Ajustes",
    onbTitle1: "Bienvenido a K-Fortuna", onbDesc1: "Genera números de la suerte combinando el Oráculo Oriental y loterías globales.",
    onbTitle2: "Modos Inteligentes", onbDesc2: "Usa modos rápidos, personalizados o deja que el Oráculo guíe tu destino.",
    onbTitle3: "Mantén la Rutina", onbDesc3: "Configura alarmas para los días de lotería y no pierdas tu oportunidad.",
    next: "Siguiente", start: "Iniciar Destino",
    chatWelcome: "Siento tu aura.", chatAskMood: "¿Cómo está tu estado de ánimo hoy?", chatActionGen: "Generar Números de Destino", chatReset: "Reiniciar Consulta"
  }
};

interface HistoryItem { id: string; numbers: number[]; mode: string; created_at: string; timestamp: string; lottery_name: string; }
interface BoardItem { id: string; user_name: string; content: string; lucky_numbers: number[]; created_at: string; }
interface LotteryPreset { id: string; name: string; count: number; max: number; country: string; defaultLang: Lang; }
interface UserProfile { name: string; birthDate: string; birthTime: string; }
interface ElementInfo { name: string; symbol: string; color: string; bg: string; desc: string; range: [number, number]; messages: { en: string; ko: string; ja: string; es: string }[]; }

interface ChatMessage {
  id: string;
  sender: "oracle" | "user";
  type: "text" | "mood-selector" | "action-generate" | "number-result";
  text?: string;
  numbers?: number[];
  story?: string;
}

interface AlarmsState {
  lottoDay: boolean;
  resultCheck: boolean;
  time: string;
}

const LOTTERY_PRESETS: LotteryPreset[] = [
  { id: "k-lotto", name: "K-Lotto", count: 6, max: 45, country: "🇰🇷", defaultLang: "ko" },
  { id: "powerball", name: "Powerball", count: 5, max: 69, country: "🇺🇸", defaultLang: "en" },
  { id: "euromillions", name: "EuroMillions", count: 5, max: 50, country: "🇪🇺", defaultLang: "en" },
  { id: "loto6", name: "Loto 6", count: 6, max: 43, country: "🇯🇵", defaultLang: "ja" },
  { id: "custom", name: "Custom", count: 6, max: 45, country: "⚙️", defaultLang: "en" },
];

const ELEMENTS: ElementInfo[] = [
  { name: "Wood", symbol: "木", color: "text-green-500", bg: "bg-green-500/10", desc: "성장과 활력", range: [1, 10], messages: [{ en: "Energy flows like a tree.", ko: "나무의 기운이 흐릅니다.", ja: "木のエネルギー.", es: "Energía de árbol." }] },
  { name: "Fire", symbol: "火", color: "text-red-500", bg: "bg-red-500/10", desc: "열정과 확산", range: [11, 20], messages: [{ en: "Passion lights way.", ko: "열정이 길을 밝힙니다.", ja: "情熱が道を照らす.", es: "La pasión ilumina." }] },
  { name: "Earth", symbol: "土", color: "text-yellow-600", bg: "bg-yellow-600/10", desc: "안정과 균형", range: [21, 30], messages: [{ en: "Stability luck.", ko: "안정이 행운을 부릅니다.", ja: "安定가幸運를呼ぶ.", es: "Estabilidad suerte." }] },
  { name: "Metal", symbol: "金", color: "text-gray-400", bg: "bg-gray-400/10", desc: "결단과 결실", range: [31, 40], messages: [{ en: "Intuition gold.", ko: "직관이 결실을 맺습니다.", ja: "直感が実を結ぶ.", es: "Intuición oro." }] },
  { name: "Water", symbol: "水", color: "text-blue-500", bg: "bg-blue-500/10", desc: "지혜와 유연함", range: [41, 50], messages: [{ en: "Wisdom flows.", ko: "지혜가 흐릅니다.", ja: "知恵が流れる.", es: "Sabiduría fluye." }] },
];

const MOODS = [
  { emoji: "😡", label: "Angry", effect: "Balancing Fire" },
  { emoji: "😢", label: "Sad", effect: "Soothing Water" },
  { emoji: "😐", label: "Calm", effect: "Grounded Earth" },
  { emoji: "🙂", label: "Happy", effect: "Growing Wood" },
  { emoji: "🤩", label: "Excited", effect: "Shining Metal" }
];

const getBallColor = (num: number, max: number): string => {
  const percent = (num / max) * 100;
  if (percent <= 20) return "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950";
  if (percent <= 40) return "bg-gradient-to-br from-blue-300 to-blue-500 text-blue-950";
  if (percent <= 60) return "bg-gradient-to-br from-red-300 to-red-500 text-red-950";
  if (percent <= 80) return "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950";
  return "bg-gradient-to-br from-green-300 to-green-500 text-green-950";
};

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

  const [showSidebar, setShowSidebar] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);

  // Chat Interface State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Alarms State
  const [alarms, setAlarms] = useState<AlarmsState>({ lottoDay: false, resultCheck: false, time: "18:00" });

  const t = TRANSLATIONS[lang];

  const triggerHaptic = useCallback(() => {
    if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(10);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const savedLang = localStorage.getItem("k-fortune-lang") as Lang;
    const savedTab = localStorage.getItem("k-fortune-tab") as TabType;
    const hasOnboarded = localStorage.getItem("k-fortune-onboarded");
    const savedAlarms = localStorage.getItem("k-fortune-alarms");
    
    if (savedLang) setLang(savedLang);
    if (savedTab && ["generate", "history", "agent", "board", "rules", "alarms", "settings"].includes(savedTab)) setActiveTab(savedTab);
    if (!hasOnboarded) setShowOnboarding(true);
    if (savedAlarms) setAlarms(JSON.parse(savedAlarms));
  }, []);

  useEffect(() => { localStorage.setItem("k-fortune-lang", lang); }, [lang]);
  useEffect(() => { localStorage.setItem("k-fortune-tab", activeTab); }, [activeTab]);
  useEffect(() => { scrollToBottom(); }, [chatMessages]);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from("lotto_history").select("*").order("created_at", { ascending: false }).limit(50);
    if (!error && data) {
      setHistory(data.map((item) => ({
        id: item.id as string, numbers: item.numbers as number[], mode: item.mode as string, created_at: item.created_at as string,
        timestamp: new Date(item.created_at).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        lottery_name: item.mode
      })));
    }
  }, [user]);

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

  // Initialize Chat when Profile is set and Tab is Agent
  useEffect(() => {
    if (userProfile && activeTab === "agent" && chatMessages.length === 0) {
      const initialGreeting = lang === "ko" ? `${userProfile.name}님, ${t.chatWelcome} ${luckyElement.symbol}(${luckyElement.name})의 별 아래 태어나셨군요.` : `Welcome ${userProfile.name}. ${t.chatWelcome} You are guided by the ${luckyElement.name} element.`;
      
      setChatMessages([
        { id: "1", sender: "oracle", type: "text", text: initialGreeting },
        { id: "2", sender: "oracle", type: "text", text: t.chatAskMood },
        { id: "3", sender: "oracle", type: "mood-selector" }
      ]);
    }
  }, [userProfile, activeTab, chatMessages.length, lang, t.chatWelcome, t.chatAskMood, luckyElement]);

  const handleMoodSelect = (mood: typeof MOODS[0]) => {
    triggerHaptic();
    const textRes = lang === "ko" ? `${mood.emoji} 기운을 확인했습니다. 당신의 ${luckyElement.symbol} 기운과 현재의 감정을 융합하여 완벽한 파동을 계산합니다.` : `I sense the ${mood.emoji} energy. Blending it with your ${luckyElement.name} foundation...`;
    
    setChatMessages(prev => [
      ...prev.filter(m => m.type !== "mood-selector"),
      { id: Date.now().toString(), sender: "user", type: "text", text: mood.emoji },
      { id: (Date.now()+1).toString(), sender: "oracle", type: "text", text: textRes },
      { id: (Date.now()+2).toString(), sender: "oracle", type: "action-generate", text: t.chatActionGen }
    ]);
  };

  const generateOracleNumbers = async () => {
    triggerHaptic();
    setIsGenerating(true);
    
    setChatMessages(prev => [
      ...prev.filter(m => m.type !== "action-generate"),
      { id: Date.now().toString(), sender: "oracle", type: "text", text: "🔮 " + t.invoking }
    ]);

    setTimeout(async () => {
      const max = selectedLotto.max;
      const count = selectedLotto.count;
      const generatedSet = new Set<number>();
      
      const [minRange, maxRange] = luckyElement.range;
      const luckySeed = Math.floor(Math.random() * (Math.min(maxRange, max) - minRange + 1)) + minRange;
      if (luckySeed <= max) generatedSet.add(luckySeed);
      
      while (generatedSet.size < count) {
        const randomBuffer = new Uint32Array(1);
        window.crypto.getRandomValues(randomBuffer);
        const randomNumber = (randomBuffer[0] % max) + 1;
        generatedSet.add(randomNumber);
      }
      
      const sortedNumbers = Array.from(generatedSet).sort((a, b) => a - b);
      
      const storyKo = `태어난 날의 강인한 [${luckyElement.name}] 기운과 오늘의 감정 파동이 만나 특별한 궤적을 그렸습니다. 특히 ${luckySeed}번은 당신을 수호하는 영혼의 숫자입니다.`;
      const storyEn = `The collision of your birth element [${luckyElement.name}] and today's emotional wave created a unique destiny path. Number ${luckySeed} acts as your guardian.`;
      
      const resultMsg: ChatMessage = {
        id: (Date.now() + 1).toString(), sender: "oracle", type: "number-result",
        numbers: sortedNumbers, story: lang === "ko" ? storyKo : storyEn
      };

      setChatMessages(prev => [
        ...prev.filter(m => m.text !== "🔮 " + t.invoking),
        resultMsg
      ]);
      
      setNumbers(sortedNumbers);
      
      if (user) {
        await supabase.from("lotto_history").insert([{ numbers: sortedNumbers, mode: `Oracle (${luckyElement.name})`, user_id: user.id }]);
        fetchHistory();
      }
      setIsGenerating(false);
    }, 1500);
  };

  const generateNumbers = async () => {
    triggerHaptic();
    setIsGenerating(true);
    setVisibleCount(0);
    setNumbers([]);
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
      for (let i = 1; i <= sortedNumbers.length; i++) { setTimeout(() => { setVisibleCount(i); triggerHaptic(); }, i * 150); }
      if (user) {
        const { data, error } = await supabase.from("lotto_history").insert([{ numbers: sortedNumbers, mode: selectedLotto.name, user_id: user.id }]).select();
        if (!error && data) {
          const newItem: HistoryItem = { id: data[0].id, numbers: data[0].numbers, mode: data[0].mode, created_at: data[0].created_at, timestamp: "방금 생성", lottery_name: selectedLotto.name };
          setHistory([newItem, ...history].slice(0, 50));
        }
      }
      setIsGenerating(false);
    }, 800);
  };

  const handleLottoSelect = (lotto: LotteryPreset) => {
    triggerHaptic();
    setSelectedLotto(lotto);
    if (lotto.id !== "custom") setLang(lotto.defaultLang);
  };

  const handlePostToBoard = async () => {
    if (!user || numbers.length === 0) return;
    triggerHaptic();
    const { error } = await supabase.from("fortune_board").insert([{ user_id: user.id, user_name: userProfile?.name || "Seeker", content: boardMessage || "Luck shared!", lucky_numbers: numbers }]);
    if (!error) { setBoardMessage(""); setShowShareModal(false); fetchBoard(); setActiveTab("board"); }
  };

  const finalShareLuck = async () => {
    triggerHaptic();
    const text = `🍀 ${t.title} Fortune 🍀\n\n[${selectedLotto.name}]\n${numbers.join(", ")}\n\n${t.subtitle}\n${window.location.origin}`;
    if (navigator.share) await navigator.share({ title: t.title, text: text });
    else { await navigator.clipboard.writeText(text); alert(lang === "ko" ? "메시지가 복사되었습니다!" : "Luck message copied!"); }
  };

  const completeOnboarding = () => {
    localStorage.setItem("k-fortune-onboarded", "true");
    setShowOnboarding(false);
  };

  const toggleAlarm = async (type: "lottoDay" | "resultCheck") => {
    triggerHaptic();
    if (!alarms[type]) {
      if (typeof window !== "undefined" && "Notification" in window) {
        let perm = Notification.permission;
        if (perm !== "granted" && perm !== "denied") {
          perm = await Notification.requestPermission();
        }
        if (perm === "granted") {
          const newAlarms = { ...alarms, [type]: true };
          setAlarms(newAlarms);
          localStorage.setItem("k-fortune-alarms", JSON.stringify(newAlarms));
        } else {
          alert(lang === "ko" ? "브라우저 알림 권한을 허용해주세요." : "Please allow notification permissions.");
        }
      } else {
        alert(lang === "ko" ? "이 브라우저에서는 알림 기능을 지원하지 않습니다." : "Notifications are not supported in this browser.");
      }
    } else {
      const newAlarms = { ...alarms, [type]: false };
      setAlarms(newAlarms);
      localStorage.setItem("k-fortune-alarms", JSON.stringify(newAlarms));
    }
  };

  const updateAlarmTime = (time: string) => {
    const newAlarms = { ...alarms, time };
    setAlarms(newAlarms);
    localStorage.setItem("k-fortune-alarms", JSON.stringify(newAlarms));
  };

  return (
    <>
      <header className="px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-black/95 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => { setShowSidebar(true); triggerHaptic(); }} className="text-gray-800 dark:text-gray-200 focus:outline-none hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter italic leading-none">{t.title}</h1>
            <p className="text-[9px] text-blue-500 font-bold uppercase tracking-[0.2em] mt-1">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          {user ? (
            <div className="flex items-center gap-3"><div className="flex flex-col items-end"><span className="text-sm font-black text-blue-500 uppercase">{userProfile?.name || "Seeker"}</span></div><button onClick={() => { supabase.auth.signOut(); triggerHaptic(); }} className="w-8 h-8 rounded-2xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-sm shadow-sm hover:scale-105 transition-all">🚪</button></div>
          ) : (
            <button onClick={() => { supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); triggerHaptic(); }} className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">{t.login}</button>
          )}
        </div>
      </header>

      {/* SIDEBAR OVERLAY */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSidebar(false)}></div>
          <div className="relative w-64 bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center">
              <span className="font-black text-lg italic tracking-tight">{t.menu}</span>
              <button onClick={() => setShowSidebar(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white p-2">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
              <ul className="space-y-2 px-4">
                <li><button onClick={() => { setActiveTab("generate"); setShowSidebar(false); triggerHaptic(); }} className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'generate' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-neutral-800'}`}><span className="text-lg">🎲</span>{t.invoke}</button></li>
                <li><button onClick={() => { setActiveTab("history"); setShowSidebar(false); triggerHaptic(); }} className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'history' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-neutral-800'}`}><span className="text-lg">📜</span>{t.records}</button></li>
                <li><button onClick={() => { setActiveTab("agent"); setShowSidebar(false); triggerHaptic(); }} className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'agent' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-neutral-800'}`}><span className="text-lg">☯️</span>{t.oracle}</button></li>
                <li><button onClick={() => { setActiveTab("rules"); setShowSidebar(false); triggerHaptic(); }} className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'rules' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-neutral-800'}`}><span className="text-lg">⚙️</span>{t.myRules}</button></li>
                <li><button onClick={() => { setActiveTab("alarms"); setShowSidebar(false); triggerHaptic(); }} className={`w-full text-left px-4 py-3 rounded-2xl font-bold text-sm flex items-center gap-3 transition-all ${activeTab === 'alarms' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-neutral-800'}`}><span className="text-lg">⏰</span>{t.alarms}</button></li>
              </ul>
            </div>
            <div className="p-6 border-t border-gray-100 dark:border-neutral-800">
              <div className="flex gap-2 justify-center mb-4">{(["ko", "en", "ja", "es"] as Lang[]).map((l) => ( <button key={l} onClick={() => { setLang(l); triggerHaptic(); }} className={`px-2 py-1 rounded text-[10px] font-black uppercase transition-all ${lang === l ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-neutral-800 text-gray-400"}`}>{l}</button> ))}</div>
              <button onClick={() => { setActiveTab("settings"); setShowSidebar(false); triggerHaptic(); }} className={`w-full text-center px-4 py-3 rounded-2xl font-bold text-sm transition-all ${activeTab === 'settings' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-gray-50 dark:bg-neutral-800 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-700'}`}>{t.settings}</button>
            </div>
          </div>
        </div>
      )}

      {/* ONBOARDING OVERLAY */}
      {showOnboarding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-6 animate-in fade-in duration-500">
          <div className="w-full max-w-sm bg-neutral-900 rounded-[3rem] p-10 text-center shadow-2xl border border-neutral-800 flex flex-col items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 w-full min-h-[220px] flex flex-col items-center justify-center">
              {onboardingStep === 0 && (
                <div className="space-y-6 animate-in zoom-in duration-500">
                  <div className="text-7xl animate-bounce">🍀</div>
                  <h2 className="text-2xl font-black text-white">{t.onbTitle1}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">{t.onbDesc1}</p>
                </div>
              )}
              {onboardingStep === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="text-7xl">🔮</div>
                  <h2 className="text-2xl font-black text-white">{t.onbTitle2}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">{t.onbDesc2}</p>
                </div>
              )}
              {onboardingStep === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                  <div className="text-7xl">⏰</div>
                  <h2 className="text-2xl font-black text-white">{t.onbTitle3}</h2>
                  <p className="text-gray-400 text-sm leading-relaxed">{t.onbDesc3}</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex gap-3 relative z-10">
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${onboardingStep === 0 ? "bg-blue-500 w-6" : "bg-neutral-700"}`}></div>
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${onboardingStep === 1 ? "bg-blue-500 w-6" : "bg-neutral-700"}`}></div>
              <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${onboardingStep === 2 ? "bg-blue-500 w-6" : "bg-neutral-700"}`}></div>
            </div>
            
            <button 
              onClick={() => { triggerHaptic(); if(onboardingStep < 2) setOnboardingStep(onboardingStep + 1); else completeOnboarding(); }} 
              className="mt-10 w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-full uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-blue-500/20 relative z-10">
              {onboardingStep < 2 ? t.next : t.start}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-6 py-8 pb-40">
        {activeTab === "generate" && (
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            <section className="grid grid-cols-2 gap-3">{LOTTERY_PRESETS.map((lotto) => ( <button key={lotto.id} onClick={() => handleLottoSelect(lotto)} className={`px-6 py-5 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-2 ${selectedLotto.id === lotto.id ? "bg-blue-600 border-blue-600 text-white shadow-xl scale-[1.02]" : "bg-white dark:bg-neutral-900 border-gray-100 dark:border-neutral-800 text-gray-400 hover:border-blue-200"}`}><span className="text-3xl">{lotto.country}</span><span className="text-sm font-black uppercase tracking-tighter">{lotto.name}</span></button> ))}</section>
            {selectedLotto.id === "custom" && ( <section className="bg-gray-50 dark:bg-neutral-900/50 p-8 rounded-[2.5rem] space-y-8 border border-gray-100 dark:border-neutral-800"><div className="space-y-4"><div className="flex justify-between items-center font-black text-gray-400 uppercase tracking-widest text-xs"><span>{t.numCount}</span><span className="text-blue-600 text-base">{customCount}</span></div><input type="range" min="3" max="10" value={customCount} onChange={(e) => setCustomCount(parseInt(e.target.value))} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" /></div><div className="space-y-4"><div className="flex justify-between items-center font-black text-gray-400 uppercase tracking-widest text-xs"><span>{t.range}</span><span className="text-blue-600 text-base">1 ~ {customMax}</span></div><input type="range" min="30" max="70" value={customMax} onChange={(e) => setCustomMax(parseInt(e.target.value))} className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" /></div></section> )}
            <section className="bg-neutral-950 rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden border border-blue-900/20 text-center min-h-[340px] flex flex-col items-center justify-center group"><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.12)_0%,transparent_70%)] opacity-50"></div>{numbers.length === 0 ? ( <div className="space-y-4 opacity-30"><div className="text-8xl animate-float">☯️</div><p className="text-xs font-black uppercase tracking-[0.4em] text-blue-400">Awaiting Alignment</p></div> ) : ( <div className="flex flex-col items-center gap-12 w-full relative z-10"><div className="flex justify-center gap-4 flex-wrap max-w-xs">{numbers.map((num, idx) => ( <div key={idx} className={`w-14 h-14 flex items-center justify-center rounded-full text-xl font-black shadow-2xl transform transition-all duration-500 ${idx < visibleCount ? "scale-100 opacity-100 rotate-0" : "scale-0 opacity-0 rotate-180"} ${getBallColor(num, selectedLotto.id === "custom" ? customMax : selectedLotto.max)}`} style={{ boxShadow: "inset -4px -4px 10px rgba(0,0,0,0.2), 0 10px 20px rgba(0,0,0,0.3)" }}>{num}</div> ))}</div>{visibleCount === numbers.length && ( <button onClick={() => { triggerHaptic(); setShowShareModal(true); }} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all flex items-center gap-2 animate-in fade-in zoom-in duration-700"><span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">{t.shareTitle}</span></button> )}</div> )}</section>
            <button onClick={generateNumbers} disabled={isGenerating} className={`w-full text-white font-black py-8 rounded-[2.5rem] shadow-2xl flex items-center justify-center transition-all active:scale-[0.95] ${isGenerating ? "bg-blue-400 animate-pulse" : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/40"}`}><span className="tracking-widest uppercase text-xl font-black">{isGenerating ? t.invoking : t.generateLuck}</span></button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-3xl font-black tracking-tighter px-2">{t.records}</h2>
            {!user ? (
              <div className="text-center py-20 bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem] p-10 space-y-8 border-2 border-dashed border-gray-100 dark:border-neutral-800"><div className="text-7xl opacity-20">🔒</div><p className="text-base font-bold text-gray-500 leading-relaxed">{lang === "ko" ? "로그인하시면 클라우드에 영구적으로\n기록을 보관할 수 있습니다." : "Log in to keep your records\npermanently in the cloud."}</p><button onClick={() => { supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); triggerHaptic(); }} className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl uppercase text-sm tracking-widest">Sign in with Google</button></div>
            ) : history.length === 0 ? (
              <div className="text-center py-32 text-gray-400 font-black italic bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem]">{t.noRecords}</div>
            ) : (
              <div className="grid grid-cols-1 gap-5">{history.map((item) => ( <div key={item.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-7 rounded-[2.5rem] shadow-sm relative overflow-hidden group hover:shadow-md transition-all"><div className="flex justify-between items-center mb-5"><div className="flex items-center gap-3"><span className="text-[10px] font-black text-white uppercase bg-blue-600 px-4 py-1.5 rounded-full">{item.lottery_name}</span><span className="text-xs text-gray-400 font-bold tracking-tight">{item.timestamp}</span></div><button onClick={() => { triggerHaptic(); if(confirm("Delete?")) supabase.from("lotto_history").delete().match({ id: item.id }).then(() => fetchHistory()); }} className="text-gray-300 hover:text-red-500 transition-all p-2 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg></button></div><div className="flex gap-3 flex-wrap">{item.numbers.map((num, nIdx) => ( <div key={nIdx} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-sm ${getBallColor(num, 70)}`}>{num}</div> ))}</div></div> ))}</div>
            )}
          </div>
        )}

        {/* --- PHASE 2 & 3: K-AGENT CHAT INTERFACE --- */}
        {activeTab === "agent" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300 pb-10">
            {!userProfile ? (
              <section className="bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] shadow-2xl border border-gray-100 dark:border-neutral-800"><div className="text-center space-y-4 mb-10"><div className="text-7xl">☯️</div><h2 className="text-3xl font-black tracking-tighter uppercase">{t.awakenDestiny}</h2><p className="text-xs text-gray-400 font-black uppercase tracking-[0.2em]">{t.oracleGuide}</p></div><form onSubmit={(e) => { e.preventDefault(); localStorage.setItem("k-fortune-profile", JSON.stringify(tempProfile)); setUserProfile(tempProfile); triggerHaptic(); }} className="space-y-8"><div className="space-y-3"><label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">{t.nameLabel}</label><input type="text" placeholder="Seeker" className="w-full px-8 py-5 rounded-3xl bg-gray-50 dark:bg-neutral-800 border-none font-black text-lg focus:ring-4 focus:ring-blue-500/20 transition-all" value={tempProfile.name} onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})} required /></div><div className="space-y-3"><label className="text-[10px] font-black text-gray-400 ml-2 uppercase tracking-widest">{t.dateLabel}</label><input type="date" className="w-full px-8 py-5 rounded-3xl bg-gray-50 dark:bg-neutral-800 border-none font-black text-lg focus:ring-4 focus:ring-blue-500/20" value={tempProfile.birthDate} onChange={(e) => setTempProfile({...tempProfile, birthDate: e.target.value})} required /></div><button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-[2.5rem] shadow-xl uppercase tracking-widest">{t.startOracle}</button></form></section>
            ) : (
              <div className="flex flex-col h-[65vh] bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem] border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-inner">
                {/* Chat Header */}
                <div className="p-6 bg-white dark:bg-black border-b border-gray-100 dark:border-neutral-800 flex justify-between items-center z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-2xl shadow-lg">🤖</div>
                    <div><h3 className="font-black italic tracking-tighter">Oracle</h3><p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">{luckyElement.symbol} Alignment</p></div>
                  </div>
                  <button onClick={() => { if(confirm("Reset Profile?")) { localStorage.removeItem("k-fortune-profile"); setUserProfile(null); setChatMessages([]); triggerHaptic(); } }} className="text-gray-400 hover:text-red-500 p-2">🔄</button>
                </div>
                
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col scrollbar-hide">
                  {chatMessages.map((msg, i) => (
                    <div key={msg.id} className={`flex w-full animate-in slide-in-from-bottom-2 duration-300 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      {msg.sender === "oracle" && <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm mr-3 shrink-0 mt-1">🤖</div>}
                      
                      <div className={`max-w-[80%] rounded-3xl p-5 shadow-sm ${msg.sender === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-white dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800 text-gray-800 dark:text-gray-100 rounded-bl-sm"}`}>
                        {msg.type === "text" && <p className={`text-sm font-bold leading-relaxed ${msg.sender === "user" ? "text-2xl text-center" : ""}`}>{msg.text}</p>}
                        
                        {msg.type === "mood-selector" && (
                          <div className="flex gap-2 justify-between mt-2">
                            {MOODS.map(m => (
                              <button key={m.label} onClick={() => handleMoodSelect(m)} className="w-10 h-10 bg-gray-50 dark:bg-neutral-900 rounded-full text-xl hover:scale-110 hover:bg-blue-100 transition-all border border-gray-200 dark:border-neutral-800">
                                {m.emoji}
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {msg.type === "action-generate" && (
                          <button onClick={generateOracleNumbers} disabled={isGenerating} className="mt-2 w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all active:scale-95">
                            {msg.text}
                          </button>
                        )}
                        
                        {msg.type === "number-result" && msg.numbers && (
                          <div className="space-y-5 mt-1">
                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-100 dark:border-blue-900/30 pb-2">Destiny Story</p>
                            <p className="text-sm font-bold leading-relaxed italic text-gray-600 dark:text-gray-300">"{msg.story}"</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                              {msg.numbers.map((num, idx) => (
                                <div key={idx} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${getBallColor(num, selectedLotto.max)}`}>{num}</div>
                              ))}
                            </div>
                            <button onClick={() => { setChatMessages([]); triggerHaptic(); }} className="w-full mt-4 py-3 bg-gray-50 dark:bg-neutral-900 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-gray-100">
                              {t.chatReset}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PHASE 4: ALARMS & ROUTINES --- */}
        {activeTab === "alarms" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300 pb-10">
             <h2 className="text-3xl font-black tracking-tighter px-2">{t.alarms}</h2>
             
             <div className="bg-white dark:bg-neutral-900 p-8 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-neutral-800 space-y-8">
                {/* Lotto Day Alarm */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${alarms.lottoDay ? "bg-blue-100 text-blue-600" : "bg-gray-50 dark:bg-neutral-800 opacity-50"}`}>🎟️</div>
                    <div>
                      <h3 className="font-black text-gray-800 dark:text-gray-100">Lotto Day Alert</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Generate & Buy</p>
                    </div>
                  </div>
                  <button onClick={() => toggleAlarm("lottoDay")} className={`w-14 h-8 rounded-full p-1 transition-colors ${alarms.lottoDay ? "bg-blue-600" : "bg-gray-200 dark:bg-neutral-700"}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${alarms.lottoDay ? "translate-x-6" : "translate-x-0"}`}></div>
                  </button>
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-neutral-800"></div>

                {/* Result Check Reminder */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-colors ${alarms.resultCheck ? "bg-blue-100 text-blue-600" : "bg-gray-50 dark:bg-neutral-800 opacity-50"}`}>🏆</div>
                    <div>
                      <h3 className="font-black text-gray-800 dark:text-gray-100">Result Check</h3>
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Compare Numbers</p>
                    </div>
                  </div>
                  <button onClick={() => toggleAlarm("resultCheck")} className={`w-14 h-8 rounded-full p-1 transition-colors ${alarms.resultCheck ? "bg-blue-600" : "bg-gray-200 dark:bg-neutral-700"}`}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-sm transform transition-transform ${alarms.resultCheck ? "translate-x-6" : "translate-x-0"}`}></div>
                  </button>
                </div>

                {/* Time Setting */}
                <div className="pt-4 flex justify-between items-center bg-gray-50 dark:bg-black p-5 rounded-3xl border border-gray-100 dark:border-neutral-800">
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Notification Time</span>
                  <input type="time" value={alarms.time} onChange={(e) => updateAlarmTime(e.target.value)} className="bg-transparent font-black text-lg text-blue-600 focus:outline-none" />
                </div>
                
                <p className="text-center text-[10px] text-gray-400 font-bold italic leading-relaxed pt-2">
                  {lang === "ko" ? "브라우저 푸시 알림 권한이 필요합니다. 홈 화면에 앱(PWA)으로 추가하면 더 안정적으로 알림을 받을 수 있습니다." : "Browser push notification permission required. Add to Home Screen (PWA) for stable alerts."}
                </p>
             </div>
          </div>
        )}

        {activeTab === "rules" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
             <h2 className="text-3xl font-black tracking-tighter px-2">{t.myRules}</h2>
             <div className="bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-neutral-800 text-center flex flex-col items-center">
                <div className="text-6xl mb-6">⚙️</div>
                <h3 className="text-xl font-black mb-2 text-gray-800 dark:text-gray-100">Rules Engine</h3>
                <p className="font-bold text-gray-500 text-sm leading-relaxed">상세 규칙 설정 엔진이 곧 연동됩니다.<br/>(다음 단계 업데이트 예정)</p>
             </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
             <h2 className="text-3xl font-black tracking-tighter px-2">{t.settings}</h2>
             <div className="bg-white dark:bg-neutral-900 p-10 rounded-[3.5rem] shadow-sm border border-gray-100 dark:border-neutral-800 text-center flex flex-col items-center">
                <div className="text-6xl mb-6">🔧</div>
                <h3 className="text-xl font-black mb-2 text-gray-800 dark:text-gray-100">System Settings</h3>
                <p className="font-bold text-gray-500 text-sm leading-relaxed">다크모드 및 시스템 고급 옵션<br/>(테마 엔진 준비중)</p>
             </div>
          </div>
        )}

        {activeTab === "board" && (
          <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300 pb-10">
            <h2 className="text-3xl font-black tracking-tighter px-2">{t.boardTitle}</h2>
            <div className="grid grid-cols-1 gap-6">{board.length === 0 ? ( <div className="text-center py-32 text-gray-400 font-black italic bg-gray-50 dark:bg-neutral-900 rounded-[3.5rem]">The square is quiet.</div> ) : ( board.map((post) => ( <div key={post.id} className="bg-white dark:bg-neutral-900 border border-gray-100 dark:border-neutral-800 p-8 rounded-[3rem] shadow-sm space-y-6"><div className="flex justify-between items-center"><span className="text-sm font-black text-blue-600 uppercase tracking-tighter italic">@{post.user_name}</span><span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</span></div><p className="text-lg font-bold leading-snug text-gray-800 dark:text-gray-100 italic">"{post.content}"</p><div className="flex gap-2 flex-wrap">{post.lucky_numbers.map((num, i) => ( <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm ${getBallColor(num, 70)}`}>{num}</div> ))}</div></div> )) )}</div>
          </div>
        )}
      </main>

      {/* SHARE MODAL */}
      {showShareModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowShareModal(false)}></div>
          <div className="relative w-full max-w-sm bg-gradient-to-b from-neutral-900 to-black rounded-[3.5rem] shadow-[0_0_100px_rgba(37,99,235,0.3)] overflow-hidden border border-white/10 flex flex-col p-10 gap-8 animate-in zoom-in duration-500">
            <div className="text-center space-y-2"><h3 className="text-2xl font-black italic tracking-tight text-white">{t.shareTitle}</h3><p className="text-[10px] text-blue-400 font-black uppercase tracking-[0.4em]">{t.subtitle}</p></div>
            <div className={`p-8 rounded-[2.5rem] ${luckyElement.bg} border border-white/5 relative overflow-hidden text-center`}><span className={`text-8xl font-serif opacity-20 ${luckyElement.color} absolute left-1/2 -translate-x-1/2 -top-4`}>{luckyElement.symbol}</span><div className="relative z-10 space-y-6"><p className="text-xs font-black text-gray-400 uppercase tracking-widest">{userProfile?.name || "Seeker"}'s Luck</p><div className="flex justify-center gap-3 flex-wrap">{numbers.map((num, i) => ( <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black ${getBallColor(num, 70)} shadow-lg`}>{num}</div> ))}</div><p className="text-sm font-bold italic text-white/80">"May the cosmos align in your favor."</p></div></div>
            {user ? ( <div className="space-y-4"><input type="text" placeholder={t.writeMessage} className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-blue-500" value={boardMessage} onChange={(e) => setBoardMessage(e.target.value)} /><button onClick={handlePostToBoard} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl text-sm uppercase tracking-widest active:scale-95 transition-all">{t.postBoard}</button></div> ) : ( <button onClick={finalShareLuck} className="w-full bg-blue-600 text-white font-black py-5 rounded-[2rem] shadow-xl text-sm uppercase tracking-widest active:scale-95 transition-all">Send Fortune</button> )}
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