import tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import csv from 'csv-parser';
import XLSX from 'xlsx';

// Load CSV data
async function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Load Excel data
function loadExcel(filePath) {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(worksheet);
}

async function trainModel() {
  try {
    // Load data
    const dummyData = await loadCSV('./electricity_dummy_10000.csv');
    const realData = loadExcel('./solar_power_generation_2025.xlsx');

    // Extract feature
    const dummyConsumption = dummyData.map(row => parseFloat(row.total_consumed_kvah)).filter(val => !isNaN(val));
    const realConsumption = realData.map(row => parseFloat(row.Consumed)).filter(val => !isNaN(val));

    // Combine data
    const combined = [...dummyConsumption, ...realConsumption];

    // Prepare sequences for LSTM
    const windowSize = 3;
    const X = [];
    const y = [];

    for (let i = 0; i < combined.length - windowSize; i++) {
      X.push(combined.slice(i, i + windowSize));
      y.push(combined[i + windowSize]);
    }

    // Convert to tensors
    const xs = tf.tensor2d(X, [X.length, windowSize]);
    const ys = tf.tensor1d(y);

    // Create LSTM model
    const model = tf.sequential();
    model.add(tf.layers.lstm({ units: 50, inputShape: [windowSize, 1] }));
    model.add(tf.layers.dense({ units: 1 }));

    model.compile({ optimizer: 'adam', loss: 'meanSquaredError' });

    console.log('Training LSTM model...');
    await model.fit(xs.reshape([X.length, windowSize, 1]), ys, {
      epochs: 100,
      batchSize: 32,
      validationSplit: 0.2,
      verbose: 1
    });

    // Save model
    await model.save('file://./model');
    console.log('Model saved to ./model directory');

    // Cleanup
    xs.dispose();
    ys.dispose();

  } catch (error) {
    console.error('Error training model:', error);
  }
}

trainModel();