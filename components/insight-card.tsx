"use client"

import { Building2, ListTodo, Users, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { AIInsight } from "@/lib/types"
import { cn } from "@/lib/utils"

const iconMap = {
  directorate: Building2,
  task: ListTodo,
  department: Users,
  automation: Zap,
}

const colorMap = {
  directorate: "bg-blue-50 text-blue-600",
  task: "bg-amber-50 text-amber-600",
  department: "bg-emerald-50 text-emerald-600",
  automation: "bg-purple-50 text-purple-600",
}

interface InsightCardProps {
  insight: AIInsight
}

export function InsightCard({ insight }: InsightCardProps) {
  const Icon = iconMap[insight.type]
  const colors = colorMap[insight.type]

  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", colors)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {insight.title}
            </p>
            <p className="mt-1 truncate text-base font-semibold text-foreground">
              {insight.value}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {insight.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
