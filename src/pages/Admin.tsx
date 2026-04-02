import {
  Users,
  Zap,
  Clock,
  TrendingUp,
  Activity,
  Server,
  IndianRupee,
  Sun,
  BarChart3,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EnergyBarChart } from "@/components/dashboard/EnergyBarChart";
import { ReportExport } from "@/components/dashboard/ReportExport";
import { downloadCSV, printReport } from "@/lib/reportExport";
import { downloadCSV, printReport } from "@/lib/reportExport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  adminStats,
  userGrowthData,
  systemLoadData,
  adminMonthlyData,
  solarGenerationMonthly,
} from "@/lib/mockData";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Admin() {
  const totalSolar2025 = solarGenerationMonthly.reduce((s, m) => s + m.generated, 0);
  const totalConsumed2025 = solarGenerationMonthly.reduce((s, m) => s + m.consumed, 0);
  const totalBill2025 = solarGenerationMonthly.reduce((s, m) => s + m.bill, 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="px-3 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-semibold">
              ADMIN
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              System Administration
            </h1>
          </div>
          <p className="text-muted-foreground mt-1">
            System-wide energy monitoring across all meters — powered by real data
          </p>
        </div>
        <ReportExport
          onExportCSV={() => downloadCSV(solarGenerationMonthly.map(r => ({ ...r, month: `${r.month} 2025` })), "admin-solar-report")}
          onPrint={() => printReport("Admin System Report")}
        />
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={adminStats.totalUsers.toLocaleString()}
          subtitle={`${adminStats.activeUsers.toLocaleString()} active meters`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Consumption"
          value={`${(adminStats.totalConsumption / 1000000).toFixed(1)}M kWh`}
          subtitle="From 10,000 hourly records"
          icon={Zap}
          variant="solar"
        />
        <StatCard
          title="Peak Hourly Load"
          value={`${(adminStats.peakLoad / 1000).toFixed(1)}K kWh`}
          subtitle={adminStats.peakLoadTime}
          icon={Activity}
          variant="grid"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${(adminStats.totalBillAmount / 10000000).toFixed(1)}Cr`}
          subtitle="All billing periods"
          icon={IndianRupee}
          variant="backup"
        />
      </div>

      {/* System Load & Monthly Generation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* System Load Pattern */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              System Load Pattern (Hourly Avg)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={systemLoadData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="time" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }}
                    formatter={(value: number, name: string) => [`${value.toLocaleString()} kWh`, name === "load" ? "Consumed" : name === "generated" ? "Generated" : "Solar"]}
                  />
                  <Legend />
                  <defs>
                    <linearGradient id="loadGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--energy-grid))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--energy-grid))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="generated" stroke="hsl(var(--primary))" fill="none" strokeWidth={2} name="Generated" />
                  <Area type="monotone" dataKey="load" stroke="hsl(var(--energy-grid))" fill="url(#loadGrad)" strokeWidth={2} name="Consumed" />
                  <Area type="monotone" dataKey="solar" stroke="hsl(var(--energy-solar))" fill="none" strokeWidth={2} name="Solar" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs fill-muted-foreground" tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "0.75rem" }}
                    formatter={(value: number) => [value.toLocaleString(), "Users"]}
                  />
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly System Consumption (from CSV) */}
      <div className="mb-8">
        <EnergyBarChart
          data={adminMonthlyData.map(d => ({
            month: d.month,
            solar: Math.round(d.solar / 1000),
            grid: Math.round(d.grid / 1000),
            consumed: Math.round(d.consumed / 1000),
          }))}
          title="Monthly System Consumption (×1000 kWh)"
          xAxisKey="month"
          dataKeys={[
            { key: "consumed", name: "Consumed", color: "hsl(var(--primary))" },
            { key: "solar", name: "Solar", color: "hsl(var(--energy-solar))" },
            { key: "grid", name: "Grid", color: "hsl(var(--energy-grid))" },
          ]}
        />
      </div>

      {/* 2025 Solar Generation Table (from XLSX) */}
      <Card className="shadow-card animate-fade-in mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Sun className="w-5 h-5 text-energy-solar" />
            2025 Solar Power Generation Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Generated (kWh)</TableHead>
                  <TableHead className="text-right">Consumed (kWh)</TableHead>
                  <TableHead className="text-right">Grid (kWh)</TableHead>
                  <TableHead className="text-right">Billed (kWh)</TableHead>
                  <TableHead className="text-right">Bill (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solarGenerationMonthly.map((row) => (
                  <TableRow key={row.month}>
                    <TableCell className="font-medium">{row.month} 2025</TableCell>
                    <TableCell className="text-right">{row.generated.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.consumed.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.grid.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{row.billed.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">₹{row.bill.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-secondary/50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{totalSolar2025.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{totalConsumed2025.toLocaleString()}</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">—</TableCell>
                  <TableCell className="text-right">₹{totalBill2025.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Energy Distribution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-energy-solar/10">
                <Sun className="w-8 h-8 text-energy-solar" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Solar (System)</p>
                <p className="text-2xl font-bold text-foreground">
                  {(adminStats.solarGeneration / 1000000).toFixed(1)}M kWh
                </p>
                <p className="text-sm text-accent">
                  {((adminStats.solarGeneration / adminStats.totalConsumption) * 100).toFixed(1)}% of consumed
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-primary/10">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Generated</p>
                <p className="text-2xl font-bold text-foreground">
                  {(adminStats.totalGenerated / 1000000).toFixed(1)}M kWh
                </p>
                <p className="text-sm text-muted-foreground">
                  Across all sources
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-energy-grid/10">
                <Server className="w-8 h-8 text-energy-grid" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. per User</p>
                <p className="text-2xl font-bold text-foreground">
                  {adminStats.averageConsumption.toLocaleString()} kWh
                </p>
                <p className="text-sm text-muted-foreground">Monthly average</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <Card className="shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">System Health Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground">Grid Status</p>
              <p className="text-lg font-semibold text-accent">Online</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground">Solar Status</p>
              <p className="text-lg font-semibold text-accent">Active</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground">Data Records</p>
              <p className="text-lg font-semibold text-accent">10,000</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground">Data Sync</p>
              <p className="text-lg font-semibold text-accent">Real-time</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Data Upload */}
      <div className="mt-8">
        <EnergyDataUpload />
      </div>
    </DashboardLayout>
  );
}
