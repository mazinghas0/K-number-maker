"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ElementInfo, UserProfile, ThemeColors, Translation } from "@/lib/types";

const MAX_SHARE_REWARD_PER_DAY = 2;
const getTodayStr = () => new Date().toISOString().slice(0, 10);
const getShareRewardKey = () => `k-share-reward-${getTodayStr()}`;
const getOracleKey = () => `k-oracle-${getTodayStr()}`;

type ShareTab = "card" | "sns" | "invite";

function getBallStyle(num: number): { bg: string; text: string } {
  if (num <= 10) return { bg: "#FBC400", text: "#000" };
  if (num <= 20) return { bg: "#69C8FF", text: "#000" };
  if (num <= 30) return { bg: "#FF7272", text: "#fff" };
  if (num <= 40) return { bg: "#AAAAAA", text: "#fff" };
  return { bg: "#B0D840", text: "#000" };
}

function lightenColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function drawShareCard(
  canvas: HTMLCanvasElement,
  numbers: number[],
  luckyElement: ElementInfo,
  userProfile: UserProfile | null
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = 420, H = 620;
  canvas.width = W;
  canvas.height = H;

  // 배경
  const bgGrad = ctx.createLinearGradient(0, 0, W, H);
  bgGrad.addColorStop(0, "#0d0d1a");
  bgGrad.addColorStop(1, "#1a0d00");
  ctx.beginPath();
  ctx.moveTo(24, 0); ctx.lineTo(W - 24, 0);
  ctx.quadraticCurveTo(W, 0, W, 24); ctx.lineTo(W, H - 24);
  ctx.quadraticCurveTo(W, H, W - 24, H); ctx.lineTo(24, H);
  ctx.quadraticCurveTo(0, H, 0, H - 24); ctx.lineTo(0, 24);
  ctx.quadraticCurveTo(0, 0, 24, 0); ctx.closePath();
  ctx.fillStyle = bgGrad;
  ctx.fill();

  // 황금 테두리
  ctx.beginPath();
  ctx.moveTo(24, 1); ctx.lineTo(W - 24, 1);
  ctx.quadraticCurveTo(W - 1, 1, W - 1, 24); ctx.lineTo(W - 1, H - 24);
  ctx.quadraticCurveTo(W - 1, H - 1, W - 24, H - 1); ctx.lineTo(24, H - 1);
  ctx.quadraticCurveTo(1, H - 1, 1, H - 24); ctx.lineTo(1, 24);
  ctx.quadraticCurveTo(1, 1, 24, 1); ctx.closePath();
  ctx.strokeStyle = "rgba(212,175,55,0.4)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 오행 심볼 워터마크
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.font = "bold 260px serif";
  ctx.fillStyle = "#FFD700";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(luckyElement.symbol, W / 2, H / 2 - 20);
  ctx.restore();

  // 앱 이름
  ctx.font = "bold 12px system-ui, sans-serif";
  ctx.fillStyle = "#D4AF37";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText("✦  K - N U M B E R  M A K E R  ✦", W / 2, 28);

  // 상단 구분선
  const lg1 = ctx.createLinearGradient(40, 0, W - 40, 0);
  lg1.addColorStop(0, "rgba(212,175,55,0)");
  lg1.addColorStop(0.5, "rgba(212,175,55,0.5)");
  lg1.addColorStop(1, "rgba(212,175,55,0)");
  ctx.beginPath(); ctx.moveTo(40, 56); ctx.lineTo(W - 40, 56);
  ctx.strokeStyle = lg1; ctx.lineWidth = 1; ctx.stroke();

  // 사용자 이름
  ctx.font = "bold 22px system-ui, sans-serif";
  ctx.fillStyle = "#FFFFFF";
  ctx.textBaseline = "top";
  ctx.fillText(userProfile?.name || "Lucky Seeker", W / 2, 76);

  // 오행 + 일간
  ctx.font = "14px system-ui, sans-serif";
  ctx.fillStyle = "#D4AF37";
  ctx.fillText(`${luckyElement.symbol} ${luckyElement.name}  •  ${luckyElement.ilgan}`, W / 2, 108);

  // 날짜
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fillText(
    new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
    W / 2, 132
  );

  // 중간 구분선
  ctx.beginPath(); ctx.moveTo(60, 158); ctx.lineTo(W - 60, 158);
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1; ctx.stroke();

  // 번호 볼
  const ballR = 34;
  const gap = numbers.length <= 6 ? 12 : 8;
  const totalBallW = numbers.length * (ballR * 2) + (numbers.length - 1) * gap;
  const startX = (W - totalBallW) / 2 + ballR;
  const ballY = H / 2 - 10;

  numbers.forEach((num, i) => {
    const cx = startX + i * (ballR * 2 + gap);
    const { bg, text } = getBallStyle(num);

    // 그림자 + 볼
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    const ballGrad = ctx.createRadialGradient(
      cx - ballR * 0.25, ballY - ballR * 0.25, ballR * 0.1,
      cx, ballY, ballR
    );
    ballGrad.addColorStop(0, lightenColor(bg, 40));
    ballGrad.addColorStop(1, bg);
    ctx.beginPath(); ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
    ctx.fillStyle = ballGrad; ctx.fill();
    ctx.restore();

    // 하이라이트
    ctx.save();
    ctx.globalAlpha = 0.25;
    const hl = ctx.createRadialGradient(cx - ballR * 0.3, ballY - ballR * 0.35, 1, cx, ballY, ballR);
    hl.addColorStop(0, "#fff"); hl.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(cx, ballY, ballR, 0, Math.PI * 2);
    ctx.fillStyle = hl; ctx.fill();
    ctx.restore();

    // 숫자
    ctx.font = `bold ${num >= 10 ? 20 : 24}px system-ui, sans-serif`;
    ctx.fillStyle = text;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(num), cx, ballY + 1);
  });

  // 운세 문구
  const phrase = luckyElement.messages?.[0]?.ko || "오늘의 행운이 함께하길";
  const short = phrase.length > 32 ? phrase.slice(0, 32) + "…" : phrase;
  ctx.font = "italic 13px Georgia, serif";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`"${short}"`, W / 2, ballY + ballR + 30);

  // 하단 구분선
  const lg2 = ctx.createLinearGradient(40, 0, W - 40, 0);
  lg2.addColorStop(0, "rgba(212,175,55,0)");
  lg2.addColorStop(0.5, "rgba(212,175,55,0.3)");
  lg2.addColorStop(1, "rgba(212,175,55,0)");
  ctx.beginPath(); ctx.moveTo(40, H - 58); ctx.lineTo(W - 40, H - 58);
  ctx.strokeStyle = lg2; ctx.lineWidth = 1; ctx.stroke();

  // 워터마크
  ctx.font = "11px system-ui, sans-serif";
  ctx.fillStyle = "rgba(212,175,55,0.45)";
  ctx.textBaseline = "bottom";
  ctx.fillText("k-number-maker.pages.dev", W / 2, H - 20);
}

