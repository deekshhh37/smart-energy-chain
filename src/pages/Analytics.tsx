import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnergyLineChart } from "@/components/dashboard/EnergyLineChart";
import { EnergyBarChart } from "@/components/dashboard/EnergyBarChart";
import { ReportExport } from "@/components/dashboard/ReportExport";
import { downloadCSV, printReport } from "@/lib/reportExport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadCSVData } from "@/lib/csvDataProcessor";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [localPrediction, setLocalPrediction] = useState<number | null>(null)
  const [localAccuracy, setLocalAccuracy] = useState<number | null>(null)
  const [localConfidence, setLocalConfidence] = useState<string | null>(null)
  const [localLoading, setLocalLoading] = useState(false)
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const csvData = await loadCSVData();
        setData({
          weeklyData: csvData.weeklyUsageData,
          peakHoursData: csvData.dailyUsageData.map((d: any, idx: number) => ({
            hour: d.time,
            usage: Math.round(d.consumption * 100) / 100
          })),
          monthlyData: csvData.weeklyUsageData.map((d: any, idx: number) => ({
            month: `Week ${idx + 1}`,
            consumption: d.consumption,
            solar: d.solar,
            grid: d.grid,
          })),
          prediction: 150,
          accuracy: 75,
          confidence: 'Medium'
        });
      } catch (error) {
        console.error('Failed to load CSV data:', error);
        setData({
          weeklyData: [],
          peakHoursData: [],
          monthlyData: [],
          prediction: 0,
          accuracy: 0,
          confidence: 'Low'
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const computeLocalPrediction = async () => {
    if (!data?.monthlyData?.length) return

    setLocalLoading(true)
    setLocalPrediction(null)
    setLocalAccuracy(null)
    setLocalConfidence(null)

    try {
      const module = await import("@/lib/mlModel")
      const result = await module.runEnhancedModelPrediction(data.monthlyData.map((m: any) => m.consumption))
      setLocalPrediction(result.prediction)
      setLocalAccuracy(result.accuracy)
      setLocalConfidence(result.confidence)
    } catch (err) {
      console.error('Local model prediction error:', err)
      setLocalPrediction(null)
      setLocalAccuracy(null)
      setLocalConfidence('Low')
    } finally {
      setLocalLoading(false)
    }
  }

  if (isLoading) return <DashboardLayout><div>Loading analytics...</div></DashboardLayout>;

  const weeklyChartData = data?.weeklyData?.map((d) => ({
    time: d.time,
    consumption: d.consumption,
    solar: d.solar,
    grid: d.grid,
    backup: d.backup,
  })) || [];

  const monthlyData2025 = data?.monthlyData?.filter(m => m.month.startsWith('2025-')) || [];
  const totalConsumed2025 = monthlyData2025.reduce((s, m) => s + m.consumption, 0);
  const totalSolar2025 = monthlyData2025.reduce((s, m) => s + m.solar, 0);
  const avgMonthly = monthlyData2025.length > 0 ? Math.round(totalConsumed2025 / monthlyData2025.length) : 0;
  const solarContribution = totalConsumed2025 > 0 ? ((totalSolar2025 / totalConsumed2025) * 100).toFixed(1) : '0.0';

  const nextMonthLabel = (() => {
    if (monthlyData2025.length === 0) return '2025-01';
    const [year, month] = monthlyData2025[monthlyData2025.length - 1].month.split('-').map(Number);
    const next = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    return `${nextYear}-${String(next).padStart(2, '0')}`;
  })();

  const mlPredictionValue = localPrediction ?? data?.prediction ?? 0;
  const monthlyPredictionData = [
    ...monthlyData2025.map((m) => ({ time: m.month, consumption: m.consumption })),
    ...(mlPredictionValue > 0 ? [{ time: nextMonthLabel, consumption: mlPredictionValue }] : []),
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Energy Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Detailed insights into your energy consumption patterns
          </p>
        </div>
        <ReportExport
          onExportCSV={() => downloadCSV(monthlyData2025, "energy-analytics")}
          onPrint={() => printReport("Energy Analytics Report")}
        />
      </div>

      {/* Weekly Usage */}
      <div className="mb-8">
        <EnergyLineChart
          data={weeklyChartData}
          title="Weekly Energy Consumption (kWh)"
          showSources={true}
        />
      </div>

      {/* Monthly & Peak Hours Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EnergyBarChart
          data={monthlyData2025}
          title="Monthly Consumption 2025 (kWh)"
          xAxisKey="month"
          dataKeys={[
            { key: "solar", name: "Solar", color: "hsl(var(--energy-solar))" },
            { key: "grid", name: "Grid", color: "hsl(var(--energy-grid))" },
          ]}
        />
        <EnergyLineChart
          data={monthlyPredictionData}
          title="ML Forecast - Next Month" 
          showSources={false}
        />
      </div>

      {/* ML Prediction */}
      <Card className="shadow-card animate-fade-in mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            AI Energy Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Predicted consumption for next month: <span className="font-semibold text-foreground">{data?.prediction || 0} kWh</span>
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Server model accuracy: </span>
                <span className="font-semibold text-foreground">{data?.accuracy || 0}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Server confidence: </span>
                <span className="font-semibold text-foreground">{data?.confidence || 'Low'}</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={computeLocalPrediction}
                disabled={localLoading}
                className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
              >
                {localLoading ? 'Computing local prediction...' : 'Compute local model prediction'}
              </button>
            </div>

            {localPrediction !== null && (
              <div className="rounded-lg border border-border p-3 bg-secondary/70">
                <p className="text-sm">Local prediction: <span className="font-semibold">{localPrediction} kWh</span></p>
                <p className="text-sm">Local accuracy: <span className="font-semibold">{localAccuracy}%</span></p>
                <p className="text-sm">Local confidence: <span className="font-semibold">{localConfidence}</span></p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Year Summary */}
      <Card className="shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            2025 Annual Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total Consumption 2025</p>
              <p className="text-2xl font-bold text-foreground">{totalConsumed2025.toLocaleString()} kWh</p>
              <p className="text-sm text-accent mt-1">From solar generation data</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Average Monthly</p>
              <p className="text-2xl font-bold text-foreground">{avgMonthly.toLocaleString()} kWh</p>
              <p className="text-sm text-muted-foreground mt-1">Across 12 months</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/50 border border-border">
              <p className="text-sm text-muted-foreground mb-1">Total Solar Adjusted</p>
              <p className="text-2xl font-bold text-foreground">{totalSolar2025.toLocaleString()} kWh</p>
              <p className="text-sm text-accent mt-1">
                {solarContribution}% solar contribution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
