"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, ListTodo, MessageSquare, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Genel Bakış", href: "/", icon: LayoutDashboard },
  { name: "Direktörlükler", href: "/directorates", icon: Building2 },
  { name: "Görevler", href: "/tasks", icon: ListTodo },
  { name: "Raporlar ve İstatistikler", href: "/reports", icon: BarChart2 },

  { name: "Yapay Zeka Asistan", href: "/chatbot", icon: MessageSquare },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
     
        <div className="flex h-16 items-center justify-center border-b border-border px-6">
    <img 
      src="/OTOKAR-LOGO.jpg" 
      alt="Otokar" 
      className="h-16 w-auto object-contain mx-auto"
    />
  </div>
      
      
      <nav className="flex flex-col gap-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
