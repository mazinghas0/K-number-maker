export type Lang = "en" | "ko" | "ja" | "es";
export type TabType = "generate" | "history" | "agent" | "board" | "rules" | "alarms" | "settings";
export type ThemeType = "dark" | "gold" | "paper" | "aurora";
export type AnimPhase = "idle" | "scatter" | "sort";

export interface Translation {
  title: string; subtitle: string; invoke: string; records: string; oracle: string; board: string;
  login: string; logout: string; generateLuck: string; invoking: string;
  selectMode: string; numCount: string; range: string; connected: string;
  noRecords: string; resetProfile: string; awakenDestiny: string; oracleGuide: string;
  nameLabel: string; dateLabel: string; startOracle: string; luckyArea: string;
  luckIndex: string; shareTitle: string; close: string; elementAnalysis: string;
  postBoard: string; boardTitle: string; writeMessage: string; send: string;
  menu: string; myRules: string; alarms: string; settings: string;
  onbTitle1: string; onbDesc1: string; onbTitle2: string; onbDesc2: string; onbTitle3: string; onbDesc3: string; next: string; start: string;
  chatWelcome: string; chatAskMood: string; chatActionGen: string; chatReset: string;
  themeLabel: string; // 추가 예정
  bestLuck: string; // 추가 예정
}

export interface HistoryItem {
  id: string;
  numbers: number[];
  mode: string;
  created_at: string;
  timestamp: string;
  lottery_name: string;
}

export interface BoardItem {
  id: string;
  user_name: string;
  content: string;
  lucky_numbers: number[];
  created_at: string;
  blessings: number; // Phase 8을 대비한 미리 정의
}

export interface LotteryPreset {
  id: string;
  name: string;
  count: number;
  max: number;
  country: string;
  defaultLang: Lang;
}

export interface UserProfile {
  name: string;
  birthDate: string;
  birthTime: string;
}

export interface ElementInfo {
  name: string;
  symbol: string;
  color: string;
  bg: string;
  desc: string;
  range: [number, number];
  ilgan: string; // 명리학 고도화 필드
  attribute: string; // 명리학 고도화 필드
  messages: { en: string; ko: string; ja: string; es: string }[];
}

export interface ChatMessage {
  id: string;
  sender: "oracle" | "user";
  type: "text" | "mood-selector" | "action-generate" | "number-result";
  text?: string;
  numbers?: number[];
  story?: string;
}

export interface AlarmsState {
  lottoDay: boolean;
  resultCheck: boolean;
  time: string;
}

export interface ThemeColors {
  bg: string;
  text: string;
  primary: string;
  accent: string;
  card: string;
}
