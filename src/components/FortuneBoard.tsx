"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { BoardItem, ThemeColors, Translation, PostBoardPayload } from "@/lib/types";
import { getBallColor } from "@/lib/fortuneEngine";

// ── 국가 코드 → 플래그 이모지 ─────────────────────────────────────
function toFlag(cc: string): string {
  if (!cc || cc.length < 2) return "🌍";
  return cc.toUpperCase().split("").map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
}

function detectCountryCode(): string {
  if (typeof window === "undefined") return "";
  const lang = navigator.language || "";
  const parts = lang.split("-");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "";
}

// ── 익명 닉네임 생성 ──────────────────────────────────────────────
const ADJ = ["행운의", "황금의", "신비한", "빛나는", "용감한", "지혜로운", "고요한", "강한"];
const ANIMALS = ["여우", "용", "호랑이", "봉황", "거북", "독수리", "사자", "늑대"];

function genAnonymousName(): string {
  const a = ADJ[Math.floor(Math.random() * ADJ.length)];
  const b = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const n = Math.floor(Math.random() * 9000) + 1000;
  return `${a}${b}#${n}`;
}

// ── 축복 중복 방지 (localStorage) ────────────────────────────────
const getBlessKey = () => `k-blessed-${new Date().toISOString().slice(0, 10)}`;

function getBlessedToday(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(getBlessKey()) ?? "[]");
}

function markBlessedToday(id: string): void {
  const list = getBlessedToday();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(getBlessKey(), JSON.stringify(list));
  }
}

// ── 내 게시물 추적 (익명) ─────────────────────────────────────────
const MY_POSTS_KEY = "k-my-posts";

function getMyPosts(): string[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(MY_POSTS_KEY) ?? "[]");
}

function addMyPost(id: string): void {
  const list = getMyPosts();
  if (!list.includes(id)) {
    list.push(id);
    localStorage.setItem(MY_POSTS_KEY, JSON.stringify(list));
  }
}

function removeMyPost(id: string): void {
  const list = getMyPosts().filter((p) => p !== id);
  localStorage.setItem(MY_POSTS_KEY, JSON.stringify(list));
}

// ── 정렬 타입 ─────────────────────────────────────────────────────
type SortType = "popular" | "latest";

// ── Props ─────────────────────────────────────────────────────────
interface Props {
  board: BoardItem[];
  activeTheme: ThemeColors;
  t: Translation;
  onBless: (id: string) => Promise<void>;
  onPost: (payload: PostBoardPayload) => Promise<string | null>;
  onDelete: (id: string) => Promise<void>;
  onWinCert: (id: string) => Promise<void>;
  user: User | null;
  numbers: number[];
}

