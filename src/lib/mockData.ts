// Real data from electricity_dummy_10000.csv and solar_power_generation_2025.xlsx

// ============================================
// USER DASHBOARD DATA (personal/meter level)
// ============================================

// Last day's hourly data (2024-02-21) from CSV
export const dailyUsageData = [
  { time: "00:00", consumption: 32.9, solar: 4.3, grid: 4.3, backup: 0 },
  { time: "01:00", consumption: 44.0, solar: 5.3, grid: 5.3, backup: 0 },
  { time: "02:00", consumption: 39.6, solar: 11.9, grid: 11.9, backup: 0 },
  { time: "03:00", consumption: 43.0, solar: 4.0, grid: 4.0, backup: 0 },
  { time: "04:00", consumption: 41.0, solar: 6.4, grid: 6.4, backup: 0 },
  { time: "05:00", consumption: 36.9, solar: 5.6, grid: 5.6, backup: 0 },
  { time: "06:00", consumption: 40.8, solar: 7.2, grid: 7.2, backup: 0 },
  { time: "07:00", consumption: 35.3, solar: 9.6, grid: 9.6, backup: 0 },
  { time: "08:00", consumption: 32.4, solar: 3.1, grid: 3.1, backup: 0 },
  { time: "09:00", consumption: 43.5, solar: 10.4, grid: 10.4, backup: 0 },
  { time: "10:00", consumption: 43.6, solar: 5.9, grid: 5.9, backup: 0 },
  { time: "11:00", consumption: 38.2, solar: 3.1, grid: 3.1, backup: 0 },
  { time: "12:00", consumption: 38.1, solar: 5.6, grid: 5.6, backup: 0 },
  { time: "13:00", consumption: 44.4, solar: 8.9, grid: 8.9, backup: 0 },
  { time: "14:00", consumption: 35.9, solar: 10.6, grid: 10.6, backup: 0 },
  { time: "15:00", consumption: 35.8, solar: 8.0, grid: 8.0, backup: 0 },
];

// User's today stats derived from last day CSV data
export const todayStats = {
  totalConsumption: 625.5, // kWh total consumed
  solarPercentage: 17.6,   // solar/consumed ratio
  gridPercentage: 82.4,    // grid portion
  backupPercentage: 0,
  costSoFar: 5226.22,     // bill amount for the day (INR)
  co2Saved: 54.95,        // estimated from solar (0.5 kg per kWh solar)
  peakUsage: 44.4,        // max hourly consumption
  averageUsage: 39.1,     // avg hourly consumption
};

export const energySourceDistribution = [
  { name: "Solar", value: 18, color: "hsl(var(--energy-solar))" },
  { name: "Grid", value: 82, color: "hsl(var(--energy-grid))" },
];

// ============================================
// ANALYTICS PAGE DATA
// ============================================

// Weekly data aggregated from CSV (last 7 days available: 2024-02-15 to 2024-02-21)
export const weeklyUsageData = [
  { day: "Feb 15", consumption: 864, solar: 175, grid: 175, backup: 0 },
  { day: "Feb 16", consumption: 871, solar: 181, grid: 181, backup: 0 },
  { day: "Feb 17", consumption: 858, solar: 169, grid: 169, backup: 0 },
  { day: "Feb 18", consumption: 879, solar: 184, grid: 184, backup: 0 },
  { day: "Feb 19", consumption: 862, solar: 177, grid: 177, backup: 0 },
  { day: "Feb 20", consumption: 870, solar: 179, grid: 179, backup: 0 },
  { day: "Feb 21", consumption: 625, solar: 110, grid: 110, backup: 0 },
];

// Real data aggregated from electricity_dummy_10000.csv
export const monthlyUsageData = [
  { month: "2025-01", consumption: 25436, solar: 5490, grid: 5490, generated: 29825, bill: 228979, efficiency: 92.5, savings: 21959 },
  { month: "2025-02", consumption: 23215, solar: 5093, grid: 5093, generated: 27216, bill: 208240, efficiency: 86.8, savings: 20374 },
  { month: "2025-03", consumption: 25708, solar: 5519, grid: 5519, generated: 30452, bill: 231721, efficiency: 86.6, savings: 22075 },
  { month: "2025-04", consumption: 25408, solar: 5393, grid: 5393, generated: 29687, bill: 230302, efficiency: 81.9, savings: 21573 },
  { month: "2025-05", consumption: 26475, solar: 5475, grid: 5475, generated: 30957, bill: 239032, efficiency: 83.6, savings: 21898 },
  { month: "2025-06", consumption: 25543, solar: 5343, grid: 5343, generated: 30270, bill: 227784, efficiency: 82.6, savings: 21371 },
  { month: "2025-07", consumption: 26801, solar: 5511, grid: 5511, generated: 31546, bill: 239899, efficiency: 86.4, savings: 22043 },
  { month: "2025-08", consumption: 26904, solar: 5562, grid: 5562, generated: 31878, bill: 241846, efficiency: 80, savings: 22248 },
  { month: "2025-09", consumption: 26498, solar: 5443, grid: 5443, generated: 30984, bill: 235460, efficiency: 94.1, savings: 21771 },
  { month: "2025-10", consumption: 27445, solar: 5684, grid: 5684, generated: 32368, bill: 244972, efficiency: 93, savings: 22736 },
  { month: "2025-11", consumption: 26767, solar: 5433, grid: 5433, generated: 31502, bill: 236307, efficiency: 90.1, savings: 21731 },
  { month: "2025-12", consumption: 27889, solar: 5612, grid: 5612, generated: 32953, bill: 249024, efficiency: 89.1, savings: 22446 },
];

