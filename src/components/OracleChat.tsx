"use client";

import React, { useState, useEffect, useRef } from "react";
import { User } from "@supabase/supabase-js";
import { Lang, ChatMessage, UserProfile, ElementInfo, ThemeColors } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";

const FREE_LIMIT = 3;

const getTodayKey = () => `k-oracle-${new Date().toISOString().slice(0, 10)}`;
const getUsage = () => {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(getTodayKey()) ?? "0");
};
const incUsage = () => {
  localStorage.setItem(getTodayKey(), String(getUsage() + 1));
};

interface Props {
  lang: Lang;
  userProfile: UserProfile;
  luckyElement: ElementInfo;
  activeTheme: ThemeColors;
  user: User | null;
  onLogin: () => void;
}

const QUICK_QUESTIONS: Record<Lang, { label: string; text: string }[]> = {
  ko: [
    { label: "💰 재물운", text: "오늘 재물운과 금전 흐름을 알려주세요." },
    { label: "❤️ 연애운", text: "오늘 연애운과 인간관계 운세를 봐주세요." },
    { label: "🏃 건강운", text: "오늘 건강운과 에너지 상태를 알려주세요." },
    { label: "🍀 행운번호", text: "저에게 맞는 행운 번호 6개를 추천해주세요." },
  ],
  en: [
    { label: "💰 Wealth", text: "Tell me about my wealth luck and financial flow today." },
    { label: "❤️ Love", text: "What is my love and relationship fortune today?" },
    { label: "🏃 Health", text: "How is my health energy and vitality today?" },
    { label: "🍀 Numbers", text: "Please recommend 6 lucky numbers for me." },
  ],
  ja: [
    { label: "💰 金運", text: "今日の金運と財政の流れを教えてください。" },
    { label: "❤️ 恋愛運", text: "今日の恋愛運と人間関係を教えてください。" },
    { label: "🏃 健康運", text: "今日の健康運とエネルギー状態を教えてください。" },
    { label: "🍀 ラッキー", text: "私に合うラッキーナンバーを6つ推薦してください。" },
  ],
  es: [
    { label: "💰 Riqueza", text: "Cuéntame sobre mi suerte con el dinero hoy." },
    { label: "❤️ Amor", text: "¿Cuál es mi fortuna en el amor hoy?" },
    { label: "🏃 Salud", text: "¿Cómo está mi energía y salud hoy?" },
    { label: "🍀 Números", text: "Por favor, recomiéndame 6 números de la suerte." },
  ],
};

