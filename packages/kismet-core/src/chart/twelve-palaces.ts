/**
 * Twelve Palaces assignment.
 *
 * Given the 命宮 position, determine which palace sits in each branch.
 * Also assigns Heavenly Stems to each palace using 五虎遁 (Five Tiger Escape).
 *
 * Palace order (fixed, counter-clockwise from 命宮):
 *   命宮 → 兄弟 → 夫妻 → 子女 → 財帛 → 疾厄 →
 *   遷移 → 交友 → 事業 → 田宅 → 福德 → 父母
 */

import type { HeavenlyStem, EarthlyBranch, PalaceName } from '../types';
import { INDEX_TO_BRANCH, INDEX_TO_STEM } from '../types';
import { getMonthStem } from '../calendar/heavenly-stems';

/** Palace display order (counter-clockwise from 命宮) */
const PALACE_ORDER: PalaceName[] = [
  'ming', 'xiongdi', 'fuqi', 'zinv', 'caibo',
  'jie', 'qianyi', 'jiaoyou', 'shiye', 'tianzhai',
  'fude', 'fumu',
];

/**
 * Map each branch index (0–11) to its palace name,
 * given that 命宮 sits at `mingBranchIndex`.
 */
export function assignPalacesToBranches(mingBranchIndex: number): Record<number, PalaceName> {
  const result: Record<number, PalaceName> = {};
  for (let i = 0; i < 12; i++) {
    // Counter-clockwise: palace 0 (命宮) at mingBranchIndex,
    // palace 1 (兄弟) at (mingBranchIndex - 1 + 12) % 12, etc.
    const branchIdx = (mingBranchIndex - i + 12) % 12;
    result[branchIdx] = PALACE_ORDER[i];
  }
  return result;
}

/**
 * Get the palace name at a specific branch, given the 命宮 position.
 */
export function getPalaceAtBranch(
  mingBranchIndex: number,
  branchIndex: number,
): PalaceName {
  const offset = (mingBranchIndex - branchIndex + 12) % 12;
  return PALACE_ORDER[offset];
}

/**
 * Assign Heavenly Stems to each of the 12 palaces using 五虎遁.
 *
 * Rule: The stem of 寅 palace (the starting branch) is determined by
 * the YEAR stem. Then stems proceed sequentially through the 10-stem cycle.
 *
 * The stem at branch 寅 = starting stem (寅 = month 1 in 五虎遁).
 * Then each subsequent branch gets the next stem.
 */
export function assignPalaceStems(yearStem: HeavenlyStem): Record<number, HeavenlyStem> {
  // The stem of 寅 palace = month stem of month 1 from year stem
  const yinStem = getMonthStem(yearStem, 1); // month 1 = 寅

  const result: Record<number, HeavenlyStem> = {};
  for (let i = 0; i < 12; i++) {
    // Starting from 寅 (branch 2), going clockwise
    const branchIdx = (2 + i) % 12; // 寅=2, 卯=3, ..., 丑=1
    const stemIdx = (getStemIndex(yinStem) + i) % 10;
    result[branchIdx] = INDEX_TO_STEM[stemIdx];
  }
  return result;
}

function getStemIndex(stem: HeavenlyStem): number {
  return { jia: 0, yi: 1, bing: 2, ding: 3, wu: 4, ji: 5, geng: 6, xin: 7, ren: 8, gui: 9 }[stem];
}

/**
 * Get the branch index for a given palace in a chart.
 */
export function getBranchForPalace(mingBranchIndex: number, palaceName: PalaceName): number {
  const palaceIdx = PALACE_ORDER.indexOf(palaceName);
  return (mingBranchIndex - palaceIdx + 12) % 12;
}
