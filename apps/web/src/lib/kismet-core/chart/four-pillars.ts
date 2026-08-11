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
 *
 * Each zodiac month is defined by a 節氣 (solar term), NOT by the
 * Gregorian calendar month. The term is the boundary:
 *
 *   Before this month's term → still in previous zodiac month.
 *   On or after this month's term → enter this zodiac month.
 *
 * Example: Gregorian July 11 is after 小暑 (Jul ~7) but before
 * 立秋 (Aug ~8), so it's 未月 (solar month 6), NOT 申月 (7).
 */
function getSolarMonthForPillar(_year: number, month: number, day: number): number {
  // Each entry maps a Gregorian month to: { termDay, solarMonth }
  // solarMonth: 1=寅, 2=卯, ... 12=丑
  const termStarts: Record<number, { day: number; solarMonth: number }> = {
    1: { day: 6, solarMonth: 12 },   // 小寒 ~Jan 6 → 丑月
    2: { day: 4, solarMonth: 1 },    // 立春 ~Feb 4 → 寅月
    3: { day: 6, solarMonth: 2 },    // 驚蟄 ~Mar 6 → 卯月
    4: { day: 5, solarMonth: 3 },    // 清明 ~Apr 5 → 辰月
    5: { day: 6, solarMonth: 4 },    // 立夏 ~May 6 → 巳月
    6: { day: 6, solarMonth: 5 },    // 芒種 ~Jun 6 → 午月
    7: { day: 7, solarMonth: 6 },    // 小暑 ~Jul 7 → 未月
    8: { day: 8, solarMonth: 7 },    // 立秋 ~Aug 8 → 申月
    9: { day: 8, solarMonth: 8 },    // 白露 ~Sep 8 → 酉月
    10: { day: 8, solarMonth: 9 },   // 寒露 ~Oct 8 → 戌月
    11: { day: 7, solarMonth: 10 },  // 立冬 ~Nov 7 → 亥月
    12: { day: 7, solarMonth: 11 },  // 大雪 ~Dec 7 → 子月
  };

  const entry = termStarts[month];
  if (!entry) return month;

  if (day >= entry.day) {
    return entry.solarMonth;
  }
  // Before this month's term → still in previous solar month
  const prev = termStarts[month === 1 ? 12 : month - 1];
  return prev ? prev.solarMonth : (month - 1 || 12);
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
