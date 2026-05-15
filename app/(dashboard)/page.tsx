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
import type { Directorate, AIInsight, Department } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
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
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const totalDirectorates = directorates.length
  const totalDepartments = directorates.reduce((acc, d) => acc + d.departments.length, 0)
  const totalPersons = directorates
    .flatMap(d => d.departments)
    .flatMap(dept => dept.adSoyadlar ?? [])
    .filter((v, i, a) => a.indexOf(v) === i)
    .length

  const chartData = directorates.map((d) => ({
    name: d.name.replace(" Direktörlugu", "").replace(" Direktörlüğü", ""),
    value: [...new Set(d.departments.flatMap(dept => dept.adSoyadlar ?? []))].length,
  }))

  const getUniquePersonCount = (directorate: Directorate) =>
    new Set(directorate.departments.flatMap(d => d.adSoyadlar ?? [])).size

  const getDeptUniquePersonCount = (dept: Department) =>
    new Set(dept.adSoyadlar ?? []).size

  const topDepartments = directorates
    .flatMap((d) => d.departments)
    .sort((a, b) => new Set(b.adSoyadlar ?? []).size - new Set(a.adSoyadlar ?? []).size)
    .slice(0, 5)

  const maxDeptTasks = Math.max(...topDepartments.map(d => new Set(d.adSoyadlar ?? []).size), 1)

  if (loading) {
    return (
      <div>
        <AppHeader title="Genel Bakış" description="Kurumsal Görev Analizine Genel Bakış" />
        <div className="p-4 md:p-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
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
      <AppHeader title="Genel Bakış" description="Kurumsal Görev Analizinize Genel Bakış" />
      <div className="p-4 md:p-6">

        {/* Stats */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <StatCard title="Toplam Direktörlük" value={totalDirectorates} icon={Building2} />
          <StatCard title="Toplam Departman" value={totalDepartments} icon={Users} />
          <StatCard title="Toplam Çalışan Kişi Sayısı" value={totalPersons} icon={Users} />
        </div>

        {/* AI Insights */}
        <div className="mt-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {insights.filter(i => i.id === "insight-1" || i.id === "insight-2").map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="mt-6 grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4" />
                Direktörlük Bazlı Görev Dağılımı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: number) => [`${value} Kişi`, "Toplam"]} />
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
                En Yoğun 5 Müdürlük
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topDepartments.map((dept, index) => (
                  <div key={dept.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        <span className="font-medium truncate">{dept.name}</span>
                      </span>
                      <span className="text-muted-foreground shrink-0 ml-2">{new Set(dept.adSoyadlar ?? []).size} Kişi</span>
                    </div>
                    <Progress value={(new Set(dept.adSoyadlar ?? []).size / maxDeptTasks) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Directorate Table */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Direktörlük Özeti</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Direktörlük Adı</TableHead>
                  <TableHead className="text-right">Toplam Kayıt</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Departman Sayısı</TableHead>
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
                        <Badge variant="secondary">{getUniquePersonCount(directorate)}</Badge>
                      </TableCell>
                      <TableCell className="text-right hidden sm:table-cell">{directorate.departmentCount}</TableCell>
                    </TableRow>
                    {expandedRows.has(directorate.id) && (
                      <TableRow key={`${directorate.id}-expanded`}>
                        <TableCell colSpan={4} className="bg-muted/20 p-0">
                          <div className="px-4 md:px-8 py-4">
                            <p className="mb-3 text-sm font-medium text-muted-foreground">
                              {directorate.name} Departmanları:
                            </p>
                            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                              {directorate.departments.map((dept) => (
                                <div
                                  key={dept.id}
                                  className="rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                                >
                                  <p className="font-medium text-foreground text-sm">{dept.name}</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    {getDeptUniquePersonCount(dept)} Kişi
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