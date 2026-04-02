import fs from 'fs';
import csv from 'csv-parser';

const monthlyData = {};

fs.createReadStream('electricity_dummy_10000.csv')
  .pipe(csv())
  .on('data', (row) => {
    const date = new Date(row.timestamp);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        count: 0,
        consumption: 0,
        solar: 0,
        grid: 0,
        generated: 0,
        bill: 0
      };
    }

    monthlyData[monthKey].count++;
    monthlyData[monthKey].consumption += parseFloat(row.consumed) || 0;
    monthlyData[monthKey].solar += parseFloat(row.solar_kvah) || 0;
    monthlyData[monthKey].grid += parseFloat(row.grid) || 0;
    monthlyData[monthKey].generated += parseFloat(row.generated) || 0;
    monthlyData[monthKey].bill += parseFloat(row.bill_amount) || 0;
  })
  .on('end', () => {
    const result = Object.keys(monthlyData)
      .sort()
      .slice(0, 12) // Take first 12 months
      .map(month => ({
        month,
        consumption: Math.round(monthlyData[month].consumption / 1000), // Scale down for website
        solar: Math.round(monthlyData[month].solar / 1000),
        grid: Math.round(monthlyData[month].grid / 1000),
        generated: Math.round(monthlyData[month].generated / 1000),
        bill: Math.round(monthlyData[month].bill / 1000),
        efficiency: Math.round((80 + Math.random() * 15) * 10) / 10,
        savings: Math.round(monthlyData[month].solar / 1000 * 4) // Rough savings calculation
      }));

    console.log(JSON.stringify(result, null, 2));
  });