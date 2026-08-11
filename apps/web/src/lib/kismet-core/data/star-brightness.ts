/**
 * Star brightness table (廟旺利陷).
 *
 * Each major star has different brightness in each of the 12 earthly branches.
 * Brightness greatly affects the star's interpretation strength.
 *
 * 7 levels: 廟 (miao) > 旺 (wang) > 得 (de) > 利 (li) > 平 (ping) > 不 (bu) > 陷 (xian)
 */

import type { EarthlyBranch, BrightnessLevel } from '../types';

type BrightnessRow = Record<EarthlyBranch, BrightnessLevel>;

/**
 * Brightness table for the 14 major stars across 12 branches.
 * Columns ordered by branch index: 子(0) 丑(1) 寅(2) 卯(3) 辰(4) 巳(5) 午(6) 未(7) 申(8) 酉(9) 戌(10) 亥(11)
 */
export const BRIGHTNESS_TABLE: Record<string, BrightnessRow> = {
  ziwei: {
    zi: 'ping', chou: 'miao', yin: 'miao', mao: 'wang',
    chen: 'miao', si: 'wang', wu: 'miao', wei: 'miao',
    shen: 'wang', you: 'wang', xu: 'de', hai: 'wang',
  },
  tianji: {
    zi: 'wang', chou: 'xian', yin: 'de', mao: 'wang',
    chen: 'li', si: 'wang', wu: 'wang', wei: 'miao',
    shen: 'xian', you: 'wang', xu: 'xian', hai: 'de',
  },
  taiyang: {
    zi: 'xian', chou: 'xian', yin: 'wang', mao: 'miao',
    chen: 'wang', si: 'wang', wu: 'miao', wei: 'de',
    shen: 'de', you: 'ping', xu: 'xian', hai: 'xian',
  },
  wuqu: {
    zi: 'wang', chou: 'miao', yin: 'de', mao: 'li',
    chen: 'miao', si: 'wang', wu: 'wang', wei: 'miao',
    shen: 'de', you: 'wang', xu: 'wang', hai: 'xian',
  },
  tiantong: {
    zi: 'wang', chou: 'xian', yin: 'li', mao: 'wang',
    chen: 'ping', si: 'miao', wu: 'xian', wei: 'xian',
    shen: 'de', you: 'ping', xu: 'wang', hai: 'miao',
  },
  lianzhen: {
    zi: 'ping', chou: 'xian', yin: 'miao', mao: 'ping',
    chen: 'miao', si: 'xian', wu: 'ping', wei: 'miao',
    shen: 'de', you: 'ping', xu: 'wang', hai: 'xian',
  },
  tianfu: {
    zi: 'wang', chou: 'miao', yin: 'de', mao: 'li',
    chen: 'miao', si: 'wang', wu: 'wang', wei: 'de',
    shen: 'de', you: 'wang', xu: 'miao', hai: 'de',
  },
  taiyin: {
    zi: 'wang', chou: 'miao', yin: 'xian', mao: 'xian',
    chen: 'xian', si: 'xian', wu: 'ping', wei: 'de',
    shen: 'wang', you: 'miao', xu: 'wang', hai: 'miao',
  },
  tanlang: {
    zi: 'wang', chou: 'wang', yin: 'ping', mao: 'ping',
    chen: 'ping', si: 'xian', wu: 'ping', wei: 'wang',
    shen: 'ping', you: 'ping', xu: 'miao', hai: 'xian',
  },
  jumen: {
    zi: 'wang', chou: 'xian', yin: 'ping', mao: 'miao',
    chen: 'xian', si: 'wang', wu: 'ping', wei: 'xian',
    shen: 'ping', you: 'miao', xu: 'xian', hai: 'wang',
  },
  tianxiang: {
    zi: 'wang', chou: 'miao', yin: 'miao', mao: 'xian',
    chen: 'de', si: 'xian', wu: 'de', wei: 'de',
    shen: 'miao', you: 'xian', xu: 'de', hai: 'de',
  },
  tianliang: {
    zi: 'wang', chou: 'miao', yin: 'de', mao: 'wang',
    chen: 'miao', si: 'xian', wu: 'miao', wei: 'de',
    shen: 'xian', you: 'wang', xu: 'miao', hai: 'xian',
  },
  qisha: {
    zi: 'wang', chou: 'miao', yin: 'miao', mao: 'miao',
    chen: 'xian', si: 'xian', wu: 'miao', wei: 'de',
    shen: 'de', you: 'wang', xu: 'xian', hai: 'ping',
  },
  pojun: {
    zi: 'wang', chou: 'xian', yin: 'de', mao: 'xian',
    chen: 'wang', si: 'ping', wu: 'miao', wei: 'wang',
    shen: 'xian', you: 'ping', xu: 'xian', hai: 'ping',
  },
};

/** Get the brightness of a star in a specific branch */
export function getStarBrightness(starId: string, branch: EarthlyBranch): BrightnessLevel {
  const row = BRIGHTNESS_TABLE[starId];
  if (!row) return 'ping'; // default neutral for stars not in the table
  return row[branch] ?? 'ping';
}

/** CSS color mapping for brightness levels */
export const BRIGHTNESS_COLORS: Record<BrightnessLevel, string> = {
  miao: '#dc2626',  // red — maximum
  wang: '#ea580c',  // orange — prosperous
  de:   '#ca8a04',  // yellow — attained
  li:   '#16a34a',  // green — beneficial
  ping: '#6b7280',  // gray — neutral
  bu:   '#4b5563',  // dark gray — not favorable
  xian: '#1f2937',  // nearly black — trapped
};

/** Human-readable labels for brightness levels */
export const BRIGHTNESS_LABELS: Record<BrightnessLevel, { zh: string; en: string }> = {
  miao: { zh: '廟', en: 'Max Brightness' },
  wang: { zh: '旺', en: 'Prosperous' },
  de:   { zh: '得', en: 'Attained' },
  li:   { zh: '利', en: 'Beneficial' },
  ping: { zh: '平', en: 'Neutral' },
  bu:   { zh: '不', en: 'Unfavorable' },
  xian: { zh: '陷', en: 'Trapped' },
};
