# 紫微斗數 Web App — 開發全記錄 (Phase 1-2 完成)

## 專案概述

開發一個畀外國人用嘅紫微斗數算命 Web App。
- **目標**: MVP 單對單幫人算命，輸入出生資料 → 自動排盤 → AI 輔助解讀
- **技術棧**: Next.js 16 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **數據庫**: Prisma + SQLite（未實作）
- **Monorepo 工具**: pnpm workspaces + turborepo
- **計算引擎**: iztro (npm library) 包裝成 @zwds/core
- **DST 修復**: luxon IANA timezone 動態處理歷史夏令時（Phase 2.5）

---

## Phase 2.5: DST 漏洞修復 (2026-08-07) ★最重要★

### Gemini 提出咗 4 個漏洞，我驗證後修復咗真正 critical 嘅 DST 問題

| 漏洞 | 驗證結果 | 行動 |
|---|---|---|
| DST 夏令時間 | ✅ Critical — 寫死 UTC offset 會導致夏天/冬天差 1 小時 | **已修復** — luxon IANA timezone |
| JS Date 日柱偏移 | 🟡 影響有限 | **已修復** — luxon 代替 JS Date |
| 早晚子時 | 🟡 真實但被誇大 (只影響 ~8%) | 未實施 |
| 南半球季節逆轉 | ❌ 不適用於紫微斗數 | 不實施 |

### 關鍵改動
- `BirthData.timezoneOffset` → `BirthData.ianaTimeZone` (e.g., "America/New_York")
- `getTrueSolarTime()` → `calculateTrueSolarTime()` — 用 luxon 自動偵測 DST
- 38 個全球城市 preset，每個有 IANA timezone + longitude
- UI 即時顯示 DST badge + true solar time correction

---

## 專案結構

```
C:\紫微斗數\
├── package.json                # root workspace (pnpm workspaces)
├── pnpm-workspace.yaml         # packages/* + apps/*
├── turbo.json                  # turborepo pipeline
├── tsconfig.json               # base TypeScript config
│
├── packages/
│   └── zwds-core/              # 核心計算引擎（純 TypeScript，零 UI）
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts                # Public API barrel export
│           ├── types.ts                # 所有 TypeScript 型別定義
│           ├── calendar/
│           │   ├── heavenly-stems.ts   # 天干地支、五虎遁、五鼠遁
│           │   ├── solar-lunar.ts      # 陽曆轉農曆（包裝 iztro）
│           │   └── true-solar-time.ts  # 真太陽時修正
│           ├── chart/
│           │   ├── chart-builder.ts    # ★ 總指揮：輸入出生資料 → 輸出完整命盤
│           │   ├── four-pillars.ts     # 四柱八字計算
│           │   ├── ming-palace.ts      # 命宮 + 身宮定位
│           │   └── twelve-palaces.ts   # 十二宮配置 + 天干分配
│           ├── data/
│           │   ├── star-definitions.ts  # 100+ 星曜定義（中英名、屬性）
│           │   ├── palace-definitions.ts # 十二宮定義 + Grid 位置
│           │   ├── transformation-map.ts # 四化 lookup table
│           │   ├── five-element-map.ts   # 五行局 lookup table
│           │   └── star-brightness.ts    # 星曜亮度表 + 顏色
│           └── i18n/
│               └── en.ts               # 英文翻譯層
│
└── apps/
    └── web/                    # Next.js 前端
        ├── next.config.ts      # transpilePackages: ["@zwds/core"]
        ├── package.json        # 依賴 @zwds/core (workspace:*)
        └── src/
            ├── app/
            │   ├── layout.tsx          # Root layout + TooltipProvider
            │   ├── page.tsx            # ★ 主頁面（唯一頁面）
            │   └── globals.css
            ├── components/
            │   ├── ui/                 # shadcn/ui (自動生成)
            │   ├── chart/
            │   │   ├── TwelvePalaceGrid.tsx  # ★ 十二宮命盤格 (Desktop 4×4 Grid + Mobile 2-col)
            │   │   ├── ChartInfo.tsx         # 命盤基本資料列
            │   │   ├── FourPillarsDisplay.tsx # 四柱八字卡片
            │   │   ├── TransformationList.tsx # 四化列表（祿權科忌）
            │   │   └── DecadeCyclePanel.tsx   # 大限列表
            │   └── forms/
            │       └── BirthDataForm.tsx # 出生資料輸入表單（含經度/城市/真太陽時）
            ├── lib/
            │   └── utils.ts            # shadcn/ui utility
            └── hooks/                  # （尚未建立）
```

---

## 所有已建立檔案的完整內容

### 1. 根目錄設定檔

---

**`C:\紫微斗數\package.json`**
```json
{
  "name": "ziwei-doushu",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "clean": "turbo clean"
  },
  "packageManager": "pnpm@9.0.0"
}
```

---

**`C:\紫微斗數\pnpm-workspace.yaml`**
```yaml
packages:
  - "packages/*"
  - "apps/*"
```

---

**`C:\紫微斗數\turbo.json`**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^build"] },
    "clean": { "cache": false }
  }
}
```

---

**`C:\紫微斗數\tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

---

### 2. @zwds/core 計算引擎

---

**`C:\紫微斗數\packages\zwds-core\package.json`**
```json
{
  "name": "@zwds/core",
  "version": "0.1.0",
  "description": "Ziwei Doushu calculation engine — pure TypeScript, zero UI dependencies",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "lint": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": { "iztro": "^1.3.0" },
  "devDependencies": { "tsup": "^8.0.0", "typescript": "^5.5.0" }
}
```

---

**`C:\紫微斗數\packages\zwds-core\tsconfig.json`**
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": { "outDir": "./dist", "rootDir": "./src" },
  "include": ["src/**/*.ts"]
}
```

---

**`C:\紫微斗數\packages\zwds-core\src\types.ts`**
```typescript
// ---- Enums & Literals ----
export type HeavenlyStem = 'jia' | 'yi' | 'bing' | 'ding' | 'wu' | 'ji' | 'geng' | 'xin' | 'ren' | 'gui';
export type EarthlyBranch = 'zi' | 'chou' | 'yin' | 'mao' | 'chen' | 'si' | 'wu' | 'wei' | 'shen' | 'you' | 'xu' | 'hai';
export type PalaceName = 'ming' | 'xiongdi' | 'fuqi' | 'zinv' | 'caibo' | 'jie' | 'qianyi' | 'jiaoyou' | 'shiye' | 'tianzhai' | 'fude' | 'fumu';
export type FiveElement = 'water' | 'wood' | 'fire' | 'earth' | 'metal';
export type FiveElementBureau = { element: FiveElement; number: 2 | 3 | 4 | 5 | 6 };
export type BrightnessLevel = 'miao' | 'wang' | 'de' | 'li' | 'ping' | 'bu' | 'xian';
export type TransformationType = 'lu' | 'quan' | 'ke' | 'ji';
export type Gender = 'male' | 'female';
export type StarType = 'major' | 'minor' | 'auxiliary';

