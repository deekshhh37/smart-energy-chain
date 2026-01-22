import { Users, Zap, Clock, TrendingUp, Activity, Server } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EnergyBarChart } from "@/components/dashboard/EnergyBarChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminStats, userGrowthData, systemLoadData } from "@/lib/mockData";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Admin() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          System-wide energy monitoring and user management
        </p>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={adminStats.totalUsers.toLocaleString()}
          subtitle={`${adminStats.activeUsers.toLocaleString()} active`}
          icon={Users}
          variant="primary"
        />
        <StatCard
          title="Total Consumption"
          value={`${(adminStats.totalConsumption / 1000000).toFixed(1)}M kWh`}
          subtitle="This month"
          icon={Zap}
          variant="solar"
        />
        <StatCard
          title="Peak Load"
          value={`${(adminStats.peakLoad / 1000).toFixed(1)} MW`}
          subtitle={adminStats.peakLoadTime}
          icon={Activity}
          variant="grid"
        />
        <StatCard
          title="Avg. per User"
          value={`${adminStats.averageConsumption} kWh`}
          subtitle="Monthly average"
          icon={TrendingUp}
          variant="backup"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* User Growth */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">User Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={userGrowthData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      boxShadow: "var(--shadow-lg)",
                    }}
                    formatter={(value: number) => [
                      value.toLocaleString(),
                      "Users",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* System Load */}
        <Card className="shadow-card animate-fade-in">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              System Load (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={systemLoadData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="time"
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} kW`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.75rem",
                      boxShadow: "var(--shadow-lg)",
                    }}
                    formatter={(value: number) => [`${value} kW`, "Load"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="load"
                    stroke="hsl(var(--energy-grid))"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Energy Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-energy-solar/10">
                <Zap className="w-8 h-8 text-energy-solar" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Solar Generation</p>
                <p className="text-2xl font-bold text-foreground">
                  {(adminStats.solarGeneration / 1000000).toFixed(2)}M kWh
                </p>
                <p className="text-sm text-accent">
                  {((adminStats.solarGeneration / adminStats.totalConsumption) * 100).toFixed(0)}%
                  of total
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
                <p className="text-sm text-muted-foreground">Grid Usage</p>
                <p className="text-2xl font-bold text-foreground">
                  {(adminStats.gridUsage / 1000000).toFixed(2)}M kWh
                </p>
                <p className="text-sm text-muted-foreground">
                  {((adminStats.gridUsage / adminStats.totalConsumption) * 100).toFixed(0)}%
                  of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-energy-backup/10">
                <Clock className="w-8 h-8 text-energy-backup" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Backup Usage</p>
                <p className="text-2xl font-bold text-foreground">
                  {(adminStats.backupUsage / 1000).toFixed(0)}K kWh
                </p>
                <p className="text-sm text-muted-foreground">
                  {((adminStats.backupUsage / adminStats.totalConsumption) * 100).toFixed(0)}%
                  of total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Table */}
      <Card className="shadow-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            System Health Overview
          </CardTitle>
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
              <p className="text-sm text-muted-foreground">Backup Status</p>
              <p className="text-lg font-semibold text-accent">Standby</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
              <p className="text-sm text-muted-foreground">Data Sync</p>
              <p className="text-lg font-semibold text-accent">Real-time</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