// ── 컴포넌트 ──────────────────────────────────────────────────────
export default function FortuneBoard({
  board,
  activeTheme,
  t,
  onBless,
  onPost,
  onDelete,
  onWinCert,
  user,
  numbers,
}: Props) {
  const [sort, setSort] = useState<SortType>("popular");
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);
  const [blessedIds, setBlessedIds] = useState<string[]>([]);
  const [myPostIds, setMyPostIds] = useState<string[]>([]);
  const [countryCode, setCountryCode] = useState("");

  // 클라이언트 마운트 후 localStorage 읽기
  useEffect(() => {
    setBlessedIds(getBlessedToday());
    setMyPostIds(getMyPosts());
    setNickname(user?.user_metadata?.full_name ?? genAnonymousName());
    setCountryCode(detectCountryCode());
  }, [user]);

  // 세계 현황 집계 (Phase 5)
  const worldData = useMemo(() => {
    const counts: Record<string, number> = {};
    board.forEach((p) => {
      const cc = p.country_code;
      if (cc) counts[cc] = (counts[cc] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [board]);

  // 정렬된 게시물
  const sorted = useMemo<BoardItem[]>(() => {
    return [...board].sort((a, b) =>
      sort === "popular"
        ? (b.blessings ?? 0) - (a.blessings ?? 0)
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [board, sort]);

  // 축복
  const handleBless = useCallback(
    async (id: string) => {
      if (blessedIds.includes(id)) return;
      markBlessedToday(id);
      setBlessedIds((prev) => [...prev, id]);
      await onBless(id);
    },
    [blessedIds, onBless]
  );

  // 게시
  const handlePost = useCallback(async () => {
    if (!message.trim() || !nickname.trim() || posting) return;
    setPosting(true);
    const newId = await onPost({
      user_name: nickname.trim(),
      content: message.trim(),
      lucky_numbers: numbers.length > 0 ? numbers : [],
      user_id: user?.id ?? null,
      country_code: countryCode,
    });
    if (newId) {
      addMyPost(newId);
      setMyPostIds(getMyPosts());
    }
    setMessage("");
    setShowForm(false);
    setPosting(false);
  }, [message, nickname, posting, numbers, user, onPost]);

  // 삭제
  const handleDelete = useCallback(
    async (id: string) => {
      await onDelete(id);
      removeMyPost(id);
      setMyPostIds((prev) => prev.filter((p) => p !== id));
    },
    [onDelete]
  );

  // 내 게시물 여부
  const isMyPost = useCallback(
    (post: BoardItem): boolean => {
      if (user?.id && post.user_id === user.id) return true;
      return myPostIds.includes(post.id);
    },
    [user, myPostIds]
  );

  const SORT_TABS: { id: SortType; label: string }[] = [
    { id: "popular", label: t.boardSortPopular },
    { id: "latest", label: t.boardSortLatest },
  ];

  const RANK_STYLES = [
    { badge: "bg-[#D4AF37] text-black", card: "bg-gradient-to-br from-yellow-500/10 to-transparent border-yellow-500/40 shadow-[0_0_30px_rgba(212,175,55,0.1)]", label: "🏆 1위", avatar: "👑" },
    { badge: "bg-slate-400 text-black", card: "bg-gradient-to-br from-slate-300/8 to-transparent border-slate-300/20", label: "🥈 2위", avatar: "⭐" },
    { badge: "bg-orange-500 text-black", card: "bg-gradient-to-br from-orange-400/8 to-transparent border-orange-400/20", label: "🥉 3위", avatar: "✨" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500 pb-24">

      {/* 헤더 */}
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-4xl font-black tracking-tighter italic">{t.boardTitle}</h2>
          <p className={`text-xs font-black uppercase tracking-[0.3em] mt-1 ${activeTheme.accent}`}>
            {t.bestLuck}
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg"
        >
          {showForm ? "✕ 닫기" : `✍ ${t.boardWriteBtn}`}
        </button>
      </div>

      {/* 세계 현황 (Phase 5) */}
      {worldData.length > 0 && (
        <div className={`${activeTheme.card} rounded-2xl px-5 py-3 border border-white/5`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{t.worldTitle}</p>
          <div className="flex gap-3 flex-wrap">
            {worldData.map(([cc, count]) => (
              <div key={cc} className="flex items-center gap-1.5">
                <span className="text-lg">{toFlag(cc)}</span>
                <span className="text-xs font-black text-white/60">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 글쓰기 폼 */}
      {showForm && (
        <div className={`${activeTheme.card} rounded-3xl p-6 border border-white/10 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200`}>

          {/* 닉네임 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {t.boardNickLabel}
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
              className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-[#D4AF37]/30 outline-none transition-all"
            />
          </div>

          {/* 현재 생성된 번호 미리보기 */}
          {numbers.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Lucky Numbers
              </p>
              <div className="flex gap-2 flex-wrap">
                {numbers.map((n, i) => (
                  <div
                    key={i}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shadow-md ${getBallColor(n)}`}
                  >
                    {n}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메시지 */}
          <textarea
            placeholder={t.writeMessage}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={100}
            rows={2}
            className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-[#D4AF37]/30 outline-none resize-none transition-all"
          />

          {/* 글자 수 + 버튼 */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500 font-bold">
              {message.length} / 100
            </span>
            <button
              onClick={handlePost}
              disabled={posting || !message.trim() || !nickname.trim()}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-black text-xs uppercase tracking-widest active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {posting ? t.boardPosting : t.postBoard}
            </button>
          </div>
        </div>
      )}

      {/* 정렬 탭 */}
      <div className="flex gap-2 px-2">
        {SORT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSort(tab.id)}
            className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              sort === tab.id
                ? "bg-white/15 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-gray-600 font-bold self-center">
          {board.length}개
        </span>
      </div>

      {/* 빈 상태 */}
      {sorted.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="text-6xl">🍀</div>
          <p className="text-gray-400 font-bold text-sm">{t.boardEmptyMsg}</p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg"
          >
            ✍ {t.boardWriteBtn}
          </button>
        </div>
      )}

      {/* 게시물 리스트 */}
      <div className="flex flex-col gap-4 px-2">
        {sorted.map((post, idx) => {
          const blessed = blessedIds.includes(post.id);
          const mine = isMyPost(post);
          const rank = RANK_STYLES[idx];

          return (
            <div
              key={post.id}
              className={`relative overflow-hidden p-6 rounded-3xl border transition-all duration-300 hover:scale-[1.005] ${
                post.is_winner
                  ? "bg-gradient-to-br from-yellow-500/15 to-transparent border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                  : rank
                  ? rank.card
                  : `${activeTheme.card} border-white/5`
              }`}
            >
              {/* 당첨 인증 뱃지 (Phase 6) */}
              {post.is_winner && (
                <div className="absolute top-0 left-0 text-[10px] font-black px-4 py-1.5 rounded-br-2xl uppercase tracking-widest bg-yellow-500 text-black">
                  🏆 {t.winBadge}
                </div>
              )}

              {/* 순위 뱃지 */}
              {!post.is_winner && rank && (
                <div className={`absolute top-0 right-0 text-[10px] font-black px-4 py-1.5 rounded-bl-2xl uppercase tracking-widest ${rank.badge}`}>
                  {rank.label}
                </div>
              )}

              {/* 상단 행: 사용자 정보 + 버튼 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-base ${rank ? "bg-[#D4AF37]/15" : "bg-white/10"}`}>
                    {rank ? rank.avatar : "👤"}
                  </div>
                  <div>
                    <p className={`text-sm font-black ${idx === 0 ? "text-[#D4AF37]" : "text-white"}`}>
                      {post.user_name}
                      {mine && (
                        <span className="ml-2 text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400 font-bold">
                          나
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-500 font-bold">
                      {new Date(post.created_at).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* 축복 버튼 */}
                  <button
                    onClick={() => handleBless(post.id)}
                    disabled={blessed}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-black transition-all active:scale-90 ${
                      blessed
                        ? "bg-green-500/20 text-green-400 border border-green-500/30 cursor-default"
                        : "bg-white/10 text-white hover:bg-[#D4AF37]/20 border border-white/5"
                    }`}
                  >
                    <span className="text-base">{blessed ? "✓" : "🍀"}</span>
                    <span>{post.blessings ?? 0}</span>
                  </button>

                  {/* 당첨 인증 버튼 (내 게시물 + 미인증) */}
                  {mine && !post.is_winner && (
                    <button
                      onClick={() => onWinCert(post.id)}
                      className="text-[10px] font-black px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-all"
                    >
                      🏆 {t.winCertBtn}
                    </button>
                  )}

                  {/* 삭제 버튼 (내 게시물만) */}
                  {mine && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs hover:bg-red-500/20 transition-all flex items-center justify-center"
                      title={t.boardDeleteConfirm}
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* 메시지 */}
              <p className="text-base font-bold italic text-white/80 mb-4 leading-relaxed">
                &quot;{post.content}&quot;
              </p>

              {/* 번호 볼 */}
              {post.lucky_numbers?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.lucky_numbers.map((num, i) => (
                    <div
                      key={i}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shadow-lg ${getBallColor(num)}`}
                    >
                      {num}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
