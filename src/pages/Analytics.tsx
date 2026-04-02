import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EnergyLineChart } from "@/components/dashboard/EnergyLineChart";
import { EnergyBarChart } from "@/components/dashboard/EnergyBarChart";
import { ReportExport } from "@/components/dashboard/ReportExport";
import { downloadCSV, printReport } from "@/lib/reportExport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const weeklyChartData = weeklyUsageData.map((d) => ({
    time: d.day,
    consumption: d.consumption,
    solar: d.solar,
    grid: d.grid,
    backup: d.backup,
  }));

  const totalConsumed2025 = monthlyUsageData.reduce((s, m) => s + m.consumption, 0);
  const totalSolar2025 = monthlyUsageData.reduce((s, m) => s + m.solar, 0);
  const avgMonthly = Math.round(totalConsumed2025 / 12);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Energy Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Detailed insights into your energy consumption patterns
        </p>
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
          data={monthlyUsageData}
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
                  data={peakHoursData}
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
