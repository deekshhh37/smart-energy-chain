import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as tf from 'https://esm.sh/@tensorflow/tfjs'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EnergyData {
  consumption_kwh: number
  solar_kwh: number
  grid_kwh: number
  bill_amount: number
  month: number
  year: number
}

interface WeeklyData {
  time: string
  consumption: number
  solar: number
  grid: number
  backup: number
}

interface MonthlyData {
  month: string
  consumption: number
  solar: number
  grid: number
  bill: number
}

interface PeakHoursData {
  hour: string
  consumption: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Fetch user's energy uploads
    const { data: uploads, error } = await supabaseClient
      .from('energy_uploads')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false })

    if (error) throw error

    // Aggregate data
    let monthlyData: MonthlyData[] = uploads.map(u => ({
      month: `${u.year}-${String(u.month).padStart(2, '0')}`,
      consumption: u.consumption_kwh,
      solar: u.solar_kwh,
      grid: u.grid_kwh,
      bill: u.bill_amount
    }))

    // Fallback sample data when user hasn't uploaded anything yet
    if (monthlyData.length === 0) {
      monthlyData = [
        { month: '2025-01', consumption: 140, solar: 45, grid: 90, bill: 70 },
        { month: '2025-02', consumption: 132, solar: 40, grid: 85, bill: 65 },
        { month: '2025-03', consumption: 150, solar: 50, grid: 95, bill: 75 },
        { month: '2025-04', consumption: 160, solar: 55, grid: 100, bill: 80 },
        { month: '2025-05', consumption: 155, solar: 52, grid: 98, bill: 78 },
        { month: '2025-06', consumption: 148, solar: 48, grid: 95, bill: 74 },
        { month: '2025-07', consumption: 170, solar: 60, grid: 100, bill: 85 },
        { month: '2025-08', consumption: 165, solar: 58, grid: 98, bill: 84 },
        { month: '2025-09', consumption: 158, solar: 54, grid: 96, bill: 80 },
        { month: '2025-10', consumption: 152, solar: 50, grid: 94, bill: 77 },
        { month: '2025-11', consumption: 148, solar: 47, grid: 93, bill: 75 },
        { month: '2025-12', consumption: 162, solar: 55, grid: 98, bill: 82 },
      ]
    }

    // For weekly data: approximate last 7 days from last month
    const lastUpload = uploads[0]
    if (lastUpload) {
      const daysInMonth = new Date(lastUpload.year, lastUpload.month, 0).getDate()
      const dailyConsumption = lastUpload.consumption_kwh / daysInMonth
      const dailySolar = lastUpload.solar_kwh / daysInMonth
      const dailyGrid = lastUpload.grid_kwh / daysInMonth
      const dailyBackup = 0 // Assuming no backup data

      const weeklyData: WeeklyData[] = []
      const today = new Date()
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(today.getDate() - i)
        weeklyData.push({
          time: date.toLocaleDateString('en-US', { weekday: 'short' }),
          consumption: Math.round(dailyConsumption),
          solar: Math.round(dailySolar),
          grid: Math.round(dailyGrid),
          backup: dailyBackup
        })
      }
    } else {
      // Fallback to mock if no data
      weeklyData = []
    }

    // Peak hours: approximate based on consumption
    const peakHoursData: PeakHoursData[] = [
      { hour: '6AM', consumption: Math.round(dailyConsumption * 0.5) },
      { hour: '8AM', consumption: Math.round(dailyConsumption * 0.8) },
      { hour: '10AM', consumption: Math.round(dailyConsumption * 0.6) },
      { hour: '12PM', consumption: Math.round(dailyConsumption * 0.7) },
      { hour: '2PM', consumption: Math.round(dailyConsumption * 0.9) },
      { hour: '4PM', consumption: Math.round(dailyConsumption * 1.0) },
      { hour: '6PM', consumption: Math.round(dailyConsumption * 1.2) },
      { hour: '8PM', consumption: Math.round(dailyConsumption * 1.1) },
      { hour: '10PM', consumption: Math.round(dailyConsumption * 0.8) },
    ]

    // ML Prediction: LSTM for next month consumption
    const result = await predictNextMonth(uploads)

    return new Response(
      JSON.stringify({
        weeklyData,
        monthlyData,
        peakHoursData,
        prediction: result.prediction,
        accuracy: result.accuracy,
        confidence: result.confidence
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function predictNextMonth(uploads: EnergyData[]): Promise<{prediction: number, accuracy: number, confidence: string}> {
  if (uploads.length < 6) return {
    prediction: uploads.length > 0 ? uploads[uploads.length - 1].consumption_kwh : 0,
    accuracy: 0,
    confidence: 'Low (insufficient data)'
  }

  // Enhanced data preprocessing
  const data = uploads.map(u => u.consumption_kwh)
  
  // Add data smoothing and trend analysis
  const smoothedData = data.map((val, i) => {
    if (i < 2) return val
    // Exponential moving average for smoothing
    const alpha = 0.3
    return alpha * val + (1 - alpha) * smoothedData[i - 1]
  })
  
  // Calculate trend indicators
  const trends = smoothedData.map((val, i) => {
    if (i < 3) return 0
    return (val - smoothedData[i - 3]) / 3 // 3-month trend
  })
  
  // Normalize data for better training
  const mean = smoothedData.reduce((a, b) => a + b, 0) / smoothedData.length
  const std = Math.sqrt(smoothedData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / smoothedData.length)
  const normalizedData = smoothedData.map(val => (val - mean) / (std || 1))
  
  const windowSize = 4 // Increased window size for better pattern recognition
  const X = []
  const y = []

  for (let i = windowSize; i < normalizedData.length; i++) {
    const features = [
      ...normalizedData.slice(i - windowSize, i),
      trends[i] || 0 // Add trend as additional feature
    ]
    X.push(features)
    y.push(normalizedData[i])
  }

  if (X.length < 3) return {
    prediction: data[data.length - 1],
    accuracy: 0,
    confidence: 'Low (minimal data)'
  }

  // Improved train/validation split (75/25)
  const trainSize = Math.floor(X.length * 0.75)
  const X_train = X.slice(0, trainSize)
  const y_train = y.slice(0, trainSize)
  const X_val = X.slice(trainSize)
  const y_val = y.slice(trainSize)

  // Convert to tensors
  const xs_train = tf.tensor2d(X_train, [X_train.length, windowSize + 1]) // +1 for trend feature
  const ys_train = tf.tensor1d(y_train)
  const xs_val = tf.tensor2d(X_val, [X_val.length, windowSize + 1])
  const ys_val = tf.tensor1d(y_val)

  // Create enhanced LSTM model with multiple layers and regularization
  const model = tf.sequential()
  
  // First LSTM layer with return sequences for stacking
  model.add(tf.layers.lstm({ 
    units: 64, 
    inputShape: [windowSize + 1, 1], // +1 for trend feature
    returnSequences: true,
    kernel_regularizer: tf.regularizers.l2({ l2: 0.01 }),
    recurrent_regularizer: tf.regularizers.l2({ l2: 0.01 })
  }))
  
  // Dropout to prevent overfitting
  model.add(tf.layers.dropout({ rate: 0.2 }))
  
  // Second LSTM layer
  model.add(tf.layers.lstm({ 
    units: 32,
    kernel_regularizer: tf.regularizers.l2({ l2: 0.01 }),
    recurrent_regularizer: tf.regularizers.l2({ l2: 0.01 })
  }))
  
  // Another dropout layer
  model.add(tf.layers.dropout({ rate: 0.2 }))
  
  // Dense layers for better feature extraction
  model.add(tf.layers.dense({ 
    units: 16, 
    activation: 'relu',
    kernel_regularizer: tf.regularizers.l2({ l2: 0.01 })
  }))
  
  model.add(tf.layers.dense({ units: 1 }))

  // Advanced optimizer with custom learning rate
  const optimizer = tf.train.adam(0.001)
  
  model.compile({ 
    optimizer: optimizer, 
    loss: 'meanSquaredError',
    metrics: ['mae', 'mape']
  })

  // Adaptive training with more epochs for better learning
  const epochs = Math.min(300, Math.max(150, X_train.length * 15))
  const batchSize = Math.min(16, Math.max(4, Math.floor(X_train.length / 4)))
  
  await model.fit(xs_train.reshape([X_train.length, windowSize + 1, 1]), ys_train, {
    epochs: epochs,
    batchSize: batchSize,
    validationData: [xs_val.reshape([X_val.length, windowSize + 1, 1]), ys_val],
    verbose: 0,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        // Early stopping if validation loss increases significantly
        if (epoch > 30 && logs.val_loss > logs.loss * 1.5) {
          model.stopTraining = true
        }
      }
    }
  })

  // Calculate validation accuracy with denormalized values
  const val_predictions = model.predict(xs_val.reshape([X_val.length, windowSize + 1, 1])) as tf.Tensor
  const val_pred_normalized = val_predictions.dataSync()
  
  // Denormalize predictions and actuals for accurate MAPE
  const val_pred_actual = val_pred_normalized.map(pred => (pred * (std || 1)) + mean)
  const val_actual_actual = y_val.map(actual => (actual * (std || 1)) + mean)
  
  let mape_sum = 0
  let valid_predictions = 0

  for (let i = 0; i < val_pred_actual.length; i++) {
    const actual = val_actual_actual[i]
    if (actual !== 0) {
      mape_sum += Math.abs((actual - val_pred_actual[i]) / actual)
      valid_predictions++
    }
  }

  const mape = valid_predictions > 0 ? (mape_sum / valid_predictions) * 100 : 100
  const accuracy = Math.max(0, Math.min(100, 100 - mape))

  // Determine confidence level
  let confidence = 'Low'
  if (accuracy > 80) confidence = 'High'
  else if (accuracy > 60) confidence = 'Medium'
  else confidence = 'Low'

  // Predict next month (denormalize the prediction)
  const lastWindow = normalizedData.slice(-windowSize)
  const lastTrend = trends[trends.length - 1] || 0
  const inputFeatures = [...lastWindow, lastTrend]
  const input = tf.tensor2d([inputFeatures], [1, windowSize + 1]).reshape([1, windowSize + 1, 1])
  const prediction_tensor = model.predict(input) as tf.Tensor
  const normalized_pred = prediction_tensor.dataSync()[0]
  
  // Denormalize the prediction
  const predValue = (normalized_pred * (std || 1)) + mean

  // Cleanup
  model.dispose()
  xs_train.dispose()
  ys_train.dispose()
  xs_val.dispose()
  ys_val.dispose()
  val_predictions.dispose()
  input.dispose()
  prediction_tensor.dispose()

  return {
    prediction: Math.max(0, Math.round(predValue)),
    accuracy: Math.round(accuracy),
    confidence
  }
}