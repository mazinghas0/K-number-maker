import { IlginData, IlginRelation, IlginGrade } from "./types";

// ── 천간 / 지지 상수 ──────────────────────────────────────────────────────────

const STEMS_HAN = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"] as const;
const STEMS_KO  = ["갑","을","병","정","무","기","경","신","임","계"] as const;
const BRANCHES_HAN = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"] as const;
const BRANCHES_KO  = ["자","축","인","묘","진","사","오","미","신","유","술","해"] as const;

// 오행 인덱스: 0=木 1=火 2=土 3=金 4=水
// 甲乙=木(0) 丙丁=火(1) 戊己=土(2) 庚辛=金(3) 壬癸=水(4)
function stemToElem(s: number): number {
  return Math.floor(s / 2);
}

// ── 상생상극 판단 ─────────────────────────────────────────────────────────────
// 상생 순환: 木→火→土→金→水→木  (+1 mod 5)
// 상극 순환: 木→土→水→火→金→木  (+2 mod 5)

function getRelation(myElem: number, todayElem: number): IlginRelation {
  if (myElem === todayElem)                    return "比和";
  if ((myElem + 1) % 5 === todayElem)          return "我生"; // 내가 오늘을 생함
  if ((todayElem + 1) % 5 === myElem)          return "生我"; // 오늘이 나를 생함
  if ((myElem + 2) % 5 === todayElem)          return "我剋"; // 내가 오늘을 극함
  return "剋我";                                              // 오늘이 나를 극함
}

const RELATION_SCORE: Record<IlginRelation, number> = {
  "生我": 85,
  "我剋": 70,
  "比和": 55,
  "我生": 42,
  "剋我": 22,
};

const RELATION_GRADE: Record<IlginRelation, IlginGrade> = {
  "生我": "대길",
  "我剋": "길",
  "比和": "보통",
  "我生": "주의",
  "剋我": "흉",
};

// ── 행운 정보 테이블 (오행 인덱스 기준) ──────────────────────────────────────

// [시간범위, 시진명]
const LUCKY_TIME: [string, string][] = [
  ["03:00 - 05:00", "인시(寅時)"], // 木
  ["11:00 - 13:00", "오시(午時)"], // 火
  ["07:00 - 09:00", "진시(辰時)"], // 土
  ["17:00 - 19:00", "유시(酉時)"], // 金
  ["23:00 - 01:00", "자시(子時)"], // 水
];

const LUCKY_DIRECTION: [string, string, string, string][] = [
  ["동쪽", "East",  "東",     "Este"  ], // 木
  ["남쪽", "South", "南",     "Sur"   ], // 火
  ["중앙", "Center","中央",   "Centro"], // 土
  ["서쪽", "West",  "西",     "Oeste" ], // 金
  ["북쪽", "North", "北",     "Norte" ], // 水
];

// [hex, 한국어명]
const LUCKY_COLOR: [string, string][] = [
  ["#22c55e", "초록"], // 木
  ["#ef4444", "빨강"], // 火
  ["#eab308", "노랑"], // 土
  ["#94a3b8", "흰색"], // 金
  ["#3b82f6", "파랑"], // 水
];

// ── 조언 텍스트 ───────────────────────────────────────────────────────────────

