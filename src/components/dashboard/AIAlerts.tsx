import { useState, useEffect } from "react";
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Sun,
  Leaf,
  Battery,
  Loader2,
  RefreshCw,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { todayStats, dailyUsageData } from "@/lib/mockData";

interface Alert {
  type: "anomaly" | "prediction" | "tip";
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  icon: string;
}

const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  sun: Sun,
  leaf: Leaf,
  battery: Battery,
};

const severityStyles: Record<string, string> = {
  info: "border-l-primary bg-primary/5",
  warning: "border-l-energy-solar bg-[hsl(var(--energy-solar)/0.08)]",
  critical: "border-l-destructive bg-destructive/5",
};

const typeLabels: Record<string, { label: string; color: string }> = {
  anomaly: { label: "Anomaly", color: "bg-destructive/10 text-destructive" },
  prediction: { label: "Prediction", color: "bg-primary/10 text-primary" },
  tip: { label: "Tip", color: "bg-accent/10 text-accent" },
};

export function AIAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("energy-alerts", {
        body: { usageData: dailyUsageData, todayStats },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setAlerts(data?.alerts || []);
    } catch (e: any) {
      console.error("Failed to fetch alerts:", e);
      setError(e.message || "Failed to generate alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="bg-card rounded-xl border shadow-card animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg gradient-primary">
            <Brain className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm">AI Smart Alerts</h3>
            <p className="text-xs text-muted-foreground">Real-time anomaly & predictions</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchAlerts}
          disabled={loading}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {loading && alerts.length === 0 && (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Analyzing energy patterns...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={fetchAlerts}>
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && alerts.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">No alerts at this time</p>
        )}

        {alerts.map((alert, i) => {
          const Icon = iconMap[alert.icon] || Zap;
          const typeInfo = typeLabels[alert.type] || typeLabels.tip;
          return (
            <div
              key={i}
              className={cn(
                "border-l-4 rounded-lg p-3 transition-all hover:shadow-sm",
                severityStyles[alert.severity] || severityStyles.info
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 shrink-0 mt-0.5 text-foreground/70" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">{alert.title}</span>
                    <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", typeInfo.color)}>
                      {typeInfo.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
