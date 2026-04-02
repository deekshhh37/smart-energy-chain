import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { usageData, todayStats } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // For local development, return mock alerts if API key not configured
    if (!LOVABLE_API_KEY) {
      const mockAlerts = [
        {
          type: "prediction",
          severity: "info",
          title: "Peak Usage Expected",
          message: "High consumption predicted for evening hours. Consider shifting heavy loads.",
          icon: "trending-up"
        },
        {
          type: "tip",
          severity: "info",
          title: "Solar Optimization",
          message: "Your solar panels are performing well. Consider adding battery storage.",
          icon: "sun"
        },
        {
          type: "anomaly",
          severity: "warning",
          title: "Unusual Grid Usage",
          message: "Grid consumption is 15% higher than usual. Check for inefficiencies.",
          icon: "alert-triangle"
        },
        {
          type: "tip",
          severity: "info",
          title: "Energy Saving",
          message: "Running appliances during off-peak hours could save up to $20/month.",
          icon: "leaf"
        }
      ];
      
      return new Response(JSON.stringify({ alerts: mockAlerts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an AI energy monitoring system. Analyze usage data and generate alerts. Return a JSON array of alert objects with these fields:
- "type": "anomaly" | "prediction" | "tip"
- "severity": "info" | "warning" | "critical"
- "title": short title (max 60 chars)
- "message": brief description (max 150 chars)
- "icon": one of "zap", "trending-up", "alert-triangle", "sun", "leaf", "battery"

Generate 4-6 alerts mixing anomaly detection, predictive warnings, and energy-saving tips. Return ONLY the JSON array, no other text.`,
          },
          {
            role: "user",
            content: `Analyze this energy data and generate alerts:

Today's Stats:
- Total Consumption: ${todayStats?.totalConsumption || 38.2} kWh
- Solar: ${todayStats?.solarPercentage || 45}%
- Grid: ${todayStats?.gridPercentage || 48}%
- Backup: ${todayStats?.backupPercentage || 7}%
- Peak Usage: ${todayStats?.peakUsage || 5.8} kWh at 6 PM
- Cost So Far: $${todayStats?.costSoFar || 4.58}
- CO₂ Saved: ${todayStats?.co2Saved || 17.2} kg

Hourly Usage Pattern: ${JSON.stringify(usageData || [])}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";
    
    // Parse the JSON from the AI response
    let alerts;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      alerts = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      alerts = [];
    }

    return new Response(JSON.stringify({ alerts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("alerts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
