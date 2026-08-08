/**
 * Solar-to-Lunar calendar conversion.
 *
 * Wraps the 'iztro' library's calendar utilities behind our own interface
 * so the engine remains portable and replaceable.
 */

import { calendar } from 'iztro';
import type { HeavenlyStem, EarthlyBranch } from '../types';
import type { LunarDate } from '../types'; // our own LunarDate type
import {
  getHourBranch,
  getLunarYearForPillars,
} from './heavenly-stems';

// Re-export for convenience
export { getYearStem, getYearBranch, getMonthStem, getMonthBranch, getHourStem, getHourBranch } from './heavenly-stems';

/** Intermediate result type matching our internal i/f */
export interface LunarDateResult {
  year: number;
  month: number;
  day: number;
  isLeapMonth: boolean;
  yearStem: HeavenlyStem;
  yearBranch: EarthlyBranch;
  monthStem: HeavenlyStem;
  monthBranch: EarthlyBranch;
  dayStem: HeavenlyStem;
  dayBranch: EarthlyBranch;
  hourBranch: EarthlyBranch;
}

/**
 * Convert a Gregorian (solar) date to a Chinese lunar date,
 * including all stem-branch information for the four pillars.
 */
export function solarToLunar(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
): LunarDateResult {
  const dateStr = `${year}-${month}-${day}`;
  const timeIndex = Math.floor(((hour + 1) % 24) / 2);

  // Use iztro's solar→lunar converter
  const lunarData = (calendar as any).solar2lunar(dateStr) as {
    lunarYear: number;
    lunarMonth: number;
    lunarDay: number;
    isLeap: boolean;
  };

  // Use iztro's stem/branch calculator
  const sbData = (calendar as any).getHeavenlyStemAndEarthlyBranchBySolarDate(
    dateStr, timeIndex,
  ) as {
    yearly: [string, string];
    monthly: [string, string];
    daily: [string, string];
    hourly: [string, string];
  };

  const yearStem = parseStem(sbData.yearly[0]) ?? 'jia';
  const yearBranch = parseBranch(sbData.yearly[1]) ?? 'zi';
  const monthStem = parseStem(sbData.monthly[0]) ?? 'jia';
  const monthBranch = parseBranch(sbData.monthly[1]) ?? 'zi';
  const dayStem = parseStem(sbData.daily[0]) ?? 'jia';
  const dayBranch = parseBranch(sbData.daily[1]) ?? 'zi';
  const hourBranch = parseBranch(sbData.hourly[1]) ?? getHourBranch(hour);

  return {
    year: lunarData.lunarYear,
    month: lunarData.lunarMonth,
    day: lunarData.lunarDay,
    isLeapMonth: lunarData.isLeap,
    yearStem,
    yearBranch,
    monthStem,
    monthBranch,
    dayStem,
    dayBranch,
    hourBranch,
  };
}

// ---- Helpers ----

const STEM_CHARS: Record<string, HeavenlyStem> = {
  '甲': 'jia', '乙': 'yi', '丙': 'bing', '丁': 'ding', '戊': 'wu',
  '己': 'ji', '庚': 'geng', '辛': 'xin', '壬': 'ren', '癸': 'gui',
};

const BRANCH_CHARS: Record<string, EarthlyBranch> = {
  '子': 'zi', '丑': 'chou', '寅': 'yin', '卯': 'mao',
  '辰': 'chen', '巳': 'si', '午': 'wu', '未': 'wei',
  '申': 'shen', '酉': 'you', '戌': 'xu', '亥': 'hai',
};

function parseStem(char: string): HeavenlyStem | null {
  return STEM_CHARS[char] ?? null;
}

function parseBranch(char: string): EarthlyBranch | null {
  return BRANCH_CHARS[char] ?? null;
}
