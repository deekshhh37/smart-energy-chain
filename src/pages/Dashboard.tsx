import { Zap, Sun, Grid3X3, TrendingUp, Leaf, IndianRupee } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { EnergyLineChart } from "@/components/dashboard/EnergyLineChart";
import { EnergyPieChart } from "@/components/dashboard/EnergyPieChart";
import { AIAlerts } from "@/components/dashboard/AIAlerts";
import { ReportExport } from "@/components/dashboard/ReportExport";
import { EnergyDataUpload } from "@/components/admin/EnergyDataUpload";
import { downloadCSV, printReport } from "@/lib/reportExport";
import {
  dailyUsageData,
  energySourceDistribution,
  todayStats,
} from "@/lib/mockData";

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Energy Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your real-time energy consumption and sources
          </p>
        </div>
        <ReportExport
          onExportCSV={() => downloadCSV(dailyUsageData, "energy-dashboard")}
          onPrint={() => printReport("Energy Dashboard Report")}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        <StatCard
          title="Today's Consumption"
          value={`${todayStats.totalConsumption} kWh`}
          subtitle="Last updated: 2 min ago"
          icon={Zap}
          variant="primary"
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Solar Energy"
          value={`${todayStats.solarPercentage}%`}
          subtitle={`${(todayStats.totalConsumption * todayStats.solarPercentage / 100).toFixed(1)} kWh from solar`}
          icon={Sun}
          variant="solar"
        />
        <StatCard
          title="Grid Usage"
          value={`${todayStats.gridPercentage}%`}
          subtitle={`${(todayStats.totalConsumption * todayStats.gridPercentage / 100).toFixed(1)} kWh from grid`}
          icon={Grid3X3}
          variant="grid"
        />
        <StatCard
          title="Cost So Far"
          value={`₹${todayStats.costSoFar.toLocaleString()}`}
          subtitle="Estimated today"
          icon={IndianRupee}
          variant="backup"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <EnergyLineChart
            data={dailyUsageData}
            title="Today's Energy Usage Trend"
            showSources={true}
          />
        </div>
        <div>
          <EnergyPieChart
            data={energySourceDistribution}
            title="Energy Source Distribution"
          />
        </div>
      </div>

      {/* AI Alerts */}
      <div className="mb-8">
        <AIAlerts />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-card rounded-xl border p-6 shadow-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Peak Usage</p>
              <p className="text-2xl font-bold text-foreground">
                {todayStats.peakUsage} kWh
              </p>
              <p className="text-xs text-muted-foreground">at 1:00 PM</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-accent/10">
              <Leaf className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              <p className="text-2xl font-bold text-foreground">
                {todayStats.co2Saved} kg
              </p>
              <p className="text-xs text-muted-foreground">via solar power</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-6 shadow-card animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-energy-solar/10">
              <Zap className="w-6 h-6 text-energy-solar" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Hourly</p>
              <p className="text-2xl font-bold text-foreground">
                {todayStats.averageUsage} kWh
              </p>
              <p className="text-xs text-muted-foreground">consumption rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Energy Data Upload */}
      <div className="mt-8">
        <EnergyDataUpload />
      </div>
    </DashboardLayout>
  );
}
