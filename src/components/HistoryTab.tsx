"use client";

import React, { useMemo, useState } from "react";
import { User } from "@supabase/supabase-js";
import { HistoryItem, ThemeColors, Translation } from "@/lib/types";
import { getBallColor } from "@/lib/fortuneEngine";

interface Props {
  history: HistoryItem[];
  activeTheme: ThemeColors;
  t: Translation;
  user: User | null;
  onLogin: () => void;
  onDelete: (id: string) => void;
}

interface FreqEntry {
  number: number;
  count: number;
}

interface MonthGroup {
  label: string;
  items: HistoryItem[];
}

function calcStreak(history: HistoryItem[]): number {
  if (history.length === 0) return 0;
  const uniqueDates = [...new Set(
    history.map(h => h.created_at.substring(0, 10))
  )].sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = new Date().toISOString().substring(0, 10);
  const yesterday = new Date(Date.now() - 86_400_000).toISOString().substring(0, 10);
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 1;

  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = new Date(uniqueDates[i - 1]).getTime();
    const curr = new Date(uniqueDates[i]).getTime();
    if (Math.round((prev - curr) / 86_400_000) === 1) streak++;
    else break;
  }
  return streak;
}

function calcFrequency(history: HistoryItem[]): FreqEntry[] {
  const map = new Map<number, number>();
  history.forEach(h => h.numbers.forEach(n => map.set(n, (map.get(n) ?? 0) + 1)));
  return Array.from(map.entries())
    .map(([number, count]) => ({ number, count }))
    .sort((a, b) => b.count - a.count);
}

