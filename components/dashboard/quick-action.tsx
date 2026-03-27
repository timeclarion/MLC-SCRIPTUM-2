import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface QuickActionProps {
  title: string
  description: string
  icon: LucideIcon
  onClick?: () => void
  variant?: "default" | "primary"
}

export function QuickAction({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  variant = "default" 
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 w-full p-4 rounded-xl border transition-colors text-left",
        variant === "primary" 
          ? "bg-primary border-primary text-foreground-inverse hover:bg-primary-800"
          : "bg-card border-border hover:bg-accent"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
        variant === "primary"
          ? "bg-white/20"
          : "bg-[#E8F0EC]"
      )}>
        <Icon className={cn(
          "w-5 h-5",
          variant === "primary" ? "text-white" : "text-primary"
        )} />
      </div>
      <div>
        <p className={cn(
          "text-sm font-medium",
          variant === "primary" ? "text-white" : "text-foreground"
        )}>
          {title}
        </p>
        <p className={cn(
          "text-xs mt-0.5",
          variant === "primary" ? "text-white/80" : "text-foreground-secondary"
        )}>
          {description}
        </p>
      </div>
    </button>
  )
}
