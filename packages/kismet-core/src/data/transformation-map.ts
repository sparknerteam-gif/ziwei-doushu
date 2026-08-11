/**
 * Four Transformations (四化) lookup tables.
 *
 * Based on the birth YEAR stem, four of the 14 major stars receive
 * a transformation: 化祿 (lu), 化權 (quan), 化科 (ke), 化忌 (ji).
 *
 * NOTE: The 庚 (geng) stem transformation is disputed between schools.
 * This follows the most common interpretation.
 */

import type { HeavenlyStem, TransformationType } from '../types';

/** Maps year stem → { starId → transformation type } */
export const TRANSFORMATION_MAP: Record<HeavenlyStem, Record<string, TransformationType>> = {
  jia:   { lianzhen: 'lu', pojun: 'quan', wuqu: 'ke', taiyang: 'ji' },
  yi:    { tianji: 'lu', tianliang: 'quan', ziwei: 'ke', taiyin: 'ji' },
  bing:  { tiantong: 'lu', tianji: 'quan', wenchang: 'ke', lianzhen: 'ji' },
  ding:  { taiyin: 'lu', tiantong: 'quan', tianji: 'ke', jumen: 'ji' },
  wu:    { tanlang: 'lu', taiyin: 'quan', youbi: 'ke', tianji: 'ji' },
  ji:    { wuqu: 'lu', tanlang: 'quan', tianliang: 'ke', wenqu: 'ji' },
  geng:  { taiyang: 'lu', wuqu: 'quan', taiyin: 'ke', tiantong: 'ji' },
  xin:   { jumen: 'lu', taiyang: 'quan', wenqu: 'ke', wenchang: 'ji' },
  ren:   { tianliang: 'lu', ziwei: 'quan', zuofu: 'ke', wuqu: 'ji' },
  gui:   { pojun: 'lu', jumen: 'quan', taiyin: 'ke', tanlang: 'ji' },
};

/** Get all transformations for a given year stem */
export function getTransformations(yearStem: HeavenlyStem): Array<{
  starId: string;
  type: TransformationType;
}> {
  const map = TRANSFORMATION_MAP[yearStem];
  return Object.entries(map).map(([starId, type]) => ({ starId, type }));
}

/** Chinese names for the four transformations */
export const TRANSFORMATION_NAMES: Record<TransformationType, { zh: string; en: string }> = {
  lu:   { zh: '化祿', en: 'Prosperity Transformation' },
  quan: { zh: '化權', en: 'Authority Transformation' },
  ke:   { zh: '化科', en: 'Fame Transformation' },
  ji:   { zh: '化忌', en: 'Obstruction Transformation' },
};
