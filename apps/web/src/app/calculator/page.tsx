"use client";

import { useState } from "react";
import { calculateChartSync } from "@/lib/kismet-core";
import type { ChartData, BirthData } from "@/lib/kismet-core";
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
import PasswordGate from "@/components/PasswordGate";

export default function Home() {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = (birthData: BirthData) => {
    setLoading(true);
    setError(null);
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
    <PasswordGate>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              ✦ Kismet
            </h1>
            <Badge variant="secondary" className="text-xs">
              Life Script Decoder
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Chart your destiny</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Input Form */}
        <BirthDataForm
          onCalculate={handleCalculate}
          loading={loading}
        />

        {error && (
          <Card className="mt-4 border-destructive/50 bg-destructive/5 p-4 text-destructive">
            {error}
          </Card>
        )}

        {/* Chart Display */}
        {chartData && (
          <div className="mt-6 space-y-6">
            <ChartInfo chartData={chartData} />

            <Separator />

            {/* Main Grid + Details Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
              {/* Left: 12-Palace Grid */}
              <TwelvePalaceGrid chartData={chartData} />

              {/* Right: Details */}
              <div className="space-y-4">
                <FourPillarsDisplay chartData={chartData} />

                <Tabs defaultValue="transformations">
                  <TabsList className="w-full">
                    <TabsTrigger value="transformations" className="flex-1">
                      Transformations
                    </TabsTrigger>
                    <TabsTrigger value="decades" className="flex-1">
                      Decade Cycles
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="transformations" className="mt-3">
                    <TransformationList chartData={chartData} />
                  </TabsContent>
                  <TabsContent value="decades" className="mt-3">
                    <DecadeCyclePanel chartData={chartData} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Stars Summary */}
            <Card className="p-4">
              <h3 className="text-sm font-semibold mb-3">All Stars by Palace</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {chartData.palaces.map((palace) => (
                  <div key={palace.index} className="text-sm">
                    <span className="font-medium text-muted-foreground">
                      {palace.name.charAt(0).toUpperCase() + palace.name.slice(1)}:
                    </span>{" "}
                    {palace.stars.length > 0
                      ? palace.stars.map((s) => s.nameEn).join(", ")
                      : "—"}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Empty state */}
        {!chartData && !error && !loading && (
          <div className="mt-16 text-center text-muted-foreground">
            <div className="text-6xl mb-4">✦</div>
            <p className="text-lg">Enter your birth data above to generate your Kismet chart.</p>
            <p className="text-sm mt-2">
              The 12-palace chart reveals insights about destiny, career, relationships, and more.
            </p>
          </div>
        )}

        {loading && (
          <div className="mt-16 text-center text-muted-foreground">
            <div className="text-4xl mb-4 animate-pulse">✦</div>
            <p className="text-lg">Calculating your birth chart...</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto py-4 text-center text-xs text-muted-foreground">
        Kismet — Life Script Decoder. For guidance and self-reflection only.
      </footer>
    </div>
    </PasswordGate>
  );
}
