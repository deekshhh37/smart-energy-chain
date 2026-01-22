// Mock data for Smart Energy Monitoring System

export const dailyUsageData = [
  { time: "00:00", consumption: 1.2, solar: 0, grid: 1.2, backup: 0 },
  { time: "02:00", consumption: 0.8, solar: 0, grid: 0.8, backup: 0 },
  { time: "04:00", consumption: 0.6, solar: 0, grid: 0.6, backup: 0 },
  { time: "06:00", consumption: 1.5, solar: 0.3, grid: 1.2, backup: 0 },
  { time: "08:00", consumption: 3.2, solar: 1.8, grid: 1.4, backup: 0 },
  { time: "10:00", consumption: 4.5, solar: 3.5, grid: 1.0, backup: 0 },
  { time: "12:00", consumption: 5.2, solar: 4.8, grid: 0.4, backup: 0 },
  { time: "14:00", consumption: 4.8, solar: 4.2, grid: 0.6, backup: 0 },
  { time: "16:00", consumption: 4.2, solar: 2.8, grid: 1.4, backup: 0 },
  { time: "18:00", consumption: 5.8, solar: 0.8, grid: 4.5, backup: 0.5 },
  { time: "20:00", consumption: 4.5, solar: 0, grid: 4.0, backup: 0.5 },
  { time: "22:00", consumption: 2.8, solar: 0, grid: 2.8, backup: 0 },
];

export const weeklyUsageData = [
  { day: "Mon", consumption: 42.5, solar: 18.2, grid: 22.3, backup: 2.0 },
  { day: "Tue", consumption: 38.2, solar: 20.5, grid: 16.7, backup: 1.0 },
  { day: "Wed", consumption: 45.8, solar: 22.1, grid: 21.7, backup: 2.0 },
  { day: "Thu", consumption: 41.2, solar: 19.8, grid: 19.4, backup: 2.0 },
  { day: "Fri", consumption: 48.5, solar: 21.3, grid: 25.2, backup: 2.0 },
  { day: "Sat", consumption: 52.3, solar: 24.5, grid: 25.8, backup: 2.0 },
  { day: "Sun", consumption: 35.8, solar: 18.9, grid: 15.4, backup: 1.5 },
];

export const monthlyUsageData = [
  { month: "Jan", consumption: 1250, solar: 380, grid: 820, backup: 50 },
  { month: "Feb", consumption: 1180, solar: 420, grid: 710, backup: 50 },
  { month: "Mar", consumption: 1320, solar: 580, grid: 690, backup: 50 },
  { month: "Apr", consumption: 1150, solar: 720, grid: 380, backup: 50 },
  { month: "May", consumption: 1080, solar: 850, grid: 180, backup: 50 },
  { month: "Jun", consumption: 1420, solar: 980, grid: 390, backup: 50 },
  { month: "Jul", consumption: 1580, solar: 1050, grid: 480, backup: 50 },
  { month: "Aug", consumption: 1620, solar: 1020, grid: 550, backup: 50 },
  { month: "Sep", consumption: 1380, solar: 780, grid: 550, backup: 50 },
  { month: "Oct", consumption: 1280, solar: 520, grid: 710, backup: 50 },
  { month: "Nov", consumption: 1350, solar: 380, grid: 920, backup: 50 },
  { month: "Dec", consumption: 1420, solar: 320, grid: 1050, backup: 50 },
];

export const energySourceDistribution = [
  { name: "Solar", value: 45, color: "hsl(var(--energy-solar))" },
  { name: "Grid", value: 48, color: "hsl(var(--energy-grid))" },
  { name: "Backup", value: 7, color: "hsl(var(--energy-backup))" },
];

export const peakHoursData = [
  { hour: "6 AM", usage: 15 },
  { hour: "7 AM", usage: 28 },
  { hour: "8 AM", usage: 45 },
  { hour: "9 AM", usage: 62 },
  { hour: "10 AM", usage: 78 },
  { hour: "11 AM", usage: 85 },
  { hour: "12 PM", usage: 92 },
  { hour: "1 PM", usage: 88 },
  { hour: "2 PM", usage: 82 },
  { hour: "3 PM", usage: 75 },
  { hour: "4 PM", usage: 68 },
  { hour: "5 PM", usage: 72 },
  { hour: "6 PM", usage: 95 },
  { hour: "7 PM", usage: 100 },
  { hour: "8 PM", usage: 88 },
  { hour: "9 PM", usage: 65 },
  { hour: "10 PM", usage: 42 },
];

export const billingHistory = [
  {
    id: "BILL-2025-001",
    month: "January 2025",
    unitsConsumed: 1250,
    costPerUnit: 0.12,
    totalAmount: 150.0,
    status: "Paid",
    transactionHash: "0x8f4e...3b2a",
    dueDate: "2025-02-15",
    paidDate: "2025-02-10",
  },
  {
    id: "BILL-2024-012",
    month: "December 2024",
    unitsConsumed: 1420,
    costPerUnit: 0.12,
    totalAmount: 170.4,
    status: "Paid",
    transactionHash: "0x7d3c...9f1e",
    dueDate: "2025-01-15",
    paidDate: "2025-01-08",
  },
  {
    id: "BILL-2024-011",
    month: "November 2024",
    unitsConsumed: 1350,
    costPerUnit: 0.11,
    totalAmount: 148.5,
    status: "Paid",
    transactionHash: "0x2a1b...4c5d",
    dueDate: "2024-12-15",
    paidDate: "2024-12-12",
  },
  {
    id: "BILL-2024-010",
    month: "October 2024",
    unitsConsumed: 1280,
    costPerUnit: 0.11,
    totalAmount: 140.8,
    status: "Paid",
    transactionHash: "0x9e8f...7a6b",
    dueDate: "2024-11-15",
    paidDate: "2024-11-10",
  },
];

export const currentBill = {
  id: "BILL-2025-002",
  month: "February 2025",
  unitsConsumed: 1180,
  costPerUnit: 0.12,
  solarCredits: 25.5,
  gridCharges: 141.6,
  taxes: 8.5,
  totalAmount: 124.6,
  status: "Pending",
  transactionHash: "0x4f2a...8c1d",
  dueDate: "2025-03-15",
  billingPeriod: "Feb 1 - Feb 28, 2025",
};

export const adminStats = {
  totalUsers: 12458,
  activeUsers: 11250,
  totalConsumption: 15420000, // kWh
  averageConsumption: 1238, // kWh per user
  peakLoad: 8500, // kW
  peakLoadTime: "7:00 PM - 8:00 PM",
  solarGeneration: 6850000, // kWh
  gridUsage: 8120000, // kWh
  backupUsage: 450000, // kWh
};

export const userGrowthData = [
  { month: "Jul", users: 8500 },
  { month: "Aug", users: 9200 },
  { month: "Sep", users: 9800 },
  { month: "Oct", users: 10500 },
  { month: "Nov", users: 11200 },
  { month: "Dec", users: 11800 },
  { month: "Jan", users: 12458 },
];

export const systemLoadData = [
  { time: "00:00", load: 2500 },
  { time: "04:00", load: 1800 },
  { time: "08:00", load: 4500 },
  { time: "12:00", load: 6200 },
  { time: "16:00", load: 5800 },
  { time: "20:00", load: 8500 },
  { time: "23:00", load: 4200 },
];

export const todayStats = {
  totalConsumption: 38.2,
  solarPercentage: 45,
  gridPercentage: 48,
  backupPercentage: 7,
  costSoFar: 4.58,
  co2Saved: 17.2,
  peakUsage: 5.8,
  averageUsage: 1.59,
};