// ---- Input Types ----
export interface BirthData {
  year: number;
  month: number;  // 1-12
  day: number;    // 1-31
  hour: number;   // 0-23 (local clock time)
  minute: number; // 0-59
  gender: Gender;
  timezoneOffset?: number; // UTC offset in minutes, default 480 (UTC+8)
  longitude?: number;      // for true solar time correction
}

// ---- Calendar Types ----
export interface LunarDate {
  year: number; month: number; day: number;
  isLeapMonth: boolean;
  yearStem: HeavenlyStem; yearBranch: EarthlyBranch;
  monthStem: HeavenlyStem; monthBranch: EarthlyBranch;
  dayStem: HeavenlyStem; dayBranch: EarthlyBranch;
  hourBranch: EarthlyBranch;
}

export interface FourPillars {
  year: { stem: HeavenlyStem; branch: EarthlyBranch };
  month: { stem: HeavenlyStem; branch: EarthlyBranch };
  day: { stem: HeavenlyStem; branch: EarthlyBranch };
  hour: { stem: HeavenlyStem; branch: EarthlyBranch };
}

// ---- Chart Types ----
export interface Star {
  id: string; nameZh: string; nameEn: string;
  type: StarType; brightness: BrightnessLevel;
  isTransformed?: boolean; transformation?: TransformationType;
  category?: string;
}

export interface StarDefinition {
  id: string; nameZh: string; nameEn: string;
  type: StarType; category?: string; element?: FiveElement;
  descriptionEn?: string; descriptionZh?: string;
}

export interface Palace {
  index: number; name: PalaceName;
  earthlyBranch: EarthlyBranch; heavenlyStem: HeavenlyStem;
  isMingPalace: boolean; isShenPalace: boolean;
  majorStars: Star[]; minorStars: Star[]; stars: Star[];
  decadeCycle?: DecadeCycle;
}

export interface Transformation {
  type: TransformationType; starId: string;
  starNameZh: string; starNameEn: string; palaceIndex: number;
}

export interface DecadeCycle {
  startAge: number; endAge: number;
  palaceIndex: number; direction: 'clockwise' | 'counterclockwise';
}

export interface ChartData {
  birthData: BirthData; lunarDate: LunarDate; fourPillars: FourPillars;
  mingPalaceIndex: number; shenPalaceIndex: number;
  fiveElementBureau: FiveElementBureau; palaces: Palace[];
  transformations: Transformation[]; decadeCycles: DecadeCycle[];
  calculatedAt: string;
}

// ---- Translation ----
export interface PalaceDefinition {
  id: PalaceName; nameZh: string; nameEn: string; shortNameEn: string;
  descriptionEn: string; descriptionZh: string; index: number;
}

// ---- Constants ----
export const BRANCH_INDEX: Record<EarthlyBranch, number> = {
  zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5,
  wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11,
};
export const INDEX_TO_BRANCH: Record<number, EarthlyBranch> = {
  0: 'zi', 1: 'chou', 2: 'yin', 3: 'mao', 4: 'chen', 5: 'si',
  6: 'wu', 7: 'wei', 8: 'shen', 9: 'you', 10: 'xu', 11: 'hai',
};
export const STEM_INDEX: Record<HeavenlyStem, number> = {
  jia: 0, yi: 1, bing: 2, ding: 3, wu: 4,
  ji: 5, geng: 6, xin: 7, ren: 8, gui: 9,
};
export const INDEX_TO_STEM: Record<number, HeavenlyStem> = {
  0: 'jia', 1: 'yi', 2: 'bing', 3: 'ding', 4: 'wu',
  5: 'ji', 6: 'geng', 7: 'xin', 8: 'ren', 9: 'gui',
};
```

---

**`C:\紫微斗數\packages\zwds-core\src\calendar\heavenly-stems.ts`**
```typescript
import type { HeavenlyStem, EarthlyBranch } from '../types';
import { INDEX_TO_STEM, INDEX_TO_BRANCH, STEM_INDEX } from '../types';

export function getYearStem(year: number): HeavenlyStem {
  const idx = ((year - 4) % 10 + 10) % 10;
  return INDEX_TO_STEM[idx];
}
export function getYearBranch(year: number): EarthlyBranch {
  const idx = ((year - 4) % 12 + 12) % 12;
  return INDEX_TO_BRANCH[idx];
}

// 五虎遁: month stem from year stem
const MONTH_STEM_START: Record<HeavenlyStem, number> = {
  jia: 2, yi: 4, bing: 6, ding: 8, wu: 0, ji: 2, geng: 4, xin: 6, ren: 8, gui: 0,
};
export function getMonthStem(yearStem: HeavenlyStem, monthIndex: number): HeavenlyStem {
  const start = MONTH_STEM_START[yearStem];
  return INDEX_TO_STEM[(start + monthIndex - 1) % 10];
}
export function getMonthBranch(monthIndex: number): EarthlyBranch {
  return INDEX_TO_BRANCH[(monthIndex + 1) % 12]; // month 1 = 寅(index 2)
}

// 五鼠遁: hour stem from day stem
const HOUR_STEM_START: Record<HeavenlyStem, number> = {
  jia: 0, yi: 2, bing: 4, ding: 6, wu: 8, ji: 0, geng: 2, xin: 4, ren: 6, gui: 8,
};
export function getHourStem(dayStem: HeavenlyStem, hourBranchIndex: number): HeavenlyStem {
  const start = HOUR_STEM_START[dayStem];
  return INDEX_TO_STEM[(start + hourBranchIndex) % 10];
}
export function getHourBranch(hour: number): EarthlyBranch {
  const branchIndex = Math.floor(((hour + 1) % 24) / 2);
  return INDEX_TO_BRANCH[branchIndex];
}

export function isBeforeLichun(year: number, month: number, day: number): boolean {
  if (month < 2) return true;
  if (month === 2 && day < 4) return true;
  return false;
}
export function getLunarYearForPillars(year: number, month: number, day: number): number {
  return isBeforeLichun(year, month, day) ? year - 1 : year;
}

