/**
 * Five Element Bureau (五行局) determination.
 *
 * The Five Element Bureau is determined by the stem-branch combination
 * of the Destiny Palace (命宮). It uses the 納音 (Na Yin) system.
 * Each stem-branch pair maps to one of the five elements with a number:
 *   Water 2 (水二局), Wood 3 (木三局), Metal 4 (金四局),
 *   Earth 5 (土五局), Fire 6 (火六局)
 */

import type { HeavenlyStem, EarthlyBranch, FiveElementBureau } from '../types';

/**
 * Na Yin (納音) Five Element lookup table.
 * Indexed by [stemIndex][branchIndex], returns the element and bureau number.
 *
 * The Na Yin system groups the 60 stem-branch combinations into 30 pairs,
 * each associated with a five-element sound.
 */
const NA_YIN_TABLE: Record<number, Record<number, FiveElementBureau>> = {
  // 甲 (jia) — index 0
  0: {
    0: { element: 'metal', number: 4 },    // 甲子
    1: { element: 'metal', number: 4 },    // 甲丑
    2: { element: 'water', number: 2 },    // 甲寅
    3: { element: 'water', number: 2 },    // 甲卯
    4: { element: 'fire', number: 6 },     // 甲辰
    5: { element: 'fire', number: 6 },     // 甲巳
    6: { element: 'metal', number: 4 },    // 甲午
    7: { element: 'metal', number: 4 },    // 甲未
    8: { element: 'water', number: 2 },    // 甲申
    9: { element: 'water', number: 2 },    // 甲酉
    10: { element: 'fire', number: 6 },    // 甲戌
    11: { element: 'fire', number: 6 },    // 甲亥
  },
  // 乙 (yi) — index 1
  1: {
    0: { element: 'metal', number: 4 },    // 乙子
    1: { element: 'metal', number: 4 },    // 乙丑
    2: { element: 'water', number: 2 },    // 乙寅
    3: { element: 'water', number: 2 },    // 乙卯
    4: { element: 'fire', number: 6 },     // 乙辰
    5: { element: 'fire', number: 6 },     // 乙巳
    6: { element: 'metal', number: 4 },    // 乙午
    7: { element: 'metal', number: 4 },    // 乙未
    8: { element: 'water', number: 2 },    // 乙申
    9: { element: 'water', number: 2 },    // 乙酉
    10: { element: 'fire', number: 6 },    // 乙戌
    11: { element: 'fire', number: 6 },    // 乙亥
  },
  // 丙 (bing) — index 2
  2: {
    0: { element: 'water', number: 2 },    // 丙子
    1: { element: 'water', number: 2 },    // 丙丑
    2: { element: 'fire', number: 6 },     // 丙寅
    3: { element: 'fire', number: 6 },     // 丙卯
    4: { element: 'earth', number: 5 },    // 丙辰
    5: { element: 'earth', number: 5 },    // 丙巳
    6: { element: 'water', number: 2 },    // 丙午
    7: { element: 'water', number: 2 },    // 丙未
    8: { element: 'fire', number: 6 },     // 丙申
    9: { element: 'fire', number: 6 },     // 丙酉
    10: { element: 'earth', number: 5 },   // 丙戌
    11: { element: 'earth', number: 5 },   // 丙亥
  },
  // 丁 (ding) — index 3
  3: {
    0: { element: 'water', number: 2 },    // 丁子
    1: { element: 'water', number: 2 },    // 丁丑
    2: { element: 'fire', number: 6 },     // 丁寅
    3: { element: 'fire', number: 6 },     // 丁卯
    4: { element: 'earth', number: 5 },    // 丁辰
    5: { element: 'earth', number: 5 },    // 丁巳
    6: { element: 'water', number: 2 },    // 丁午
    7: { element: 'water', number: 2 },    // 丁未
    8: { element: 'fire', number: 6 },     // 丁申
    9: { element: 'fire', number: 6 },     // 丁酉
    10: { element: 'earth', number: 5 },   // 丁戌
    11: { element: 'earth', number: 5 },   // 丁亥
  },
  // 戊 (wu) — index 4
  4: {
    0: { element: 'fire', number: 6 },     // 戊子
    1: { element: 'fire', number: 6 },     // 戊丑
    2: { element: 'earth', number: 5 },    // 戊寅
    3: { element: 'earth', number: 5 },    // 戊卯
    4: { element: 'wood', number: 3 },     // 戊辰
    5: { element: 'wood', number: 3 },     // 戊巳
    6: { element: 'fire', number: 6 },     // 戊午
    7: { element: 'fire', number: 6 },     // 戊未
    8: { element: 'earth', number: 5 },    // 戊申
    9: { element: 'earth', number: 5 },    // 戊酉
    10: { element: 'wood', number: 3 },    // 戊戌
    11: { element: 'wood', number: 3 },    // 戊亥
  },
  // 己 (ji) — index 5
  5: {
    0: { element: 'fire', number: 6 },     // 己子
    1: { element: 'fire', number: 6 },     // 己丑
    2: { element: 'earth', number: 5 },    // 己寅
    3: { element: 'earth', number: 5 },    // 己卯
    4: { element: 'wood', number: 3 },     // 己辰
    5: { element: 'wood', number: 3 },     // 己巳
    6: { element: 'fire', number: 6 },     // 己午
    7: { element: 'fire', number: 6 },     // 己未
    8: { element: 'earth', number: 5 },    // 己申
    9: { element: 'earth', number: 5 },    // 己酉
    10: { element: 'wood', number: 3 },    // 己戌
    11: { element: 'wood', number: 3 },    // 己亥
  },
  // 庚 (geng) — index 6
  6: {
    0: { element: 'earth', number: 5 },    // 庚子
    1: { element: 'earth', number: 5 },    // 庚丑
    2: { element: 'wood', number: 3 },     // 庚寅
    3: { element: 'wood', number: 3 },     // 庚卯
    4: { element: 'metal', number: 4 },    // 庚辰
    5: { element: 'metal', number: 4 },    // 庚巳
    6: { element: 'earth', number: 5 },    // 庚午
    7: { element: 'earth', number: 5 },    // 庚未
    8: { element: 'wood', number: 3 },     // 庚申
    9: { element: 'wood', number: 3 },     // 庚酉
    10: { element: 'metal', number: 4 },   // 庚戌
    11: { element: 'metal', number: 4 },   // 庚亥
  },
  // 辛 (xin) — index 7
  7: {
    0: { element: 'earth', number: 5 },    // 辛子
    1: { element: 'earth', number: 5 },    // 辛丑
    2: { element: 'wood', number: 3 },     // 辛寅
    3: { element: 'wood', number: 3 },     // 辛卯
    4: { element: 'metal', number: 4 },    // 辛辰
    5: { element: 'metal', number: 4 },    // 辛巳
    6: { element: 'earth', number: 5 },    // 辛午
    7: { element: 'earth', number: 5 },    // 辛未
    8: { element: 'wood', number: 3 },     // 辛申
    9: { element: 'wood', number: 3 },     // 辛酉
    10: { element: 'metal', number: 4 },   // 辛戌
    11: { element: 'metal', number: 4 },   // 辛亥
  },
  // 壬 (ren) — index 8
  8: {
    0: { element: 'wood', number: 3 },     // 壬子
    1: { element: 'wood', number: 3 },     // 壬丑
    2: { element: 'metal', number: 4 },    // 壬寅
    3: { element: 'metal', number: 4 },    // 壬卯
    4: { element: 'water', number: 2 },    // 壬辰
    5: { element: 'water', number: 2 },    // 壬巳
    6: { element: 'wood', number: 3 },     // 壬午
    7: { element: 'wood', number: 3 },     // 壬未
    8: { element: 'metal', number: 4 },    // 壬申
    9: { element: 'metal', number: 4 },    // 壬酉
    10: { element: 'water', number: 2 },   // 壬戌
    11: { element: 'water', number: 2 },   // 壬亥
  },
  // 癸 (gui) — index 9
  9: {
    0: { element: 'wood', number: 3 },     // 癸子
    1: { element: 'wood', number: 3 },     // 癸丑
    2: { element: 'metal', number: 4 },    // 癸寅
    3: { element: 'metal', number: 4 },    // 癸卯
    4: { element: 'water', number: 2 },    // 癸辰
    5: { element: 'water', number: 2 },    // 癸巳
    6: { element: 'wood', number: 3 },     // 癸午
    7: { element: 'wood', number: 3 },     // 癸未
    8: { element: 'metal', number: 4 },    // 癸申
    9: { element: 'metal', number: 4 },    // 癸酉
    10: { element: 'water', number: 2 },   // 癸戌
    11: { element: 'water', number: 2 },   // 癸亥
  },
};

/**
 * Get the Five Element Bureau for a given stem-branch pair (of the Destiny Palace).
 */
export function getFiveElementBureau(stem: HeavenlyStem, branch: EarthlyBranch): FiveElementBureau {
  const stemIdx = { jia: 0, yi: 1, bing: 2, ding: 3, wu: 4, ji: 5, geng: 6, xin: 7, ren: 8, gui: 9 }[stem];
  const branchIdx = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[branch];
  return NA_YIN_TABLE[stemIdx][branchIdx];
}
