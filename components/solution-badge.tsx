import { Badge } from "@/components/ui/badge"
import { Bot, Cog, Layers, HelpCircle } from "lucide-react"
import type { SolutionType } from "@/lib/types"
import { cn } from "@/lib/utils"

const solutionConfig: Record<SolutionType, { icon: typeof Bot; label: string; className: string }> = {
  AI: {
    icon: Bot,
    label: "AI",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  },
  RPA: {
    icon: Cog,
    label: "RPA",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  },
  Hybrid: {
    icon: Layers,
    label: "Hibrit",
    className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  },
  Other: {
    icon: HelpCircle,
    label: "Diger",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-100",
  },
}

interface SolutionBadgeProps {
  type: SolutionType
  className?: string
}

export function SolutionBadge({ type, className }: SolutionBadgeProps) {
  const config = solutionConfig[type]
  const Icon = config.icon

  return (
    <Badge variant="secondary" className={cn("gap-1", config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
