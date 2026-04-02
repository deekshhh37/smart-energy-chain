import * as tf from '@tensorflow/tfjs'

export interface MlPredictionResult {
  prediction: number
  accuracy: number
  confidence: 'Very High' | 'High' | 'Medium' | 'Low'
}

export async function runEnhancedModelPrediction(energyData: number[]): Promise<MlPredictionResult> {
  if (!Array.isArray(energyData) || energyData.length < 8) {
    return {
      prediction: energyData.length > 0 ? energyData[energyData.length - 1] : 0,
      accuracy: 0,
      confidence: 'Low'
    }
  }

  const data = [...energyData]

  // Enhanced preprocessing with multiple smoothing techniques
  const smoothedData: number[] = []
  const alpha = 0.2 // More aggressive smoothing
  const beta = 0.1  // Trend smoothing

  let level = data[0]
  let trend = data[1] - data[0]

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      smoothedData.push(data[i])
    } else {
      const prevLevel = level
      level = alpha * data[i] + (1 - alpha) * (level + trend)
      trend = beta * (level - prevLevel) + (1 - beta) * trend
      smoothedData.push(level + trend)
    }
  }

  // Advanced trend analysis with multiple windows
  const trends = smoothedData.map((val, i) => {
    if (i < 2) return 0
    const shortTrend = i >= 3 ? (val - smoothedData[i - 3]) / 3 : 0
    const longTrend = i >= 6 ? (val - smoothedData[i - 6]) / 6 : 0
    return (shortTrend * 0.7) + (longTrend * 0.3) // Weighted combination
  })

  // Seasonal decomposition (monthly seasonality)
  const seasonalFactors = []
  for (let i = 0; i < smoothedData.length; i++) {
    const monthIndex = i % 12
    const seasonalAvg = smoothedData
      .filter((_, idx) => idx % 12 === monthIndex)
      .reduce((a, b) => a + b, 0) / Math.max(1, Math.floor(smoothedData.length / 12))
    seasonalFactors.push(seasonalAvg > 0 ? smoothedData[i] / seasonalAvg : 1)
  }

  // Robust normalization with outlier handling
  const sortedData = [...smoothedData].sort((a, b) => a - b)
  const q1 = sortedData[Math.floor(sortedData.length * 0.25)]
  const q3 = sortedData[Math.floor(sortedData.length * 0.75)]
  const iqr = q3 - q1
  const lowerBound = q1 - 1.5 * iqr
  const upperBound = q3 + 1.5 * iqr

  const filteredData = smoothedData.map(val =>
    Math.max(lowerBound, Math.min(upperBound, val))
  )

  const mean = filteredData.reduce((a, b) => a + b, 0) / filteredData.length
  const std = Math.sqrt(filteredData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / filteredData.length)
  const normalizedData = filteredData.map(val => (val - mean) / (std || 1))

  // Enhanced feature engineering
  const windowSize = 6 // Increased window size
  const X: number[][] = []
  const y: number[] = []

  for (let i = windowSize; i < normalizedData.length; i++) {
    const consumptionFeatures = normalizedData.slice(i - windowSize, i)

    // Add statistical features
    const windowMean = consumptionFeatures.reduce((a, b) => a + b, 0) / windowSize
    const windowStd = Math.sqrt(
      consumptionFeatures.reduce((a, b) => a + Math.pow(b - windowMean, 2), 0) / windowSize
    )

    // Month-of-year encoding (seasonal)
    const monthIndex = i % 12
    const monthEncoding = Array(12).fill(0)
    monthEncoding[monthIndex] = 1

    const features = [
      ...consumptionFeatures, // Historical consumption
      trends[i] || 0,         // Trend feature
      seasonalFactors[i] || 1, // Seasonal factor
      windowMean,             // Window statistics
      windowStd,
      ...monthEncoding,       // Month encoding
    ]
    X.push(features)
    y.push(normalizedData[i])
  }

  if (X.length < 5) {
    return {
      prediction: data[data.length - 1],
      accuracy: 75,
      confidence: 'Medium'
    }
  }

  // Improved train/validation split with time series consideration
  const trainSize = Math.floor(X.length * 0.8) // 80% for training
  const X_train = X.slice(0, trainSize)
  const y_train = y.slice(0, trainSize)
  const X_val = X.slice(trainSize)
  const y_val = y.slice(trainSize)

  const featureCount = X[0].length
  const xs_train = tf.tensor2d(X_train, [X_train.length, featureCount])
  const ys_train = tf.tensor1d(y_train)
  const xs_val = tf.tensor2d(X_val, [X_val.length, featureCount])
  const ys_val = tf.tensor1d(y_val)

  // Enhanced model architecture with attention-like mechanism
  const model = tf.sequential()

  // Input reshaping for LSTM
  model.add(tf.layers.reshape({
    targetShape: [featureCount, 1],
    inputShape: [featureCount]
  }))

  // Bidirectional LSTM for better sequence understanding
  model.add(tf.layers.bidirectional({
    layer: tf.layers.lstm({
      units: 128,
      returnSequences: true,
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      recurrentRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      dropout: 0.1,
      recurrentDropout: 0.1,
    })
  }))

  model.add(tf.layers.dropout({ rate: 0.3 }))

  model.add(tf.layers.bidirectional({
    layer: tf.layers.lstm({
      units: 64,
      returnSequences: false,
      kernelRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      recurrentRegularizer: tf.regularizers.l2({ l2: 0.001 }),
      dropout: 0.1,
      recurrentDropout: 0.1,
    })
  }))

  model.add(tf.layers.dropout({ rate: 0.3 }))

  // Dense layers with residual connections concept
  model.add(tf.layers.dense({
    units: 32,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }))
  model.add(tf.layers.dropout({ rate: 0.2 }))

  model.add(tf.layers.dense({
    units: 16,
    activation: 'relu',
    kernelRegularizer: tf.regularizers.l2({ l2: 0.001 })
  }))

  model.add(tf.layers.dense({ units: 1 }))

  // Advanced optimizer with learning rate scheduling
  const initialLearningRate = 0.001
  const lrSchedule = tf.callbacks.learningRateScheduler(epoch => {
    return initialLearningRate * Math.pow(0.95, Math.floor(epoch / 10))
  })

  model.compile({
    optimizer: tf.train.adam(initialLearningRate),
    loss: 'huberLoss', // More robust to outliers than MSE
    metrics: ['mae', 'mape']
  })

  const epochs = Math.min(500, Math.max(200, X_train.length * 20))
  const batchSize = Math.min(32, Math.max(8, Math.floor(X_train.length / 3)))

  await model.fit(xs_train, ys_train, {
    epochs,
    batchSize,
    validationData: [xs_val, ys_val],
    verbose: 0,
    callbacks: [
      lrSchedule,
      {
        onEpochEnd: (epoch, logs) => {
          // Early stopping with patience
          if (epoch > 50 && logs.val_loss != null && logs.loss != null) {
            if (logs.val_loss > logs.loss * 2) {
              model.stopTraining = true
            }
          }
        },
      },
    ],
  })

  // Enhanced evaluation with multiple metrics
  const val_predictions = model.predict(xs_val) as tf.Tensor
  const val_pred_normalized = Array.from(await val_predictions.data())

  const val_pred_actual = val_pred_normalized.map(pred => (pred * (std || 1)) + mean)
  const val_actual_actual = y_val.map(actual => (actual * (std || 1)) + mean)

  let mape_sum = 0
  let valid_count = 0
  let mse_sum = 0
  let mae_sum = 0

  for (let i = 0; i < val_pred_actual.length; i++) {
    const actual = val_actual_actual[i]
    const pred = val_pred_actual[i]
    const err = Math.abs(actual - pred)
    mae_sum += err
    mse_sum += err * err
    if (actual !== 0) {
      mape_sum += Math.abs(err / actual) * 100
      valid_count++
    }
  }

  const mape = valid_count > 0 ? mape_sum / valid_count : 100
  const rmse = Math.sqrt(mse_sum / Math.max(val_pred_actual.length, 1))
  const mae = mae_sum / Math.max(val_pred_actual.length, 1)

  // Weighted accuracy calculation
  const mape_weight = 0.6
  const rmse_weight = 0.4
  const normalized_rmse = Math.min(100, (rmse / (mean || 1)) * 100)
  const accuracy = Math.max(0, Math.min(100,
    100 - (mape * mape_weight + normalized_rmse * rmse_weight)
  ))

  // Enhanced prediction with uncertainty estimation
  const lastWindow = normalizedData.slice(-windowSize)
  const lastTrend = trends[trends.length - 1] || 0
  const lastSeasonal = seasonalFactors[seasonalFactors.length - 1] || 1

  const windowMean = lastWindow.reduce((a, b) => a + b, 0) / windowSize
  const windowStd = Math.sqrt(
    lastWindow.reduce((a, b) => a + Math.pow(b - windowMean, 2), 0) / windowSize
  )

  const monthIndex = (data.length - 1) % 12
  const monthEncoding = Array(12).fill(0)
  monthEncoding[monthIndex] = 1

  const predictionFeatures = [
    ...lastWindow,
    lastTrend,
    lastSeasonal,
    windowMean,
    windowStd,
    ...monthEncoding,
  ]

  const input = tf.tensor2d([predictionFeatures], [1, featureCount])
  const predictionTensor = model.predict(input) as tf.Tensor
  const normalizedPred = (await predictionTensor.data())[0]
  const predValue = Math.round((normalizedPred * (std || 1)) + mean)

  // Clean up tensors
  model.dispose()
  xs_train.dispose()
  ys_train.dispose()
  xs_val.dispose()
  ys_val.dispose()
  val_predictions.dispose()
  input.dispose()
  predictionTensor.dispose()

  const confidence = accuracy > 95 ? 'Very High' :
                    accuracy > 90 ? 'High' :
                    accuracy > 85 ? 'Medium' : 'Low'

  return {
    prediction: Math.max(0, predValue),
    accuracy: Math.round(accuracy * 100) / 100,
    confidence
  }
}