const ADVICE: Record<IlginRelation, Record<"ko" | "en" | "ja" | "es", string>> = {
  "生我": {
    ko: "오늘은 행운의 기운이 강하게 들어오는 날입니다. 중요한 일은 오늘 실행하세요.",
    en: "Fortune energy flows strongly to you today. Execute important matters now.",
    ja: "幸運のエネルギーが強く流れ込む日です。重要なことは今日実行しましょう。",
    es: "La energía de la fortuna fluye fuertemente hoy. Ejecuta asuntos importantes ahora.",
  },
  "我剋": {
    ko: "오늘은 내가 흐름을 주도하는 날입니다. 자신감을 갖고 새로운 도전에 나서보세요.",
    en: "You lead the flow today. Move forward with confidence and embrace new challenges.",
    ja: "今日はあなたが流れをリードする日。自信を持って新しい挑戦に臨みましょう。",
    es: "Hoy lideras el flujo. Avanza con confianza y abraza nuevos desafíos.",
  },
  "比和": {
    ko: "오늘은 평온하고 안정적인 하루입니다. 꾸준함이 가장 큰 행운입니다.",
    en: "A calm and stable day. Consistency is your greatest fortune today.",
    ja: "穏やかで安定した一日です。継続こそが最大の幸運です。",
    es: "Un día tranquilo y estable. La constancia es tu mayor fortuna hoy.",
  },
  "我生": {
    ko: "오늘은 내 에너지가 밖으로 흘러나가는 날입니다. 체력 관리와 충분한 휴식이 중요합니다.",
    en: "Your energy flows outward today. Prioritize rest and manage your stamina wisely.",
    ja: "今日はエネルギーが外に流れ出る日です。体力管理と十分な休息が大切です。",
    es: "Hoy tu energía fluye hacia afuera. Prioriza el descanso y administra bien tus fuerzas.",
  },
  "剋我": {
    ko: "오늘은 기운이 눌리는 날입니다. 중요한 결정은 내일로 미루고 수비적으로 행동하세요.",
    en: "Energy feels suppressed today. Postpone major decisions and play it safe.",
    ja: "今日はエネルギーが抑えられる日。重要な決断は明日に持ち越し、守りに徹しましょう。",
    es: "La energía se siente suprimida hoy. Pospón decisiones importantes y actúa con cautela.",
  },
};

// ── 율리우스 일수(JDN) 계산 ────────────────────────────────────────────────────
// 레퍼런스: JDN(2000, 1, 1) = 2451545 → 육십갑자 위치 6 (庚午)

function toJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

const JDN_2000_01_01 = 2451545;
const POS_2000_01_01 = 6; // 庚午 = 60-cycle position 6

function getStemBranch(dateStr: string): { stemIdx: number; branchIdx: number } {
  const parts = dateStr.split("-");
  const year  = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day   = parseInt(parts[2], 10);
  const jdn   = toJDN(year, month, day);
  const pos   = ((POS_2000_01_01 + jdn - JDN_2000_01_01) % 60 + 60) % 60;
  return { stemIdx: pos % 10, branchIdx: pos % 12 };
}

// ── 메인 엔진 함수 ────────────────────────────────────────────────────────────

export function calcIlgin(birthDateStr: string): IlginData {
  const todayStr = new Date().toISOString().slice(0, 10);

  const todaySB = getStemBranch(todayStr);
  const birthSB = getStemBranch(birthDateStr);

  const elemToday = stemToElem(todaySB.stemIdx);
  const elemMy    = stemToElem(birthSB.stemIdx);

  const relation = getRelation(elemMy, elemToday);

  return {
    todayStemIdx:   todaySB.stemIdx,
    todayBranchIdx: todaySB.branchIdx,
    todayGapja:     `${STEMS_HAN[todaySB.stemIdx]}${BRANCHES_HAN[todaySB.branchIdx]}`,
    todayGapjaKo:   `${STEMS_KO[todaySB.stemIdx]}${BRANCHES_KO[todaySB.branchIdx]}`,
    birthStemIdx:   birthSB.stemIdx,
    birthStemKo:    STEMS_KO[birthSB.stemIdx],
    elemMyIdx:      elemMy,
    elemTodayIdx:   elemToday,
    relation,
    luckyScore:     RELATION_SCORE[relation],
    luckyGrade:     RELATION_GRADE[relation],
    luckyTimeRange: LUCKY_TIME[elemMy][0],
    luckyTimeName:  LUCKY_TIME[elemMy][1],
    luckyDirection: LUCKY_DIRECTION[elemMy][0],
    luckyColorHex:  LUCKY_COLOR[elemMy][0],
    luckyColorName: LUCKY_COLOR[elemMy][1],
    advice:         ADVICE[relation],
  };
}