export const STEM_NAMES: Record<HeavenlyStem, { zh: string; en: string; yinYang: 'yang' | 'yin' }> = {
  jia: { zh: '甲', en: 'Jia', yinYang: 'yang' }, yi: { zh: '乙', en: 'Yi', yinYang: 'yin' },
  bing: { zh: '丙', en: 'Bing', yinYang: 'yang' }, ding: { zh: '丁', en: 'Ding', yinYang: 'yin' },
  wu: { zh: '戊', en: 'Wu', yinYang: 'yang' }, ji: { zh: '己', en: 'Ji', yinYang: 'yin' },
  geng: { zh: '庚', en: 'Geng', yinYang: 'yang' }, xin: { zh: '辛', en: 'Xin', yinYang: 'yin' },
  ren: { zh: '壬', en: 'Ren', yinYang: 'yang' }, gui: { zh: '癸', en: 'Gui', yinYang: 'yin' },
};

export const BRANCH_NAMES: Record<EarthlyBranch, { zh: string; en: string; animal: string }> = {
  zi: { zh: '子', en: 'Zi', animal: 'Rat' }, chou: { zh: '丑', en: 'Chou', animal: 'Ox' },
  yin: { zh: '寅', en: 'Yin', animal: 'Tiger' }, mao: { zh: '卯', en: 'Mao', animal: 'Rabbit' },
  chen: { zh: '辰', en: 'Chen', animal: 'Dragon' }, si: { zh: '巳', en: 'Si', animal: 'Snake' },
  wu: { zh: '午', en: 'Wu', animal: 'Horse' }, wei: { zh: '未', en: 'Wei', animal: 'Goat' },
  shen: { zh: '申', en: 'Shen', animal: 'Monkey' }, you: { zh: '酉', en: 'You', animal: 'Rooster' },
  xu: { zh: '戌', en: 'Xu', animal: 'Dog' }, hai: { zh: '亥', en: 'Hai', animal: 'Pig' },
};
```

---

**`C:\紫微斗數\packages\zwds-core\src\calendar\solar-lunar.ts`**
```typescript
import { calendar } from 'iztro';
import type { HeavenlyStem, EarthlyBranch } from '../types';
import { getHourBranch } from './heavenly-stems';

export { getYearStem, getYearBranch, getMonthStem, getMonthBranch, getHourStem, getHourBranch } from './heavenly-stems';

export interface LunarDateResult {
  year: number; month: number; day: number; isLeapMonth: boolean;
  yearStem: HeavenlyStem; yearBranch: EarthlyBranch;
  monthStem: HeavenlyStem; monthBranch: EarthlyBranch;
  dayStem: HeavenlyStem; dayBranch: EarthlyBranch;
  hourBranch: EarthlyBranch;
}

export function solarToLunar(year: number, month: number, day: number, hour: number = 0): LunarDateResult {
  const dateStr = `${year}-${month}-${day}`;
  const timeIndex = Math.floor(((hour + 1) % 24) / 2);

  const lunarData = (calendar as any).solar2lunar(dateStr) as {
    lunarYear: number; lunarMonth: number; lunarDay: number; isLeap: boolean;
  };
  const sbData = (calendar as any).getHeavenlyStemAndEarthlyBranchBySolarDate(dateStr, timeIndex) as {
    yearly: [string, string]; monthly: [string, string]; daily: [string, string]; hourly: [string, string];
  };

  const STEM_CHARS: Record<string, HeavenlyStem> = {
    '甲': 'jia', '乙': 'yi', '丙': 'bing', '丁': 'ding', '戊': 'wu',
    '己': 'ji', '庚': 'geng', '辛': 'xin', '壬': 'ren', '癸': 'gui',
  };
  const BRANCH_CHARS: Record<string, EarthlyBranch> = {
    '子': 'zi', '丑': 'chou', '寅': 'yin', '卯': 'mao', '辰': 'chen', '巳': 'si',
    '午': 'wu', '未': 'wei', '申': 'shen', '酉': 'you', '戌': 'xu', '亥': 'hai',
  };

  return {
    year: lunarData.lunarYear,
    month: lunarData.lunarMonth,
    day: lunarData.lunarDay,
    isLeapMonth: lunarData.isLeap,
    yearStem: STEM_CHARS[sbData.yearly[0]] ?? 'jia',
    yearBranch: BRANCH_CHARS[sbData.yearly[1]] ?? 'zi',
    monthStem: STEM_CHARS[sbData.monthly[0]] ?? 'jia',
    monthBranch: BRANCH_CHARS[sbData.monthly[1]] ?? 'zi',
    dayStem: STEM_CHARS[sbData.daily[0]] ?? 'jia',
    dayBranch: BRANCH_CHARS[sbData.daily[1]] ?? 'zi',
    hourBranch: BRANCH_CHARS[sbData.hourly[1]] ?? getHourBranch(hour),
  };
}
```

---

**`C:\紫微斗數\packages\zwds-core\src\calendar\true-solar-time.ts`**
```typescript
export interface TrueSolarTimeResult {
  correctedHour: number; correctedMinute: number;
  dayShift: -1 | 0 | 1; originalHour: number; offsetMinutes: number;
}

export function getTrueSolarTime(
  hour: number, minute: number,
  timezoneOffset: number = 480, longitude: number = 120,
): TrueSolarTimeResult {
  const timezoneMeridian = timezoneOffset / 60 * 15;
  const longitudeOffsetMinutes = (longitude - timezoneMeridian) * 4;
  const totalOffsetMinutes = Math.round(longitudeOffsetMinutes);

  let totalMinutes = hour * 60 + minute + totalOffsetMinutes;
  let dayShift: -1 | 0 | 1 = 0;

  while (totalMinutes < 0) { totalMinutes += 24 * 60; dayShift = -1; }
  while (totalMinutes >= 24 * 60) { totalMinutes -= 24 * 60; dayShift = 1; }

  return {
    correctedHour: Math.floor(totalMinutes / 60),
    correctedMinute: totalMinutes % 60,
    dayShift, originalHour: hour, offsetMinutes: totalOffsetMinutes,
  };
}

