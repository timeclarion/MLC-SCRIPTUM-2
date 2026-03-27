import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    label: string
  }
  icon: LucideIcon
  className?: string
}

export function StatCard({ title, value, change, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col p-6 bg-card rounded-xl border border-border",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground-secondary">{title}</p>
          <p className="mt-2 text-3xl font-serif font-semibold text-foreground tracking-tight">
            {value}
          </p>
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-100">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center gap-1.5">
          <span
            className={cn(
              "text-sm font-medium",
              change.value >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {change.value >= 0 ? "+" : ""}{change.value}%
          </span>
          <span className="text-sm text-foreground-secondary">{change.label}</span>
        </div>
      )}
    </div>
  )
}