function groupByMonth(history: HistoryItem[]): MonthGroup[] {
  const map = new Map<string, HistoryItem[]>();
  history.forEach(h => {
    const key = h.created_at.substring(0, 7);
    const arr = map.get(key) ?? [];
    arr.push(h);
    map.set(key, arr);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({
      label: `${key.substring(0, 4)}년 ${parseInt(key.substring(5, 7))}월`,
      items,
    }));
}

function copyNumbers(numbers: number[]) {
  navigator.clipboard.writeText(numbers.join(", ")).catch(() => {});
}

// ── 서브 컴포넌트 ────────────────────────────────────────────

function StatsBadge({ icon, value, label, accent }: {
  icon: string; value: string | number; label: string; accent: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1 py-4 bg-white/5 rounded-3xl border border-white/10">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xl font-black ${accent}`}>{value}</span>
      <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function HitMap({ freq, activeTheme }: { freq: FreqEntry[]; activeTheme: ThemeColors }) {
  const top5 = freq.slice(0, 5);
  const maxCount = freq[0]?.count ?? 1;

  if (freq.length === 0) return null;

  return (
    <div className={`${activeTheme.card} rounded-[2.5rem] border border-white/10 p-6`}>
      <p className="text-xs font-black opacity-50 uppercase tracking-widest mb-5">행운 번호 히트맵</p>

      {/* TOP 5 큰 공 */}
      <div className="flex gap-3 justify-center flex-wrap mb-6">
        {top5.map(({ number, count }, i) => (
          <div key={number} className="flex flex-col items-center gap-2">
            <div className="relative">
              <div
                className={`rounded-full flex items-center justify-center font-black shadow-lg text-white ${getBallColor(number)}`}
                style={{ width: 52 - i * 4, height: 52 - i * 4, fontSize: 16 - i }}
              >
                {number}
              </div>
              <span className={`absolute -top-2 -right-2 text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTheme.primary} text-white`}>
                {count}
              </span>
            </div>
            <span className="text-[9px] opacity-40 font-bold">#{i + 1}</span>
          </div>
        ))}
      </div>

      {/* 전체 번호 히트바 */}
      <div className="space-y-1.5">
        {freq.slice(0, 10).map(({ number, count }) => (
          <div key={number} className="flex items-center gap-3">
            <span className="text-xs font-black w-7 text-right opacity-60">{number}</span>
            <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${activeTheme.primary} transition-all duration-700`}
                style={{ width: `${(count / maxCount) * 100}%` }}
              />
            </div>
            <span className="text-xs font-black opacity-40 w-4">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryCard({ item, activeTheme, onDelete }: {
  item: HistoryItem;
  activeTheme: ThemeColors;
  onDelete: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleCopy = () => {
    copyNumbers(item.numbers);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = () => {
    setDeleting(true);
    onDelete(item.id);
  };

  return (
    <div
      className={`${activeTheme.card} rounded-[2.5rem] border border-white/5 shadow-xl transition-all duration-300 overflow-hidden ${deleting ? "opacity-0 scale-95" : "opacity-100"}`}
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center px-6 pt-5 pb-3">
        <span className={`text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em] ${activeTheme.primary} text-white`}>
          {item.lottery_name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-bold">{item.timestamp}</span>
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-xs transition-all hover:scale-110"
            title="삭제"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 번호 공 */}
      <div className="flex gap-3 flex-wrap px-6 pb-4">
        {item.numbers.map((n, idx) => (
          <div
            key={idx}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-sm font-black shadow-md text-white ${getBallColor(n)}`}
          >
            {n}
          </div>
        ))}
      </div>

      {/* 복사 버튼 */}
      <button
        onClick={handleCopy}
        className={`w-full py-3 text-xs font-black uppercase tracking-widest border-t border-white/5 transition-all ${
          copied
            ? "text-emerald-400 bg-emerald-500/10"
            : "text-gray-500 hover:bg-white/5 hover:text-gray-300"
        }`}
      >
        {copied ? "✓ 복사됨" : "번호 복사"}
      </button>
    </div>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────────────

export default function HistoryTab({ history, activeTheme, t, user, onLogin, onDelete }: Props) {
  const streak = useMemo(() => calcStreak(history), [history]);
  const freq = useMemo(() => calcFrequency(history), [history]);
  const monthGroups = useMemo(() => groupByMonth(history), [history]);
  const topNumber = freq[0]?.number ?? "-";

  if (!user) {
    return (
      <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500">
        <h2 className="text-4xl font-black italic px-4">{t.records}</h2>
        <div className="text-center py-20 bg-white/5 rounded-[3.5rem] p-10 space-y-8 border border-dashed border-white/10">
          <div className="text-7xl opacity-20">🔒</div>
          <p className="text-base font-bold text-gray-500 leading-relaxed">
            {t.historyLoginMsg}
          </p>
          <button
            onClick={onLogin}
            className={`w-full py-5 ${activeTheme.primary} text-white font-black rounded-3xl uppercase text-sm tracking-widest hover:opacity-90 transition-all`}
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-8 duration-500">
        <h2 className="text-4xl font-black italic px-4">{t.records}</h2>
        <div className="text-center py-40 text-gray-500 font-black italic bg-white/5 rounded-[3.5rem] border border-white/5 text-xl">
          {t.noRecords}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-8 duration-500">
      <h2 className="text-4xl font-black italic px-4">{t.records}</h2>

      {/* 통계 배지 3개 */}
      <div className="flex gap-3">
        <StatsBadge icon="🔥" value={`${streak}일`} label="스트릭" accent={activeTheme.accent} />
        <StatsBadge icon="📊" value={history.length} label="총 생성" accent={activeTheme.accent} />
        <StatsBadge icon="⭐" value={topNumber} label="최다 번호" accent={activeTheme.accent} />
      </div>

      {/* 히트맵 */}
      <HitMap freq={freq} activeTheme={activeTheme} />

      {/* 월별 기록 리스트 */}
      {monthGroups.map(group => (
        <div key={group.label} className="flex flex-col gap-4">
          <p className="text-xs font-black opacity-40 uppercase tracking-widest px-2">{group.label}</p>
          {group.items.map(item => (
            <HistoryCard key={item.id} item={item} activeTheme={activeTheme} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  );
}