// Peak hours from CSV hourly averages
export const peakHoursData = [
  { hour: "12 AM", usage: 84 },
  { hour: "1 AM", usage: 85 },
  { hour: "2 AM", usage: 84 },
  { hour: "3 AM", usage: 84 },
  { hour: "4 AM", usage: 85 },
  { hour: "5 AM", usage: 85 },
  { hour: "6 AM", usage: 85 },
  { hour: "7 AM", usage: 85 },
  { hour: "8 AM", usage: 84 },
  { hour: "9 AM", usage: 85 },
  { hour: "10 AM", usage: 86 },
  { hour: "11 AM", usage: 85 },
  { hour: "12 PM", usage: 85 },
  { hour: "1 PM", usage: 85 },
  { hour: "2 PM", usage: 85 },
  { hour: "3 PM", usage: 84 },
  { hour: "4 PM", usage: 85 },
  { hour: "5 PM", usage: 86 },
  { hour: "6 PM", usage: 84 },
  { hour: "7 PM", usage: 85 },
  { hour: "8 PM", usage: 85 },
  { hour: "9 PM", usage: 84 },
  { hour: "10 PM", usage: 85 },
  { hour: "11 PM", usage: 85 },
];

// ============================================
// BILLING PAGE DATA (from 2025 XLSX)
// ============================================

export const billingHistory = [
  {
    id: "BILL-2025-012",
    month: "December 2025",
    unitsConsumed: 38347,
    costPerUnit: 21.52,
    totalAmount: 825506,
    status: "Paid",
    transactionHash: "0x8f4e...3b2a",
    dueDate: "2026-01-15",
    paidDate: "2026-01-10",
  },
  {
    id: "BILL-2025-011",
    month: "November 2025",
    unitsConsumed: 42807,
    costPerUnit: 22.32,
    totalAmount: 955527,
    status: "Paid",
    transactionHash: "0x7d3c...9f1e",
    dueDate: "2025-12-15",
    paidDate: "2025-12-08",
  },
  {
    id: "BILL-2025-010",
    month: "October 2025",
    unitsConsumed: 38082,
    costPerUnit: 25.13,
    totalAmount: 957246,
    status: "Paid",
    transactionHash: "0x2a1b...4c5d",
    dueDate: "2025-11-15",
    paidDate: "2025-11-12",
  },
  {
    id: "BILL-2025-009",
    month: "September 2025",
    unitsConsumed: 30761,
    costPerUnit: 29.50,
    totalAmount: 907559,
    status: "Paid",
    transactionHash: "0x9e8f...7a6b",
    dueDate: "2025-10-15",
    paidDate: "2025-10-10",
  },
  {
    id: "BILL-2025-008",
    month: "August 2025",
    unitsConsumed: 29544,
    costPerUnit: 35.87,
    totalAmount: 1059662,
    status: "Paid",
    transactionHash: "0x3c4d...2e1f",
    dueDate: "2025-09-15",
    paidDate: "2025-09-09",
  },
  {
    id: "BILL-2025-007",
    month: "July 2025",
    unitsConsumed: 34159,
    costPerUnit: 20.05,
    totalAmount: 684838,
    status: "Paid",
    transactionHash: "0x5f6a...8b9c",
    dueDate: "2025-08-15",
    paidDate: "2025-08-11",
  },
];

export const currentBill = {
  id: "BILL-2026-001",
  month: "January 2026",
  unitsConsumed: 40321,
  costPerUnit: 9.16,
  solarCredits: 14400,
  gridCharges: 369496,
  taxes: 18475,
  totalAmount: 369496,
  status: "Pending",
  transactionHash: "0x4f2a...8c1d",
  dueDate: "2026-02-15",
  billingPeriod: "Jan 1 - Jan 31, 2026",
};

// ============================================
// ADMIN DASHBOARD DATA (system-wide from CSV)
// ============================================

// Aggregated from 10,000 hourly records across all meters
export const adminStats = {
  totalUsers: 12458,
  activeUsers: 11250,
  totalConsumption: 361256811, // kWh total from CSV
  averageConsumption: 28993,   // per user monthly avg
  peakLoad: 44436,            // max hourly consumption from CSV
  peakLoadTime: "1:00 PM - 2:00 PM",
  solarGeneration: 74769095,  // total solar from CSV
  gridUsage: 74769095,        // total grid from CSV (same as solar in this dataset)
  backupUsage: 0,
  totalBillAmount: 3230190310, // total billing from CSV
  totalGenerated: 425078244,   // total generated from CSV
};

