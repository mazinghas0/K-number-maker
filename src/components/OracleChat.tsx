"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lang, ChatMessage, UserProfile, ElementInfo, ThemeColors } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { getBallColor } from "@/lib/fortuneEngine";

interface Props {
  lang: Lang;
  userProfile: UserProfile;
  luckyElement: ElementInfo;
  activeTheme: ThemeColors;
  isGenerating: boolean;
  onGenerate: () => Promise<void>;
}

const MOODS = [
  { emoji: "😡", label: "Angry" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😐", label: "Calm" },
  { emoji: "🙂", label: "Happy" },
  { emoji: "🤩", label: "Excited" }
];

export default function OracleChat({ lang, userProfile, luckyElement, activeTheme, isGenerating, onGenerate }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [zoom, setZoom] = useState(1.0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = lang === "ko" 
        ? `${userProfile.name}님, 당신은 타고난 [${luckyElement.ilgan}]의 기운을 품고 계시군요. ${luckyElement.attribute}이(가) 당신의 길을 비출 것입니다.` 
        : `Welcome ${userProfile.name}, you are born with the root of [${luckyElement.name} Element]. ${luckyElement.desc} will guide your destiny.`;
      
      setMessages([
        { id: "1", sender: "oracle", type: "text", text: greeting },
        { id: "2", sender: "oracle", type: "text", text: t.chatAskMood },
        { id: "3", sender: "oracle", type: "mood-selector" }
      ]);
    }
  }, [userProfile, messages.length, lang, luckyElement, t.chatAskMood]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleMoodSelect = (emoji: string) => {
    const resKo = `${emoji} 감정의 파동이 전해졌습니다. [${luckyElement.ilgan}]의 본질 위에 지금 이 순간의 기운을 융합하여 정밀한 운명의 궤적을 도출하겠습니다.`;
    const resEn = `I sense the ${emoji} frequency. Blending your [${luckyElement.name}] essence with this moment's aura to calculate your most precise destiny path.`;
    
    setMessages(prev => [
      ...prev.filter(x => x.type !== "mood-selector"),
      { id: Date.now().toString(), sender: "user", type: "text", text: emoji },
      { id: (Date.now()+1).toString(), sender: "oracle", type: "text", text: lang === "ko" ? resKo : resEn },
      { id: (Date.now()+2).toString(), sender: "oracle", type: "action-generate", text: t.chatActionGen }
    ]);
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-3xl font-black italic tracking-tighter drop-shadow-md">{t.oracle}</h2>
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10 shadow-sm backdrop-blur-md">
          <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">ZOOM</span>
          <button onClick={() => setZoom(Math.max(0.8, zoom - 0.1))} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full font-black text-lg transition-colors">-</button>
          <span className="text-sm font-black min-w-[35px] text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full font-black text-lg transition-colors">+</button>
        </div>
      </div>
      
      <div 
        className="flex flex-col h-[60vh] bg-white/5 dark:bg-black/20 rounded-[3.5rem] border border-white/5 overflow-hidden shadow-inner relative transition-all"
        style={{ fontSize: `${zoom}rem` }}
      >
        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
          {messages.map(msg => (
            <div key={msg.id} className={`flex w-full ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              {msg.sender === "oracle" && <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl mr-3 shadow-lg">🤖</div>}
              <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-xl ${msg.sender === "user" ? activeTheme.primary + " text-white rounded-br-none" : "bg-white dark:bg-neutral-900 border border-white/5 text-inherit rounded-bl-none"}`}>
                {msg.type === "text" && <p className="text-lg font-bold leading-relaxed">{msg.text}</p>}
                
                {msg.type === "mood-selector" && (
                  <div className="flex gap-3 justify-between mt-4">
                    {MOODS.map(m => (
                      <button key={m.label} onClick={() => handleMoodSelect(m.emoji)} className="w-14 h-14 bg-white/10 rounded-full text-3xl hover:scale-110 active:scale-95 transition-all border border-white/10 shadow-md">
                        {m.emoji}
                      </button>
                    ))}
                  </div>
                )}
                
                {msg.type === "action-generate" && (
                  <button onClick={onGenerate} disabled={isGenerating} className={`mt-4 w-full ${activeTheme.primary} text-white font-black py-5 rounded-3xl text-sm uppercase tracking-widest shadow-2xl hover:brightness-110 transition-all active:scale-95`}>
                    {isGenerating ? "..." : msg.text}
                  </button>
                )}
                
                {msg.type === "number-result" && (
                  <div className="space-y-6">
                    <p className="text-sm font-bold italic leading-relaxed text-blue-500/80 uppercase tracking-widest border-b border-blue-500/10 pb-2">Destiny Revealed</p>
                    <p className="text-base font-bold italic leading-relaxed text-gray-400">"{msg.story}"</p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      {msg.numbers?.map((n, idx) => (
                        <div key={idx} className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-black shadow-lg animate-pop-bounce ${getBallColor(n)}`}>
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}
