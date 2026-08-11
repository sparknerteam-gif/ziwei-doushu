/**
 * Chart Builder — the main orchestrator.
 *
 * Takes birth data, runs all calculation modules, and produces
 * a complete ChartData object with all palaces, stars, and cycles.
 *
 * Wraps the 'iztro' library for star placement while keeping
 * our own type system as the canonical output format.
 */

import { astro } from 'iztro';
import type {
  ChartData, BirthData, Palace, Star, Transformation, DecadeCycle,
  HeavenlyStem, EarthlyBranch,
} from '../types';
import { BRANCH_INDEX, INDEX_TO_BRANCH, INDEX_TO_STEM, STEM_INDEX } from '../types';
import { calculateFourPillars } from './four-pillars';
import { calculateShenPalace, getDecadeDirection } from './ming-palace';
import { assignPalacesToBranches, assignPalaceStems } from './twelve-palaces';
import { getTransformations } from '../data/transformation-map';
import { getFiveElementBureau } from '../data/five-element-map';
import { getStarBrightness } from '../data/star-brightness';
import { STAR_BY_ID, MAJOR_STAR_IDS } from '../data/star-definitions';
import { PALACE_BY_ID } from '../data/palace-definitions';
import { solarToLunar } from '../calendar/solar-lunar';
import { calculateTrueSolarTime } from '../calendar/true-solar-time';

// ---- Public API ----

/** Calculate a complete Ziwei Doushu chart from birth data. */
export function calculateChartSync(birthData: BirthData): ChartData {
  const { year, month, day, hour, minute, gender, ianaTimeZone, longitude } = birthData;

  // 0. DST-aware true solar time correction
  const trueSolar = calculateTrueSolarTime({
    year, month, day, hour, minute,
    ianaTimeZone: ianaTimeZone ?? 'Asia/Hong_Kong',
    longitude: longitude ?? 114.169,
  });

  const effectiveYear = trueSolar.effectiveYear;
  const effectiveMonth = trueSolar.effectiveMonth;
  const effectiveDay = trueSolar.effectiveDay;
  const effectiveHour = trueSolar.correctedHour;
  const effectiveMinute = trueSolar.correctedMinute;

  // 1. Lunar date + stems/branches (use corrected time)
  const lunarDate = solarToLunar(effectiveYear, effectiveMonth, effectiveDay, effectiveHour);

  // 2. Four Pillars
  const fourPillars = calculateFourPillars({
    year: effectiveYear,
    month: effectiveMonth,
    day: effectiveDay,
    hour: effectiveHour,
  });

  // 3. Use iztro for star placement
  const timeIndex = hourToTimeIndex(effectiveHour);
  const iztroGender = gender === 'male' ? '男' as const : '女' as const;
  const iztroResult = (
    astro as any
  ).astrolabeBySolarDate(
    `${effectiveYear}-${effectiveMonth}-${effectiveDay}`,
    timeIndex,
    iztroGender,
  );

  // 4. Extract iztro palace data
  const iztroPalaces = iztroResult.palaces ?? [];

  // 5. Find ming palace index from iztro
  let mingBranchIndex = 2; // default 寅
  const iztroMingPalace = iztroPalaces.find((p: any) => {
    const n = p.name;
    return n === '命宮' || n === 'Destiny';
  });
  if (iztroMingPalace) {
    mingBranchIndex = branchNameToIndex(iztroMingPalace.earthlyBranch);
  }
  // Also check the astrolabe metadata
  if (iztroResult.earthlyBranchOfSoulPalace) {
    mingBranchIndex = branchNameToIndex(iztroResult.earthlyBranchOfSoulPalace);
  }

  const shenBranchIndex = iztroResult.earthlyBranchOfBodyPalace
    ? branchNameToIndex(iztroResult.earthlyBranchOfBodyPalace)
    : calculateShenPalace(lunarDate.month, lunarDate.hourBranch);

  // 6. Palace → Branch mapping & stems
  const palaceBranchMap = assignPalacesToBranches(mingBranchIndex);
  const branchStemMap = assignPalaceStems(fourPillars.year.stem);

  // 7. Five Element Bureau
  const mingStem = branchStemMap[mingBranchIndex];
  const mingBranch = INDEX_TO_BRANCH[mingBranchIndex];
  const fiveElementBureau = getFiveElementBureau(mingStem, mingBranch);

  // 8. Build palaces with stars
  const palaces = buildPalacesFromIztro(
    iztroPalaces,
    iztroResult,
    palaceBranchMap,
    branchStemMap,
    mingBranchIndex,
    shenBranchIndex,
    fourPillars.year.stem,
  );

  // 9. Transformations — merge from iztro data
  const transformations = buildTransformations(palaces, fourPillars.year.stem);

  // 10. Decade Cycles
  const decadeDirection = getDecadeDirection(
    STEM_INDEX[fourPillars.year.stem],
    gender,
  );
  const decadeCycles = buildDecadeCycles(
    mingBranchIndex,
    fiveElementBureau.number,
    decadeDirection,
  );
  for (const cycle of decadeCycles) {
    for (const palace of palaces) {
      const brIdx = palace.index;
      if (brIdx === cycle.palaceIndex) {
        palace.decadeCycle = cycle;
      }
    }
  }

  return {
    birthData,
    lunarDate,
    fourPillars,
    mingPalaceIndex: mingBranchIndex,
    shenPalaceIndex: shenBranchIndex,
    fiveElementBureau,
    palaces,
    transformations,
    decadeCycles,
    calculatedAt: new Date().toISOString(),
  };
}

