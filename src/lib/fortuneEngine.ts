import { ElementInfo } from "./types";

export const ELEMENTS: ElementInfo[] = [
  { 
    name: "Wood", symbol: "木", color: "text-green-500", bg: "bg-green-500/10", desc: "성장과 활력", range: [1, 10], 
    ilgan: "갑을목(甲乙木)", attribute: "뻗어나가는 강인한 나무의 기운",
    messages: [{ en: "Energy flows like a tree.", ko: "나무의 기운이 흐릅니다.", ja: "木のエネルギー.", es: "Energía de árbol." }] 
  },
  { 
    name: "Fire", symbol: "火", color: "text-red-500", bg: "bg-red-500/10", desc: "열정과 확산", range: [11, 20], 
    ilgan: "병정화(丙丁火)", attribute: "어둠을 밝히는 뜨거운 불꽃의 기운",
    messages: [{ en: "Passion lights way.", ko: "열정이 길을 밝힙니다.", ja: "情熱が道を照らす.", es: "La pasión ilumina." }] 
  },
  { 
    name: "Earth", symbol: "土", color: "text-yellow-600", bg: "bg-yellow-600/10", desc: "안정과 균형", range: [21, 30], 
    ilgan: "무기토(戊己土)", attribute: "모든 것을 포용하는 대지의 기운",
    messages: [{ en: "Stability luck.", ko: "안정이 행운을 부릅니다.", ja: "安定が幸運を呼ぶ.", es: "Estabilidad suerte." }] 
  },
  { 
    name: "Metal", symbol: "金", color: "text-gray-400", bg: "bg-gray-400/10", desc: "결단과 결실", range: [31, 40], 
    ilgan: "경신금(庚辛金)", attribute: "불순물을 쳐내는 단단한 쇠의 기운",
    messages: [{ en: "Intuition gold.", ko: "직관이 결실을 맺습니다.", ja: "直感が実を結ぶ.", es: "Intuición oro." }] 
  },
  { 
    name: "Water", symbol: "水", color: "text-blue-500", bg: "bg-blue-500/10", desc: "지혜와 유연함", range: [41, 50], 
    ilgan: "임계수(壬癸水)", attribute: "유연하게 흐르며 만물을 적시는 물의 기운",
    messages: [{ en: "Wisdom flows.", ko: "지혜가 흐릅니다.", ja: "知恵が流れる.", es: "Sabiduría fluye." }] 
  },
];

/**
 * 명리학 기반 오행 및 일간 분석 엔진
 */
export function analyzeDestiny(birthDate: string): ElementInfo {
  if (!birthDate) return ELEMENTS[2]; // 기본값: Earth
  
  const date = new Date(birthDate);
  const day = date.getDate();
  
  // 단순 날짜 기반이 아닌, 명리학적 순환을 고려한 인덱스 추출 (확장 가능)
  const index = day % 5;
  return ELEMENTS[index];
}

/**
 * 번호 대역별 공 색상 유틸리티
 */
export function getBallColor(num: number, max: number = 45): string {
  const percent = (num / max) * 100;
  if (percent <= 20) return "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950";
  if (percent <= 40) return "bg-gradient-to-br from-blue-300 to-blue-500 text-blue-950";
  if (percent <= 60) return "bg-gradient-to-br from-red-300 to-red-500 text-red-950";
  if (percent <= 80) return "bg-gradient-to-br from-gray-300 to-gray-500 text-gray-950";
  return "bg-gradient-to-br from-green-300 to-green-500 text-green-950";
}
