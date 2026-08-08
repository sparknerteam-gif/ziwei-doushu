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

import { DateTime } from 'luxon';

// ---- Input / Output Types ----

export interface TrueSolarTimeInput {
  year: number;
  month: number;        // 1–12
  day: number;          // 1–31
  hour: number;         // 0–23 (clock time)
  minute: number;       // 0–59
  ianaTimeZone: string; // e.g. "America/New_York", "Europe/London"
  longitude: number;    // e.g. -74.006
}

export interface TrueSolarTimeResult {
  effectiveYear: number;
  effectiveMonth: number;
  effectiveDay: number;
  correctedHour: number;
  correctedMinute: number;
  dayShift: -1 | 0 | 1;
  utcOffsetMinutes: number;         // actual DST-aware UTC offset
  longitudeOffsetMinutes: number;
  totalOffsetMinutes: number;
  isDST: boolean;
}

// ---- Main API ----

export function calculateTrueSolarTime(input: TrueSolarTimeInput): TrueSolarTimeResult {
  const { year, month, day, hour, minute, ianaTimeZone, longitude } = input;

  // 1. Parse local time in the given IANA timezone
  const localDt = DateTime.fromObject(
    { year, month, day, hour, minute },
    { zone: ianaTimeZone },
  );

  if (!localDt.isValid) {
    throw new Error(`Invalid date or timezone: ${localDt.invalidReason}`);
  }

  // 2. DST-aware UTC offset
  const utcOffsetMinutes = localDt.offset; // e.g. -240 (EDT) or -300 (EST)
  const isDST = localDt.isInDST;

  // 3. Standard meridian for this timezone
  const timezoneMeridian = (utcOffsetMinutes / 60) * 15;

  // 4. Longitude correction: 1° = 4 minutes
  const longitudeOffsetMinutes = Math.round((longitude - timezoneMeridian) * 4);

  // 5. Total correction (no EoT for MVP)
  const totalOffsetMinutes = longitudeOffsetMinutes;

  // 6. Apply correction
  const trueSolarDt = localDt.plus({ minutes: totalOffsetMinutes });

  // 7. Day shift detection
  let dayShift: -1 | 0 | 1 = 0;
  const orig = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const next = trueSolarDt.toFormat('yyyy-MM-dd');
  if (next > orig) dayShift = 1;
  else if (next < orig) dayShift = -1;

  return {
    effectiveYear: trueSolarDt.year,
    effectiveMonth: trueSolarDt.month,
    effectiveDay: trueSolarDt.day,
    correctedHour: trueSolarDt.hour,
    correctedMinute: trueSolarDt.minute,
    dayShift,
    utcOffsetMinutes,
    longitudeOffsetMinutes,
    totalOffsetMinutes,
    isDST,
  };
}

// ---- Shichen (時辰) helper ----

export function getShichen(
  correctedHour: number,
): { index: number; nameZh: string; nameEn: string } {
  const idx = Math.floor(((correctedHour + 1) % 24) / 2);
  const names: Record<number, { zh: string; en: string }> = {
    0: { zh: '子時', en: 'Zi (Rat) — 23:00–00:59' },
    1: { zh: '丑時', en: 'Chou (Ox) — 01:00–02:59' },
    2: { zh: '寅時', en: 'Yin (Tiger) — 03:00–04:59' },
    3: { zh: '卯時', en: 'Mao (Rabbit) — 05:00–06:59' },
    4: { zh: '辰時', en: 'Chen (Dragon) — 07:00–08:59' },
    5: { zh: '巳時', en: 'Si (Snake) — 09:00–10:59' },
    6: { zh: '午時', en: 'Wu (Horse) — 11:00–12:59' },
    7: { zh: '未時', en: 'Wei (Goat) — 13:00–14:59' },
    8: { zh: '申時', en: 'Shen (Monkey) — 15:00–16:59' },
    9: { zh: '酉時', en: 'You (Rooster) — 17:00–18:59' },
    10: { zh: '戌時', en: 'Xu (Dog) — 19:00–20:59' },
    11: { zh: '亥時', en: 'Hai (Pig) — 21:00–22:59' },
  };
  const entry = names[idx] ?? { zh: '?', en: '?' };
  return { index: idx, nameZh: entry.zh, nameEn: entry.en };
}

// ---- City presets with IANA timezones ----