/** Async wrapper (for future async calculations) */
export async function calculateChart(birthData: BirthData): Promise<ChartData> {
  return calculateChartSync(birthData);
}

// ---- Internal helpers ----

function hourToTimeIndex(hour: number): number {
  // iztro timeIndex: 0=子, 1=丑, ..., 11=亥
  // 子时 = 23:00-00:59, so hour 23/0 → 0, hour 1/2 → 1, etc.
  return Math.floor(((hour + 1) % 24) / 2);
}

/** Convert iztro branch name (Chinese chars or English) to 0-based index */
function branchNameToIndex(name: string | undefined): number {
  if (!name) return 2;
  const map: Record<string, number> = {
    '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5,
    '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11,
    'Zi': 0, 'Chou': 1, 'Yin': 2, 'Mao': 3, 'Chen': 4, 'Si': 5,
    'Wu': 6, 'Wei': 7, 'Shen': 8, 'You': 9, 'Xu': 10, 'Hai': 11,
  };
  return map[name] ?? 2;
}

/** Convert iztro stem name to our HeavenlyStem type */
function stemNameToId(name: string | undefined): HeavenlyStem {
  if (!name) return 'jia';
  const map: Record<string, HeavenlyStem> = {
    '甲': 'jia', '乙': 'yi', '丙': 'bing', '丁': 'ding', '戊': 'wu',
    '己': 'ji', '庚': 'geng', '辛': 'xin', '壬': 'ren', '癸': 'gui',
    'Jia': 'jia', 'Yi': 'yi', 'Bing': 'bing', 'Ding': 'ding', 'Wu': 'wu',
    'Ji': 'ji', 'Geng': 'geng', 'Xin': 'xin', 'Ren': 'ren', 'Gui': 'gui',
  };
  return map[name] ?? 'jia';
}

/** Convert iztro star name to our star ID */
function starNameToId(name: string): string {
  const map: Record<string, string> = {
    '紫微': 'ziwei', '天機': 'tianji', '太陽': 'taiyang', '武曲': 'wuqu',
    '天同': 'tiantong', '廉貞': 'lianzhen', '天府': 'tianfu', '太陰': 'taiyin',
    '貪狼': 'tanlang', '巨門': 'jumen', '天相': 'tianxiang', '天梁': 'tianliang',
    '七殺': 'qisha', '破軍': 'pojun', '左輔': 'zuofu', '右弼': 'youbi',
    '文昌': 'wenchang', '文曲': 'wenqu', '地劫': 'dijie', '地空': 'dikong',
    '祿存': 'lucun', '擎羊': 'qingyang', '陀羅': 'tuoluo', '天馬': 'tianma',
    '天魁': 'tiankui', '天鉞': 'tianyue', '火星': 'huoxing', '鈴星': 'lingxing',
    '天刑': 'tianxing', '天姚': 'tianyao', '天哭': 'tianku',
    // English names from iztro
    'Purple': 'ziwei', 'Sky': 'tianji', 'Sun': 'taiyang', 'Military': 'wuqu',
    'Heavenly Unity': 'tiantong', 'Upright': 'lianzhen', 'Treasury': 'tianfu',
    'Moon': 'taiyin', 'Greedy Wolf': 'tanlang', 'Great Gate': 'jumen',
    'Minister': 'tianxiang', 'Heavenly Beam': 'tianliang',
    'Seven Killings': 'qisha', 'Army Breaker': 'pojun',
    'Left Assistant': 'zuofu', 'Right Aide': 'youbi',
    'Literary': 'wenchang', 'Literary Music': 'wenqu',
    'Earth Calamity': 'dijie', 'Earth Void': 'dikong',
    'Preserved Blessing': 'lucun', 'Rising Goat': 'qingyang',
    'Spinning Top': 'tuoluo', 'Heavenly Horse': 'tianma',
    'Heavenly Leader': 'tiankui', 'Heavenly Battle-Axe': 'tianyue',
    'Fire': 'huoxing', 'Bell': 'lingxing',
    'Heavenly Punishment': 'tianxing', 'Heavenly Allure': 'tianyao',
    'Heavenly Weeping': 'tianku',
  };
  return map[name] ?? name.toLowerCase().replace(/\s+/g, '_');
}

