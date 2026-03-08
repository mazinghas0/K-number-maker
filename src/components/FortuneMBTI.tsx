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

// ── 키워드 번역 테이블 ─────────────────────────────────────────────
const KWMAP: Record<string, { en: string; ja: string; es: string }> = {
  "성장": { en: "Growth", ja: "成長", es: "Crecimiento" },
  "인내": { en: "Patience", ja: "忍耐", es: "Paciencia" },
  "리더십": { en: "Leadership", ja: "リーダー", es: "Liderazgo" },
  "뿌리": { en: "Roots", ja: "根", es: "Raíces" },
  "시작": { en: "Beginning", ja: "始まり", es: "Inicio" },
  "희망": { en: "Hope", ja: "希望", es: "Esperanza" },
  "순수": { en: "Purity", ja: "純粋", es: "Pureza" },
  "가능성": { en: "Potential", ja: "可能性", es: "Potencial" },
  "열정": { en: "Passion", ja: "情熱", es: "Pasión" },
  "승부": { en: "Combat", ja: "勝負", es: "Combate" },
  "카리스마": { en: "Charisma", ja: "カリスマ", es: "Carisma" },
  "폭발력": { en: "Explosive", ja: "爆発力", es: "Explosivo" },
  "따뜻함": { en: "Warmth", ja: "温かさ", es: "Calidez" },
  "창의력": { en: "Creative", ja: "創造力", es: "Creativo" },
  "직관": { en: "Intuition", ja: "直感", es: "Intuición" },
  "새벽": { en: "Dawn", ja: "夜明け", es: "Amanecer" },
  "안정": { en: "Stability", ja: "安定", es: "Estabilidad" },
  "신뢰": { en: "Trust", ja: "信頼", es: "Confianza" },
  "재물": { en: "Wealth", ja: "財物", es: "Riqueza" },
  "수호": { en: "Guardian", ja: "守護", es: "Guardián" },
  "풍요": { en: "Abundance", ja: "豊かさ", es: "Abundancia" },
  "수확": { en: "Harvest", ja: "収穫", es: "Cosecha" },
  "나눔": { en: "Sharing", ja: "分かち合い", es: "Compartir" },
  "감사": { en: "Gratitude", ja: "感謝", es: "Gratitud" },
  "결단": { en: "Decision", ja: "決断", es: "Decisión" },
  "승리": { en: "Victory", ja: "勝利", es: "Victoria" },
  "의지": { en: "Will", ja: "意志", es: "Voluntad" },
  "황금": { en: "Gold", ja: "黄金", es: "Oro" },
  "예리함": { en: "Sharp", ja: "鋭さ", es: "Agudeza" },
  "신비": { en: "Mystery", ja: "神秘", es: "Misterio" },
  "고요": { en: "Serenity", ja: "静寂", es: "Serenidad" },
  "깊이": { en: "Depth", ja: "深さ", es: "Profundidad" },
  "지혜": { en: "Wisdom", ja: "知恵", es: "Sabiduría" },
  "잠재력": { en: "Latent", ja: "潜在力", es: "Potencial" },
  "폭발": { en: "Explosion", ja: "爆発", es: "Explosión" },
  "흐름": { en: "Flow", ja: "流れ", es: "Flujo" },
  "적응": { en: "Adapt", ja: "適応", es: "Adaptar" },
  "치유": { en: "Healing", ja: "癒し", es: "Sanación" },
  "균형": { en: "Balance", ja: "均衡", es: "Equilibrio" },
  "자연": { en: "Nature", ja: "自然", es: "Naturaleza" },
  "통찰": { en: "Insight", ja: "洞察", es: "Perspicacia" },
  "부활": { en: "Revival", ja: "復活", es: "Renacimiento" },
  "전설": { en: "Legend", ja: "伝説", es: "Leyenda" },
  "불사": { en: "Immortal", ja: "不死", es: "Inmortal" },
  "변화": { en: "Change", ja: "変化", es: "Cambio" },
  "에너지": { en: "Energy", ja: "エネルギー", es: "Energía" },
  "변환": { en: "Transform", ja: "変換", es: "Transformar" },
  "창조": { en: "Creation", ja: "創造", es: "Creación" },
  "희귀": { en: "Rare", ja: "希少", es: "Raro" },
  "투명": { en: "Clarity", ja: "透明", es: "Claridad" },
  "영원": { en: "Eternal", ja: "永遠", es: "Eterno" },
  "반영": { en: "Reflection", ja: "反映", es: "Reflexión" },
  "평온": { en: "Calm", ja: "平穏", es: "Calma" },
  "우주": { en: "Cosmos", ja: "宇宙", es: "Cosmos" },
  "전지전능": { en: "Omnipotent", ja: "全知全能", es: "Omnipotente" },
  "초월": { en: "Transcend", ja: "超越", es: "Trascender" },
  "운명": { en: "Destiny", ja: "運命", es: "Destino" },
};

function translateKw(kw: string, lang: Lang): string {
  if (lang === "ko") return kw;
  return KWMAP[kw]?.[lang as "en" | "ja" | "es"] ?? kw;
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

      // Keywords (번역 + 줄바꿈)
      const kwPad = 12, kwGap = 10, kwH = 38, kwLineH = 52;
      ctx.font = "bold 22px sans-serif";
      const translatedKws = ft.keywords.map((kw) => "#" + translateKw(kw, lang));
      let kwX = 80, kwRowY = y + 60;
      for (const kw2 of translatedKws) {
        const kwW = ctx.measureText(kw2).width;
        const tagW = kwW + kwPad * 2;
        // 줄바꿈
        if (kwX + tagW > W - 80 && kwX > 80) {
          kwX = 80;
          kwRowY += kwLineH;
        }
        ctx.fillStyle = ft.color + "33";
        ctx.beginPath();
        ctx.roundRect(kwX, kwRowY - 26, tagW, kwH, 19);
        ctx.fill();
        ctx.strokeStyle = ft.color + "88";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = ft.color;
        ctx.textAlign = "left";
        ctx.fillText(kw2, kwX + kwPad, kwRowY);
        kwX += tagW + kwGap;
      }
      ctx.textAlign = "center";

      // Divider
      const divY = kwRowY + 50;
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
              #{translateKw(kw, lang)}
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