export function getShichen(correctedHour: number): { index: number; nameZh: string; nameEn: string } {
  const shichenIndex = Math.floor(((correctedHour + 1) % 24) / 2);
  const names: Record<number, { zh: string; en: string }> = {
    0: { zh: '子時', en: 'Zi Hour (Rat, 23:00–00:59)' },
    1: { zh: '丑時', en: 'Chou Hour (Ox, 01:00–02:59)' },
    2: { zh: '寅時', en: 'Yin Hour (Tiger, 03:00–04:59)' },
    3: { zh: '卯時', en: 'Mao Hour (Rabbit, 05:00–06:59)' },
    4: { zh: '辰時', en: 'Chen Hour (Dragon, 07:00–08:59)' },
    5: { zh: '巳時', en: 'Si Hour (Snake, 09:00–10:59)' },
    6: { zh: '午時', en: 'Wu Hour (Horse, 11:00–12:59)' },
    7: { zh: '未時', en: 'Wei Hour (Goat, 13:00–14:59)' },
    8: { zh: '申時', en: 'Shen Hour (Monkey, 15:00–16:59)' },
    9: { zh: '酉時', en: 'You Hour (Rooster, 17:00–18:59)' },
    10: { zh: '戌時', en: 'Xu Hour (Dog, 19:00–20:59)' },
    11: { zh: '亥時', en: 'Hai Hour (Pig, 21:00–22:59)' },
  };
  const entry = names[shichenIndex] ?? { zh: '?', en: '?' };
  return { index: shichenIndex, nameZh: entry.zh, nameEn: entry.en };
}

export const CITY_PRESETS: Array<{ city: string; country: string; longitude: number; timezoneOffset: number }> = [
  { city: 'Beijing', country: 'China', longitude: 116.4, timezoneOffset: 480 },
  { city: 'Hong Kong', country: 'China', longitude: 114.2, timezoneOffset: 480 },
  { city: 'Taipei', country: 'Taiwan', longitude: 121.5, timezoneOffset: 480 },
  { city: 'Tokyo', country: 'Japan', longitude: 139.7, timezoneOffset: 540 },
  { city: 'Seoul', country: 'South Korea', longitude: 127.0, timezoneOffset: 540 },
  { city: 'New York', country: 'USA', longitude: -74.0, timezoneOffset: -300 },
  { city: 'Los Angeles', country: 'USA', longitude: -118.2, timezoneOffset: -480 },
  { city: 'Chicago', country: 'USA', longitude: -87.6, timezoneOffset: -360 },
  { city: 'London', country: 'UK', longitude: -0.1, timezoneOffset: 0 },
  { city: 'Paris', country: 'France', longitude: 2.3, timezoneOffset: 60 },
  { city: 'Sydney', country: 'Australia', longitude: 151.2, timezoneOffset: 600 },
  { city: 'Dubai', country: 'UAE', longitude: 55.3, timezoneOffset: 240 },
  { city: 'Mumbai', country: 'India', longitude: 72.9, timezoneOffset: 330 },
  { city: 'São Paulo', country: 'Brazil', longitude: -46.6, timezoneOffset: -180 },
  { city: 'Toronto', country: 'Canada', longitude: -79.4, timezoneOffset: -300 },
  { city: 'Vancouver', country: 'Canada', longitude: -123.1, timezoneOffset: -480 },
  { city: 'Melbourne', country: 'Australia', longitude: 145.0, timezoneOffset: 600 },
  { city: 'Berlin', country: 'Germany', longitude: 13.4, timezoneOffset: 60 },
  { city: 'Moscow', country: 'Russia', longitude: 37.6, timezoneOffset: 180 },
  { city: 'Bangkok', country: 'Thailand', longitude: 100.5, timezoneOffset: 420 },
];
```

---

**`C:\紫微斗數\packages\zwds-core\src\chart\four-pillars.ts`**
```typescript
import type { FourPillars, HeavenlyStem, EarthlyBranch } from '../types';
import { getYearStem, getYearBranch, getMonthStem, getMonthBranch, getHourStem, getHourBranch, getLunarYearForPillars } from '../calendar/heavenly-stems';

export interface FourPillarsInput { year: number; month: number; day: number; hour: number; }

export function calculateFourPillars(input: FourPillarsInput): FourPillars {
  const { year, month, day, hour } = input;
  const lunarYear = getLunarYearForPillars(year, month, day);
  const yearStem = getYearStem(lunarYear);
  const yearBranch = getYearBranch(lunarYear);

  const solarMonthIdx = getSolarMonthForPillar(year, month, day);
  const monthStem = getMonthStem(yearStem, solarMonthIdx);
  const monthBranch = getMonthBranch(solarMonthIdx);

  const { stem: dayStem, branch: dayBranch } = calculateDayPillar(year, month, day);

  const hourBranch = getHourBranch(hour);
  const hourBranchIdx = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  const hourStem = getHourStem(dayStem, hourBranchIdx);

  return { year: { stem: yearStem, branch: yearBranch }, month: { stem: monthStem, branch: monthBranch }, day: { stem: dayStem, branch: dayBranch }, hour: { stem: hourStem, branch: hourBranch } };
}

function getSolarMonthForPillar(year: number, month: number, day: number): number {
  const termStarts: Record<number, number> = { 1: 6, 2: 4, 3: 6, 4: 5, 5: 6, 6: 6, 7: 7, 8: 8, 9: 8, 10: 8, 11: 7, 12: 7 };
  const termDay = termStarts[month] ?? 7;
  if (day < termDay) return month === 1 ? 12 : ((month - 1) % 12);
  return month;
}

function calculateDayPillar(year: number, month: number, day: number): { stem: HeavenlyStem; branch: EarthlyBranch } {
  let a = Math.floor((14 - month) / 12);
  let y = year + 4800 - a;
  let m = month + 12 * a - 3;
  let jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const epochJdn = 2415021; // Jan 1, 1900
  const daysDiff = jdn - epochJdn;
  const STEM_MAP: Record<number, HeavenlyStem> = { 0: 'jia', 1: 'yi', 2: 'bing', 3: 'ding', 4: 'wu', 5: 'ji', 6: 'geng', 7: 'xin', 8: 'ren', 9: 'gui' };
  const BRANCH_MAP: Record<number, EarthlyBranch> = { 0: 'zi', 1: 'chou', 2: 'yin', 3: 'mao', 4: 'chen', 5: 'si', 6: 'wu', 7: 'wei', 8: 'shen', 9: 'you', 10: 'xu', 11: 'hai' };
  return { stem: STEM_MAP[((0 + daysDiff) % 10 + 10) % 10], branch: BRANCH_MAP[((10 + daysDiff) % 12 + 12) % 12] };
}
```

---

**`C:\紫微斗數\packages\zwds-core\src\chart\ming-palace.ts`**
```typescript
import type { EarthlyBranch, Gender } from '../types';

export function calculateMingPalace(lunarMonth: number, hourBranch: EarthlyBranch): number {
  const hourIndex = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  return (2 + lunarMonth - hourIndex + 12) % 12;
}