function buildPalacesFromIztro(
  iztroPalaces: any[],
  iztroResult: any,
  palaceBranchMap: Record<number, import('../types').PalaceName>,
  branchStemMap: Record<number, HeavenlyStem>,
  mingBranchIndex: number,
  shenBranchIndex: number,
  yearStem: HeavenlyStem,
): Palace[] {
  const palaces: Palace[] = [];

  // Build a lookup from branch name to iztro palace
  const iztroByBranch: Record<number, any> = {};
  for (const p of iztroPalaces) {
    const idx = branchNameToIndex(p.earthlyBranch);
    iztroByBranch[idx] = p;
  }

  for (let branchIdx = 0; branchIdx < 12; branchIdx++) {
    const palaceName = palaceBranchMap[branchIdx];
    const stem = branchStemMap[branchIdx];
    const branch = INDEX_TO_BRANCH[branchIdx];
    const iztroPalace = iztroByBranch[branchIdx];

    const stars = extractStars(iztroPalace, branch);
    const majorStars = stars.filter(s => MAJOR_STAR_IDS.has(s.id));
    const minorStars = stars.filter(s => !MAJOR_STAR_IDS.has(s.id));

    palaces.push({
      index: branchIdx,
      name: palaceName,
      earthlyBranch: branch,
      heavenlyStem: stem,
      isMingPalace: branchIdx === mingBranchIndex,
      isShenPalace: branchIdx === shenBranchIndex,
      majorStars,
      minorStars,
      stars,
    });
  }

  return palaces;
}

function extractStars(iztroPalace: any, branch: EarthlyBranch): Star[] {
  const stars: Star[] = [];
  if (!iztroPalace) return stars;

  const allStars: any[] = [
    ...(iztroPalace.majorStars ?? []),
    ...(iztroPalace.minorStars ?? []),
    ...(iztroPalace.adjectiveStars ?? []),
  ];

  for (const s of allStars) {
    const rawName = s?.name ?? '';
    const starId = starNameToId(rawName);
    const starDef = STAR_BY_ID[starId];

    // Determine brightness: from star object or compute from branch table
    let brightness = getStarBrightness(starId, branch);
    if (s?.brightness) {
      const brightMap: Record<string, any> = {
        '廟': 'miao', '旺': 'wang', '得': 'de', '利': 'li',
        '平': 'ping', '不': 'bu', '陷': 'xian',
        'bright': 'miao', 'prosperous': 'wang',
      };
      brightness = brightMap[s.brightness] ?? brightness;
    }

    // Check for transformation (四化)
    let isTransformed = false;
    let transformation: import('../types').TransformationType | undefined;
    if (s?.mutagen) {
      const m = s.mutagen;
      const tMap: Record<string, import('../types').TransformationType> = {
        '祿': 'lu', '權': 'quan', '科': 'ke', '忌': 'ji',
      };
      transformation = tMap[m] ?? undefined;
      if (transformation) isTransformed = true;
    }

    if (starDef) {
      stars.push({
        id: starDef.id,
        nameZh: starDef.nameZh,
        nameEn: starDef.nameEn,
        type: starDef.type,
        brightness,
        isTransformed,
        transformation,
        category: starDef.category,
      });
    } else if (rawName) {
      // Unknown star from iztro, still include it
      stars.push({
        id: starId,
        nameZh: rawName,
        nameEn: rawName,
        type: 'auxiliary',
        brightness,
        isTransformed,
        transformation,
      });
    }
  }

  // Sort: major stars first, then alphabetical by id
  stars.sort((a, b) => {
    if (a.type === 'major' && b.type !== 'major') return -1;
    if (a.type !== 'major' && b.type === 'major') return 1;
    return a.id.localeCompare(b.id);
  });

  return stars;
}

function buildTransformations(
  palaces: Palace[],
  yearStem: HeavenlyStem,
): Transformation[] {
  const transformations: Transformation[] = [];
  const transformationData = getTransformations(yearStem);
  const seen = new Set<string>();

  for (const t of transformationData) {
    for (let i = 0; i < palaces.length; i++) {
      const star = palaces[i].stars.find(s => s.id === t.starId);
      if (star && !seen.has(t.starId)) {
        star.isTransformed = true;
        star.transformation = t.type;
        seen.add(t.starId);
        transformations.push({
          type: t.type,
          starId: t.starId,
          starNameZh: star.nameZh,
          starNameEn: star.nameEn,
          palaceIndex: i,
        });
        // Also update in majorStars/minorStars arrays
        for (const ms of palaces[i].majorStars) {
          if (ms.id === t.starId) { ms.isTransformed = true; ms.transformation = t.type; }
        }
        for (const ms of palaces[i].minorStars) {
          if (ms.id === t.starId) { ms.isTransformed = true; ms.transformation = t.type; }
        }
        break;
      }
    }
  }
  return transformations;
}

function buildDecadeCycles(
  mingBranchIndex: number,
  bureauNumber: number,
  direction: 'clockwise' | 'counterclockwise',
): DecadeCycle[] {
  const cycles: DecadeCycle[] = [];
  let cur = mingBranchIndex;
  let age = bureauNumber;

  for (let i = 0; i < 12; i++) {
    cycles.push({
      startAge: age,
      endAge: age + 9,
      palaceIndex: cur,
      direction,
    });
    cur = direction === 'clockwise' ? (cur + 1) % 12 : (cur - 1 + 12) % 12;
    age += 10;
  }
  return cycles;
}
