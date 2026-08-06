/**
 * Calendar utilities — Heavenly Stems & Earthly Branches.
 *
 * Pure functions for stem-branch calculations used across the engine.
 */

import type { HeavenlyStem, EarthlyBranch } from '../types';
import { INDEX_TO_STEM, INDEX_TO_BRANCH, STEM_INDEX } from '../types';

// ---- Heavenly Stems ----

/** Get the year stem from a Gregorian year. Formula: (year - 4) % 10 */
export function getYearStem(year: number): HeavenlyStem {
  const idx = ((year - 4) % 10 + 10) % 10;
  return INDEX_TO_STEM[idx];
}

/** Get the year branch from a Gregorian year. Formula: (year - 4) % 12 */
export function getYearBranch(year: number): EarthlyBranch {
  const idx = ((year - 4) % 12 + 12) % 12;
  return INDEX_TO_BRANCH[idx];
}

// ---- Month Stem (五虎遁 / Five Tiger Escape) ----
// Month stem is derived from year stem: "甲己之年丙作首"

const MONTH_STEM_START: Record<HeavenlyStem, number> = {
  jia: 2,  // 丙(2) — 甲己之年丙作首
  yi: 4,   // 戊(4) — 乙庚之年戊為頭
  bing: 6, // 庚(6) — 丙辛必定尋庚起
  ding: 8, // 壬(8) — 丁壬壬位順行流
  wu: 0,   // 甲(0) — 戊癸何方發？甲寅之上好追求
  ji: 2,   // 丙(2)
  geng: 4, // 戊(4)
  xin: 6,  // 庚(6)
  ren: 8,  // 壬(8)
  gui: 0,  // 甲(0)
};

/**
 * Get the Heavenly Stem for a given month (1=寅月, approximately Feb).
 * Month 1 = 寅 (Tiger) month, which starts around 立春 (Feb 4).
 * This follows the solar terms, NOT the lunar calendar.
 */
export function getMonthStem(yearStem: HeavenlyStem, monthIndex: number): HeavenlyStem {
  // monthIndex: 1=寅, 2=卯, ..., 12=丑
  const start = MONTH_STEM_START[yearStem];
  const idx = (start + monthIndex - 1) % 10;
  return INDEX_TO_STEM[idx];
}

/** Get the Earthly Branch for a solar month (1=寅 to 12=丑) */
export function getMonthBranch(monthIndex: number): EarthlyBranch {
  // month 1 = 寅 (index 2), month 2 = 卯 (index 3), etc.
  const idx = (monthIndex + 1) % 12;
  return INDEX_TO_BRANCH[idx];
}

// ---- Hour Stem (五鼠遁 / Five Rat Escape) ----
// Hour stem is derived from day stem: "甲己還加甲"

const HOUR_STEM_START: Record<HeavenlyStem, number> = {
  jia: 0,   // 甲(0) — 甲己還加甲
  yi: 2,    // 丙(2) — 乙庚丙作初
  bing: 4,  // 戊(4) — 丙辛從戊起
  ding: 6,  // 庚(6) — 丁壬庚子居
  wu: 8,    // 壬(8) — 戊癸何方發？壬子是真途
  ji: 0,    // 甲(0)
  geng: 2,  // 丙(2)
  xin: 4,   // 戊(4)
  ren: 6,   // 庚(6)
  gui: 8,   // 壬(8)
};

/** Get the Heavenly Stem for a given 時辰 (0=子時, 1=丑時, ..., 11=亥時) */
export function getHourStem(dayStem: HeavenlyStem, hourBranchIndex: number): HeavenlyStem {
  const start = HOUR_STEM_START[dayStem];
  const idx = (start + hourBranchIndex) % 10;
  return INDEX_TO_STEM[idx];
}

/** Convert a 24-hour time to the Earthly Branch (時辰). Each 時辰 covers 2 hours. */
export function getHourBranch(hour: number): EarthlyBranch {
  // 子時: 23:00–00:59, 丑時: 01:00–02:59, etc.
  const branchIndex = Math.floor(((hour + 1) % 24) / 2);
  return INDEX_TO_BRANCH[branchIndex];
}

// ---- Sexagenary Cycle (六十甲子) ----

/** Get the position in the 60-year cycle for a given year. Formula: (year - 4) % 60 */
export function getSexagenaryPosition(year: number): number {
  return ((year - 4) % 60 + 60) % 60;
}

// ---- Lunar Year Stem-Branch ----
// For the lunar year stem-branch, we need to account that the lunar year
// starts at 立春 (approximately Feb 4), not Jan 1. If birth is before 立春,
// use the previous year's stem-branch.

/**
 * Check if a Gregorian date is before 立春 (Start of Spring) of that year.
 * Simplified: 立春 is approximately Feb 4. For precise calculation,
 * we'd need solar term ephemeris data.
 *
 * Returns true if the birth date should use the PREVIOUS year's stem-branch.
 */
export function isBeforeLichun(year: number, month: number, day: number): boolean {
  // Simplified: 立春 is on Feb 4 (±1 day depending on year)
  // For MVP, use Feb 4 as the cutoff
  if (month < 2) return true;
  if (month === 2 && day < 4) return true;
  return false;
}

/** Get the correct lunar year for stem-branch calculation */
export function getLunarYearForPillars(year: number, month: number, day: number): number {
  return isBeforeLichun(year, month, day) ? year - 1 : year;
}

// ---- Display names ----

export const STEM_NAMES: Record<HeavenlyStem, { zh: string; en: string; yinYang: 'yang' | 'yin' }> = {
  jia:   { zh: '甲', en: 'Jia', yinYang: 'yang' },
  yi:    { zh: '乙', en: 'Yi', yinYang: 'yin' },
  bing:  { zh: '丙', en: 'Bing', yinYang: 'yang' },
  ding:  { zh: '丁', en: 'Ding', yinYang: 'yin' },
  wu:    { zh: '戊', en: 'Wu', yinYang: 'yang' },
  ji:    { zh: '己', en: 'Ji', yinYang: 'yin' },
  geng:  { zh: '庚', en: 'Geng', yinYang: 'yang' },
  xin:   { zh: '辛', en: 'Xin', yinYang: 'yin' },
  ren:   { zh: '壬', en: 'Ren', yinYang: 'yang' },
  gui:   { zh: '癸', en: 'Gui', yinYang: 'yin' },
};

export const BRANCH_NAMES: Record<EarthlyBranch, { zh: string; en: string; animal: string }> = {
  zi:   { zh: '子', en: 'Zi', animal: 'Rat' },
  chou: { zh: '丑', en: 'Chou', animal: 'Ox' },
  yin:  { zh: '寅', en: 'Yin', animal: 'Tiger' },
  mao:  { zh: '卯', en: 'Mao', animal: 'Rabbit' },
  chen: { zh: '辰', en: 'Chen', animal: 'Dragon' },
  si:   { zh: '巳', en: 'Si', animal: 'Snake' },
  wu:   { zh: '午', en: 'Wu', animal: 'Horse' },
  wei:  { zh: '未', en: 'Wei', animal: 'Goat' },
  shen: { zh: '申', en: 'Shen', animal: 'Monkey' },
  you:  { zh: '酉', en: 'You', animal: 'Rooster' },
  xu:   { zh: '戌', en: 'Xu', animal: 'Dog' },
  hai:  { zh: '亥', en: 'Hai', animal: 'Pig' },
};
