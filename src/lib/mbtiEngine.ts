import { FortuneType, ElementInfo } from "./types";

// ── 16가지 운명 유형 정의 ─────────────────────────────────────────
export const FORTUNE_TYPES: FortuneType[] = [
  // ── 목(木) ───────────────────────────────────────────────────────
  {
    id: "ancient-tree",
    name: "천년의 거목",
    emoji: "🌳",
    element: "목",
    trait: "강",
    rarity: 8.4,
    color: "#22c55e",
    gradientFrom: "#14532d",
    gradientTo: "#052e16",
    keywords: ["성장", "인내", "리더십", "뿌리"],
    desc: {
      ko: "깊은 뿌리처럼 흔들리지 않는 강인함. 오랜 시간 쌓아온 행운이 한 번에 폭발한다.",
      en: "Unshakeable strength like deep roots. Fortune built over time explodes all at once.",
      ja: "深い根のような揺るぎない強さ。長年積み重ねた幸運が一気に爆発する。",
      es: "Fortaleza inquebrantable como raíces profundas. La fortuna acumulada explota de una vez.",
    },
    compatId: "still-water",
    compatName: "맑은 샘물",
  },
  {
    id: "spring-sprout",
    name: "봄의 새싹",
    emoji: "🌱",
    element: "목",
    trait: "유",
    rarity: 9.1,
    color: "#4ade80",
    gradientFrom: "#166534",
    gradientTo: "#14532d",
    keywords: ["시작", "희망", "순수", "가능성"],
    desc: {
      ko: "새로운 시작마다 행운이 피어나는 유형. 첫 도전에서 가장 강한 기운이 발현된다.",
      en: "Fortune blooms with every new beginning. The strongest energy appears at first attempts.",
      ja: "新しい始まりごとに幸運が花開くタイプ。初めての挑戦で最も強いエネルギーが現れる。",
      es: "La fortuna florece con cada nuevo comienzo. La energía más fuerte aparece en los primeros intentos.",
    },
    compatId: "dawn-flame",
    compatName: "새벽의 불꽃",
  },

  // ── 화(火) ───────────────────────────────────────────────────────
  {
    id: "storm-dragon",
    name: "폭풍의 드래곤",
    emoji: "🔥",
    element: "화",
    trait: "강",
    rarity: 6.2,
    color: "#ef4444",
    gradientFrom: "#7f1d1d",
    gradientTo: "#450a0a",
    keywords: ["열정", "승부", "카리스마", "폭발력"],
    desc: {
      ko: "강렬한 불꽃처럼 한번 타오르면 멈출 수 없는 행운의 소유자. 승부처에서 진가를 발휘한다.",
      en: "Fortune that burns like an intense flame and cannot be stopped. Shines brightest at decisive moments.",
      ja: "激しい炎のように一度燃え上がったら止まらない幸運の持ち主。勝負どころで真価を発揮する。",
      es: "Portador de fortuna que arde como una llama intensa. Brilla más en los momentos decisivos.",
    },
    compatId: "spring-sprout",
    compatName: "봄의 새싹",
  },
  {
    id: "dawn-flame",
    name: "새벽의 불꽃",
    emoji: "🌅",
    element: "화",
    trait: "유",
    rarity: 10.3,
    color: "#f97316",
    gradientFrom: "#7c2d12",
    gradientTo: "#431407",
    keywords: ["따뜻함", "창의력", "직관", "새벽"],
    desc: {
      ko: "어둠을 밝히는 새벽빛처럼 주변을 행운으로 물들이는 유형. 창의적 시도에서 행운이 빛난다.",
      en: "Colors surroundings with fortune like dawn light. Luck shines brightest in creative attempts.",
      ja: "暗闇を照らす夜明けの光のように周囲を幸運で染めるタイプ。創造的な試みで運が輝く。",
      es: "Colorea el entorno con fortuna como la luz del amanecer. La suerte brilla en intentos creativos.",
    },
    compatId: "golden-warrior",
    compatName: "황금의 전사",
  },

  // ── 토(土) ───────────────────────────────────────────────────────
  {
    id: "earth-guardian",
    name: "대지의 수호자",
    emoji: "🏔️",
    element: "토",
    trait: "강",
    rarity: 7.8,
    color: "#d97706",
    gradientFrom: "#78350f",
    gradientTo: "#451a03",
    keywords: ["안정", "신뢰", "재물", "수호"],
    desc: {
      ko: "흔들리지 않는 대지처럼 꾸준한 행운이 쌓이는 유형. 장기적 투자와 인내에서 진가를 발휘한다.",
      en: "Fortune accumulates steadily like unshakeable earth. Shows true value in long-term investments.",
      ja: "揺るぎない大地のように着実に幸運が積み重なるタイプ。長期的な投資と忍耐で真価を発揮する。",
      es: "La fortuna se acumula constantemente como tierra inquebrantable. Brilla en inversiones a largo plazo.",
    },
    compatId: "ancient-tree",
    compatName: "천년의 거목",
  },
  {
    id: "fertile-field",
    name: "풍요의 들판",
    emoji: "🌾",
    element: "토",
    trait: "유",
    rarity: 11.2,
    color: "#ca8a04",
    gradientFrom: "#713f12",
    gradientTo: "#3b1a05",
    keywords: ["풍요", "수확", "나눔", "감사"],
    desc: {
      ko: "씨앗을 뿌리면 반드시 결실을 맺는 유형. 주변과 나눌수록 더 큰 행운이 돌아온다.",
      en: "Fortune that always bears fruit when seeds are sown. The more you share, the greater the luck returns.",
      ja: "種をまけば必ず実を結ぶタイプ。周囲と分かち合うほど大きな幸運が戻ってくる。",
      es: "Fortuna que siempre da frutos cuando se siembran semillas. Cuanto más compartes, más suerte regresa.",
    },
    compatId: "dawn-flame",
    compatName: "새벽의 불꽃",
  },

  // ── 금(金) ───────────────────────────────────────────────────────
  {
    id: "golden-warrior",
    name: "황금의 전사",
    emoji: "⚔️",
    element: "금",
    trait: "강",
    rarity: 5.9,
    color: "#eab308",
    gradientFrom: "#713f12",
    gradientTo: "#1c1917",
    keywords: ["결단", "승리", "의지", "황금"],
    desc: {
      ko: "단 한 번의 결단으로 모든 것을 바꾸는 행운의 전사. 중요한 선택의 순간에 행운이 집중된다.",
      en: "A fortune warrior who changes everything with a single decisive moment. Luck concentrates at crucial choices.",
      ja: "たった一度の決断で全てを変える幸運の戦士。重要な選択の瞬間に運が集中する。",
      es: "Un guerrero de la fortuna que cambia todo con una sola decisión. La suerte se concentra en elecciones cruciales.",
    },
    compatId: "dawn-flame",
    compatName: "새벽의 불꽃",
  },
  {
    id: "moonlight-blade",
    name: "달빛의 검",
    emoji: "🌙",
    element: "금",
    trait: "유",
    rarity: 8.7,
    color: "#a78bfa",
    gradientFrom: "#2e1065",
    gradientTo: "#1e1b4b",
    keywords: ["예리함", "직관", "신비", "고요"],
    desc: {
      ko: "달빛처럼 고요하지만 예리한 행운. 남들이 놓치는 기회를 정확히 포착하는 능력을 가졌다.",
      en: "Fortune quiet as moonlight but sharp as a blade. Has the ability to precisely catch opportunities others miss.",
      ja: "月明かりのように静かで鋭い幸運。他の人が見逃すチャンスを正確に捉える能力を持つ。",
      es: "Fortuna silenciosa como la luz lunar pero afilada. Tiene la capacidad de capturar oportunidades que otros pierden.",
    },
    compatId: "deep-ocean",
    compatName: "깊은 바다",
  },

  // ── 수(水) ───────────────────────────────────────────────────────
  {
    id: "deep-ocean",
    name: "깊은 바다",
    emoji: "🌊",
    element: "수",
    trait: "강",
    rarity: 7.3,
    color: "#3b82f6",
    gradientFrom: "#1e3a5f",
    gradientTo: "#0c1a2e",
    keywords: ["깊이", "지혜", "잠재력", "폭발"],
    desc: {
      ko: "조용히 깊어지다 한번에 거대한 파도를 일으키는 행운. 오래 기다릴수록 더 강력해진다.",
      en: "Fortune that quietly deepens and then creates a massive wave at once. The longer you wait, the more powerful.",
      ja: "静かに深まり一度に巨大な波を起こす幸運。長く待つほど強くなる。",
      es: "Fortuna que se profundiza silenciosamente y crea una ola masiva de una vez. Cuanto más esperas, más poderosa.",
    },
    compatId: "moonlight-blade",
    compatName: "달빛의 검",
  },
  {
    id: "still-water",
    name: "맑은 샘물",
    emoji: "💧",
    element: "수",
    trait: "유",
    rarity: 9.8,
    color: "#60a5fa",
    gradientFrom: "#1e40af",
    gradientTo: "#1e3a8a",
    keywords: ["순수", "흐름", "적응", "치유"],
    desc: {
      ko: "어떤 환경에도 자연스럽게 스며드는 행운. 막히면 돌아가는 물처럼 결국 목적지에 도달한다.",
      en: "Fortune that naturally permeates any environment. Like water that goes around obstacles, always reaches its destination.",
      ja: "どんな環境にも自然に染み込む幸運。障害を回り道する水のように、最終的に目的地に到達する。",
      es: "Fortuna que se impregna naturalmente en cualquier ambiente. Como el agua que rodea obstáculos, siempre llega.",
    },
    compatId: "ancient-tree",
    compatName: "천년의 거목",
  },

  // ── 복합 유형 (희귀) ─────────────────────────────────────────────
  {
    id: "sage",
    name: "숲의 현자",
    emoji: "🌲",
    element: "복합",
    trait: "균형",
    rarity: 3.8,
    color: "#86efac",
    gradientFrom: "#14532d",
    gradientTo: "#0a2818",
    keywords: ["지혜", "균형", "자연", "통찰"],
    desc: {
      ko: "목과 토의 기운이 하나로 합쳐진 희귀한 유형. 지혜와 안정이 공존하며 모든 이에게 행운을 나눠준다.",
      en: "A rare type where Wood and Earth energy merge. Wisdom and stability coexist, sharing fortune with all.",
      ja: "木と土の気が一つに合わさった希少なタイプ。知恵と安定が共存し、全ての人に幸運を分け与える。",
      es: "Tipo raro donde la energía de Madera y Tierra se fusionan. Sabiduría y estabilidad coexisten.",
    },
    compatId: "crystal",
    compatName: "북극의 수정",
  },
  {
    id: "phoenix",
    name: "봉황의 후예",
    emoji: "🦅",
    element: "복합",
    trait: "균형",
    rarity: 3.2,
    color: "#fca5a5",
    gradientFrom: "#7f1d1d",
    gradientTo: "#1c0707",
    keywords: ["부활", "전설", "불사", "변화"],
    desc: {
      ko: "화와 목의 기운이 결합한 봉황의 기운. 실패 후 더 강하게 부활하는 역전의 행운을 가졌다.",
      en: "The phoenix energy combining Fire and Wood. Possesses comeback fortune that rises stronger after failure.",
      ja: "火と木の気が結合した鳳凰の気。失敗後により強く復活する逆転の幸運を持つ。",
      es: "La energía del fénix combinando Fuego y Madera. Posee fortuna de regreso que surge más fuerte tras el fracaso.",
    },
    compatId: "crystal",
    compatName: "북극의 수정",
  },
  {
    id: "volcano",
    name: "용암의 정수",
    emoji: "🌋",
    element: "복합",
    trait: "균형",
    rarity: 2.9,
    color: "#fb923c",
    gradientFrom: "#7c2d12",
    gradientTo: "#1c0a03",
    keywords: ["에너지", "폭발", "변환", "창조"],
    desc: {
      ko: "화와 금의 기운이 융합된 극히 희귀한 유형. 극적인 변화와 함께 거대한 행운이 한번에 분출된다.",
      en: "Extremely rare type fusing Fire and Metal energy. Massive fortune erupts all at once with dramatic change.",
      ja: "火と金の気が融合した極めて希少なタイプ。劇的な変化とともに巨大な幸運が一気に噴出される。",
      es: "Tipo extremadamente raro que fusiona energía de Fuego y Metal. La fortuna masiva erupciona con cambio dramático.",
    },
    compatId: "lake",
    compatName: "신비의 호수",
  },
  {
    id: "crystal",
    name: "북극의 수정",
    emoji: "❄️",
    element: "복합",
    trait: "균형",
    rarity: 3.5,
    color: "#bae6fd",
    gradientFrom: "#0c4a6e",
    gradientTo: "#082f49",
    keywords: ["순수", "희귀", "투명", "영원"],
    desc: {
      ko: "금과 수의 기운이 결정화된 유형. 한번 움직이면 멈추지 않는 연속적 행운의 흐름을 가졌다.",
      en: "A type where Metal and Water energy crystallize. Possesses a continuous stream of fortune that never stops once moving.",
      ja: "金と水の気が結晶化したタイプ。一度動き出したら止まらない連続的な幸運の流れを持つ。",
      es: "Tipo donde la energía de Metal y Agua se cristaliza. Posee una corriente continua de fortuna imparable.",
    },
    compatId: "phoenix",
    compatName: "봉황의 후예",
  },
  {
    id: "lake",
    name: "신비의 호수",
    emoji: "🏞️",
    element: "복합",
    trait: "균형",
    rarity: 4.1,
    color: "#67e8f9",
    gradientFrom: "#164e63",
    gradientTo: "#083344",
    keywords: ["신비", "깊이", "반영", "평온"],
    desc: {
      ko: "수와 토의 기운이 합쳐진 신비로운 유형. 고요한 수면 아래 거대한 행운이 잠들어 있다.",
      en: "A mysterious type where Water and Earth energy combine. Enormous fortune sleeps beneath the calm surface.",
      ja: "水と土の気が合わさった神秘的なタイプ。穏やかな水面の下に巨大な幸運が眠っている。",
      es: "Tipo misterioso donde la energía de Agua y Tierra se combinan. Enorme fortuna duerme bajo la superficie tranquila.",
    },
    compatId: "volcano",
    compatName: "용암의 정수",
  },

  // ── 특별 유형 ─────────────────────────────────────────────────────
  {
    id: "cosmic",
    name: "우주의 중심",
    emoji: "✨",
    element: "복합",
    trait: "균형",
    rarity: 1.2,
    color: "#e879f9",
    gradientFrom: "#581c87",
    gradientTo: "#1a0533",
    keywords: ["우주", "전지전능", "초월", "운명"],
    desc: {
      ko: "다섯 오행 모두의 기운을 품은 전설의 유형. 전체 사용자 중 1%만이 도달할 수 있는 극희귀 운명.",
      en: "A legendary type embodying all five elements. An ultra-rare destiny that only 1% of all users can reach.",
      ja: "五行全ての気を宿した伝説のタイプ。全ユーザーの1%しか到達できない超希少な運命。",
      es: "Un tipo legendario que encarna los cinco elementos. Un destino ultra raro que solo el 1% de usuarios puede alcanzar.",
    },
    compatId: "cosmic",
    compatName: "우주의 중심",
  },
];

