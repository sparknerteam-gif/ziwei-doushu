/** 10 Heavenly Stems (天干) */
type HeavenlyStem = 'jia' | 'yi' | 'bing' | 'ding' | 'wu' | 'ji' | 'geng' | 'xin' | 'ren' | 'gui';
/** 12 Earthly Branches (地支) */
type EarthlyBranch = 'zi' | 'chou' | 'yin' | 'mao' | 'chen' | 'si' | 'wu' | 'wei' | 'shen' | 'you' | 'xu' | 'hai';
/** 12 Palaces (十二宮) */
type PalaceName = 'ming' | 'xiongdi' | 'fuqi' | 'zinv' | 'caibo' | 'jie' | 'qianyi' | 'jiaoyou' | 'shiye' | 'tianzhai' | 'fude' | 'fumu';
/** 5 Elements (五行) */
type FiveElement = 'water' | 'wood' | 'fire' | 'earth' | 'metal';
/** 5 Element Bureau (五行局) — used for star placement */
type FiveElementBureau = {
    element: FiveElement;
    number: 2 | 3 | 4 | 5 | 6;
};
/** Star brightness level (廟旺利陷) */
type BrightnessLevel = 'miao' | 'wang' | 'de' | 'li' | 'ping' | 'bu' | 'xian';
/** Four Transformations (四化) */
type TransformationType = 'lu' | 'quan' | 'ke' | 'ji';
/** Gender */
type Gender = 'male' | 'female';
/** Star type categories */
type StarType = 'major' | 'minor' | 'auxiliary';
interface BirthData {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    gender: Gender;
    ianaTimeZone: string;
    longitude: number;
}
interface LunarDate {
    year: number;
    month: number;
    day: number;
    isLeapMonth: boolean;
    yearStem: HeavenlyStem;
    yearBranch: EarthlyBranch;
    monthStem: HeavenlyStem;
    monthBranch: EarthlyBranch;
    dayStem: HeavenlyStem;
    dayBranch: EarthlyBranch;
    hourBranch: EarthlyBranch;
}
interface FourPillars {
    year: {
        stem: HeavenlyStem;
        branch: EarthlyBranch;
    };
    month: {
        stem: HeavenlyStem;
        branch: EarthlyBranch;
    };
    day: {
        stem: HeavenlyStem;
        branch: EarthlyBranch;
    };
    hour: {
        stem: HeavenlyStem;
        branch: EarthlyBranch;
    };
}
interface Star {
    id: string;
    nameZh: string;
    nameEn: string;
    type: StarType;
    brightness: BrightnessLevel;
    isTransformed?: boolean;
    transformation?: TransformationType;
    category?: string;
}
interface StarDefinition {
    id: string;
    nameZh: string;
    nameEn: string;
    type: StarType;
    category?: string;
    element?: FiveElement;
    descriptionEn?: string;
    descriptionZh?: string;
}
interface Palace {
    index: number;
    name: PalaceName;
    earthlyBranch: EarthlyBranch;
    heavenlyStem: HeavenlyStem;
    isMingPalace: boolean;
    isShenPalace: boolean;
    majorStars: Star[];
    minorStars: Star[];
    stars: Star[];
    decadeCycle?: DecadeCycle;
}
interface Transformation {
    type: TransformationType;
    starId: string;
    starNameZh: string;
    starNameEn: string;
    palaceIndex: number;
}
interface DecadeCycle {
    startAge: number;
    endAge: number;
    palaceIndex: number;
    direction: 'clockwise' | 'counterclockwise';
}
interface YearlyCycle {
    year: number;
    yearlyStem: HeavenlyStem;
    yearlyBranch: EarthlyBranch;
    mingPalaceIndex: number;
}
interface ChartData {
    id?: string;
    birthData: BirthData;
    lunarDate: LunarDate;
    fourPillars: FourPillars;
    mingPalaceIndex: number;
    shenPalaceIndex: number;
    fiveElementBureau: FiveElementBureau;
    palaces: Palace[];
    transformations: Transformation[];
    decadeCycles: DecadeCycle[];
    calculatedAt: string;
}
interface PalaceDefinition {
    id: PalaceName;
    nameZh: string;
    nameEn: string;
    shortNameEn: string;
    descriptionEn: string;
    descriptionZh: string;
    index: number;
}
declare const BRANCH_INDEX: Record<EarthlyBranch, number>;
declare const INDEX_TO_BRANCH: Record<number, EarthlyBranch>;
declare const STEM_INDEX: Record<HeavenlyStem, number>;
declare const INDEX_TO_STEM: Record<number, HeavenlyStem>;

