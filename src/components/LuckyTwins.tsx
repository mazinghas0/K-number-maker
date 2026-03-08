"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Translation } from "@/lib/types";
import { getBallColor } from "@/lib/fortuneEngine";

interface TwinPost {
  user_name: string;
  content: string;
  lucky_numbers: number[];
  overlap: number;
}

interface Props {
  numbers: number[];
  t: Translation;
}

export default function LuckyTwins({ numbers, t }: Props) {
  const [twins, setTwins] = useState<TwinPost[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (numbers.length === 0) return;
    setLoading(true);

    supabase
      .from("fortune_board")
      .select("user_name, content, lucky_numbers")
      .overlaps("lucky_numbers", numbers)
      .limit(50)
      .then(({ data }) => {
        if (data) {
          const MIN_OVERLAP = Math.max(3, Math.floor(numbers.length * 0.5));
          const matched: TwinPost[] = data
            .map((p) => ({
              user_name: p.user_name as string,
              content: p.content as string,
              lucky_numbers: p.lucky_numbers as number[],
              overlap: (p.lucky_numbers as number[]).filter((n) => numbers.includes(n)).length,
            }))
            .filter((p) => p.overlap >= MIN_OVERLAP)
            .sort((a, b) => b.overlap - a.overlap)
            .slice(0, 5);
          setTwins(matched);
        }
        setLoading(false);
      });
  }, [numbers]);

  if (loading || twins.length === 0) return null;

  const isExact = twins[0]?.overlap === numbers.length;

  return (
    <div
      className="rounded-2xl overflow-hidden mt-4 border border-white/10"
      style={{
        background: isExact
          ? "linear-gradient(135deg, #581c87, #1a0533)"
          : "linear-gradient(135deg, #1e3a5f, #0c1a2e)",
        boxShadow: isExact ? "0 0 30px #e879f933" : "0 0 20px #3b82f633",
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{isExact ? "✨" : "👥"}</span>
          <span className="text-sm font-black text-white">{t.twinsTitle}</span>
          <span
            className="ml-auto text-xs font-black px-2 py-0.5 rounded-full"
            style={{
              background: isExact ? "#e879f933" : "#3b82f633",
              color: isExact ? "#e879f9" : "#60a5fa",
            }}
          >
            {twins.length} {t.twinsFound}
          </span>
        </div>

        {/* Twin list */}
        <div className="flex flex-col gap-2">
          {twins.map((twin, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl p-3">
              <div className="flex gap-1 flex-wrap flex-1 min-w-0">
                {twin.lucky_numbers.slice(0, 6).map((n, j) => (
                  <div
                    key={j}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shadow-md ${
                      numbers.includes(n) ? getBallColor(n) : "bg-white/10 text-white/40"
                    }`}
                  >
                    {n}
                  </div>
                ))}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-black text-white/70">{twin.user_name}</p>
                <p className="text-[10px] text-white/40">
                  {twin.overlap}/{numbers.length} match
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