interface Props {
  numbers: number[];
  onClose: () => void;
  luckyElement: ElementInfo;
  userProfile: UserProfile | null;
  activeTheme: ThemeColors;
  t: Translation;
  onShareReward: () => void;
}

export default function ShareModal({ numbers, onClose, luckyElement, userProfile, t, onShareReward }: Props) {
  const [activeTab, setActiveTab] = useState<ShareTab>("card");
  const [copied, setCopied] = useState(false);
  const [rewarded, setRewarded] = useState(false);
  const [rewardLimitReached, setRewardLimitReached] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const n = parseInt(localStorage.getItem(getShareRewardKey()) ?? "0");
    if (n >= MAX_SHARE_REWARD_PER_DAY) setRewardLimitReached(true);
  }, []);

  useEffect(() => {
    if (canvasRef.current && numbers.length > 0) {
      drawShareCard(canvasRef.current, numbers, luckyElement, userProfile);
    }
  }, [numbers, luckyElement, userProfile]);

  const giveReward = useCallback(() => {
    if (rewarded || rewardLimitReached) return;
    const n = parseInt(localStorage.getItem(getShareRewardKey()) ?? "0");
    if (n >= MAX_SHARE_REWARD_PER_DAY) { setRewardLimitReached(true); return; }
    const usage = parseInt(localStorage.getItem(getOracleKey()) ?? "0");
    if (usage > 0) localStorage.setItem(getOracleKey(), String(usage - 1));
    localStorage.setItem(getShareRewardKey(), String(n + 1));
    setRewarded(true);
    onShareReward();
  }, [rewarded, rewardLimitReached, onShareReward]);

  const handleSaveImage = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement("a");
    a.download = `k-number-${getTodayStr()}.png`;
    a.href = c.toDataURL("image/png");
    a.click();
    giveReward();
  }, [giveReward]);

  const handleNativeShare = useCallback(async () => {
    const c = canvasRef.current;
    if (!c) return;
    const txt = `🍀 오늘의 행운 번호: ${numbers.join(", ")}\n✨ ${luckyElement.name} 기운으로 생성\n\nk-number-maker.pages.dev`;
    if (navigator.canShare) {
      try {
        const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), "image/png"));
        const file = new File([blob], "lucky-numbers.png", { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ title: "K-Number 행운 카드", text: txt, files: [file] });
          giveReward();
          return;
        }
      } catch { /* fallback */ }
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: "K-Number 행운 카드", text: txt, url: "https://k-number-maker.pages.dev" });
        giveReward();
      } catch { /* cancelled */ }
    } else {
      handleSaveImage();
    }
  }, [numbers, luckyElement, giveReward, handleSaveImage]);

  const shareToSns = useCallback((platform: "telegram" | "twitter" | "whatsapp" | "line") => {
    const text = encodeURIComponent(`🍀 오늘의 행운 번호: ${numbers.join(", ")}\n✨ ${luckyElement.name} 기운\n`);
    const url = encodeURIComponent("https://k-number-maker.pages.dev");
    const map: Record<"telegram" | "twitter" | "whatsapp" | "line", string> = {
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      line: `https://social-plugins.line.me/lineit/share?url=${url}`,
    };
    window.open(map[platform], "_blank", "width=600,height=500");
    giveReward();
  }, [numbers, luckyElement, giveReward]);

  const handleCopyInvite = useCallback(() => {
    const existing = localStorage.getItem("k-invite-id");
    const id = existing ?? (() => {
      const newId = Math.random().toString(36).slice(2, 10);
      localStorage.setItem("k-invite-id", newId);
      return newId;
    })();
    const link = `https://k-number-maker.pages.dev?ref=${id}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      giveReward();
    });
  }, [giveReward]);

  if (numbers.length === 0) return null;

  const TABS: { id: ShareTab; label: string }[] = [
    { id: "card", label: t.shareCard },
    { id: "sns", label: t.shareSns },
    { id: "invite", label: t.shareInvite },
  ];

  const SNS: { id: "telegram" | "twitter" | "whatsapp" | "line"; label: string; color: string; icon: string }[] = [
    { id: "telegram", label: "Telegram", color: "#29B6F6", icon: "✈️" },
    { id: "twitter", label: "X (Twitter)", color: "#555555", icon: "𝕏" },
    { id: "whatsapp", label: "WhatsApp", color: "#25D366", icon: "💬" },
    { id: "line", label: "LINE", color: "#06C755", icon: "💚" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-sm sm:max-w-md bg-[#0d0d1a] border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(212,175,55,0.15)] animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300">

        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-black tracking-widest text-white uppercase">{t.shareTitle}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 hover:bg-white/20 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* 탭 */}
        <div className="flex px-6 gap-2 mb-4">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-[#D4AF37] text-black"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="px-6 pb-6 flex flex-col gap-3">

          {/* 카드 탭 */}
          {activeTab === "card" && (
            <>
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] w-full"
                  style={{ maxWidth: 300, height: "auto" }}
                />
              </div>
              <button
                onClick={handleSaveImage}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black font-black text-sm uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                ⬇ {t.shareSave}
              </button>
              <button
                onClick={handleNativeShare}
                className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black text-sm uppercase tracking-widest active:scale-95 transition-all hover:bg-white/10"
              >
                ↗ 공유하기
              </button>
            </>
          )}

          {/* SNS 탭 */}
          {activeTab === "sns" && (
            <div className="grid grid-cols-2 gap-3">
              {SNS.map(btn => (
                <button
                  key={btn.id}
                  onClick={() => shareToSns(btn.id)}
                  className="flex flex-col items-center gap-2 py-5 rounded-2xl border border-white/10 hover:border-white/20 transition-all active:scale-95"
                  style={{ background: `${btn.color}18` }}
                >
                  <span className="text-2xl">{btn.icon}</span>
                  <span className="text-xs font-black text-white tracking-wide">{btn.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* 초대 탭 */}
          {activeTab === "invite" && (
            <>
              <div className="bg-white/5 rounded-2xl p-5 text-center space-y-3">
                <div className="text-3xl">🎁</div>
                <p className="text-sm font-bold text-white">친구 초대하고 함께 행운을!</p>
                <p className="text-xs text-gray-400 leading-relaxed">
                  내 초대 링크를 공유하면<br />
                  <span className="text-[#D4AF37] font-bold">AI 상담 +1회</span> 보너스 획득
                </p>
              </div>
              <button
                onClick={handleCopyInvite}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all ${
                  copied
                    ? "bg-green-500 text-white"
                    : "bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-black"
                }`}
              >
                {copied ? `✓ ${t.shareCopied}` : `🔗 ${t.shareCopyLink}`}
              </button>
              <p className="text-[10px] text-gray-500 text-center">
                k-number-maker.pages.dev?ref=...
              </p>
            </>
          )}

          {/* 보상 배너 */}
          <div className={`rounded-2xl px-4 py-3 text-center text-xs font-bold transition-all ${
            rewarded
              ? "bg-green-500/15 border border-green-500/30 text-green-400"
              : rewardLimitReached
              ? "bg-white/5 border border-white/10 text-gray-500"
              : "bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37]"
          }`}>
            {rewarded
              ? `✨ ${t.shareBonus}`
              : rewardLimitReached
              ? t.shareTodayLimit
              : `🎁 ${t.shareRewardDesc}`}
          </div>
        </div>
      </div>
    </div>
  );
}
