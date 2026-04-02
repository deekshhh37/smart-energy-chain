// Test script to calculate LSTM model accuracy
// Run with: node scripts/test_accuracy.js

import * as tf from 'https://esm.sh/@tensorflow/tfjs'

// Mock energy data for testing
const mockData = [
  { consumption_kwh: 120, month: 1, year: 2024 },
  { consumption_kwh: 135, month: 2, year: 2024 },
  { consumption_kwh: 118, month: 3, year: 2024 },
  { consumption_kwh: 142, month: 4, year: 2024 },
  { consumption_kwh: 158, month: 5, year: 2024 },
  { consumption_kwh: 165, month: 6, year: 2024 },
  { consumption_kwh: 172, month: 7, year: 2024 },
  { consumption_kwh: 168, month: 8, year: 2024 },
  { consumption_kwh: 155, month: 9, year: 2024 },
  { consumption_kwh: 148, month: 10, year: 2024 },
  { consumption_kwh: 138, month: 11, year: 2024 },
  { consumption_kwh: 152, month: 12, year: 2024 },
]

async function testModelAccuracy() {
  console.log('🧠 Testing LSTM Model Accuracy...\n')

  const data = mockData.map(u => u.consumption_kwh)
  const windowSize = 3
  const X = []
  const y = []

  // Create sequences
  for (let i = 0; i < data.length - windowSize; i++) {
    X.push(data.slice(i, i + windowSize))
    y.push(data[i + windowSize])
  }

  // Split train/validation
  const trainSize = Math.floor(X.length * 0.8)
  const X_train = X.slice(0, trainSize)
  const y_train = y.slice(0, trainSize)
  const X_val = X.slice(trainSize)
  const y_val = y.slice(trainSize)

  console.log(`📊 Data: ${data.length} months`)
  console.log(`🎯 Training sequences: ${X_train.length}`)
  console.log(`✅ Validation sequences: ${X_val.length}\n`)

  // Convert to tensors
  const xs_train = tf.tensor2d(X_train, [X_train.length, windowSize])
  const ys_train = tf.tensor1d(y_train)
  const xs_val = tf.tensor2d(X_val, [X_val.length, windowSize])
  const ys_val = tf.tensor1d(y_val)

  // Create model
  const model = tf.sequential()
  model.add(tf.layers.lstm({ units: 10, inputShape: [windowSize, 1] }))
  model.add(tf.layers.dense({ units: 1 }))
  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' })

  // Train
  console.log('🚀 Training LSTM model...')
  await model.fit(xs_train.reshape([X_train.length, windowSize, 1]), ys_train, {
    epochs: 50,
    validationData: [xs_val.reshape([X_val.length, windowSize, 1]), ys_val],
    verbose: 0
  })

  // Calculate accuracy
  const val_predictions = model.predict(xs_val.reshape([X_val.length, windowSize, 1]))
  const val_pred_array = val_predictions.dataSync()
  const val_actual_array = ys_val.dataSync()

  let mape_sum = 0
  let valid_predictions = 0
  let mse_sum = 0

  console.log('\n📈 Validation Results:')
  console.log('Month | Actual | Predicted | Error | % Error')
  console.log('------|--------|-----------|-------|--------')

  for (let i = 0; i < val_pred_array.length; i++) {
    const actual = val_actual_array[i]
    const predicted = val_pred_array[i]
    const error = Math.abs(actual - predicted)
    const percent_error = actual !== 0 ? (error / actual) * 100 : 0

    console.log(`${i + trainSize + windowSize + 1}    | ${actual.toFixed(1)}   | ${predicted.toFixed(1)}     | ${error.toFixed(1)}  | ${percent_error.toFixed(1)}%`)

    if (actual !== 0) {
      mape_sum += percent_error
      valid_predictions++
    }
    mse_sum += error * error
  }

  const mape = valid_predictions > 0 ? mape_sum / valid_predictions : 100
  const mse = mse_sum / val_pred_array.length
  const rmse = Math.sqrt(mse)
  const accuracy = Math.max(0, Math.min(100, 100 - mape))

  console.log(`\n🎯 Model Performance Metrics:`)
  console.log(`• Mean Absolute Percentage Error (MAPE): ${mape.toFixed(2)}%`)
  console.log(`• Root Mean Square Error (RMSE): ${rmse.toFixed(2)} kWh`)
  console.log(`• Model Accuracy: ${accuracy.toFixed(1)}%`)

  let confidence = 'Low'
  if (accuracy > 80) confidence = 'High'
  else if (accuracy > 60) confidence = 'Medium'

  console.log(`• Confidence Level: ${confidence}`)

  // Cleanup
  model.dispose()
  xs_train.dispose()
  ys_train.dispose()
  xs_val.dispose()
  ys_val.dispose()
  val_predictions.dispose()

  console.log('\n✅ Accuracy testing complete!')
}

testModelAccuracy().catch(console.error)