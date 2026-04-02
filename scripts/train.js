import * as tf from '@tensorflow/tfjs';
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
    // Generate enhanced mock data with seasonal patterns and trends
    const mockData = [];
    const baseConsumption = 150;
    let trend = 0;

    for (let i = 0; i < 1000; i++) {
      // Seasonal pattern (higher in winter, lower in summer)
      const seasonalFactor = 1 + 0.3 * Math.sin(2 * Math.PI * (i % 12) / 12);
      // Add some noise and trend
      const noise = (Math.random() - 0.5) * 20;
      trend += (Math.random() - 0.5) * 0.1; // Slow trend change

      const consumption = baseConsumption * seasonalFactor + trend + noise;
      mockData.push(Math.max(50, consumption)); // Ensure positive values
    }

    const combined = mockData;

    // Enhanced preprocessing: exponential smoothing + trend analysis
    const smoothedData = [];
    const alpha = 0.3;

    for (let i = 0; i < combined.length; i++) {
      if (i === 0) {
        smoothedData.push(combined[i]);
      } else {
        smoothedData.push(alpha * combined[i] + (1 - alpha) * smoothedData[i - 1]);
      }
    }

    const trends = smoothedData.map((val, i) => {
      if (i < 3) return 0;
      return (val - smoothedData[i - 3]) / 3;
    });
    
    // Normalization
    const mean = smoothedData.reduce((a, b) => a + b, 0) / smoothedData.length
    const std = Math.sqrt(smoothedData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / smoothedData.length)
    const normalizedData = smoothedData.map(val => (val - mean) / (std || 1))

    // Enhanced sequences with trend features
    const windowSize = 4;
    const X = [];
    const y = [];

    for (let i = windowSize; i < normalizedData.length; i++) {
      const features = [
        ...normalizedData.slice(i - windowSize, i),
        trends[i] || 0
      ]
      X.push(features)
      y.push(normalizedData[i])
    }

    console.log(`📊 Training on ${combined.length} data points`)
    console.log(`🎯 Generated ${X.length} training sequences`)
    console.log(`🔧 Features per sequence: ${windowSize + 1} (consumption + trend)`)

    // Convert to tensors
    const xs = tf.tensor2d(X, [X.length, windowSize + 1]);
    const ys = tf.tensor1d(y);

    // Create enhanced LSTM model with multi-layer architecture
    const model = tf.sequential();

    // First LSTM layer with L2 regularization
    model.add(tf.layers.lstm({
      units: 64,
      inputShape: [windowSize + 1, 1],
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      returnSequences: true
    }));

    // Dropout for regularization
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Second LSTM layer
    model.add(tf.layers.lstm({
      units: 32,
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
    }));

    // Another dropout
    model.add(tf.layers.dropout({ rate: 0.2 }));

    // Dense output layer
    model.add(tf.layers.dense({ units: 1 }));

    // Compile with optimized settings
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'meanSquaredError',
      metrics: ['mse']
    });

    console.log('🚀 Training enhanced LSTM model...');
    console.log('📊 Model architecture: 64→32 LSTM units with L2 regularization');

    // Early stopping callback
    const earlyStopping = tf.callbacks.earlyStopping({
      monitor: 'val_loss',
      patience: 10
    });

    await model.fit(xs.reshape([X.length, windowSize + 1, 1]), ys, {
      epochs: 200,
      batchSize: 16,
      validationSplit: 0.2,
      callbacks: [earlyStopping],
      verbose: 1
    });

    // Save model (commented out for browser TF.js compatibility)
    // await model.save('file://./model');
    console.log('💾 Model training completed (save skipped for compatibility)');

    // Cleanup
    xs.dispose();
    ys.dispose();

  } catch (error) {
    console.error('Error training model:', error);
  }
}

trainModel();