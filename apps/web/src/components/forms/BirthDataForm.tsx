"use client";

import { useState } from "react";
import type { BirthData } from "@/lib/zwds-core";
import { WORLD_CITY_PRESETS, calculateTrueSolarTime, getShichen } from "@/lib/zwds-core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface BirthDataFormProps {
  onCalculate: (birthData: BirthData) => void;
  loading: boolean;
}

export function BirthDataForm({ onCalculate, loading }: BirthDataFormProps) {
  const [year, setYear] = useState("1990");
  const [month, setMonth] = useState("1");
  const [day, setDay] = useState("1");
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("0");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Location — IANA timezone + longitude
  const [selectedCity, setSelectedCity] = useState("New York");
  const [ianaTimeZone, setIanaTimeZone] = useState("America/New_York");
  const [longitude, setLongitude] = useState("-74.006");

  const handleCityChange = (city: string | null) => {
    if (!city) return;
    setSelectedCity(city);
    const preset = WORLD_CITY_PRESETS.find((c) => c.city === city);
    if (preset) {
      setIanaTimeZone(preset.ianaTimeZone);
      setLongitude(String(preset.longitude));
    }
  };

  // Live preview of true solar time + DST
  const trueSolar = calculateTrueSolarTime({
    year: parseInt(year) || 1990,
    month: parseInt(month) || 1,
    day: parseInt(day) || 1,
    hour: parseInt(hour) || 12,
    minute: parseInt(minute) || 0,
    ianaTimeZone,
    longitude: parseFloat(longitude) || -74.006,
  });
  const shichen = getShichen(trueSolar.correctedHour);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCalculate({
      year: parseInt(year),
      month: parseInt(month),
      day: parseInt(day),
      hour: parseInt(hour),
      minute: parseInt(minute),
      gender,
      ianaTimeZone,
      longitude: parseFloat(longitude),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Birth Data</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} min={1900} max={2100} required placeholder="1990" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="month">Month</Label>
              <Input id="month" type="number" value={month} onChange={(e) => setMonth(e.target.value)} min={1} max={12} required placeholder="1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="day">Day</Label>
              <Input id="day" type="number" value={day} onChange={(e) => setDay(e.target.value)} min={1} max={31} required placeholder="1" />
            </div>
          </div>

          {/* Time row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="hour">Hour (0–23, local clock time)</Label>
              <Input id="hour" type="number" value={hour} onChange={(e) => setHour(e.target.value)} min={0} max={23} required placeholder="12" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minute">Minute</Label>
              <Input id="minute" type="number" value={minute} onChange={(e) => setMinute(e.target.value)} min={0} max={59} required placeholder="0" />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-1.5">
            <Label>Gender</Label>
            <RadioGroup value={gender} onValueChange={(v) => setGender(v as "male" | "female")} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="cursor-pointer">Female</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Location: always visible */}
          <div className="space-y-1.5">
            <Label className="text-xs">Birthplace</Label>
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORLD_CITY_PRESETS.map((c) => (
                  <SelectItem key={c.city} value={c.city} className="text-xs">
                    {c.city}, {c.country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-1">
              <div className="flex-1">
                <span className="text-[10px] text-muted-foreground">IANA: {ianaTimeZone}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground">Longitude: {longitude}°</span>
              </div>
            </div>
          </div>

          {/* True Solar Time + DST preview */}
          {(trueSolar.totalOffsetMinutes !== 0 || trueSolar.isDST) ? (
            <div className="rounded-lg bg-muted/50 p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-muted-foreground font-medium">True Solar Time Correction</span>
                <div className="flex gap-1">
                  {trueSolar.isDST && (
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800">
                      ☀ DST Active
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    UTC{trueSolar.utcOffsetMinutes >= 0 ? "+" : ""}{trueSolar.utcOffsetMinutes / 60}h
                  </Badge>
                  {trueSolar.totalOffsetMinutes !== 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      {trueSolar.totalOffsetMinutes > 0 ? "+" : ""}{trueSolar.totalOffsetMinutes} min longitude
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-muted-foreground">
                Clock: {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
                {" → "}
                <span className="text-foreground font-medium">
                  True Solar: {String(trueSolar.correctedHour).padStart(2, "0")}:{String(trueSolar.correctedMinute).padStart(2, "0")}
                </span>
              </div>

              <div className="text-muted-foreground">
                時辰: <span className="text-foreground font-medium">{shichen.nameZh} — {shichen.nameEn}</span>
                {trueSolar.dayShift !== 0 && (
                  <span className="text-destructive ml-2 font-medium">
                    ⚠ Day shift: {trueSolar.dayShift > 0 ? "+" : ""}{trueSolar.dayShift} day (pillars recalculated)
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-muted/30 p-2 text-center text-[10px] text-muted-foreground">
              ✓ No time correction needed — birthplace is at timezone standard meridian.
              UTC{trueSolar.utcOffsetMinutes >= 0 ? "+" : ""}{trueSolar.utcOffsetMinutes / 60}h
              {trueSolar.isDST && " · DST active"}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Calculating..." : "Calculate Birth Chart"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
