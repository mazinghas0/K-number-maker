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
  themeLabel: string;
  bestLuck: string;
  shareCard: string;
  shareSns: string;
  shareInvite: string;
  shareSave: string;
  shareCopyLink: string;
  shareCopied: string;
  shareRewardDesc: string;
  shareBonus: string;
  shareTodayLimit: string;
  boardSortPopular: string;
  boardSortLatest: string;
  boardNickLabel: string;
  boardEmptyMsg: string;
  boardWriteBtn: string;
  boardPosting: string;
  boardDeleteConfirm: string;
  mbtiTitle: string;
  mbtiRarity: string;
  mbtiCompat: string;
  mbtiShareBtn: string;
  mbtiKeywords: string;
  historyLoginMsg: string;
  tcTitle: string;
  tcSealBtn: string;
  tcMessage: string;
  tcOpenIn: string;
  tcCountdown: string;
  tcOpened: string;
  tcEmpty: string;
  tcDays7: string;
  tcDays30: string;
  tcDays100: string;
  twinsTitle: string;
  twinsFound: string;
  twinsNone: string;
  worldTitle: string;
  winCertBtn: string;
  winBadge: string;
  ilginTitle: string;
  ilginScore: string;
  ilginLuckyTime: string;
  ilginDirection: string;
  ilginColor: string;
  ilginRelation: string;
}

export type IlginRelation = "比和" | "我生" | "生我" | "我剋" | "剋我";
export type IlginGrade = "대길" | "길" | "보통" | "주의" | "흉";

export interface IlginData {
  todayStemIdx: number;
  todayBranchIdx: number;
  todayGapja: string;
  todayGapjaKo: string;
  birthStemIdx: number;
  birthStemKo: string;
  elemMyIdx: number;
  elemTodayIdx: number;
  relation: IlginRelation;
  luckyScore: number;
  luckyGrade: IlginGrade;
  luckyTimeRange: string;
  luckyTimeName: string;
  luckyDirection: string;
  luckyColorHex: string;
  luckyColorName: string;
  advice: Record<"ko" | "en" | "ja" | "es", string>;
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
  user_id: string | null;
  user_name: string;
  content: string;
  lucky_numbers: number[];
  created_at: string;
  blessings: number;
  is_winner: boolean;
  country_code: string;
}

export interface TimeCapsuleItem {
  id: string;
  device_id: string;
  numbers: number[];
  message: string;
  open_at: string;
  created_at: string;
  is_opened: boolean;
}

export interface PostBoardPayload {
  user_name: string;
  content: string;
  lucky_numbers: number[];
  user_id: string | null;
  country_code: string;
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
  text: string;
}

export interface AlarmsState {
  lottoDay: boolean;
  resultCheck: boolean;
  time: string;
}

export type FortuneElement = "목" | "화" | "토" | "금" | "수" | "복합";
export type FortuneTrait = "강" | "유" | "균형";

export interface FortuneType {
  id: string;
  name: string;
  emoji: string;
  element: FortuneElement;
  trait: FortuneTrait;
  rarity: number;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  keywords: string[];
  desc: Record<"ko" | "en" | "ja" | "es", string>;
  compatId: string;
  compatName: string;
}

export interface ThemeColors {
  bg: string;
  text: string;
  primary: string;
  accent: string;
  card: string;
}
