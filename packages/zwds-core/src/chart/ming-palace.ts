/**
 * Destiny Palace (命宮) & Body Palace (身宮) calculation.
 *
 * 命宮 position formula:
 *   Start from 寅 (Tiger, index 2).
 *   Count forward by (month number) steps.
 *   Count backward by (hour branch index) steps.
 *
 *   命宮 branch = (2 + month_number - hour_index + 12) % 12
 *
 * 身宮 position formula (reverse direction):
 *   身宮 branch = (2 + month_number + hour_index) % 12
 */

import type { EarthlyBranch, Gender } from '../types';
import { INDEX_TO_BRANCH } from '../types';
import { BRANCH_NAMES } from '../calendar/heavenly-stems';

/**
 * Calculate the Destiny Palace (命宮) branch index (0–11).
 *
 * @param lunarMonth — lunar month number (1–12)
 * @param hourBranch — the birth hour's earthly branch
 * @returns branch index (0=子, 1=丑, ..., 11=亥)
 */
export function calculateMingPalace(
  lunarMonth: number,
  hourBranch: EarthlyBranch,
): number {
  const hourIndex = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  // The 寅-based formula: start at 寅(2), add month, subtract hour
  const mingIdx = (2 + lunarMonth - hourIndex + 12) % 12;
  return mingIdx;
}

/**
 * Calculate the Body Palace (身宮) branch index (0–11).
 *
 * Same as 命宮 but adds instead of subtracts the hour for the month offset.
 */
export function calculateShenPalace(
  lunarMonth: number,
  hourBranch: EarthlyBranch,
): number {
  const hourIndex = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  const shenIdx = (2 + lunarMonth + hourIndex) % 12;
  return shenIdx;
}

/**
 * Determine if the birth year is Yang (陽年) or Yin (陰年).
 * Used for determining decade cycle direction.
 * Yang stems: 甲, 丙, 戊, 庚, 壬 (jia, bing, wu, geng, ren)
 */
export function isYangYear(yearStemIndex: number): boolean {
  return yearStemIndex % 2 === 0; // 甲(0) yang, 乙(1) yin, 丙(2) yang, ...
}

/**
 * Determine if the decade cycle goes clockwise or counterclockwise.
 *
 * 陽男/陰女 → clockwise (順行)
 * 陰男/陽女 → counterclockwise (逆行)
 */
export function getDecadeDirection(
  yearStemIndex: number,
  gender: Gender,
): 'clockwise' | 'counterclockwise' {
  const yang = isYangYear(yearStemIndex);
  if (yang && gender === 'male') return 'clockwise';
  if (yang && gender === 'female') return 'counterclockwise';
  if (!yang && gender === 'male') return 'counterclockwise';
  return 'clockwise'; // yin + female
}