// Monthly system-wide data from CSV (2023)
export const adminMonthlyData = [
  { month: "Jan 23", generated: 29824819, consumed: 25436421, grid: 5489802, solar: 5489802, bill: 228978523 },
  { month: "Feb 23", generated: 27216442, consumed: 23215183, grid: 5093489, solar: 5093489, bill: 208239848 },
  { month: "Mar 23", generated: 30452218, consumed: 25708435, grid: 5518863, solar: 5518863, bill: 231720718 },
  { month: "Apr 23", generated: 29686951, consumed: 25408053, grid: 5393289, solar: 5393289, bill: 230301803 },
  { month: "May 23", generated: 30956918, consumed: 26475437, grid: 5474580, solar: 5474580, bill: 239032419 },
  { month: "Jun 23", generated: 30269972, consumed: 25542702, grid: 5342724, solar: 5342724, bill: 227783975 },
  { month: "Jul 23", generated: 31546239, consumed: 26800509, grid: 5510842, solar: 5510842, bill: 239899283 },
  { month: "Aug 23", generated: 31877617, consumed: 26903814, grid: 5561971, solar: 5561971, bill: 241845794 },
  { month: "Sep 23", generated: 30983866, consumed: 26498054, grid: 5442732, solar: 5442732, bill: 235459576 },
  { month: "Oct 23", generated: 32367833, consumed: 27445429, grid: 5684022, solar: 5684022, bill: 244971578 },
  { month: "Nov 23", generated: 31501817, consumed: 26766720, grid: 5432734, solar: 5432734, bill: 236306648 },
  { month: "Dec 23", generated: 32953192, consumed: 27889028, grid: 5611516, solar: 5611516, bill: 249024112 },
  { month: "Jan 24", generated: 33168308, consumed: 28191976, grid: 5536607, solar: 5536607, bill: 247437279 },
  { month: "Feb 24", generated: 22272052, consumed: 18975050, grid: 3675924, solar: 3675924, bill: 169188754 },
];

// System-wide hourly load pattern (averaged from all CSV records)
export const systemLoadData = [
  { time: "00:00", load: 36105, generated: 42407, solar: 7603 },
  { time: "02:00", load: 35883, generated: 42550, solar: 7685 },
  { time: "04:00", load: 36215, generated: 42610, solar: 7475 },
  { time: "06:00", load: 36167, generated: 42381, solar: 7548 },
  { time: "08:00", load: 35676, generated: 42649, solar: 7381 },
  { time: "10:00", load: 36406, generated: 42505, solar: 7623 },
  { time: "12:00", load: 36062, generated: 42296, solar: 7352 },
  { time: "14:00", load: 35995, generated: 42529, solar: 7446 },
  { time: "16:00", load: 36283, generated: 42424, solar: 7424 },
  { time: "18:00", load: 35971, generated: 42609, solar: 7349 },
  { time: "20:00", load: 36221, generated: 42432, solar: 7475 },
  { time: "22:00", load: 36226, generated: 42725, solar: 7475 },
];

// User growth data (keeping simulated growth)
export const userGrowthData = [
  { month: "Jul 23", users: 8500 },
  { month: "Sep 23", users: 9800 },
  { month: "Nov 23", users: 11200 },
  { month: "Jan 24", users: 12458 },
  { month: "Mar 24", users: 13200 },
  { month: "May 24", users: 14100 },
  { month: "Jul 24", users: 15300 },
];

// 2025 solar generation data from XLSX (for admin solar panel)
export const solarGenerationMonthly = [
  { month: "Jan", generated: 54721, consumed: 40321, grid: 14400, billed: 19896, bill: 369496 },
  { month: "Feb", generated: 52577, consumed: 45281, grid: 7296, billed: 46960, bill: 609971 },
  { month: "Mar", generated: 61235, consumed: 52563, grid: 8672, billed: 49800, bill: 634061 },
  { month: "Apr", generated: 55337, consumed: 48737, grid: 6600, billed: 81056, bill: 869373 },
  { month: "May", generated: 52869, consumed: 49277, grid: 3592, billed: 74080, bill: 887332 },
  { month: "Jun", generated: 46307, consumed: 35403, grid: 10904, billed: 30024, bill: 457021 },
  { month: "Jul", generated: 40351, consumed: 34159, grid: 6192, billed: 55640, bill: 684838 },
  { month: "Aug", generated: 34632, consumed: 29544, grid: 5088, billed: 76312, bill: 1059662 },
  { month: "Sep", generated: 37373, consumed: 30761, grid: 6612, billed: 58620, bill: 907559 },
  { month: "Oct", generated: 46266, consumed: 38082, grid: 8184, billed: 64656, bill: 957246 },
  { month: "Nov", generated: 49335, consumed: 42807, grid: 6528, billed: 65064, bill: 955527 },
  { month: "Dec", generated: 48187, consumed: 38347, grid: 9840, billed: 46560, bill: 825506 },
];
