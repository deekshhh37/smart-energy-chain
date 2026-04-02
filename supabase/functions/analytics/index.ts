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
    const monthlyData: MonthlyData[] = uploads.map(u => ({
      month: `${u.year}-${String(u.month).padStart(2, '0')}`,
      consumption: u.consumption_kwh,
      solar: u.solar_kwh,
      grid: u.grid_kwh,
      bill: u.bill_amount
    }))

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
  if (uploads.length < 4) return {
    prediction: uploads.length > 0 ? uploads[uploads.length - 1].consumption_kwh : 0,
    accuracy: 0,
    confidence: 'Low (insufficient data)'
  }

  // Prepare data for LSTM
  const data = uploads.map(u => u.consumption_kwh)
  const windowSize = 3
  const X = []
  const y = []

  for (let i = 0; i < data.length - windowSize; i++) {
    X.push(data.slice(i, i + windowSize))
    y.push(data[i + windowSize])
  }

  if (X.length < 2) return {
    prediction: data[data.length - 1],
    accuracy: 0,
    confidence: 'Low (minimal data)'
  }

  // Split into train/validation (80/20)
  const trainSize = Math.floor(X.length * 0.8)
  const X_train = X.slice(0, trainSize)
  const y_train = y.slice(0, trainSize)
  const X_val = X.slice(trainSize)
  const y_val = y.slice(trainSize)

  // Convert to tensors
  const xs_train = tf.tensor2d(X_train, [X_train.length, windowSize])
  const ys_train = tf.tensor1d(y_train)
  const xs_val = tf.tensor2d(X_val, [X_val.length, windowSize])
  const ys_val = tf.tensor1d(y_val)

  // Create LSTM model
  const model = tf.sequential()
  model.add(tf.layers.lstm({ units: 10, inputShape: [windowSize, 1] }))
  model.add(tf.layers.dense({ units: 1 }))

  model.compile({ optimizer: 'adam', loss: 'meanSquaredError' })

  // Train with validation
  await model.fit(xs_train.reshape([X_train.length, windowSize, 1]), ys_train, {
    epochs: 50,
    validationData: [xs_val.reshape([X_val.length, windowSize, 1]), ys_val],
    verbose: 0
  })

  // Calculate validation accuracy
  const val_predictions = model.predict(xs_val.reshape([X_val.length, windowSize, 1])) as tf.Tensor
  const val_pred_array = val_predictions.dataSync()
  const val_actual_array = ys_val.dataSync()

  // Calculate MAPE (Mean Absolute Percentage Error)
  let mape_sum = 0
  let valid_predictions = 0

  for (let i = 0; i < val_pred_array.length; i++) {
    if (val_actual_array[i] !== 0) {
      mape_sum += Math.abs((val_actual_array[i] - val_pred_array[i]) / val_actual_array[i])
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

  // Predict next
  const lastWindow = data.slice(-windowSize)
  const input = tf.tensor2d([lastWindow], [1, windowSize]).reshape([1, windowSize, 1])
  const prediction_tensor = model.predict(input) as tf.Tensor
  const predValue = prediction_tensor.dataSync()[0]

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