"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, ListTodo, MessageSquare, BarChart2, Users, ChevronLeft, ChevronRight, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Genel Bakış", href: "/", icon: LayoutDashboard },
  { name: "Direktörlükler", href: "/directorates", icon: Building2 },
  { name: "Görevler", href: "/tasks", icon: ListTodo },
  { name: "Kişi Görev Analizi", href: "/person-tasks", icon: Users },
  { name: "Raporlar ve İstatistikler", href: "/reports", icon: BarChart2 },
  { name: "Yapay Zeka Asistan", href: "/chatbot", icon: MessageSquare },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const main = document.querySelector("main")
    if (main) {
      main.style.marginLeft = collapsed ? "64px" : "256px"
      main.style.transition = "margin-left 0.3s"
    }
  }, [collapsed])

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen border-r border-border bg-sidebar transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border px-2">
        {!collapsed ? (
          <img src="/OTOKAR-LOGO.jpg" alt="Otokar" className="h-14 w-auto object-contain" />
        ) : (
          <Menu className="h-6 w-6 text-muted-foreground" />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 p-2 mt-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  )
}