/**
 * Chart Builder — the main orchestrator.
 *
 * Takes birth data, runs all calculation modules, and produces
 * a complete ChartData object with all palaces, stars, and cycles.
 *
 * Wraps the 'iztro' library for star placement while keeping
 * our own type system as the canonical output format.
 */

/** Calculate a complete Ziwei Doushu chart from birth data. */
declare function calculateChartSync(birthData: BirthData): ChartData;
/** Async wrapper (for future async calculations) */
declare function calculateChart(birthData: BirthData): Promise<ChartData>;

/**
 * Four Pillars (四柱八字) calculation.
 *
 * Year, Month, Day, Hour pillars — the foundation of Ziwei Doushu.
 * Each pillar is a pair of (HeavenlyStem, EarthlyBranch).
 */

interface FourPillarsInput {
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
declare function calculateFourPillars(input: FourPillarsInput): FourPillars;
/** Format a Four Pillars object into a readable string */
declare function formatFourPillars(pillars: FourPillars): string;

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

/**
 * Calculate the Destiny Palace (命宮) branch index (0–11).
 *
 * @param lunarMonth — lunar month number (1–12)
 * @param hourBranch — the birth hour's earthly branch
 * @returns branch index (0=子, 1=丑, ..., 11=亥)
 */
declare function calculateMingPalace(lunarMonth: number, hourBranch: EarthlyBranch): number;
/**
 * Calculate the Body Palace (身宮) branch index (0–11).
 *
 * Same as 命宮 but adds instead of subtracts the hour for the month offset.
 */
declare function calculateShenPalace(lunarMonth: number, hourBranch: EarthlyBranch): number;
/**
 * Determine if the birth year is Yang (陽年) or Yin (陰年).
 * Used for determining decade cycle direction.
 * Yang stems: 甲, 丙, 戊, 庚, 壬 (jia, bing, wu, geng, ren)
 */
declare function isYangYear(yearStemIndex: number): boolean;
/**
 * Determine if the decade cycle goes clockwise or counterclockwise.
 *
 * 陽男/陰女 → clockwise (順行)
 * 陰男/陽女 → counterclockwise (逆行)
 */
declare function getDecadeDirection(yearStemIndex: number, gender: Gender): 'clockwise' | 'counterclockwise';

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

/**
 * Map each branch index (0–11) to its palace name,
 * given that 命宮 sits at `mingBranchIndex`.
 */
declare function assignPalacesToBranches(mingBranchIndex: number): Record<number, PalaceName>;
/**
 * Get the palace name at a specific branch, given the 命宮 position.
 */
declare function getPalaceAtBranch(mingBranchIndex: number, branchIndex: number): PalaceName;
/**
 * Assign Heavenly Stems to each of the 12 palaces using 五虎遁.
 *
 * Rule: The stem of 寅 palace (the starting branch) is determined by
 * the YEAR stem. Then stems proceed sequentially through the 10-stem cycle.
 *
 * The stem at branch 寅 = starting stem (寅 = month 1 in 五虎遁).
 * Then each subsequent branch gets the next stem.
 */
declare function assignPalaceStems(yearStem: HeavenlyStem): Record<number, HeavenlyStem>;
/**
 * Get the branch index for a given palace in a chart.
 */
declare function getBranchForPalace(mingBranchIndex: number, palaceName: PalaceName): number;

/**
 * True Solar Time (真太陽時) — DST-aware, IANA timezone–based correction.
 *
 * For foreigners using Ziwei Doushu, the birth time must be corrected to
 * local apparent solar time. This module handles:
 *
 *   1. DST (Daylight Saving Time) — Luxon's IANA database auto-detects
 *      historical DST rules for the birth date, so July births in New York
 *      correctly get UTC-4 (EDT) instead of the hardcoded UTC-5 (EST).
 *
 *   2. Longitude correction — within a timezone, each degree east of the
 *      standard meridian adds 4 minutes to true solar time.
 *
 *   3. Day-shift handling — if correction crosses midnight, the effective
 *      date for chart calculation is adjusted.
 *
 * Formula:
 *   True Solar Time = Local Clock Time (DST-adjusted UTC offset)
 *                     + (longitude − timezoneMeridian) × 4 minutes
 */
interface TrueSolarTimeInput {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    ianaTimeZone: string;
    longitude: number;
}
interface TrueSolarTimeResult {
    effectiveYear: number;
    effectiveMonth: number;
    effectiveDay: number;
    correctedHour: number;
    correctedMinute: number;
    dayShift: -1 | 0 | 1;
    utcOffsetMinutes: number;
    longitudeOffsetMinutes: number;
    totalOffsetMinutes: number;
    isDST: boolean;
}
declare function calculateTrueSolarTime(input: TrueSolarTimeInput): TrueSolarTimeResult;
declare function getShichen(correctedHour: number): {
    index: number;
    nameZh: string;
    nameEn: string;
};
declare const WORLD_CITY_PRESETS: Array<{
    city: string;
    country: string;
    ianaTimeZone: string;
    longitude: number;
}>;

/**
 * Calendar utilities — Heavenly Stems & Earthly Branches.
 *
 * Pure functions for stem-branch calculations used across the engine.
 */

/** Get the year stem from a Gregorian year. Formula: (year - 4) % 10 */
declare function getYearStem(year: number): HeavenlyStem;
/** Get the year branch from a Gregorian year. Formula: (year - 4) % 12 */
declare function getYearBranch(year: number): EarthlyBranch;
/**
 * Get the Heavenly Stem for a given month (1=寅月, approximately Feb).
 * Month 1 = 寅 (Tiger) month, which starts around 立春 (Feb 4).
 * This follows the solar terms, NOT the lunar calendar.
 */
declare function getMonthStem(yearStem: HeavenlyStem, monthIndex: number): HeavenlyStem;
/** Get the Earthly Branch for a solar month (1=寅 to 12=丑) */
declare function getMonthBranch(monthIndex: number): EarthlyBranch;
/** Get the Heavenly Stem for a given 時辰 (0=子時, 1=丑時, ..., 11=亥時) */
declare function getHourStem(dayStem: HeavenlyStem, hourBranchIndex: number): HeavenlyStem;
/** Convert a 24-hour time to the Earthly Branch (時辰). Each 時辰 covers 2 hours. */
declare function getHourBranch(hour: number): EarthlyBranch;
/** Get the position in the 60-year cycle for a given year. Formula: (year - 4) % 60 */
declare function getSexagenaryPosition(year: number): number;
/**
 * Check if a Gregorian date is before 立春 (Start of Spring) of that year.
 * Simplified: 立春 is approximately Feb 4. For precise calculation,
 * we'd need solar term ephemeris data.
 *
 * Returns true if the birth date should use the PREVIOUS year's stem-branch.
 */
declare function isBeforeLichun(year: number, month: number, day: number): boolean;
declare const STEM_NAMES: Record<HeavenlyStem, {
    zh: string;
    en: string;
    yinYang: 'yang' | 'yin';
}>;
declare const BRANCH_NAMES: Record<EarthlyBranch, {
    zh: string;
    en: string;
    animal: string;
}>;

/**
 * Star definitions — all 100+ Ziwei Doushu stars with English translations.
 * Organized by category for the visualization layer.
 */

declare const MAJOR_STARS: StarDefinition[];
declare const AUXILIARY_STARS: StarDefinition[];
declare const ALL_STAR_DEFINITIONS: StarDefinition[];
declare const STAR_BY_ID: Record<string, StarDefinition>;
declare const MAJOR_STAR_IDS: Set<string>;
declare const AUXILIARY_STAR_IDS: Set<string>;

/**
 * Palace definitions — the 12 palaces with English translations and grid positions.
 * The traditional layout arranges them in a 4×4 grid as follows:
 *
 *       巳(5)      午(6)      未(7)      申(8)
 *    ┌─────────┬─────────┬─────────┬─────────┐
 *    │  交友   │  事業   │  田宅   │  福德   │
 *    │ Friends │ Career  │Property │ Fortune │
 *    ├─────────┼─────────┴─────────┼─────────┤
 * 辰 │  遷移   │                  │  父母   │ 酉
 * (4)│ Travel  │    CHART INFO    │ Parents │ (9)
 *    ├─────────┤                  ├─────────┤
 * 卯 │  疾厄   │   (center area)  │  命宮   │ 戌
 * (3)│ Health  │                  │ Destiny │ (10)
 *    ├─────────┼─────────┬─────────┼─────────┤
 *    │  財帛   │  子女   │  夫妻   │  兄弟   │
 *    │ Wealth  │Children │ Spouse  │Siblings │
 *    └─────────┴─────────┴─────────┴─────────┘
 *       寅(2)      丑(1)      子(0)      亥(11)
 */

/**
 * Palace display order follows the traditional counter-clockwise
 * arrangement starting from 寅 (Destiny Palace default position).
 *
 * Index 0–11 maps to grid positions as shown above.
 * The `gridRow` and `gridCol` define 1-based CSS grid positions.
 */
declare const PALACE_DEFINITIONS: (PalaceDefinition & {
    gridRow: number;
    gridCol: number;
    defaultBranchIndex: number;
})[];
declare const PALACE_BY_ID: Partial<Record<PalaceName, (typeof PALACE_DEFINITIONS)[number]>>;
/** Palace ordering: given 命宮 at branch index `mingBranch` (0–11),
 *  return which PalaceName occupies each of the 12 branches.
 *  Palaces are placed counter-clockwise from 命宮. */
declare function getPalaceOrder(mingBranchIndex: number): PalaceName[];

/**
 * Four Transformations (四化) lookup tables.
 *
 * Based on the birth YEAR stem, four of the 14 major stars receive
 * a transformation: 化祿 (lu), 化權 (quan), 化科 (ke), 化忌 (ji).
 *
 * NOTE: The 庚 (geng) stem transformation is disputed between schools.
 * This follows the most common interpretation.
 */

/** Maps year stem → { starId → transformation type } */
declare const TRANSFORMATION_MAP: Record<HeavenlyStem, Record<string, TransformationType>>;
/** Get all transformations for a given year stem */
declare function getTransformations(yearStem: HeavenlyStem): Array<{
    starId: string;
    type: TransformationType;
}>;
/** Chinese names for the four transformations */
declare const TRANSFORMATION_NAMES: Record<TransformationType, {
    zh: string;
    en: string;
}>;

/**
 * Five Element Bureau (五行局) determination.
 *
 * The Five Element Bureau is determined by the stem-branch combination
 * of the Destiny Palace (命宮). It uses the 納音 (Na Yin) system.
 * Each stem-branch pair maps to one of the five elements with a number:
 *   Water 2 (水二局), Wood 3 (木三局), Metal 4 (金四局),
 *   Earth 5 (土五局), Fire 6 (火六局)
 */

/**
 * Get the Five Element Bureau for a given stem-branch pair (of the Destiny Palace).
 */
declare function getFiveElementBureau(stem: HeavenlyStem, branch: EarthlyBranch): FiveElementBureau;

/**
 * Star brightness table (廟旺利陷).
 *
 * Each major star has different brightness in each of the 12 earthly branches.
 * Brightness greatly affects the star's interpretation strength.
 *
 * 7 levels: 廟 (miao) > 旺 (wang) > 得 (de) > 利 (li) > 平 (ping) > 不 (bu) > 陷 (xian)
 */

type BrightnessRow = Record<EarthlyBranch, BrightnessLevel>;
/**
 * Brightness table for the 14 major stars across 12 branches.
 * Columns ordered by branch index: 子(0) 丑(1) 寅(2) 卯(3) 辰(4) 巳(5) 午(6) 未(7) 申(8) 酉(9) 戌(10) 亥(11)
 */
declare const BRIGHTNESS_TABLE: Record<string, BrightnessRow>;
/** Get the brightness of a star in a specific branch */
declare function getStarBrightness(starId: string, branch: EarthlyBranch): BrightnessLevel;
/** CSS color mapping for brightness levels */
declare const BRIGHTNESS_COLORS: Record<BrightnessLevel, string>;
/** Human-readable labels for brightness levels */
declare const BRIGHTNESS_LABELS: Record<BrightnessLevel, {
    zh: string;
    en: string;
}>;

/**
 * English translations for all Ziwei Doushu terminology.
 *
 * This module provides the canonical English translations used
 * throughout the application. All terms include their Chinese
 * originals for reference.
 */

declare function getPalaceNameEn(name: PalaceName): string;
declare function getPalaceNameZh(name: PalaceName): string;
declare function getStarNameEn(starId: string): string;
declare function getStarNameZh(starId: string): string;
declare const FIVE_ELEMENT_NAMES: Record<FiveElement, {
    zh: string;
    en: string;
}>;
declare const YIN_YANG_NAMES: {
    yang: {
        zh: string;
        en: string;
    };
    yin: {
        zh: string;
        en: string;
    };
};
declare const GENDER_NAMES: {
    male: {
        zh: string;
        en: string;
    };
    female: {
        zh: string;
        en: string;
    };
};
declare const DECADE_CYCLE_TERMS: {
    decadeCycle: {
        zh: string;
        en: string;
    };
    yearlyCycle: {
        zh: string;
        en: string;
    };
    clockwise: {
        zh: string;
        en: string;
    };
    counterclockwise: {
        zh: string;
        en: string;
    };
};
declare const COMMON_TERMS: {
    birthChart: {
        zh: string;
        en: string;
    };
    destinyPalace: {
        zh: string;
        en: string;
    };
    bodyPalace: {
        zh: string;
        en: string;
    };
    fourPillars: {
        zh: string;
        en: string;
    };
    heavenlyStem: {
        zh: string;
        en: string;
    };
    earthlyBranch: {
        zh: string;
        en: string;
    };
    fiveElementBureau: {
        zh: string;
        en: string;
    };
    majorStars: {
        zh: string;
        en: string;
    };
    minorStars: {
        zh: string;
        en: string;
    };
    transformation: {
        zh: string;
        en: string;
    };
    brightness: {
        zh: string;
        en: string;
    };
    lunarCalendar: {
        zh: string;
        en: string;
    };
    solarCalendar: {
        zh: string;
        en: string;
    };
    birthDate: {
        zh: string;
        en: string;
    };
    birthTime: {
        zh: string;
        en: string;
    };
    gender: {
        zh: string;
        en: string;
    };
    timezone: {
        zh: string;
        en: string;
    };
    calculate: {
        zh: string;
        en: string;
    };
    interpretation: {
        zh: string;
        en: string;
    };
    save: {
        zh: string;
        en: string;
    };
    loading: {
        zh: string;
        en: string;
    };
};

export { ALL_STAR_DEFINITIONS, AUXILIARY_STARS, AUXILIARY_STAR_IDS, BRANCH_INDEX, BRANCH_NAMES, BRIGHTNESS_COLORS, BRIGHTNESS_LABELS, BRIGHTNESS_TABLE, type BirthData, type BrightnessLevel, COMMON_TERMS, type ChartData, DECADE_CYCLE_TERMS, type DecadeCycle, type EarthlyBranch, FIVE_ELEMENT_NAMES, type FiveElement, type FiveElementBureau, type FourPillars, GENDER_NAMES, type Gender, type HeavenlyStem, INDEX_TO_BRANCH, INDEX_TO_STEM, type LunarDate, MAJOR_STARS, MAJOR_STAR_IDS, PALACE_BY_ID, PALACE_DEFINITIONS, type Palace, type PalaceDefinition, type PalaceName, STAR_BY_ID, STEM_INDEX, STEM_NAMES, type Star, type StarDefinition, type StarType, TRANSFORMATION_MAP, TRANSFORMATION_NAMES, type Transformation, type TransformationType, type TrueSolarTimeInput, type TrueSolarTimeResult, WORLD_CITY_PRESETS, YIN_YANG_NAMES, type YearlyCycle, assignPalaceStems, assignPalacesToBranches, calculateChart, calculateChartSync, calculateFourPillars, calculateMingPalace, calculateShenPalace, calculateTrueSolarTime, formatFourPillars, getBranchForPalace, getDecadeDirection, getFiveElementBureau, getHourBranch, getHourStem, getMonthBranch, getMonthStem, getPalaceAtBranch, getPalaceNameEn, getPalaceNameZh, getPalaceOrder, getSexagenaryPosition, getShichen, getStarBrightness, getStarNameEn, getStarNameZh, getTransformations, getYearBranch, getYearStem, isBeforeLichun, isYangYear };
