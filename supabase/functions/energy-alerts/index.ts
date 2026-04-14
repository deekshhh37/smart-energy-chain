// deno-lint-ignore-file no-explicit-any
// @ts-nocheck

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Helper function to generate context-aware mock alerts
const generateMockAlerts = (stats: any) => {
  const gridPercentage = stats?.gridPercentage || 48;
  const solarPercentage = stats?.solarPercentage || 45;
  
  const alerts = [
    {
      type: "prediction",
      severity: "info",
      title: "Peak Usage Expected",
      message: "High consumption predicted for evening hours. Consider shifting heavy loads.",
      icon: "trending-up"
    }
  ];
  
  // Add solar optimization tip if solar is performing well
  if (solarPercentage > 40) {
    alerts.push({
      type: "tip",
      severity: "info",
      title: "Solar Optimization",
      message: "Your solar panels are performing well. Consider adding battery storage.",
      icon: "sun"
    });
  }
  
  // Add grid usage warning if grid percentage is high
  if (gridPercentage > 50) {
    alerts.push({
      type: "anomaly",
      severity: "warning",
      title: "High Grid Dependency",
      message: `Grid consumption at ${gridPercentage}%. Maximize solar usage or add battery backup.`,
      icon: "alert-triangle"
    });
  }
  
  // Add energy saving tip
  alerts.push({
    type: "tip",
    severity: "info",
    title: "Energy Saving Opportunity",
    message: "Running appliances during off-peak hours could save up to $20/month.",
    icon: "leaf"
  });
  
  return alerts;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { usageData, todayStats } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    // For development or if no API key, return mock alerts quickly
    if (!LOVABLE_API_KEY) {
      const mockAlerts = generateMockAlerts(todayStats);
      return new Response(JSON.stringify({ alerts: mockAlerts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try AI-powered alerts with a 10-second timeout
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000);

    try {
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
        signal: abortController.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          // Rate limited or credits exhausted - return mock alerts
          console.warn(`AI gateway error ${response.status}, using mock alerts`);
          const mockAlerts = generateMockAlerts(todayStats);
          return new Response(JSON.stringify({ alerts: mockAlerts }), {
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
        alerts = jsonMatch ? JSON.parse(jsonMatch[0]) : generateMockAlerts(todayStats);
      } catch {
        alerts = generateMockAlerts(todayStats);
      }

      return new Response(JSON.stringify({ alerts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // Fall back to mock alerts on timeout or network error
      if (fetchError.name === "AbortError" || fetchError.message?.includes("timeout")) {
        console.warn("AI request timed out or aborted, using mock alerts");
        const mockAlerts = generateMockAlerts(todayStats);
        return new Response(JSON.stringify({ alerts: mockAlerts }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // For other fetch errors, also fall back to mock
      console.error("AI fetch error:", fetchError);
      const mockAlerts = generateMockAlerts(todayStats);
      return new Response(JSON.stringify({ alerts: mockAlerts }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e) {
    console.error("alerts error:", e);
    // Return a basic mock alert if something goes seriously wrong
    const basicMocks = [
      {
        type: "tip",
        severity: "info",
        title: "Energy Monitoring Active",
        message: "Your energy usage is being monitored.",
        icon: "zap"
      }
    ];
    return new Response(JSON.stringify({ alerts: basicMocks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
