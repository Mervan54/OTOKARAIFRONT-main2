"use client"

import { useState, useEffect, useMemo } from "react"
import { AppHeader } from "@/components/app-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, ChevronLeft, ChevronRight, Search, Maximize2, Minimize2 } from "lucide-react"
import { getDirectorateSummary, getSentenceBasedTasks, getAIAnalysis } from "@/lib/api"
import type { Directorate, UniqueTask, AIAnalysisResponse } from "@/lib/types"
import { DepartmentBadge } from "@/components/department-badge"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

const REPEAT_PAGE_SIZE = 10

function getPersonDepartment(personName: string, directorates: Directorate[]): string {
  for (const dir of directorates) {
    for (const dept of dir.departments) {
      if (dept.adSoyadlar?.includes(personName)) {
        return dept.name
      }
    }
  }
  return ""
}

function RepeatTaskRow({ task, index, directorates }: { task: UniqueTask; index: number; directorates: Directorate[] }) {
  const [showPopup, setShowPopup] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const MAX_CHARS = 80

  return (
    <>
      <div className="flex items-start gap-3 rounded-lg border p-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {task.name.slice(0, MAX_CHARS)}
            {task.name.length > MAX_CHARS && (
              <>
                ...
                <button onClick={() => setShowPopup(true)} className="ml-1 text-xs text-primary hover:underline">
                  devamını oku
                </button>
              </>
            )}
          </p>
          <div className="mt-1 flex flex-wrap gap-1">
            {task.departments.slice(0, 3).map(d => (
              <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
            ))}
            {task.departments.length > 3 && (
              <Badge variant="outline" className="text-xs">+{task.departments.length - 3}</Badge>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-1 items-center">
          {task.persons.slice(0, 3).map(p => {
          const dept = getPersonDepartment(p, directorates)
          return (
         <div key={p} className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">{p}</span>
        {dept && <DepartmentBadge name={dept} />}
        </div>
          )
          })}
        {task.persons.length > 3 && (
       <button onClick={() => setShowPopup(true)} className="text-xs text-primary hover:underline">
        +{task.persons.length - 3} kişi daha
        </button>
       )}
       </div>
        </div>
        <Badge className="shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
          {task.persons.length} Kişi
        </Badge>
      </div>

      {showPopup && typeof window !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowPopup(false)}
        >
         <div
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl border flex flex-col transition-all duration-200 ${
        isMaximized ? "w-full h-full rounded-none" : "w-full max-w-2xl mx-4"
        }`}
       onClick={e => e.stopPropagation()}
         >
           <div className="flex items-center justify-between p-4 border-b">
  <h3 className="font-semibold text-base">Görev Detayı</h3>
  <div className="flex items-center gap-2">
    <button onClick={() => setIsMaximized(!isMaximized)} className="text-muted-foreground hover:text-foreground p-1">
      {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
    </button>
    <button onClick={() => setShowPopup(false)} className="text-muted-foreground hover:text-foreground text-lg font-bold">✕</button>
  </div>
</div>
            <div className="overflow-y-auto max-h-64 p-4">
              <ul className="space-y-1">
                {task.name
                  .split(/,\s*-|\.\s*-|;\s*-|,\s*•|\.\s*•|;\s*•/)
                  .map((item, i) => (
                    <li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>{item.trim().replace(/^[-•]\s*/, "")}</span>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="p-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Bu görevi paylaşan kişiler ({task.persons.length}):
              </p>
              <div className="flex flex-wrap gap-2">
               {task.persons.map(p => {
                const dept = getPersonDepartment(p, directorates)
                   return (
               <div key={p} className="flex items-center gap-1">
                 <span className="text-xs text-muted-foreground">{p}</span>
                {dept && <DepartmentBadge name={dept} />}
                </div>
                     )
                   })}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

export default function ReportsPage() {
  const [directorates, setDirectorates] = useState<Directorate[]>([])
  const [tasks, setTasks] = useState<UniqueTask[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDir, setSelectedDir] = useState<string>("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<AIAnalysisResponse | null>(null)
  const [repeatPage, setRepeatPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBirim, setSelectedBirim] = useState("all")
  const [selectedDept, setSelectedDept] = useState("all")

  useEffect(() => {
    async function fetchData() {
      const [dirs, tsks] = await Promise.all([
        getDirectorateSummary(),
        getSentenceBasedTasks()
      ])
      setDirectorates(dirs)
      setTasks(tsks)
      setLoading(false)
    }
    fetchData()
  }, [])

  const birims = useMemo(() => {
    return [...new Set(directorates.map(d => d.name))].sort()
  }, [directorates])

  const departments = useMemo(() => {
    if (selectedBirim === "all") return []
    const dir = directorates.find(d => d.name === selectedBirim)
    return dir ? dir.departments.map(d => d.name).sort() : []
  }, [directorates, selectedBirim])

  const repeatingTasks = useMemo(() => {
    return tasks
      .filter(t => t.persons.length >= 2)
      .sort((a, b) => b.persons.length - a.persons.length)
  }, [tasks])

  const filteredTasks = useMemo(() => {
    let result = repeatingTasks

    if (selectedBirim !== "all") {
      const dir = directorates.find(d => d.name === selectedBirim)
      const deptPersons = new Set(dir?.departments.flatMap(d => d.adSoyadlar ?? []) ?? [])
      result = result.filter(t => t.persons.some(p => deptPersons.has(p)))
    }

    if (selectedDept !== "all") {
      const dept = directorates.flatMap(d => d.departments).find(d => d.name === selectedDept)
      const deptPersons = new Set(dept?.adSoyadlar ?? [])
      result = result.filter(t => t.persons.some(p => deptPersons.has(p)))
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.persons.some(p => p.toLowerCase().includes(q)) ||
        t.departments.some(d => d.toLowerCase().includes(q))
      )
    }

    return result
  }, [repeatingTasks, selectedBirim, selectedDept, searchQuery, directorates])

  const dirRepeatData = useMemo(() => {
    return directorates.map(d => {
      const uniquePersons = new Set(
        d.departments.flatMap(dept => dept.adSoyadlar ?? [])
          .filter(person => tasks.some(t => t.persons.length >= 2 && t.persons.includes(person)))
      ).size
      return {
        name: d.name.split(" ")[0],
        tekrarEdenKisi: uniquePersons,
      }
    }).sort((a, b) => b.tekrarEdenKisi - a.tekrarEdenKisi)
  }, [directorates, tasks])

  const radarData = useMemo(() => {
    return directorates.map(d => ({
      name: d.name.split(" ")[0],
      Kişi: new Set(d.departments.flatMap(dept => dept.adSoyadlar ?? [])).size,
      Departman: d.departments.length,
    }))
  }, [directorates])

  const totalRepeating = repeatingTasks.length
  const mostRepeated = repeatingTasks[0]
  const totalAffected = new Set(repeatingTasks.flatMap(t => t.persons)).size
  const totalPages = Math.ceil(filteredTasks.length / REPEAT_PAGE_SIZE)
  const paginatedTasks = filteredTasks.slice(
    (repeatPage - 1) * REPEAT_PAGE_SIZE,
    repeatPage * REPEAT_PAGE_SIZE
  )

  const handleAiAnalysis = async () => {
    if (!selectedDir) return
    setAiLoading(true)
    setAiResult(null)
    try {
      const result = await getAIAnalysis(selectedDir)
      setAiResult(result)
    } catch (e) {
      console.error(e)
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <AppHeader title="Raporlar ve İstatistikler" description="Görev analizi raporları" />
        <div className="p-6 grid gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHeader title="Raporlar ve İstatistikler" description="Görev analizi raporları" />
      <div className="p-6 space-y-6">

        {/* Özet Kartlar */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Tekrar Eden Görev Sayısı</p>
            <p className="mt-1 text-3xl font-bold text-primary">{totalRepeating}</p>
            <p className="mt-1 text-xs text-muted-foreground">2+ kişide ortak olan görevler</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Etkilenen Çalışan Sayısı</p>
            <p className="mt-1 text-3xl font-bold text-primary">{totalAffected}</p>
            <p className="mt-1 text-xs text-muted-foreground">Tekrar eden görevlerde yer alan kişiler</p>
          </div>
        </div>

        {/* Direktörlük Bazlı Tekrar Analizi */}
        <Card>
          <CardHeader>
            <CardTitle>Direktörlük Bazlı Görev Tekrarı</CardTitle>
            <p className="text-sm text-muted-foreground">
              Her direktörlükte kaç kişi tekrar eden görevlere dahil
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dirRepeatData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: number) => [value, "Tekrar Eden Göreve Dahil Kişi"]} />
                  <Bar dataKey="tekrarEdenKisi" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tekrar Eden Görevler Listesi */}
        <Card>
          <CardHeader>
            <CardTitle>Tekrar Eden Görevler</CardTitle>
            <p className="text-sm text-muted-foreground">
              En çoktan aza sıralı — görev, kişi veya departmana göre arayabilirsiniz
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-4">
              <Select value={selectedBirim} onValueChange={(val) => { setSelectedBirim(val); setSelectedDept("all"); setRepeatPage(1) }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Birim seç..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Birimler</SelectItem>
                  {birims.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDept} onValueChange={(val) => { setSelectedDept(val); setRepeatPage(1) }} disabled={selectedBirim === "all"}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Departman seç..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Departmanlar</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Görev, kişi veya departman ara..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setRepeatPage(1) }}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-3">
              {paginatedTasks.map((task, i) => (
                <RepeatTaskRow
                  key={task.id}
                  task={task}
                  index={(repeatPage - 1) * REPEAT_PAGE_SIZE + i}
                  directorates={directorates}
                />
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">Sonuç bulunamadı.</p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Sayfa {repeatPage} / {totalPages || 1} — Toplam {filteredTasks.length} görev
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRepeatPage(p => Math.max(1, p - 1))}
                  disabled={repeatPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRepeatPage(p => Math.min(totalPages, p + 1))}
                  disabled={repeatPage === totalPages || totalPages === 0}
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Direktörlük Karşılaştırma */}
        <Card>
          <CardHeader>
            <CardTitle>Direktörlük Karşılaştırma</CardTitle>
            <p className="text-sm text-muted-foreground">
              Kişi sayısı ve departman sayısına göre direktörlük karşılaştırması
            </p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis />
                  <Radar name="Kişi Sayısı" dataKey="Kişi" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Departman Sayısı" dataKey="Departman" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}