export function calculateShenPalace(lunarMonth: number, hourBranch: EarthlyBranch): number {
  const hourIndex = { zi: 0, chou: 1, yin: 2, mao: 3, chen: 4, si: 5, wu: 6, wei: 7, shen: 8, you: 9, xu: 10, hai: 11 }[hourBranch];
  return (2 + lunarMonth + hourIndex) % 12;
}

export function isYangYear(yearStemIndex: number): boolean { return yearStemIndex % 2 === 0; }

export function getDecadeDirection(yearStemIndex: number, gender: Gender): 'clockwise' | 'counterclockwise' {
  const yang = isYangYear(yearStemIndex);
  if (yang && gender === 'male') return 'clockwise';
  if (yang && gender === 'female') return 'counterclockwise';
  if (!yang && gender === 'male') return 'counterclockwise';
  return 'clockwise';
}
```

---

**`C:\紫微斗數\packages\zwds-core\src\chart\twelve-palaces.ts`**
```typescript
import type { HeavenlyStem, EarthlyBranch, PalaceName } from '../types';
import { INDEX_TO_STEM } from '../types';
import { getMonthStem } from '../calendar/heavenly-stems';

const PALACE_ORDER: PalaceName[] = ['ming', 'xiongdi', 'fuqi', 'zinv', 'caibo', 'jie', 'qianyi', 'jiaoyou', 'shiye', 'tianzhai', 'fude', 'fumu'];

export function assignPalacesToBranches(mingBranchIndex: number): Record<number, PalaceName> {
  const result: Record<number, PalaceName> = {};
  for (let i = 0; i < 12; i++) {
    const branchIdx = (mingBranchIndex - i + 12) % 12;
    result[branchIdx] = PALACE_ORDER[i];
  }
  return result;
}

export function assignPalaceStems(yearStem: HeavenlyStem): Record<number, HeavenlyStem> {
  const yinStem = getMonthStem(yearStem, 1);
  const result: Record<number, HeavenlyStem> = {};
  for (let i = 0; i < 12; i++) {
    const branchIdx = (2 + i) % 12;
    const stemIdx = (getStemIndex(yinStem) + i) % 10;
    result[branchIdx] = INDEX_TO_STEM[stemIdx];
  }
  return result;
}

function getStemIndex(stem: HeavenlyStem): number {
  return { jia: 0, yi: 1, bing: 2, ding: 3, wu: 4, ji: 5, geng: 6, xin: 7, ren: 8, gui: 9 }[stem];
}
```

---

**`C:\紫微斗數\packages\zwds-core\src\chart\chart-builder.ts`** — ★ 最重要：總指揮
```typescript
import { astro } from 'iztro';
import type { ChartData, BirthData, Palace, Star, Transformation, DecadeCycle, HeavenlyStem, EarthlyBranch } from '../types';
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
import { getTrueSolarTime } from '../calendar/true-solar-time';

export function calculateChartSync(birthData: BirthData): ChartData {
  const { year, month, day, hour, minute, gender, timezoneOffset, longitude } = birthData;

  // 0. True solar time correction
  const trueSolar = getTrueSolarTime(hour, minute, timezoneOffset ?? 480, longitude ?? 120);
  const effectiveHour = trueSolar.correctedHour;
  const effectiveMinute = trueSolar.correctedMinute;

  let effectiveYear = year, effectiveMonth = month, effectiveDay = day;
  if (trueSolar.dayShift === -1) {
    const prevDate = new Date(year, month - 1, day - 1);
    effectiveYear = prevDate.getFullYear(); effectiveMonth = prevDate.getMonth() + 1; effectiveDay = prevDate.getDate();
  } else if (trueSolar.dayShift === 1) {
    const nextDate = new Date(year, month - 1, day + 1);
    effectiveYear = nextDate.getFullYear(); effectiveMonth = nextDate.getMonth() + 1; effectiveDay = nextDate.getDate();
  }

  const lunarDate = solarToLunar(effectiveYear, effectiveMonth, effectiveDay, effectiveHour);
  const fourPillars = calculateFourPillars({ year: effectiveYear, month: effectiveMonth, day: effectiveDay, hour: effectiveHour });

  const timeIndex = hourToTimeIndex(effectiveHour);
  const iztroGender = gender === 'male' ? '男' as const : '女' as const;
  const iztroResult = (astro as any).astrolabeBySolarDate(`${effectiveYear}-${effectiveMonth}-${effectiveDay}`, timeIndex, iztroGender);
  const iztroPalaces = iztroResult.palaces ?? [];

  let mingBranchIndex = 2;
  if (iztroResult.earthlyBranchOfSoulPalace) mingBranchIndex = branchNameToIndex(iztroResult.earthlyBranchOfSoulPalace);
  const shenBranchIndex = iztroResult.earthlyBranchOfBodyPalace ? branchNameToIndex(iztroResult.earthlyBranchOfBodyPalace)
    : calculateShenPalace(lunarDate.month, lunarDate.hourBranch);

  const palaceBranchMap = assignPalacesToBranches(mingBranchIndex);
  const branchStemMap = assignPalaceStems(fourPillars.year.stem);
  const fiveElementBureau = getFiveElementBureau(branchStemMap[mingBranchIndex], INDEX_TO_BRANCH[mingBranchIndex]);

  const palaces = buildPalacesFromIztro(iztroPalaces, iztroResult, palaceBranchMap, branchStemMap, mingBranchIndex, shenBranchIndex);
  const transformations = buildTransformations(palaces, fourPillars.year.stem);

  const decadeDirection = getDecadeDirection(STEM_INDEX[fourPillars.year.stem], gender);
  const decadeCycles = buildDecadeCycles(mingBranchIndex, fiveElementBureau.number, decadeDirection);
  for (const cycle of decadeCycles) {
    for (const palace of palaces) { if (palace.index === cycle.palaceIndex) { palace.decadeCycle = cycle; } }
  }

  return { birthData, lunarDate, fourPillars, mingPalaceIndex: mingBranchIndex, shenPalaceIndex: shenBranchIndex,
    fiveElementBureau, palaces, transformations, decadeCycles, calculatedAt: new Date().toISOString() };
}

export async function calculateChart(birthData: BirthData): Promise<ChartData> { return calculateChartSync(birthData); }

function hourToTimeIndex(hour: number): number { return Math.floor(((hour + 1) % 24) / 2); }