// ── 계산 헬퍼 ─────────────────────────────────────────────────────

const ELEMENT_TO_INDEX: Record<string, number> = {
  "목": 0, "화": 1, "토": 2, "금": 3, "수": 4,
};

function calcTrait(numbers: number[]): "강" | "유" {
  if (numbers.length === 0) return "강";
  const odds = numbers.filter((n) => n % 2 !== 0).length;
  return odds > numbers.length / 2 ? "강" : "유";
}

function calcRangeCount(numbers: number[]): number {
  const covered = [false, false, false, false, false];
  numbers.forEach((n) => {
    if (n <= 9) covered[0] = true;
    else if (n <= 19) covered[1] = true;
    else if (n <= 29) covered[2] = true;
    else if (n <= 39) covered[3] = true;
    else covered[4] = true;
  });
  return covered.filter(Boolean).length;
}

// ── 메인 계산 함수 ────────────────────────────────────────────────
export function calcFortuneType(
  luckyElement: ElementInfo,
  numbers: number[]
): FortuneType {
  const rangeCount = calcRangeCount(numbers);

  // 5개 범위 모두 커버 → 우주의 중심 (1.2%)
  if (rangeCount >= 5) {
    return FORTUNE_TYPES.find((t) => t.id === "cosmic")!;
  }

  const elemIdx = ELEMENT_TO_INDEX[luckyElement.name] ?? 0;
  const compositeIds = ["sage", "phoenix", "volcano", "crystal", "lake"] as const;

  // 4개 범위 커버 → 복합 유형 (element 기반)
  if (rangeCount >= 4) {
    return FORTUNE_TYPES.find((t) => t.id === compositeIds[elemIdx])!;
  }

  // 일반 유형: element × trait
  const trait = calcTrait(numbers);
  // 각 오행당 2개 (강/유): 목0/1, 화2/3, 토4/5, 금6/7, 수8/9
  const normalIdx = elemIdx * 2 + (trait === "강" ? 0 : 1);
  return FORTUNE_TYPES[normalIdx];
}
