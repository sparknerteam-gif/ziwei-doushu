/**
 * @zwds/core — Public API
 *
 * Ziwei Doushu (紫微斗數) calculation engine.
 * Pure TypeScript, zero UI dependencies.
 */

// Types
export type {
  BirthData,
  ChartData,
  LunarDate,
  FourPillars,
  Palace,
  Star,
  StarDefinition,
  PalaceDefinition,
  DecadeCycle,
  YearlyCycle,
  Transformation,
  HeavenlyStem,
  EarthlyBranch,
  PalaceName,
  FiveElement,
  FiveElementBureau,
  BrightnessLevel,
  TransformationType,
  Gender,
  StarType,
} from './types';

export {
  BRANCH_INDEX,
  INDEX_TO_BRANCH,
  STEM_INDEX,
  INDEX_TO_STEM,
} from './types';

// Chart calculation
export { calculateChart, calculateChartSync } from './chart/chart-builder';
export { calculateFourPillars, formatFourPillars } from './chart/four-pillars';
export { calculateMingPalace, calculateShenPalace, getDecadeDirection, isYangYear } from './chart/ming-palace';
export { assignPalacesToBranches, assignPalaceStems, getPalaceAtBranch, getBranchForPalace } from './chart/twelve-palaces';

// Calendar
export {
  calculateTrueSolarTime,
  getShichen,
  WORLD_CITY_PRESETS,
} from './calendar/true-solar-time';
export type { TrueSolarTimeInput, TrueSolarTimeResult } from './calendar/true-solar-time';
export {
  getYearStem,
  getYearBranch,
  getMonthStem,
  getMonthBranch,
  getHourStem,
  getHourBranch,
  getSexagenaryPosition,
  STEM_NAMES,
  BRANCH_NAMES,
  isBeforeLichun,
} from './calendar/heavenly-stems';

// Data
export {
  MAJOR_STARS,
  AUXILIARY_STARS,
  ALL_STAR_DEFINITIONS,
  STAR_BY_ID,
  MAJOR_STAR_IDS,
  AUXILIARY_STAR_IDS,
} from './data/star-definitions';

export {
  PALACE_DEFINITIONS,
  PALACE_BY_ID,
  getPalaceOrder,
} from './data/palace-definitions';

export {
  TRANSFORMATION_MAP,
  getTransformations,
  TRANSFORMATION_NAMES,
} from './data/transformation-map';

export {
  getFiveElementBureau,
} from './data/five-element-map';

export {
  BRIGHTNESS_TABLE,
  getStarBrightness,
  BRIGHTNESS_COLORS,
  BRIGHTNESS_LABELS,
} from './data/star-brightness';

// i18n
export {
  getPalaceNameEn,
  getPalaceNameZh,
  getStarNameEn,
  getStarNameZh,
  FIVE_ELEMENT_NAMES,
  YIN_YANG_NAMES,
  GENDER_NAMES,
  DECADE_CYCLE_TERMS,
  COMMON_TERMS,
} from './i18n/en';
