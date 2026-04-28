"use client"

import { useState, useEffect, Fragment } from "react"
import { Building2, Users, ListTodo, ChevronDown, ChevronRight, Sparkles, TrendingUp } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { StatCard } from "@/components/stat-card"
import { InsightCard } from "@/components/insight-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { getDirectorateSummary, getAIInsights } from "@/lib/api"
import type { Directorate, AIInsight } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef"]

export default function DashboardPage() {
  const [directorates, setDirectorates] = useState<Directorate[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function fetchData() {
      const data = await getDirectorateSummary()
      setDirectorates(data)
      const insightData = await getAIInsights(data)
      setInsights(insightData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const totalDirectorates = directorates.length
  const totalDepartments = directorates.reduce((acc, d) => acc + d.departmentCount, 0)
  const totalTasks = directorates.reduce((acc, d) => acc + d.totalRecords, 0)

  const chartData = directorates.map((d) => ({
    name: d.name.replace(" Direktorlugu", "").replace(" Direktörlüğü", ""),
    value: d.totalRecords,
  }))

  const topDepartments = directorates
    .flatMap((d) => d.departments)
    .sort((a, b) => b.taskCount - a.taskCount)
    .slice(0, 5)

  const maxDeptTasks = topDepartments[0]?.taskCount || 1

  if (loading) {
    return (
      <div>
        <AppHeader title="Genel Bakis" description="Kurumsal gorev analizinize genel bakis" />
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <div className="mt-6">
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHeader title="Genel Bakis" description="Kurumsal gorev analizinize genel bakis" />
      <div className="p-6">
        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <StatCard
            title="Toplam Direktorluk"
            value={totalDirectorates}
            icon={Building2}
            description="Aktif organizasyonel birimler"
          />
          <StatCard
            title="Toplam Departman"
            value={totalDepartments}
            icon={Users}
            description="Tum direktorluklerde"
          />
          <StatCard
            title="Toplam Gorev"
            value={totalTasks}
            icon={ListTodo}
            description="Tanimli gorev kayitlari"
          />
        </div>

        {/* AI Insights */}
        <div className="mt-6">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">AI Oneriler</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Direktorluk Bazli Gorev Dagilimi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={100} 
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} gorev`, "Toplam"]}
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {chartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Departments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                En Yogun 5 Mudurluk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDepartments.map((dept, index) => (
                  <div key={dept.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium">{dept.name}</span>
                      </span>
                      <span className="text-muted-foreground">{dept.taskCount} gorev</span>
                    </div>
                    <Progress 
                      value={(dept.taskCount / maxDeptTasks) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Directorate Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Direktorluk Ozeti</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Direktorluk Adi</TableHead>
                  <TableHead className="text-right">Toplam Kayit</TableHead>
                  <TableHead className="text-right">Departman Sayisi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {directorates.map((directorate) => (
                  <Fragment key={directorate.id}>
                    <TableRow
                     
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-muted/50",
                        expandedRows.has(directorate.id) && "bg-muted/30"
                      )}
                      onClick={() => toggleRow(directorate.id)}
                    >
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          {expandedRows.has(directorate.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="font-medium">{directorate.name}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{directorate.totalRecords}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{directorate.departmentCount}</TableCell>
                    </TableRow>
                    {expandedRows.has(directorate.id) && (
                      <TableRow key={`${directorate.id}-expanded`}>
                        <TableCell colSpan={4} className="bg-muted/20 p-0">
                          <div className="px-8 py-4">
                            <p className="mb-3 text-sm font-medium text-muted-foreground">
                              {directorate.name} Departmanlari:
                            </p>
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {directorate.departments.map((dept) => (
                                <div
                                  key={dept.id}
                                  className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                                >
                                  <p className="font-medium text-foreground">{dept.name}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {dept.taskCount} gorev
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                 </Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
