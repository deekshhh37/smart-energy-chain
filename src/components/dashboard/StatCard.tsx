import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "solar" | "grid" | "backup" | "primary";
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  const variantStyles = {
    default: "bg-card",
    solar: "bg-gradient-to-br from-energy-solar/10 to-energy-solar/5 border-energy-solar/20",
    grid: "bg-gradient-to-br from-energy-grid/10 to-energy-grid/5 border-energy-grid/20",
    backup: "bg-gradient-to-br from-energy-backup/10 to-energy-backup/5 border-energy-backup/20",
    primary: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
  };

  const iconStyles = {
    default: "bg-muted text-muted-foreground",
    solar: "bg-energy-solar/20 text-energy-solar",
    grid: "bg-energy-grid/20 text-energy-grid",
    backup: "bg-energy-backup/20 text-energy-backup",
    primary: "bg-primary/20 text-primary",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-6 shadow-card transition-all duration-300 hover:shadow-lg animate-fade-in",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium",
                trend.isPositive ? "text-accent" : "text-destructive"
              )}
            >
              <span>{trend.isPositive ? "↑" : "↓"}</span>
              <span>{Math.abs(trend.value)}% from yesterday</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", iconStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
