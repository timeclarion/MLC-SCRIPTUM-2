import { cn } from "@/lib/utils"
import { FileText, Users, Briefcase, RefreshCw } from "lucide-react"

interface ActivityItemProps {
  type: "document" | "client" | "process" | "sync"
  title: string
  description: string
  time: string
  user?: string
}

const icons = {
  document: FileText,
  client: Users,
  process: Briefcase,
  sync: RefreshCw,
}

const iconColors = {
  document: "bg-primary-100 text-primary",
  client: "bg-primary-50 text-primary-600",
  process: "bg-warning-bg text-warning",
  sync: "bg-success-bg text-success",
}

export function ActivityItem({ type, title, description, time, user }: ActivityItemProps) {
  const Icon = icons[type]
  
  return (
    <div className="flex items-start gap-4 py-4">
      <div className={cn(
        "flex items-center justify-center w-10 h-10 rounded-lg flex-shrink-0",
        iconColors[type]
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-sm text-foreground-secondary truncate">{description}</p>
        {user && (
          <p className="text-xs text-foreground-secondary mt-1">por {user}</p>
        )}
      </div>
      <span className="text-xs text-foreground-secondary flex-shrink-0">{time}</span>
    </div>
  )
}
