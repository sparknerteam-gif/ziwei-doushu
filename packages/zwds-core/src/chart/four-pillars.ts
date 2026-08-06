/**
 * Four Pillars (四柱八字) calculation.
 *
 * Year, Month, Day, Hour pillars — the foundation of Ziwei Doushu.
 * Each pillar is a pair of (HeavenlyStem, EarthlyBranch).
 */

import type { FourPillars, HeavenlyStem, EarthlyBranch } from '../types';
import {
  getYearStem,
  getYearBranch,
  getMonthStem,
  getMonthBranch,
  getHourStem,
  getHourBranch,
  getLunarYearForPillars,
  STEM_NAMES,
  BRANCH_NAMES,
} from '../calendar/heavenly-stems';

export interface FourPillarsInput {
  year: number;
  month: number;
  day: number;
  hour: number;
}

/**
 * Calculate the Four Pillars from birth data.
 *
 * Important: the year pillar follows 立春 (Start of Spring, ~Feb 4),
 * not January 1 or the lunar new year. If birth is before 立春,
 * the previous year's stem-branch is used.
 */
export function calculateFourPillars(input: FourPillarsInput): FourPillars {
  const { year, month, day, hour } = input;

  // Year pillar — accounts for 立春 boundary
  const lunarYear = getLunarYearForPillars(year, month, day);
  const yearStem = getYearStem(lunarYear);
  const yearBranch = getYearBranch(lunarYear);

  // Month pillar — based on solar terms (節氣)
  // Simplified: we use the date to approximate which solar-term month we're in
  const solarMonthIdx = getSolarMonthForPillar(year, month, day);
  const monthStem = getMonthStem(yearStem, solarMonthIdx);
  const monthBranch = getMonthBranch(solarMonthIdx);

  // Day pillar — calculated from a known epoch
  const { stem: dayStem, branch: dayBranch } = calculateDayPillar(year, month, day);

  // Hour pillar — branch from the 2-hour period, stem derived from day stem
  const hourBranch = getHourBranch(hour);
  const hourBranchIdx = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  const hourStem = getHourStem(dayStem, hourBranchIdx);

  return {
    year: { stem: yearStem, branch: yearBranch },
    month: { stem: monthStem, branch: monthBranch },
    day: { stem: dayStem, branch: dayBranch },
    hour: { stem: hourStem, branch: hourBranch },
  };
}

/**
 * Determine solar month index (1=寅, 2=卯, ..., 12=丑).
 * Each solar month begins at a specific 節氣 (solar term).
 * We use approximate dates (±1 day accuracy).
 */
function getSolarMonthForPillar(year: number, month: number, day: number): number {
  // Approximate solar term start dates (day of month)
  // Values are middle-of-range approximations
  const termStarts: Record<number, number> = {
    1: 6,   // 小寒 ~Jan 6 → 丑月 (12)
    2: 4,   // 立春 ~Feb 4 → 寅月 (1)
    3: 6,   // 驚蟄 ~Mar 6 → 卯月 (2)
    4: 5,   // 清明 ~Apr 5 → 辰月 (3)
    5: 6,   // 立夏 ~May 6 → 巳月 (4)
    6: 6,   // 芒種 ~Jun 6 → 午月 (5)
    7: 7,   // 小暑 ~Jul 7 → 未月 (6)
    8: 8,   // 立秋 ~Aug 8 → 申月 (7)
    9: 8,   // 白露 ~Sep 8 → 酉月 (8)
    10: 8,  // 寒露 ~Oct 8 → 戌月 (9)
    11: 7,  // 立冬 ~Nov 7 → 亥月 (10)
    12: 7,  // 大雪 ~Dec 7 → 子月 (11)
  };

  // Check if day is before or after the term start
  const termDay = termStarts[month] ?? 7;
  if (day < termDay) {
    // Use previous solar month
    return month === 1 ? 12 : ((month - 1) % 12);
  }
  return month;
}

/**
 * Calculate day pillar (日柱) from a known epoch.
 * Epoch: January 1, 1900 = 甲戌日 (dayStem=甲, dayBranch=戌)
 * Stem index: 甲=0, 戌=10
 */
function calculateDayPillar(year: number, month: number, day: number): {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
} {
  // Julian Day Number calculation
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4)
    - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Jan 1, 1900 JDN = 2415021
  const epochJdn = 2415021;
  const daysDiff = jdn - epochJdn;

  // Jan 1, 1900 = 甲戌: stem 0, branch 10
  const stemIdx = ((0 + daysDiff) % 10 + 10) % 10;
  const branchIdx = ((10 + daysDiff) % 12 + 12) % 12;

  const STEM_MAP: Record<number, HeavenlyStem> = {
    0: 'jia', 1: 'yi', 2: 'bing', 3: 'ding', 4: 'wu',
    5: 'ji', 6: 'geng', 7: 'xin', 8: 'ren', 9: 'gui',
  };
  const BRANCH_MAP: Record<number, EarthlyBranch> = {
    0: 'zi', 1: 'chou', 2: 'yin', 3: 'mao', 4: 'chen', 5: 'si',
    6: 'wu', 7: 'wei', 8: 'shen', 9: 'you', 10: 'xu', 11: 'hai',
  };

  return {
    stem: STEM_MAP[stemIdx],
    branch: BRANCH_MAP[branchIdx],
  };
}

/** Format a Four Pillars object into a readable string */
export function formatFourPillars(pillars: FourPillars): string {
  const fmt = (s: HeavenlyStem, b: EarthlyBranch) =>
    `${STEM_NAMES[s].zh}${BRANCH_NAMES[b].zh}(${STEM_NAMES[s].en} ${BRANCH_NAMES[b].animal})`;

  return [
    `Year:  ${fmt(pillars.year.stem, pillars.year.branch)}`,
    `Month: ${fmt(pillars.month.stem, pillars.month.branch)}`,
    `Day:   ${fmt(pillars.day.stem, pillars.day.branch)}`,
    `Hour:  ${fmt(pillars.hour.stem, pillars.hour.branch)}`,
  ].join('\n');
}