export default function OracleChat({ lang, userProfile, luckyElement, activeTheme, user, onLogin }: Props) {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [usageToday, setUsageToday] = useState(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUsageToday(getUsage());
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = lang === "ko"
        ? `${userProfile.name}님, 반갑습니다. 당신은 ${luckyElement.ilgan}의 기운을 타고나셨군요. ${luckyElement.attribute}이(가) 오늘도 당신의 길을 비출 것입니다. 어떤 것이 궁금하신가요?`
        : lang === "ja"
        ? `${userProfile.name}さん、ようこそ。あなたは${luckyElement.ilgan}の気を持って生まれました。${luckyElement.attribute}が今日もあなたの道を照らすでしょう。何が気になりますか？`
        : lang === "es"
        ? `Bienvenido, ${userProfile.name}. Llevas la esencia de [${luckyElement.name}]. ${luckyElement.desc} guiará tu camino hoy. ¿Qué deseas saber?`
        : `Welcome, ${userProfile.name}. You carry the essence of [${luckyElement.name}]. ${luckyElement.desc} will guide your path today. What would you like to know?`;

      setMessages([{ id: "init", sender: "oracle", text: greeting }]);
    }
  }, [messages.length, userProfile, luckyElement, lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    if (getUsage() >= FREE_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    const userMsg: ChatMessage = { id: Date.now().toString(), sender: "user", text };
    const oracleId = (Date.now() + 1).toString();
    const oracleMsg: ChatMessage = { id: oracleId, sender: "oracle", text: "" };

    setMessages(prev => [...prev, userMsg, oracleMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const historyForAPI = [...messages, userMsg];

      const res = await fetch("/api/oracle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historyForAPI, userProfile, luckyElement, lang }),
      });

      if (!res.ok || !res.body) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === oracleId ? { ...m, text: fullText } : m));
      }

      incUsage();
      setUsageToday(getUsage());
    } catch {
      setMessages(prev =>
        prev.map(m => m.id === oracleId
          ? { ...m, text: lang === "ko" ? "죄송합니다. 연결에 문제가 생겼습니다. 잠시 후 다시 시도해주세요." : "Sorry, a connection error occurred. Please try again." }
          : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const remaining = FREE_LIMIT - usageToday;
  const qs = QUICK_QUESTIONS[lang];

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500 pb-10">
      {/* 헤더: 오행 배지 + 남은 횟수 */}
      <div className="flex justify-between items-center px-1">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${luckyElement.bg} border border-white/10`}>
          <span className={`text-base font-black ${luckyElement.color}`}>{luckyElement.symbol}</span>
          <span className="text-xs font-black opacity-70">{luckyElement.ilgan}</span>
        </div>
        <div className={`text-xs font-black px-4 py-2 rounded-full border transition-colors ${
          remaining <= 1
            ? "text-red-400 bg-red-500/10 border-red-500/20"
            : "opacity-50 border-white/10"
        }`}>
          {lang === "ko" ? `오늘 ${remaining}회 남음` : `${remaining} left today`}
        </div>
      </div>

      {/* 채팅 영역 */}
      <div className="flex flex-col h-[52vh] bg-white/5 rounded-[2.5rem] border border-white/5 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-hide">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "oracle" && (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-sm mr-3 flex-shrink-0 mt-1 shadow-lg">
                  🔮
                </div>
              )}
              <div className={`max-w-[82%] rounded-[1.5rem] px-5 py-4 shadow-md ${
                msg.sender === "user"
                  ? `${activeTheme.primary} text-white rounded-br-sm`
                  : "bg-white/10 border border-white/10 rounded-bl-sm"
              }`}>
                {msg.text ? (
                  <p className="text-sm font-semibold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <span className="inline-flex gap-1.5 py-1">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* 빠른 질문 버튼 */}
      <div className="grid grid-cols-2 gap-2">
        {qs.map(q => (
          <button
            key={q.label}
            onClick={() => sendMessage(q.text)}
            disabled={isStreaming || remaining <= 0}
            className="py-3 px-4 rounded-2xl text-xs font-black bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* 텍스트 입력 */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder={lang === "ko" ? "궁금한 것을 물어보세요..." : lang === "ja" ? "何でも聞いてください..." : "Ask the Oracle..."}
          disabled={isStreaming || remaining <= 0}
          className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-40 transition-all"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming || remaining <= 0}
          className={`w-14 h-14 rounded-2xl ${activeTheme.primary} text-white flex items-center justify-center text-lg font-black disabled:opacity-40 transition-all hover:scale-105 active:scale-95 flex-shrink-0`}
        >
          ↑
        </button>
      </div>

      {/* 대화 초기화 */}
      {messages.length > 1 && (
        <button
          onClick={() => { setMessages([]); setInput(""); }}
          className="text-xs font-black opacity-30 hover:opacity-60 transition-opacity text-center py-1"
        >
          {t.chatReset}
        </button>
      )}

      {/* 사용량 초과 모달 */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowLimitModal(false)} />
          <div className={`relative w-full max-w-sm ${activeTheme.card} rounded-[2.5rem] border border-white/10 p-8 space-y-6 shadow-2xl`}>
            <div className="text-center space-y-3">
              <div className="text-5xl">🔮</div>
              <h3 className="text-xl font-black">
                {lang === "ko" ? "오늘 무료 상담 완료" : "Daily Limit Reached"}
              </h3>
              <p className="text-sm opacity-60 leading-relaxed">
                {lang === "ko"
                  ? `무료 상담 ${FREE_LIMIT}회를 모두 사용했습니다.\n내일 다시 돌아오거나 아래 방법으로 계속하세요.`
                  : `You've used all ${FREE_LIMIT} free consultations today.`}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => alert(lang === "ko" ? "광고 기능을 준비 중입니다." : "Ad feature coming soon.")}
                className="w-full py-4 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-black text-sm hover:bg-yellow-500/30 transition-all"
              >
                📺 {lang === "ko" ? "광고 시청 → +1회" : "Watch Ad → +1 more"}
              </button>

              {!user ? (
                <button
                  onClick={() => { setShowLimitModal(false); onLogin(); }}
                  className={`w-full py-4 rounded-2xl ${activeTheme.primary} text-white font-black text-sm hover:opacity-90 transition-all`}
                >
                  🔑 {lang === "ko" ? "로그인하고 더 받기" : "Login for more"}
                </button>
              ) : null}

              <button
                onClick={() => alert(lang === "ko" ? "구독 기능을 준비 중입니다." : "Subscription coming soon.")}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-black text-sm hover:bg-white/10 transition-all"
              >
                ⭐ {lang === "ko" ? "구독 → 무제한" : "Subscribe → Unlimited"}
              </button>
            </div>

            <button
              onClick={() => setShowLimitModal(false)}
              className="w-full text-center text-xs opacity-40 hover:opacity-70 transition-opacity"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