export const WORLD_CITY_PRESETS: Array<{
  city: string;
  country: string;
  ianaTimeZone: string;
  longitude: number;
}> = [
  // Asia
  { city: 'Beijing', country: 'China', ianaTimeZone: 'Asia/Shanghai', longitude: 116.407 },
  { city: 'Hong Kong', country: 'Hong Kong', ianaTimeZone: 'Asia/Hong_Kong', longitude: 114.169 },
  { city: 'Taipei', country: 'Taiwan', ianaTimeZone: 'Asia/Taipei', longitude: 121.565 },
  { city: 'Singapore', country: 'Singapore', ianaTimeZone: 'Asia/Singapore', longitude: 103.820 },
  { city: 'Tokyo', country: 'Japan', ianaTimeZone: 'Asia/Tokyo', longitude: 139.692 },
  { city: 'Seoul', country: 'South Korea', ianaTimeZone: 'Asia/Seoul', longitude: 126.978 },
  { city: 'Shanghai', country: 'China', ianaTimeZone: 'Asia/Shanghai', longitude: 121.474 },
  { city: 'Bangkok', country: 'Thailand', ianaTimeZone: 'Asia/Bangkok', longitude: 100.502 },
  { city: 'Dubai', country: 'UAE', ianaTimeZone: 'Asia/Dubai', longitude: 55.271 },
  { city: 'Mumbai', country: 'India', ianaTimeZone: 'Asia/Kolkata', longitude: 72.878 },
  { city: 'Kuala Lumpur', country: 'Malaysia', ianaTimeZone: 'Asia/Kuala_Lumpur', longitude: 101.687 },
  // Europe
  { city: 'London', country: 'UK', ianaTimeZone: 'Europe/London', longitude: -0.128 },
  { city: 'Paris', country: 'France', ianaTimeZone: 'Europe/Paris', longitude: 2.352 },
  { city: 'Berlin', country: 'Germany', ianaTimeZone: 'Europe/Berlin', longitude: 13.405 },
  { city: 'Moscow', country: 'Russia', ianaTimeZone: 'Europe/Moscow', longitude: 37.618 },
  { city: 'Rome', country: 'Italy', ianaTimeZone: 'Europe/Rome', longitude: 12.496 },
  { city: 'Madrid', country: 'Spain', ianaTimeZone: 'Europe/Madrid', longitude: -3.704 },
  { city: 'Amsterdam', country: 'Netherlands', ianaTimeZone: 'Europe/Amsterdam', longitude: 4.904 },
  { city: 'Stockholm', country: 'Sweden', ianaTimeZone: 'Europe/Stockholm', longitude: 18.069 },
  { city: 'Zurich', country: 'Switzerland', ianaTimeZone: 'Europe/Zurich', longitude: 8.542 },
  // North America
  { city: 'New York', country: 'USA', ianaTimeZone: 'America/New_York', longitude: -74.006 },
  { city: 'Los Angeles', country: 'USA', ianaTimeZone: 'America/Los_Angeles', longitude: -118.244 },
  { city: 'Chicago', country: 'USA', ianaTimeZone: 'America/Chicago', longitude: -87.630 },
  { city: 'Houston', country: 'USA', ianaTimeZone: 'America/Chicago', longitude: -95.370 },
  { city: 'San Francisco', country: 'USA', ianaTimeZone: 'America/Los_Angeles', longitude: -122.419 },
  { city: 'Toronto', country: 'Canada', ianaTimeZone: 'America/Toronto', longitude: -79.383 },
  { city: 'Vancouver', country: 'Canada', ianaTimeZone: 'America/Vancouver', longitude: -123.121 },
  { city: 'Mexico City', country: 'Mexico', ianaTimeZone: 'America/Mexico_City', longitude: -99.133 },
  // South America
  { city: 'São Paulo', country: 'Brazil', ianaTimeZone: 'America/Sao_Paulo', longitude: -46.633 },
  { city: 'Buenos Aires', country: 'Argentina', ianaTimeZone: 'America/Argentina/Buenos_Aires', longitude: -58.382 },
  { city: 'Santiago', country: 'Chile', ianaTimeZone: 'America/Santiago', longitude: -70.649 },
  // Oceania
  { city: 'Sydney', country: 'Australia', ianaTimeZone: 'Australia/Sydney', longitude: 151.209 },
  { city: 'Melbourne', country: 'Australia', ianaTimeZone: 'Australia/Melbourne', longitude: 144.963 },
  { city: 'Brisbane', country: 'Australia', ianaTimeZone: 'Australia/Brisbane', longitude: 153.026 },
  { city: 'Perth', country: 'Australia', ianaTimeZone: 'Australia/Perth', longitude: 115.861 },
  { city: 'Auckland', country: 'New Zealand', ianaTimeZone: 'Pacific/Auckland', longitude: 174.764 },
  // Africa
  { city: 'Cape Town', country: 'South Africa', ianaTimeZone: 'Africa/Johannesburg', longitude: 18.424 },
  { city: 'Lagos', country: 'Nigeria', ianaTimeZone: 'Africa/Lagos', longitude: 3.379 },
  { city: 'Nairobi', country: 'Kenya', ianaTimeZone: 'Africa/Nairobi', longitude: 36.822 },
];