function branchNameToIndex(name: string | undefined): number {
  if (!name) return 2;
  const map: Record<string, number> = { '子': 0, '丑': 1, '寅': 2, '卯': 3, '辰': 4, '巳': 5, '午': 6, '未': 7, '申': 8, '酉': 9, '戌': 10, '亥': 11 };
  return map[name] ?? 2;
}

function buildPalacesFromIztro(iztroPalaces: any[], iztroResult: any, palaceBranchMap: Record<number, PalaceName>,
  branchStemMap: Record<number, HeavenlyStem>, mingBranchIndex: number, shenBranchIndex: number): Palace[] {
  const palaces: Palace[] = [];
  const iztroByBranch: Record<number, any> = {};
  for (const p of iztroPalaces) { iztroByBranch[branchNameToIndex(p.earthlyBranch)] = p; }

  for (let branchIdx = 0; branchIdx < 12; branchIdx++) {
    const palaceName = palaceBranchMap[branchIdx];
    const stem = branchStemMap[branchIdx];
    const branch = INDEX_TO_BRANCH[branchIdx];
    const iztroPalace = iztroByBranch[branchIdx];
    const stars = extractStars(iztroPalace, branch);
    palaces.push({ index: branchIdx, name: palaceName, earthlyBranch: branch, heavenlyStem: stem,
      isMingPalace: branchIdx === mingBranchIndex, isShenPalace: branchIdx === shenBranchIndex,
      majorStars: stars.filter(s => MAJOR_STAR_IDS.has(s.id)),
      minorStars: stars.filter(s => !MAJOR_STAR_IDS.has(s.id)), stars });
  }
  return palaces;
}

function extractStars(iztroPalace: any, branch: EarthlyBranch): Star[] {
  const stars: Star[] = [];
  if (!iztroPalace) return stars;
  const allStars: any[] = [...(iztroPalace.majorStars ?? []), ...(iztroPalace.minorStars ?? []), ...(iztroPalace.adjectiveStars ?? [])];

  for (const s of allStars) {
    const rawName = s?.name ?? '';
    const starId = starNameToId(rawName);
    const starDef = STAR_BY_ID[starId];
    let brightness = getStarBrightness(starId, branch);
    if (s?.brightness) {
      const brightMap: Record<string, any> = { '廟': 'miao', '旺': 'wang', '得': 'de', '利': 'li', '平': 'ping', '不': 'bu', '陷': 'xian' };
      brightness = brightMap[s.brightness] ?? brightness;
    }
    let isTransformed = false;
    let transformation: TransformationType | undefined;
    if (s?.mutagen) {
      const tMap: Record<string, TransformationType> = { '祿': 'lu', '權': 'quan', '科': 'ke', '忌': 'ji' };
      transformation = tMap[s.mutagen] ?? undefined;
      if (transformation) isTransformed = true;
    }
    if (starDef) {
      stars.push({ id: starDef.id, nameZh: starDef.nameZh, nameEn: starDef.nameEn, type: starDef.type, brightness, isTransformed, transformation, category: starDef.category });
    } else if (rawName) {
      stars.push({ id: starId, nameZh: rawName, nameEn: rawName, type: 'auxiliary', brightness, isTransformed, transformation });
    }
  }
  stars.sort((a, b) => { if (a.type === 'major' && b.type !== 'major') return -1; if (a.type !== 'major' && b.type === 'major') return 1; return a.id.localeCompare(b.id); });
  return stars;
}

function starNameToId(name: string): string {
  const map: Record<string, string> = {
    '紫微': 'ziwei', '天機': 'tianji', '太陽': 'taiyang', '武曲': 'wuqu', '天同': 'tiantong', '廉貞': 'lianzhen',
    '天府': 'tianfu', '太陰': 'taiyin', '貪狼': 'tanlang', '巨門': 'jumen', '天相': 'tianxiang', '天梁': 'tianliang',
    '七殺': 'qisha', '破軍': 'pojun', '左輔': 'zuofu', '右弼': 'youbi', '文昌': 'wenchang', '文曲': 'wenqu',
    '地劫': 'dijie', '地空': 'dikong', '祿存': 'lucun', '擎羊': 'qingyang', '陀羅': 'tuoluo', '天馬': 'tianma',
    '天魁': 'tiankui', '天鉞': 'tianyue', '火星': 'huoxing', '鈴星': 'lingxing', '天刑': 'tianxing', '天姚': 'tianyao', '天哭': 'tianku',
  };
  return map[name] ?? name.toLowerCase().replace(/\s+/g, '_');
}

function buildTransformations(palaces: Palace[], yearStem: HeavenlyStem): Transformation[] {
  const transformations: Transformation[] = [];
  const transformationData = getTransformations(yearStem);
  const seen = new Set<string>();
  for (const t of transformationData) {
    for (let i = 0; i < palaces.length; i++) {
      const star = palaces[i].stars.find(s => s.id === t.starId);
      if (star && !seen.has(t.starId)) {
        star.isTransformed = true; star.transformation = t.type; seen.add(t.starId);
        transformations.push({ type: t.type, starId: t.starId, starNameZh: star.nameZh, starNameEn: star.nameEn, palaceIndex: i });
        for (const ms of [...palaces[i].majorStars, ...palaces[i].minorStars]) {
          if (ms.id === t.starId) { ms.isTransformed = true; ms.transformation = t.type; }
        }
        break;
      }
    }
  }
  return transformations;
}

