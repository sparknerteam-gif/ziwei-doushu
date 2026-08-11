// ============================================================================
// @zwds/core — Core Type Definitions
// ============================================================================

// ---- Enums & Literals ----

/** 10 Heavenly Stems (天干) */
export type HeavenlyStem =
  | 'jia'   // 甲
  | 'yi'    // 乙
  | 'bing'  // 丙
  | 'ding'  // 丁
  | 'wu'    // 戊
  | 'ji'    // 己
  | 'geng'  // 庚
  | 'xin'   // 辛
  | 'ren'   // 壬
  | 'gui';  // 癸

/** 12 Earthly Branches (地支) */
export type EarthlyBranch =
  | 'zi'    // 子
  | 'chou'  // 丑
  | 'yin'   // 寅
  | 'mao'   // 卯
  | 'chen'  // 辰
  | 'si'    // 巳
  | 'wu'    // 午
  | 'wei'   // 未
  | 'shen'  // 申
  | 'you'   // 酉
  | 'xu'    // 戌
  | 'hai';  // 亥

/** 12 Palaces (十二宮) */
export type PalaceName =
  | 'ming'       // 命宮 — Destiny / Self
  | 'xiongdi'    // 兄弟 — Siblings
  | 'fuqi'       // 夫妻 — Spouse / Marriage
  | 'zinv'       // 子女 — Children
  | 'caibo'      // 財帛 — Wealth
  | 'jie'        // 疾厄 — Health
  | 'qianyi'     // 遷移 — Travel / Relocation
  | 'jiaoyou'    // 交友/僕役 — Friends / Servants
  | 'shiye'      // 事業/官祿 — Career / Office
  | 'tianzhai'   // 田宅 — Property / Home
  | 'fude'       // 福德 — Fortune / Virtue
  | 'fumu';      // 父母 — Parents

/** 5 Elements (五行) */
export type FiveElement =
  | 'water'   // 水
  | 'wood'    // 木
  | 'fire'    // 火
  | 'earth'   // 土
  | 'metal';  // 金

/** 5 Element Bureau (五行局) — used for star placement */
export type FiveElementBureau = {
  element: FiveElement;
  number: 2 | 3 | 4 | 5 | 6; // 水2 木3 金4 土5 火6
};

/** Star brightness level (廟旺利陷) */
export type BrightnessLevel =
  | 'miao'   // 廟 — maximum brightness
  | 'wang'   // 旺 — prosperous
  | 'de'     // 得 — attained
  | 'li'     // 利 — beneficial
  | 'ping'   // 平 — neutral
  | 'bu'     // 不 — not favorable
  | 'xian';  // 陷 — trapped/diminished

/** Four Transformations (四化) */
export type TransformationType = 'lu' | 'quan' | 'ke' | 'ji'; // 祿 權 科 忌

/** Gender */
export type Gender = 'male' | 'female';

/** Star type categories */
export type StarType = 'major' | 'minor' | 'auxiliary';

// ---- Input Types ----

export interface BirthData {
  year: number;            // Gregorian year, e.g. 1984
  month: number;           // 1–12
  day: number;             // 1–31
  hour: number;            // 0–23 (local clock time, e.g. 8am = 8)
  minute: number;          // 0–59
  gender: Gender;
  ianaTimeZone: string;    // IANA timezone, e.g. "America/New_York", "Asia/Hong_Kong"
  longitude: number;       // e.g. -74.006 for New York, 114.169 for Hong Kong
}

// ---- Calendar Types ----

export interface LunarDate {
  year: number;
  month: number;       // 1–12
  day: number;         // 1–30
  isLeapMonth: boolean;
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  monthStem: HeavenlyStem;
  monthBranch: EarthlyBranch;
  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;
  hourBranch: EarthlyBranch; // 時辰 (2-hour period)
}

export interface FourPillars {
  year: { stem: HeavenlyStem; branch: EarthlyBranch };
  month: { stem: HeavenlyStem; branch: EarthlyBranch };
  day: { stem: HeavenlyStem; branch: EarthlyBranch };
  hour: { stem: HeavenlyStem; branch: EarthlyBranch };
}

// ---- Chart Types ----

export interface Star {
  id: string;
  nameZh: string;
  nameEn: string;
  type: StarType;
  brightness: BrightnessLevel;
  isTransformed?: boolean;
  transformation?: TransformationType;
  category?: string; // e.g. "ziwei_group", "tianfu_group", "month_star"
}

export interface StarDefinition {
  id: string;
  nameZh: string;
  nameEn: string;
  type: StarType;
  category?: string;
  element?: FiveElement;
  descriptionEn?: string;
  descriptionZh?: string;
}

export interface Palace {
  index: number;           // 0–11 (display order in traditional grid)
  name: PalaceName;
  earthlyBranch: EarthlyBranch;
  heavenlyStem: HeavenlyStem;
  isMingPalace: boolean;
  isShenPalace: boolean;
  majorStars: Star[];
  minorStars: Star[];
  stars: Star[];           // combined & sorted
  decadeCycle?: DecadeCycle;
}

export interface Transformation {
  type: TransformationType;
  starId: string;
  starNameZh: string;
  starNameEn: string;
  palaceIndex: number;
}

export interface DecadeCycle {
  startAge: number;
  endAge: number;
  palaceIndex: number;
  direction: 'clockwise' | 'counterclockwise';
}

export interface YearlyCycle {
  year: number;
  yearlyStem: HeavenlyStem;
  yearlyBranch: EarthlyBranch;
  mingPalaceIndex: number; // 流年命宮 — which palace is the yearly "destiny" palace
}

export interface ChartData {
  id?: string;
  birthData: BirthData;
  lunarDate: LunarDate;
  fourPillars: FourPillars;
  mingPalaceIndex: number;     // 命宮 position (0–11)
  shenPalaceIndex: number;     // 身宮 position (0–11)
  fiveElementBureau: FiveElementBureau;
  palaces: Palace[];           // exactly 12
  transformations: Transformation[];
  decadeCycles: DecadeCycle[];
  calculatedAt: string;        // ISO timestamp
}

// ---- Translation Types ----

export interface TranslationMap {
  [key: string]: string | TranslationMap;
}

export interface PalaceDefinition {
  id: PalaceName;
  nameZh: string;
  nameEn: string;
  shortNameEn: string;
  descriptionEn: string;
  descriptionZh: string;
  index: number; // position in traditional grid layout
}

// ---- Branch index constants ----
export const BRANCH_INDEX: Record<EarthlyBranch, number> = {
  zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5,
  wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11,
};

export const INDEX_TO_BRANCH: Record<number, EarthlyBranch> = {
  0: 'zi', 1: 'chou', 2: 'yin', 3: 'mao', 4: 'chen', 5: 'si',
  6: 'wu', 7: 'wei', 8: 'shen', 9: 'you', 10: 'xu', 11: 'hai',
};

export const STEM_INDEX: Record<HeavenlyStem, number> = {
  jia: 0, yi: 1, bing: 2, ding: 3, wu: 4,
  ji: 5, geng: 6, xin: 7, ren: 8, gui: 9,
};

export const INDEX_TO_STEM: Record<number, HeavenlyStem> = {
  0: 'jia', 1: 'yi', 2: 'bing', 3: 'ding', 4: 'wu',
  5: 'ji', 6: 'geng', 7: 'xin', 8: 'ren', 9: 'gui',
};
