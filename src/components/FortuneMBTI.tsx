"use client";

import React, { useRef, useCallback } from "react";
import { FortuneType, Lang, Translation, ThemeColors } from "@/lib/types";

interface Props {
  fortuneType: FortuneType;
  lang: Lang;
  numbers: number[];
  activeTheme: ThemeColors;
  t: Translation;
}

function getRarityLabel(rarity: number, lang: Lang): string {
  if (rarity <= 2) {
    return lang === "ko" ? "전설" : lang === "ja" ? "伝説" : lang === "es" ? "Legendario" : "Legendary";
  }
  if (rarity <= 5) {
    return lang === "ko" ? "매우 희귀" : lang === "ja" ? "超希少" : lang === "es" ? "Muy Raro" : "Very Rare";
  }
  if (rarity <= 8) {
    return lang === "ko" ? "희귀" : lang === "ja" ? "希少" : lang === "es" ? "Raro" : "Rare";
  }
  return lang === "ko" ? "일반" : lang === "ja" ? "一般" : lang === "es" ? "Común" : "Common";
}

function getRarityColor(rarity: number): string {
  if (rarity <= 2) return "#e879f9";
  if (rarity <= 5) return "#f59e0b";
  if (rarity <= 8) return "#60a5fa";
  return "#9ca3af";
}

function getCompatLabel(lang: Lang): string {
  return lang === "ko" ? "베스트 궁합" : lang === "ja" ? "ベスト相性" : lang === "es" ? "Mejor Afinidad" : "Best Match";
}

