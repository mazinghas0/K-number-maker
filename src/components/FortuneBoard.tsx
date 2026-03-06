"use client";

import React from "react";
import { Lang, BoardItem } from "@/lib/types";
import { TRANSLATIONS } from "@/lib/translations";
import { getBallColor } from "@/lib/fortuneEngine";

interface Props {
  lang: Lang;
  board: BoardItem[];
  onBless: (id: string) => Promise<void>;
}

export default function FortuneBoard({ lang, board, onBless }: Props) {
  const t = TRANSLATIONS[lang];

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="px-4 space-y-2 mb-4">
        <h2 className="text-4xl font-black tracking-tighter italic drop-shadow-md">{t.boardTitle}</h2>
        <p className="text-sm text-blue-500 uppercase font-black tracking-widest">{t.bestLuck}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 px-2">
        {board.length === 0 ? (
          <div className="text-center py-40 text-gray-500 font-black italic bg-white/5 rounded-[3.5rem] text-xl shadow-inner border border-white/5">
            The Square is awaiting its first luck...
          </div>
        ) : (
          board.map((post, idx) => (
            <div 
              key={post.id} 
              className={`relative overflow-hidden p-10 rounded-[3.5rem] border transition-all duration-500 hover:scale-[1.01] shadow-2xl ${
                idx === 0 
                  ? 'bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/50 shadow-yellow-500/20' 
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-yellow-500 text-black text-[10px] font-black px-5 py-2 rounded-bl-3xl uppercase tracking-widest animate-pulse shadow-lg">
                  🏆 1st Golden Aura
                </div>
              )}
              
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${idx === 0 ? 'bg-yellow-500/20' : 'bg-white/10'}`}>
                    👤
                  </div>
                  <div>
                    <span className={`text-lg font-black italic ${idx === 0 ? 'text-yellow-500' : 'text-blue-400'}`}>@{post.user_name}</span>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <button 
                  onClick={() => onBless(post.id)}
                  className="group flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full hover:bg-yellow-500/20 transition-all border border-white/5 active:scale-90 shadow-md"
                >
                  <span className="text-2xl group-hover:scale-125 transition-transform">🍀</span>
                  <span className="text-sm font-black text-white">{post.blessings || 0}</span>
                </button>
              </div>

              <p className="text-2xl font-bold leading-relaxed italic text-white mb-8">"{post.content}"</p>
              
              <div className="flex gap-3 flex-wrap">
                {post.lucky_numbers.map((num, i) => (
                  <div 
                    key={i} 
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-base font-black shadow-2xl ${getBallColor(num)}`}
                    style={{ boxShadow: "inset -2px -2px 6px rgba(0,0,0,0.2), 0 8px 15px rgba(0,0,0,0.3)" }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