function buildDecadeCycles(mingBranchIndex: number, bureauNumber: number, direction: 'clockwise' | 'counterclockwise'): DecadeCycle[] {
  const cycles: DecadeCycle[] = [];
  let cur = mingBranchIndex, age = bureauNumber;
  for (let i = 0; i < 12; i++) {
    cycles.push({ startAge: age, endAge: age + 9, palaceIndex: cur, direction });
    cur = direction === 'clockwise' ? (cur + 1) % 12 : (cur - 1 + 12) % 12;
    age += 10;
  }
  return cycles;
}
```

---

### 3. 資料定義檔 (Data)

由於 data files 較長，以下係關鍵結構摘要：

- **`data/star-definitions.ts`**: 14 主星 + 18 輔星定義，含 `MAJOR_STARS`, `AUXILIARY_STARS`, `ALL_STAR_DEFINITIONS`, `STAR_BY_ID`, `MAJOR_STAR_IDS`
- **`data/palace-definitions.ts`**: 12 宮定義，含 `PALACE_DEFINITIONS` (含 gridRow/gridCol), `PALACE_BY_ID`, `getPalaceOrder()`
- **`data/transformation-map.ts`**: `TRANSFORMATION_MAP` (10天干×4四化), `getTransformations()`, `TRANSFORMATION_NAMES`
- **`data/five-element-map.ts`**: `NA_YIN_TABLE` (60干支→五行局), `getFiveElementBureau()`
- **`data/star-brightness.ts`**: `BRIGHTNESS_TABLE` (14星×12地支), `BRIGHTNESS_COLORS` (7色), `BRIGHTNESS_LABELS`

---

### 4. Next.js Web App

---

**`C:\紫微斗數\apps\web\src\app\page.tsx`** — ★ 唯一頁面
```typescript
"use client";
import { useState } from "react";
import { calculateChartSync } from "@zwds/core";
import type { ChartData, BirthData } from "@zwds/core";
import { TwelvePalaceGrid } from "@/components/chart/TwelvePalaceGrid";
import { ChartInfo } from "@/components/chart/ChartInfo";
import { BirthDataForm } from "@/components/forms/BirthDataForm";
import { FourPillarsDisplay } from "@/components/chart/FourPillarsDisplay";
import { TransformationList } from "@/components/chart/TransformationList";
import { DecadeCyclePanel } from "@/components/chart/DecadeCyclePanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = (birthData: BirthData) => {
    setLoading(true); setError(null);
    try {
      const chart = calculateChartSync(birthData);
      setChartData(chart);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate chart");
      setChartData(null);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">✦ Ziwei Doushu</h1>
            <Badge variant="secondary" className="text-xs">Purple Star Astrology</Badge>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <BirthDataForm onCalculate={handleCalculate} loading={loading} />
        {error && <Card className="mt-4 border-destructive/50 bg-destructive/5 p-4 text-destructive">{error}</Card>}
        {chartData && (
          <div className="mt-6 space-y-6">
            <ChartInfo chartData={chartData} />
            <Separator />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              <TwelvePalaceGrid chartData={chartData} />
              <div className="space-y-4">
                <FourPillarsDisplay chartData={chartData} />
                <Tabs defaultValue="transformations">
                  <TabsList className="w-full">
                    <TabsTrigger value="transformations" className="flex-1">Transformations</TabsTrigger>
                    <TabsTrigger value="decades" className="flex-1">Decade Cycles</TabsTrigger>
                  </TabsList>
                  <TabsContent value="transformations" className="mt-3"><TransformationList chartData={chartData} /></TabsContent>
                  <TabsContent value="decades" className="mt-3"><DecadeCyclePanel chartData={chartData} /></TabsContent>
                </Tabs>
              </div>
            </div>
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">All Stars by Palace</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {chartData.palaces.map((palace) => (
                  <div key={palace.index} className="text-sm">
                    <span className="font-medium text-muted-foreground">{palace.name}:</span>{" "}
                    {palace.stars.length > 0 ? palace.stars.map((s) => s.nameEn).join(", ") : "—"}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
        {!chartData && !error && !loading && (
          <div className="mt-16 text-center text-muted-foreground">
            <div className="text-6xl mb-4">✦</div>
            <p className="text-lg">Enter your birth data above to generate your Ziwei Doushu chart.</p>
          </div>
        )}
        {loading && (
          <div className="mt-16 text-center text-muted-foreground">
            <div className="text-4xl mb-4 animate-pulse">✦</div>
            <p className="text-lg">Calculating your birth chart...</p>
          </div>
        )}
      </main>
      <footer className="border-t mt-auto py-4 text-center text-xs text-muted-foreground">
        Ziwei Doushu (紫微斗數) — Purple Star Astrology. For guidance and self-reflection only.
      </footer>
    </div>
  );
}
```

---

**`C:\紫微斗數\apps\web\src\components\forms\BirthDataForm.tsx`** — 輸入表單（含真太陽時）
```typescript
"use client";
import { useState } from "react";
import type { BirthData } from "@zwds/core";
import { CITY_PRESETS, getTrueSolarTime, getShichen } from "@zwds/core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface BirthDataFormProps { onCalculate: (birthData: BirthData) => void; loading: boolean; }

export function BirthDataForm({ onCalculate, loading }: BirthDataFormProps) {
  const [year, setYear] = useState("1990"); const [month, setMonth] = useState("1"); const [day, setDay] = useState("1");
  const [hour, setHour] = useState("12"); const [minute, setMinute] = useState("0");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Beijing");
  const [longitude, setLongitude] = useState("116.4"); const [timezoneOffset, setTimezoneOffset] = useState("480");

  const handleCityChange = (city: string | null) => {
    if (!city) return; setSelectedCity(city);
    const preset = CITY_PRESETS.find((c) => c.city === city);
    if (preset) { setLongitude(String(preset.longitude)); setTimezoneOffset(String(preset.timezoneOffset)); }
  };

  const trueSolar = getTrueSolarTime(parseInt(hour) || 0, parseInt(minute) || 0, parseInt(timezoneOffset) || 480, parseFloat(longitude) || 120);
  const shichen = getShichen(trueSolar.correctedHour);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({ year: parseInt(year), month: parseInt(month), day: parseInt(day),
      hour: parseInt(hour), minute: parseInt(minute), gender,
      longitude: parseFloat(longitude), timezoneOffset: parseInt(timezoneOffset) });
  };

  return (
    <Card>
      <CardHeader className="pb-3"><CardTitle className="text-lg">Birth Data</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5"><Label htmlFor="year">Year</Label><Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} min={1900} max={2100} required /></div>
            <div className="space-y-1.5"><Label htmlFor="month">Month</Label><Input id="month" type="number" value={month} onChange={(e) => setMonth(e.target.value)} min={1} max={12} required /></div>
            <div className="space-y-1.5"><Label htmlFor="day">Day</Label><Input id="day" type="number" value={day} onChange={(e) => setDay(e.target.value)} min={1} max={31} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label htmlFor="hour">Hour (0–23, local clock time)</Label><Input id="hour" type="number" value={hour} onChange={(e) => setHour(e.target.value)} min={0} max={23} required /></div>
            <div className="space-y-1.5"><Label htmlFor="minute">Minute</Label><Input id="minute" type="number" value={minute} onChange={(e) => setMinute(e.target.value)} min={0} max={59} required /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <RadioGroup value={gender} onValueChange={(v) => setGender(v as "male" | "female")} className="flex gap-4">
              <div className="flex items-center space-x-2"><RadioGroupItem value="male" id="male" /><Label htmlFor="male" className="cursor-pointer">Male</Label></div>
              <div className="flex items-center space-x-2"><RadioGroupItem value="female" id="female" /><Label htmlFor="female" className="cursor-pointer">Female</Label></div>
            </RadioGroup>
          </div>
          {trueSolar.offsetMinutes !== 0 && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-1 text-xs">
              <div className="flex items-center justify-between"><span className="text-muted-foreground">True Solar Time Correction</span><Badge variant="outline" className="text-[10px]">{trueSolar.offsetMinutes > 0 ? "+" : ""}{trueSolar.offsetMinutes} min</Badge></div>
              <div className="text-muted-foreground">Clock: {String(trueSolar.originalHour).padStart(2, "0")}:{minute.padStart(2, "0")} → <span className="text-foreground font-medium">{String(trueSolar.correctedHour).padStart(2, "0")}:{String(trueSolar.correctedMinute).padStart(2, "0")}</span></div>
              <div className="text-muted-foreground">時辰: <span className="text-foreground font-medium">{shichen.nameZh} — {shichen.nameEn}</span>{trueSolar.dayShift !== 0 && <span className="text-amber-600 dark:text-amber-400 ml-2">⚠ Day pillar shifted by {trueSolar.dayShift} day</span>}</div>
            </div>
          )}
          <div className="border-t pt-3">
            <button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={() => setShowAdvanced(!showAdvanced)}>
              {showAdvanced ? "▾ Hide" : "▸ Show"} Location Settings (True Solar Time)
            </button>
          </div>
          {showAdvanced && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/30">
              <div className="space-y-1.5">
                <Label className="text-xs">Birthplace (City Preset)</Label>
                <Select value={selectedCity} onValueChange={handleCityChange}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{CITY_PRESETS.map((c) => (<SelectItem key={c.city} value={c.city} className="text-xs">{c.city}, {c.country} (UTC{c.timezoneOffset >= 0 ? "+" : ""}{c.timezoneOffset / 60})</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label htmlFor="longitude" className="text-xs">Longitude</Label><Input id="longitude" type="number" step="0.1" value={longitude} onChange={(e) => { setLongitude(e.target.value); setSelectedCity("Custom"); }} className="h-8 text-xs" /></div>
                <div className="space-y-1.5"><Label htmlFor="tz" className="text-xs">UTC Offset (min)</Label><Input id="tz" type="number" value={timezoneOffset} onChange={(e) => { setTimezoneOffset(e.target.value); setSelectedCity("Custom"); }} className="h-8 text-xs" /></div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">Chinese astrology uses <strong>true solar time</strong> (日晷時間), not clock time. We correct your clock time based on the longitude difference within your timezone. Each 1° east = +4 minutes.</p>
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Calculating..." : "Calculate Birth Chart"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

---

**`C:\紫微斗數\apps\web\src\components\chart\TwelvePalaceGrid.tsx`** — ★ 十二宮命盤格

關鍵結構：
- `GRID_LAYOUT`: 12 地支 → {row, col} 的 4×4 CSS Grid mapping
- `TwelvePalaceGrid`: Desktop 用 CSS Grid `grid-template-columns: repeat(4, 1fr)`，中間 2×2 放 chart info。Mobile 用 `grid-cols-2` card list
- `PalaceCell`: 每個宮位顯示 stem+branch、宮名（中英）、M/S badge、StarBadge list、大限年齡。Hover 有 Tooltip 顯示詳細
- `StarBadge`: 用 brightness 顏色做背景 + border + 圓點 indicator，有 transformation 顯示 祿/權/科/忌 symbol
- 關鍵：`StarBadge` 使用 `<span title="...">` 而唔係 `<Tooltip>`，避免 nested `<button>` hydration error

其餘組件 (`ChartInfo`, `FourPillarsDisplay`, `TransformationList`, `DecadeCyclePanel`) 都係簡單 display 組件。

---

## 關鍵技術決策

### 1. 真太陽時修正（外國人出生時間問題）
- 使用 **School 3（真太陽時修正）**：保持當地日期，只根據經度修正時辰
- 公式：`True Solar Time = Clock Time + (longitude - timezoneMeridian) × 4 min`
- 支援 20 個城市 preset（北京、紐約、倫敦等）
- 如果修正跨越午夜，會自動調整日柱日期
- 每個 1° 向東 = +4 分鐘，足以準確到時辰（2 小時區間）級別

### 2. 計算引擎設計
- `@zwds/core` 完全分離，零 UI 依賴，可被任何 future 手機 APP 重用
- 包裝 iztro library 做排星，我哋自己控制 output type
- 所有靜態 data（星曜、宮位、四化、五行局、亮度表）hardcode 喺 data/ folder，用 lookup table 唔使計

### 3. Monorepo 結構
- pnpm workspaces + turborepo
- `packages/zwds-core` 同 `apps/web` 分離
- `apps/web` 透過 `workspace:*` 引用 `@zwds/core`

### 4. 命盤顯示
- Desktop: 傳統 4×4 Grid（巳午未申 top row，辰-酉 left/right，卯-戌 left/right，寅丑子亥 bottom）
- Mobile: 2-column card list
- 星曜用 brightness 顏色標記（廟=紅、旺=橙、得=黃、利=綠、平=灰、陷=黑）
- 命宮 ring-2 primary，身宮 ring-1 amber

---

## 錯誤修復記錄

1. **Nested `<button>` hydration error**: `TooltipTrigger` render 一個 `<button>`，如果 nested tooltip（PalaceCell + StarBadge）會變成 `<button>` inside `<button>`。修復：StarBadge 改用原生 `<span title="...">` 而唔係 Tooltip
2. **iztro API mismatch**: iztro 用 `astro.astrolabeBySolarDate()`，唔係 `astrolabe`。需要 import `{ astro } from 'iztro'` 然後 call `(astro as any).astrolabeBySolarDate()`
3. **Select onChange type**: shadcn/ui Select 嘅 `onValueChange` callback 接受 `string | null`，唔係 `string`
4. **exports field order**: package.json exports 要 `"types"` 排第一，唔係 build warning

---

## 啟動方式

```bash
# 安裝依賴
cd C:\紫微斗數
pnpm install

# Build 計算引擎
cd packages\zwds-core
pnpm build

# 啟動 dev server
cd ..\..\apps\web
pnpm dev
# → http://localhost:3000
```

---

## 備註

- `apps/web/node_modules/next/dist/docs/` 有 Next.js 嘅 guide，寫 code 前建議參考
- iztro library version: 1.3.5，MIT license
- Next.js version: 16.3.0 (Turbopack)，React 19
- shadcn/ui 使用 `@base-ui/react` 做 primitives，Tooltip 來自 base-ui 而唔係 Radix
