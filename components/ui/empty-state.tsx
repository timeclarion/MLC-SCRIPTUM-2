"use client"

import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#F3F2EE] mb-4">
        <Icon className="w-6 h-6 text-[#9B9B9B]" />
      </div>
      <h3 className="text-base font-medium text-foreground text-center mb-2">
        {title}
      </h3>
      <p className="text-sm text-foreground-secondary text-center max-w-[360px] mb-5">
        {description}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-800 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
