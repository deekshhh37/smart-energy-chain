import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnergyLineChart } from "@/components/dashboard/EnergyLineChart";
import { EnergyBarChart } from "@/components/dashboard/EnergyBarChart";
import { ReportExport } from "@/components/dashboard/ReportExport";
import { downloadCSV, printReport } from "@/lib/reportExport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  weeklyUsageData,
  monthlyUsageData,
  peakHoursData,
} from "@/lib/mockData";
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
  const { data, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('analytics');
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Backend not available, using mock data:', err);
        // Fallback to mock data
        return {
          weeklyData: weeklyUsageData.map(d => ({
            time: d.day,
            consumption: d.consumption,
            solar: d.solar,
            grid: d.grid,
            backup: d.backup,
          })),
          monthlyData: monthlyUsageData,
          peakHoursData,
          prediction: 150, // Mock prediction
          accuracy: 75, // Mock accuracy
          confidence: 'Medium' // Mock confidence
        };
      }
    },
  });

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
  const avgMonthly = Math.round(totalConsumed2025 / monthlyData2025.length) || 0;

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

        <Card className="shadow-card animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Hourly Load Pattern (System Avg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.peakHoursData || []}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="hour"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    interval={3}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      boxShadow: "var(--shadow-lg)",
                    }}
                    formatter={(value: number) => [`${value}%`, "Load"]}
                  />
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="usage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#colorUsage)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
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
                <span className="text-muted-foreground">Model Accuracy: </span>
                <span className="font-semibold text-foreground">{data?.accuracy || 0}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Confidence: </span>
                <span className={`font-semibold ${
                  data?.confidence === 'High' ? 'text-green-600' :
                  data?.confidence === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {data?.confidence || 'Low'}
                </span>
              </div>
            </div>
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
                {((totalSolar2025 / totalConsumed2025) * 100).toFixed(1)}% solar contribution
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
