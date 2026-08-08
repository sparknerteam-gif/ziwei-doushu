/**
 * English translations for all Ziwei Doushu terminology.
 *
 * This module provides the canonical English translations used
 * throughout the application. All terms include their Chinese
 * originals for reference.
 */

import type { PalaceName, HeavenlyStem, EarthlyBranch, FiveElement, TransformationType, BrightnessLevel } from '../types';
import { PALACE_DEFINITIONS } from '../data/palace-definitions';
import { ALL_STAR_DEFINITIONS } from '../data/star-definitions';
import { BRIGHTNESS_LABELS } from '../data/star-brightness';
import { TRANSFORMATION_NAMES } from '../data/transformation-map';
import { STEM_NAMES, BRANCH_NAMES } from '../calendar/heavenly-stems';

// ---- Re-export data module translations for convenience ----
export { PALACE_DEFINITIONS, ALL_STAR_DEFINITIONS, BRIGHTNESS_LABELS, TRANSFORMATION_NAMES, STEM_NAMES, BRANCH_NAMES };

// ---- Palace name lookup ----
export function getPalaceNameEn(name: PalaceName): string {
  return PALACE_BY_ID_LOOKUP[name]?.nameEn ?? name;
}

export function getPalaceNameZh(name: PalaceName): string {
  return PALACE_BY_ID_LOOKUP[name]?.nameZh ?? name;
}

const PALACE_BY_ID_LOOKUP: Record<string, typeof PALACE_DEFINITIONS[number]> = {};
for (const p of PALACE_DEFINITIONS) {
  PALACE_BY_ID_LOOKUP[p.id] = p;
}

// ---- Star name lookup ----
export function getStarNameEn(starId: string): string {
  const star = STAR_BY_ID_LOOKUP[starId];
  return star?.nameEn ?? starId;
}

export function getStarNameZh(starId: string): string {
  const star = STAR_BY_ID_LOOKUP[starId];
  return star?.nameZh ?? starId;
}

const STAR_BY_ID_LOOKUP: Record<string, typeof ALL_STAR_DEFINITIONS[number]> = {};
for (const s of ALL_STAR_DEFINITIONS) {
  STAR_BY_ID_LOOKUP[s.id] = s;
}

// ---- Five Element English ----
export const FIVE_ELEMENT_NAMES: Record<FiveElement, { zh: string; en: string }> = {
  wood:  { zh: '木', en: 'Wood' },
  fire:  { zh: '火', en: 'Fire' },
  earth: { zh: '土', en: 'Earth' },
  metal: { zh: '金', en: 'Metal' },
  water: { zh: '水', en: 'Water' },
};

// ---- Yin/Yang ----
export const YIN_YANG_NAMES = {
  yang: { zh: '陽', en: 'Yang' },
  yin:  { zh: '陰', en: 'Yin' },
};

// ---- Gender ----
export const GENDER_NAMES = {
  male:   { zh: '男', en: 'Male' },
  female: { zh: '女', en: 'Female' },
};

// ---- Decade cycle terms ----
export const DECADE_CYCLE_TERMS = {
  decadeCycle:  { zh: '大限', en: 'Decade Cycle' },
  yearlyCycle:  { zh: '流年', en: 'Yearly Cycle' },
  clockwise:    { zh: '順行', en: 'Clockwise' },
  counterclockwise: { zh: '逆行', en: 'Counterclockwise' },
};

// ---- Common UI terms ----
export const COMMON_TERMS = {
  birthChart:       { zh: '命盤', en: 'Birth Chart' },
  destinyPalace:    { zh: '命宮', en: 'Destiny Palace' },
  bodyPalace:       { zh: '身宮', en: 'Body Palace' },
  fourPillars:      { zh: '四柱八字', en: 'Four Pillars' },
  heavenlyStem:     { zh: '天干', en: 'Heavenly Stem' },
  earthlyBranch:    { zh: '地支', en: 'Earthly Branch' },
  fiveElementBureau:{ zh: '五行局', en: 'Five Element Bureau' },
  majorStars:       { zh: '主星', en: 'Major Stars' },
  minorStars:       { zh: '輔星', en: 'Minor Stars' },
  transformation:   { zh: '四化', en: 'Four Transformations' },
  brightness:       { zh: '亮度', en: 'Brightness' },
  lunarCalendar:    { zh: '農曆', en: 'Lunar Calendar' },
  solarCalendar:    { zh: '陽曆', en: 'Solar Calendar' },
  birthDate:        { zh: '出生日期', en: 'Birth Date' },
  birthTime:        { zh: '出生時間', en: 'Birth Time' },
  gender:           { zh: '性別', en: 'Gender' },
  timezone:         { zh: '時區', en: 'Timezone' },
  calculate:        { zh: '排盤', en: 'Calculate Chart' },
  interpretation:   { zh: '解讀', en: 'Interpretation' },
  save:             { zh: '儲存', en: 'Save' },
  loading:          { zh: '計算中', en: 'Calculating...' },
};
