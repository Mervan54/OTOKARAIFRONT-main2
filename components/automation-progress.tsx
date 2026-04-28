"use client"

import { cn } from "@/lib/utils"

interface AutomationProgressProps {
  value: number
  className?: string
  showLabel?: boolean
}

export function AutomationProgress({ value, className, showLabel = true }: AutomationProgressProps) {
  const getColor = (val: number) => {
    if (val >= 80) return "bg-emerald-500"
    if (val >= 60) return "bg-blue-500"
    if (val >= 40) return "bg-amber-500"
    return "bg-gray-400"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-500", getColor(value))}
          style={{ width: `${value}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-muted-foreground w-10 text-right">
          %{value}
        </span>
      )}
    </div>
  )
}
