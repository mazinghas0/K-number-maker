"use client";

import React, { useState } from "react";
import { IlginData, IlginGrade, Lang, ThemeColors, Translation } from "@/lib/types";

interface Props {
  ilginData: IlginData;
  lang: Lang;
  activeTheme: ThemeColors;
  t: Translation;
}

const GRADE_STYLE: Record<IlginGrade, { bg: string; text: string; label: string }> = {
  "대길": { bg: "bg-emerald-500/20", text: "text-emerald-400", label: "大吉" },
  "길":   { bg: "bg-blue-500/20",    text: "text-blue-400",    label: "吉"   },
  "보통": { bg: "bg-gray-500/20",    text: "text-gray-400",    label: "平"   },
  "주의": { bg: "bg-amber-500/20",   text: "text-amber-400",   label: "注意" },
  "흉":   { bg: "bg-red-500/20",     text: "text-red-400",     label: "凶"   },
};

const ELEM_SYMBOL = ["木", "火", "土", "金", "水"] as const;
const ELEM_COLOR  = [
  "text-green-400", "text-red-400", "text-yellow-400", "text-gray-300", "text-blue-400",
] as const;

const RELATION_KO: Record<string, string> = {
  "生我": "생아 (나를 생함)",
  "我剋": "아극 (내가 극함)",
  "比和": "비화 (같은 기운)",
  "我生": "아생 (내가 생함)",
  "剋我": "극아 (나를 극함)",
};

const RELATION_EN: Record<string, string> = {
  "生我": "Generates Me",
  "我剋": "I Control",
  "比和": "Harmonious",
  "我生": "I Generate",
  "剋我": "Controls Me",
};

const RELATION_JA: Record<string, string> = {
  "生我": "生我 (生じる)",
  "我剋": "我剋 (制する)",
  "比和": "比和 (調和)",
  "我生": "我生 (生かす)",
  "剋我": "剋我 (制される)",
};

const RELATION_ES: Record<string, string> = {
  "生我": "Me Genera",
  "我剋": "Yo Controlo",
  "比和": "Armonioso",
  "我生": "Yo Genero",
  "剋我": "Me Controla",
};

function getRelationLabel(relation: string, lang: Lang): string {
  const map: Record<Lang, Record<string, string>> = {
    ko: RELATION_KO,
    en: RELATION_EN,
    ja: RELATION_JA,
    es: RELATION_ES,
  };
  return map[lang][relation] ?? relation;
}

export default function IlginCard({ ilginData, lang, activeTheme, t }: Props) {
  const [expanded, setExpanded] = useState(false);
  const grade = GRADE_STYLE[ilginData.luckyGrade];
  const scorePercent = ilginData.luckyScore;

  const scoreColor =
    scorePercent >= 75 ? "from-emerald-500 to-green-400" :
    scorePercent >= 60 ? "from-blue-500 to-cyan-400" :
    scorePercent >= 45 ? "from-gray-500 to-gray-400" :
    scorePercent >= 30 ? "from-amber-500 to-orange-400" :
                         "from-red-600 to-red-400";

  return (
    <div
      className={`${activeTheme.card} rounded-[2.5rem] border border-white/10 overflow-hidden`}
    >
      {/* 헤더 */}
      <button
        className="w-full flex items-center justify-between px-6 pt-5 pb-4"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3">
          <span className="text-xs font-black opacity-40 uppercase tracking-widest">
            {t.ilginTitle}
          </span>
          <span className={`text-xs font-black px-2.5 py-1 rounded-full ${grade.bg} ${grade.text}`}>
            {ilginData.luckyGrade} {grade.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className={`text-2xl font-black ${grade.text}`}>
              {ilginData.todayGapja}
            </span>
            <span className="text-xs opacity-40 ml-1.5">{ilginData.todayGapjaKo}일</span>
          </div>
          <span className={`text-xs opacity-40 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
            ▼
          </span>
        </div>
      </button>

      {/* 행운 지수 게이지 */}
      <div className="px-6 pb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
            {t.ilginScore}
          </span>
          <span className={`text-sm font-black ${grade.text}`}>{scorePercent}</span>
        </div>
        <div className="h-2.5 bg-white/8 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${scoreColor} transition-all duration-1000`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* 확장 영역 */}
      {expanded && (
        <div className="px-6 pb-6 space-y-5 border-t border-white/5 pt-4">

          {/* 천간 궁합 */}
          <div className="flex items-center justify-between bg-white/5 rounded-2xl px-4 py-3">
            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">
              {t.ilginRelation}
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-base font-black ${ELEM_COLOR[ilginData.elemMyIdx]}`}>
                {ELEM_SYMBOL[ilginData.elemMyIdx]}
              </span>
              <span className="text-xs opacity-30">×</span>
              <span className={`text-base font-black ${ELEM_COLOR[ilginData.elemTodayIdx]}`}>
                {ELEM_SYMBOL[ilginData.elemTodayIdx]}
              </span>
              <span className={`text-xs font-black ml-1 ${grade.text}`}>
                {getRelationLabel(ilginData.relation, lang)}
              </span>
            </div>
          </div>

          {/* 행운 정보 그리드 */}
          <div className="grid grid-cols-3 gap-2">
            <InfoTile
              label={t.ilginLuckyTime}
              value={ilginData.luckyTimeName}
              sub={ilginData.luckyTimeRange}
              accent={grade.text}
            />
            <InfoTile
              label={t.ilginDirection}
              value={ilginData.luckyDirection}
              accent={grade.text}
            />
            <div
              className="flex flex-col items-center gap-1.5 py-3 bg-white/5 rounded-2xl border border-white/5"
            >
              <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">
                {t.ilginColor}
              </span>
              <div
                className="w-6 h-6 rounded-full shadow-md border border-white/10"
                style={{ backgroundColor: ilginData.luckyColorHex }}
              />
              <span className="text-xs font-black opacity-70">{ilginData.luckyColorName}</span>
            </div>
          </div>

          {/* 조언 */}
          <div className="bg-white/5 rounded-2xl px-4 py-3 border border-white/5">
            <p className="text-sm font-semibold leading-relaxed opacity-80">
              {ilginData.advice[lang]}
            </p>
          </div>

          {/* 내 일간 배지 */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/8">
              <span className="text-[10px] opacity-40 font-black">내 일간</span>
              <span className={`text-sm font-black ${ELEM_COLOR[ilginData.elemMyIdx]}`}>
                {ilginData.birthStemKo}({ELEM_SYMBOL[ilginData.elemMyIdx]})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoTile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-3 bg-white/5 rounded-2xl border border-white/5">
      <span className="text-[9px] font-black opacity-40 uppercase tracking-widest">{label}</span>
      <span className={`text-xs font-black ${accent}`}>{value}</span>
      {sub && <span className="text-[9px] opacity-30 text-center leading-tight">{sub}</span>}
    </div>
  );
}
