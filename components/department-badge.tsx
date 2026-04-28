import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DepartmentBadgeProps {
  name: string
  className?: string
}

const colorVariants = [
  "bg-blue-100 text-blue-700 hover:bg-blue-100",
  "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
  "bg-amber-100 text-amber-700 hover:bg-amber-100",
  "bg-rose-100 text-rose-700 hover:bg-rose-100",
  "bg-violet-100 text-violet-700 hover:bg-violet-100",
  "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
  "bg-orange-100 text-orange-700 hover:bg-orange-100",
  "bg-pink-100 text-pink-700 hover:bg-pink-100",
]

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return Math.abs(hash)
}

export function DepartmentBadge({ name, className }: DepartmentBadgeProps) {
  const colorIndex = hashString(name) % colorVariants.length
  
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-normal",
        colorVariants[colorIndex],
        className
      )}
    >
      {name}
    </Badge>
  )
}