export default function FortuneMBTI({ fortuneType: ft, lang, numbers, activeTheme, t }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateCard = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current;
      if (!canvas) return resolve(null);
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(null);

      const W = 720, H = 960;
      canvas.width = W;
      canvas.height = H;

      // Background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, ft.gradientFrom);
      bg.addColorStop(1, ft.gradientTo);
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(0, 0, W, H, 32);
      ctx.fill();

      // Subtle radial glow
      const glow = ctx.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, W * 0.6);
      glow.addColorStop(0, ft.color + "33");
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);

      // Border
      ctx.strokeStyle = ft.color + "66";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(12, 12, W - 24, H - 24, 24);
      ctx.stroke();

      // Watermark emoji (large, faint)
      ctx.font = "260px serif";
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(ft.emoji, W / 2, H * 0.55);
      ctx.globalAlpha = 1;

      // Rarity badge
      const rarityLabel = getRarityLabel(ft.rarity, lang);
      const rarityColor = getRarityColor(ft.rarity);
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "center";
      const rarityText = `✦ ${rarityLabel} ${ft.rarity.toFixed(1)}%`;
      const rwid = ctx.measureText(rarityText).width;
      ctx.fillStyle = rarityColor + "22";
      ctx.beginPath();
      ctx.roundRect(W / 2 - rwid / 2 - 16, 52, rwid + 32, 44, 22);
      ctx.fill();
      ctx.strokeStyle = rarityColor + "88";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = rarityColor;
      ctx.fillText(rarityText, W / 2, 80);

      // Big emoji
      ctx.font = "120px serif";
      ctx.textAlign = "center";
      ctx.fillText(ft.emoji, W / 2, 230);

      // Type name
      ctx.font = "bold 52px sans-serif";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(ft.name, W / 2, 300);

      // Desc
      const desc = ft.desc[lang] ?? ft.desc.en;
      ctx.font = "26px sans-serif";
      ctx.fillStyle = "#ffffff99";
      const words = desc.split(" ");
      let line = "";
      let y = 360;
      const maxW = W - 100;
      for (const w of words) {
        const test = line ? line + " " + w : w;
        if (ctx.measureText(test).width > maxW && line) {
          ctx.fillText(line, W / 2, y);
          line = w;
          y += 38;
        } else {
          line = test;
        }
      }
      if (line) ctx.fillText(line, W / 2, y);

      // Keywords
      const kwY = y + 60;
      let kwX = 80;
      ctx.font = "bold 22px sans-serif";
      for (const kw of ft.keywords) {
        const kw2 = "#" + kw;
        const kwW = ctx.measureText(kw2).width;
        ctx.fillStyle = ft.color + "33";
        ctx.beginPath();
        ctx.roundRect(kwX, kwY - 26, kwW + 24, 38, 19);
        ctx.fill();
        ctx.strokeStyle = ft.color + "88";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = ft.color;
        ctx.fillText(kw2, kwX + 12, kwY);
        kwX += kwW + 42;
      }

      // Divider
      const divY = kwY + 50;
      ctx.strokeStyle = ft.color + "44";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.beginPath();
      ctx.moveTo(60, divY);
      ctx.lineTo(W - 60, divY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Numbers
      const numY = divY + 60;
      const ballR = 30;
      const totalW = numbers.length * (ballR * 2 + 12) - 12;
      let bx = W / 2 - totalW / 2 + ballR;
      ctx.font = "bold 20px sans-serif";
      for (const n of numbers) {
        const ballGrad = ctx.createRadialGradient(bx - 8, numY - 10, 2, bx, numY, ballR);
        ballGrad.addColorStop(0, ft.color + "cc");
        ballGrad.addColorStop(1, ft.color + "44");
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(bx, numY, ballR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(String(n), bx, numY + 7);
        bx += ballR * 2 + 12;
      }

      // Compat
      const compatY = numY + 70;
      ctx.font = "22px sans-serif";
      ctx.fillStyle = "#ffffff66";
      ctx.textAlign = "center";
      const compatLine = `${getCompatLabel(lang)}: ${ft.compatName}`;
      ctx.fillText(compatLine, W / 2, compatY);

      // Watermark
      ctx.font = "18px sans-serif";
      ctx.fillStyle = "#ffffff44";
      ctx.fillText("k-number-maker.pages.dev", W / 2, H - 36);

      canvas.toBlob(resolve, "image/png");
    });
  }, [ft, lang, numbers]);

  const handleShare = useCallback(async () => {
    const blob = await generateCard();
    if (!blob) return;
    const file = new File([blob], "fortune-type.png", { type: "image/png" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: ft.name });
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "fortune-type.png";
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [generateCard, ft.name]);

  const rarityColor = getRarityColor(ft.rarity);
  const rarityLabel = getRarityLabel(ft.rarity, lang);
  const desc = ft.desc[lang] ?? ft.desc.en;

  return (
    <div
      className="relative rounded-2xl overflow-hidden mt-6 p-5 border border-white/10"
      style={{
        background: `linear-gradient(135deg, ${ft.gradientFrom}, ${ft.gradientTo})`,
        boxShadow: `0 0 40px ${ft.color}33`,
      }}
    >
      {/* Hidden canvas for image generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Watermark emoji */}
      <div
        className="absolute inset-0 flex items-center justify-center text-[180px] pointer-events-none select-none"
        style={{ opacity: 0.05 }}
        aria-hidden
      >
        {ft.emoji}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Rarity badge */}
        <div className="flex justify-between items-center mb-3">
          <span
            className="text-xs font-bold px-3 py-1 rounded-full border"
            style={{ color: rarityColor, borderColor: rarityColor + "66", background: rarityColor + "22" }}
          >
            ✦ {rarityLabel} {ft.rarity.toFixed(1)}%
          </span>
          <button
            onClick={handleShare}
            className="text-xs font-bold px-3 py-1 rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            {t.mbtiShareBtn}
          </button>
        </div>

        {/* Emoji + name */}
        <div className="text-center mb-3">
          <div className="text-6xl mb-2">{ft.emoji}</div>
          <div className="text-2xl font-black text-white">{ft.name}</div>
          <div className="text-xs font-bold uppercase tracking-widest mt-1" style={{ color: ft.color }}>
            {t.mbtiTitle}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/70 text-center leading-relaxed mb-4">{desc}</p>

        {/* Keywords */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {ft.keywords.map((kw) => (
            <span
              key={kw}
              className="text-xs font-bold px-3 py-1 rounded-full border"
              style={{ color: ft.color, borderColor: ft.color + "66", background: ft.color + "22" }}
            >
              #{kw}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-3" />

        {/* Best match */}
        <div className="flex justify-center items-center gap-2 text-sm text-white/60">
          <span className="font-bold text-white/40">{getCompatLabel(lang)}</span>
          <span className="font-bold" style={{ color: ft.color }}>{ft.compatName}</span>
        </div>
      </div>
    </div>
  );
}
