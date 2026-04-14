// Process CSV data and convert to dashboard-compatible format

export interface HourlyData {
  timestamp: string;
  generated: number;
  avg_kvah: number;
  consumed: number;
  grid: number;
  total_consumed_kvah: number;
  billed_kvah: number;
  solar_kvah: number;
  banked_solar_kvah: number;
  bill_amount: number;
}

export interface DailyStats {
  date: string;
  consumption: number;
  solar: number;
  grid: number;
  backup: number;
  bill: number;
  generated: number;
}

export interface DashboardData {
  dailyUsageData: Array<{ time: string; consumption: number; solar: number; grid: number; backup: number }>;
  todayStats: {
    totalConsumption: number;
    solarPercentage: number;
    gridPercentage: number;
    backupPercentage: number;
    costSoFar: number;
    co2Saved: number;
    peakUsage: number;
    averageUsage: number;
  };
  weeklyUsageData: Array<{ day: string; consumption: number; solar: number; grid: number; backup: number }>;
}

// Parse CSV from string
export function parseCSVData(csvText: string): HourlyData[] {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map((line, idx) => {
    const values = line.split(',');
    return {
      timestamp: values[0],
      generated: parseFloat(values[1]),
      avg_kvah: parseFloat(values[2]),
      consumed: parseFloat(values[3]),
      grid: parseFloat(values[4]),
      total_consumed_kvah: parseFloat(values[5]),
      billed_kvah: parseFloat(values[6]),
      solar_kvah: parseFloat(values[7]),
      banked_solar_kvah: parseFloat(values[8]),
      bill_amount: parseFloat(values[9]),
    };
  });
}

// Group by day
export function groupByDay(data: HourlyData[]): Map<string, HourlyData[]> {
  const grouped = new Map<string, HourlyData[]>();
  
  data.forEach(row => {
    const date = row.timestamp.split(' ')[0];
    if (!grouped.has(date)) {
      grouped.set(date, []);
    }
    grouped.get(date)!.push(row);
  });
  
  return grouped;
}

// Calculate daily stats
export function calculateDailyStats(hourlyData: HourlyData[]): DailyStats {
  const totalConsumption = hourlyData.reduce((sum, h) => sum + h.consumed, 0);
  const totalSolar = hourlyData.reduce((sum, h) => sum + h.solar_kvah, 0);
  const totalGrid = hourlyData.reduce((sum, h) => sum + h.grid, 0);
  const totalBill = hourlyData.reduce((sum, h) => sum + h.bill_amount, 0);
  const totalGenerated = hourlyData.reduce((sum, h) => sum + h.generated, 0);
  
  return {
    date: hourlyData[0].timestamp.split(' ')[0],
    consumption: totalConsumption,
    solar: totalSolar,
    grid: totalGrid,
    backup: 0,
    bill: totalBill,
    generated: totalGenerated,
  };
}

// Convert daily stats to dashboard format
export function processDashboardData(csvData: HourlyData[]): DashboardData {
  const grouped = groupByDay(csvData);
  const dailyStatsArray = Array.from(grouped.values()).map(calculateDailyStats);
  
  // Get last day's data for dashboard
  const lastDay = dailyStatsArray[dailyStatsArray.length - 1];
  const lastDayHourly = Array.from(grouped.values())[grouped.size - 1] || [];
  
  // Format hourly data for today
  const dailyUsageData = lastDayHourly.map((h, idx) => {
    const hours = String(idx).padStart(2, '0');
    return {
      time: `${hours}:00`,
      consumption: h.consumed / 1000, // Convert to kWh
      solar: h.solar_kvah / 1000,
      grid: h.grid / 1000,
      backup: 0,
    };
  });
  
  // Calculate stats
  const totalConsumption = lastDay.consumption;
  const totalSolar = lastDay.solar;
  const totalGrid = lastDay.grid;
  const solarPercentage = totalConsumption > 0 ? (totalSolar / totalConsumption) * 100 : 0;
  const gridPercentage = 100 - solarPercentage;
  const averageUsage = dailyUsageData.reduce((sum, d) => sum + d.consumption, 0) / dailyUsageData.length;
  const peakUsage = Math.max(...dailyUsageData.map(d => d.consumption));
  
  // Calculate weekly data (last 7 days)
  const weeklyUsageData = dailyStatsArray.slice(-7).map((stat, idx) => ({
    day: `Day ${idx + 1}`,
    consumption: stat.consumption,
    solar: stat.solar,
    grid: stat.grid,
    backup: 0,
  }));
  
  return {
    dailyUsageData,
    todayStats: {
      totalConsumption: totalConsumption / 1000,
      solarPercentage: Math.round(solarPercentage * 10) / 10,
      gridPercentage: Math.round(gridPercentage * 10) / 10,
      backupPercentage: 0,
      costSoFar: lastDay.bill,
      co2Saved: (totalSolar / 1000) * 0.5, // 0.5 kg CO2 saved per kWh solar
      peakUsage: peakUsage,
      averageUsage: averageUsage,
    },
    weeklyUsageData,
  };
}

// Fetch and process CSV from public folder
export async function loadCSVData(): Promise<DashboardData> {
  try {
    const response = await fetch('/electricity_dummy_10000.csv');
    const csvText = await response.text();
    const hourlyData = parseCSVData(csvText);
    return processDashboardData(hourlyData);
  } catch (error) {
    console.error('Failed to load CSV data:', error);
    throw error;
  }
}
