"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import {
  ArrowLeft, Building2, Users, Target, Award, Briefcase,
  ChevronDown, ChevronUp, Sparkles, Loader2, ExternalLink, ChevronLeft, ChevronRight
} from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDirectorateSummary, getDirectorateAiResult } from "@/lib/api"
import type { Directorate, Department } from "@/lib/types"

interface PageProps {
  params: Promise<{ id: string }>
}

const MAX_VISIBLE_ITEMS = 5
const TASKS_PER_PAGE = 20
const CACHE_TTL_MS = 30 * 60 * 1000
const analysisCache = new Map<string, { data: any; timestamp: number }>()

const dirToBirim: Record<string, string> = {
  "Bilgi Teknolojileri": "BT",
  "ASKERI": "Askeri",
  "FINANS": "Finans",
  "Genel": "Genel Müdürlük",
  "İnsanKaynakları": "İnsanKaynakları",
  "KALITE": "Kalite",
  "SatınAlma": "SatınAlma",
  "Satış": "Satış",
  "Ticari Araçlar": "TicariAraçlar",
  "Üretim": "Üretim",
}

function getAiRateBadgeClass(rate: number): string {
  if (rate >= 70) return "bg-green-200 border-green-500 text-green-900"
  if (rate >= 60) return "bg-green-100 border-green-400 text-green-800"
  if (rate >= 50) return "bg-green-50 border-green-300 text-green-700"
  return "bg-blue-50 border-blue-200 text-blue-800"
}

function getAvgBadgeClass(rate: number): string {
  if (rate >= 70) return "bg-green-300 text-green-900 hover:bg-green-300"
  if (rate >= 60) return "bg-green-200 text-green-900 hover:bg-green-200"
  if (rate >= 50) return "bg-green-100 text-green-800 hover:bg-green-100"
  return "bg-blue-100 text-blue-800 hover:bg-blue-100"
}

function getSolutionBadgeClass(solution: string): string {
  if (solution?.includes("AI")) return "bg-purple-50 text-purple-700 border-purple-200"
  if (solution?.includes("RPA")) return "bg-blue-50 text-blue-700 border-blue-200"
  if (solution?.includes("Hybrid") || solution?.includes("Hibrit")) return "bg-emerald-50 text-emerald-700 border-emerald-200"
  return "bg-gray-50 text-gray-700 border-gray-200"
}

function getPairColor(rate: number): { border: string; bg: string; num: string } {
  if (rate >= 70) return { border: "border-l-green-500", bg: "bg-green-200", num: "bg-green-200 text-green-900" }
  if (rate >= 60) return { border: "border-l-green-400", bg: "bg-green-100", num: "bg-green-100 text-green-800" }
  if (rate >= 50) return { border: "border-l-green-300", bg: "bg-green-50", num: "bg-green-50 text-green-700" }
  return { border: "border-l-green-200", bg: "bg-green-50", num: "bg-green-50 text-green-600" }
}

function TaskAnalysisItem({ task, index }: { task: any; index: number }) {
  const rate = task.AiAutomationRate ?? task.aiSupportRate ?? 0
  const color = getPairColor(rate)
  return (
    <div className="flex gap-3">
      <div className="shrink-0 flex flex-col items-center pt-1">
        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${color.num}`}>
          {index + 1}
        </div>
      </div>
      <div className={`flex-1 rounded-lg border-l-4 border p-3 ${color.border} ${color.bg}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">
              {task.Task ?? task.taskSummary}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Badge variant="outline" className={`text-xs ${getAiRateBadgeClass(rate)}`}>
              %{rate}
            </Badge>
            {(task.BestSolution ?? task.bestSolution) && (
              <Badge variant="outline" className={`text-xs ${getSolutionBadgeClass(task.BestSolution ?? task.bestSolution)}`}>
                {task.BestSolution ?? task.bestSolution}
              </Badge>
            )}
          </div>
        </div>
        <div className="mb-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-all" style={{ width: `${rate}%` }} />
          </div>
        </div>
        {task.Recommendation && (
          <p className="text-xs text-muted-foreground mb-1">{task.Recommendation}</p>
        )}
        {(task.ProjectIdea ?? task.projectIdea) && (
          <p className="text-xs text-blue-600 mb-1">💡 {task.ProjectIdea ?? task.projectIdea}</p>
        )}
        {task.ProjectLink && task.ProjectLink !== "Not Found" && (
          <a
            href={task.ProjectLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            {task.ProjectLink}
          </a>
        )}
      </div>
    </div>
  )
}

function TaskList({ persons, allPersonsForShared }: { persons: any[]; allPersonsForShared: any[] }) {
  const [currentPage, setCurrentPage] = useState(1)

  const allTasks = persons
    .flatMap((person: any) =>
      (person.TaskAnalyses ?? []).map((task: any) => {
        const sharedPersons = allPersonsForShared
          .filter((p: any) => p.FullName !== person.FullName)
          .filter((p: any) =>
            p.TaskAnalyses?.some((t: any) =>
              t.Task?.trim().toLowerCase().slice(0, 40) ===
              task.Task?.trim().toLowerCase().slice(0, 40)
            )
          )
          .map((p: any) => p.FullName)

        return {
          ...task,
          _ownerName: person.FullName,
          _sharedPersons: sharedPersons,
        }
      })
    )
    .sort((a: any, b: any) =>
      (b.AiAutomationRate ?? b.aiSupportRate ?? 0) -
      (a.AiAutomationRate ?? a.aiSupportRate ?? 0)
    )

  const totalPages = Math.ceil(allTasks.length / TASKS_PER_PAGE)
  const startIndex = (currentPage - 1) * TASKS_PER_PAGE
  const pagedTasks = allTasks.slice(startIndex, startIndex + TASKS_PER_PAGE)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Sayfanın üstüne scroll et
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {pagedTasks.map((task: any, ti: number) => (
          <div key={ti}>
            <div className="flex items-center gap-1.5 mb-1 ml-9">
              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {task._ownerName?.charAt(0)}
              </div>
              <span className="text-xs text-muted-foreground font-medium">{task._ownerName}</span>
            </div>
            <TaskAnalysisItem task={task} index={startIndex + ti} />
            {task._sharedPersons?.length > 0 && (
              <div className="ml-9 mt-1 mb-1 flex flex-wrap gap-1 items-center">
                <span className="text-xs text-muted-foreground">👥 Ortak:</span>
                {task._sharedPersons.map((name: string) => (
                  <span key={name} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                    {name}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-xs text-muted-foreground">
            {startIndex + 1}–{Math.min(startIndex + TASKS_PER_PAGE, allTasks.length)} / {allTasks.length} görev
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page =>
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1
              )
              .reduce((acc: (number | string)[], page, idx, arr) => {
                if (idx > 0 && (page as number) - (arr[idx - 1] as number) > 1) acc.push("...")
                acc.push(page)
                return acc
              }, [])
              .map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="text-xs text-muted-foreground px-1">...</span>
                ) : (
                  <Button
                    key={item}
                    variant={currentPage === item ? "default" : "outline"}
                    size="icon"
                    className="h-7 w-7 text-xs"
                    onClick={() => handlePageChange(item as number)}
                  >
                    {item}
                  </Button>
                )
              )}

            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function DepartmentCard({ dept, avgRate }: { dept: Department; avgRate?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [showAllGoals, setShowAllGoals] = useState(false)
  const [showAllSkills, setShowAllSkills] = useState(false)
  const [showAllResp, setShowAllResp] = useState(false)

  const visibleGoals = showAllGoals ? dept.goals : dept.goals.slice(0, MAX_VISIBLE_ITEMS)
  const visibleSkills = showAllSkills ? dept.skills : dept.skills.slice(0, MAX_VISIBLE_ITEMS)
  const visibleResp = showAllResp ? dept.responsibilities : dept.responsibilities.slice(0, MAX_VISIBLE_ITEMS)

  return (
    <Card className="transition-shadow hover:shadow-md">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-base">{dept.name}</CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge>{new Set(dept.adSoyadlar ?? []).size} Kişi</Badge>
                {avgRate !== undefined && avgRate > 0 && (
                  <Badge className={getAvgBadgeClass(avgRate)}>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Ort. %{avgRate} AI
                  </Badge>
                )}
              </div>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-4 pt-2">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Target className="h-4 w-4" /> Amaçlar
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visibleGoals.map((goal, i) => (
                  <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 whitespace-normal break-words max-w-full text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
              {dept.goals.length > MAX_VISIBLE_ITEMS && (
                <Button variant="ghost" size="sm" onClick={() => setShowAllGoals(!showAllGoals)} className="mt-2 h-auto p-0 text-xs text-primary">
                  {showAllGoals ? "Daha az göster" : `+${dept.goals.length - MAX_VISIBLE_ITEMS} daha göster`}
                </Button>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Award className="h-4 w-4" /> Yetkinlikler
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visibleSkills.map((skill, i) => (
                  <Badge key={i} variant="outline" className="bg-emerald-50 text-emerald-700 whitespace-normal break-words max-w-full text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
              {dept.skills.length > MAX_VISIBLE_ITEMS && (
                <Button variant="ghost" size="sm" onClick={() => setShowAllSkills(!showAllSkills)} className="mt-2 h-auto p-0 text-xs text-primary">
                  {showAllSkills ? "Daha az göster" : `+${dept.skills.length - MAX_VISIBLE_ITEMS} daha göster`}
                </Button>
              )}
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Briefcase className="h-4 w-4" /> Ana Sorumluluklar
              </div>
              <div className="flex flex-wrap gap-1.5">
                {visibleResp.map((resp, i) => (
                  <Badge key={i} variant="outline" className="bg-amber-50 text-amber-700 whitespace-normal break-words max-w-full text-xs">
                    {resp}
                  </Badge>
                ))}
              </div>
              {dept.responsibilities.length > MAX_VISIBLE_ITEMS && (
                <Button variant="ghost" size="sm" onClick={() => setShowAllResp(!showAllResp)} className="mt-2 h-auto p-0 text-xs text-primary">
                  {showAllResp ? "Daha az göster" : `+${dept.responsibilities.length - MAX_VISIBLE_ITEMS} daha göster`}
                </Button>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default function DirectorateDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const [directorate, setDirectorate] = useState<Directorate | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [selectedMudurluk, setSelectedMudurluk] = useState<string>("all")

  const deptAverages: Record<string, number> = {}
  if (analysisResult?.data?.mudurlukler) {
    analysisResult.data.mudurlukler.forEach((m: any) => {
      deptAverages[m.mudurluk] = m.averageAiAutomationRate
    })
  }

  const allPersons = analysisResult?.data?.mudurlukler?.flatMap((m: any) => m.persons ?? []) ?? []
  const overallAvg = allPersons.length > 0
    ? Math.round(allPersons.reduce((acc: number, p: any) => acc + (p.AverageAiAutomationRate ?? 0), 0) / allPersons.length)
    : 0

  const sortedMudurlukler = analysisResult?.data?.mudurlukler
    ? [...analysisResult.data.mudurlukler].sort(
        (a: any, b: any) => b.averageAiAutomationRate - a.averageAiAutomationRate
      )
    : []

  const filteredMudurlukler = selectedMudurluk === "all"
    ? sortedMudurlukler
    : sortedMudurlukler.filter((m: any) => m.mudurluk === selectedMudurluk)

  useEffect(() => {
    async function fetchAnalysis(directorateName: string) {
      const cached = analysisCache.get(directorateName)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setAnalysisResult(cached.data)
        setShowAnalysis(true)
        return
      }
      const birimKodu = dirToBirim[directorateName] ?? directorateName
      const result = await getDirectorateAiResult(birimKodu)
      if (result?.data?.mudurlukler) {
        analysisCache.set(directorateName, { data: result, timestamp: Date.now() })
        setAnalysisResult(result)
        setShowAnalysis(true)
      }
    }

    async function fetchData() {
      const data = await getDirectorateSummary()
      const found = data.find((d: any) => d.id === id)
      setDirectorate(found || null)
      setLoading(false)
      if (found) {
        try {
          await fetchAnalysis(found.name)
        } catch { }
      }
    }
    fetchData()
  }, [id])

  const handleAnalyze = async () => {
    if (!directorate) return
    setIsAnalyzing(true)
    try {
      const birimKodu = dirToBirim[directorate.name] ?? directorate.name
      const result = await getDirectorateAiResult(birimKodu)
      if (result?.data?.mudurlukler) {
        analysisCache.set(directorate.name, { data: result, timestamp: Date.now() })
        setAnalysisResult(result)
        setShowAnalysis(true)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="flex h-16 items-center gap-4 border-b border-border px-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!directorate) {
    return (
      <div>
        <AppHeader title="Bulunamadı" />
        <div className="flex flex-col items-center justify-center p-12">
          <Building2 className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Direktörlük bulunamadı</h2>
          <p className="mt-2 text-muted-foreground">Aradığınız direktörlük mevcut değil.</p>
          <Link href="/directorates">
            <Button className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Direktörlüklere Dön
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const totalPersons = new Set(directorate.departments.flatMap(d => d.adSoyadlar ?? [])).size

  return (
    <div>
      <AppHeader title={directorate.name} description="Direktörlük Detayları ve Departmanlar" />
      <div className="p-6">
        <Link href="/directorates">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Direktörlüklere Dön
          </Button>
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          <StatCard title="Toplam Kişi" value={totalPersons} icon={Users} />
          <StatCard title="Departman Sayısı" value={directorate.departmentCount} icon={Building2} />
        </div>

        <div className="flex justify-end mt-4">
          <Button variant="outline" size="sm" onClick={handleAnalyze} disabled={isAnalyzing} className="gap-1.5">
            {isAnalyzing ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analiz ediliyor...</>
            ) : analysisResult ? (
              <><Sparkles className="h-3.5 w-3.5" /> Yeniden Yükle</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> AI Analiz</>
            )}
          </Button>
        </div>

        {showAnalysis && analysisResult && (
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Analiz Sonuçları
                  {overallAvg > 0 && (
                    <Badge className={`ml-2 ${getAvgBadgeClass(overallAvg)}`}>
                      Genel Ort. %{overallAvg}
                    </Badge>
                  )}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(false)}>
                  Kapat
                </Button>
              </div>

              {sortedMudurlukler.length > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-sm text-muted-foreground shrink-0">Müdürlük:</span>
                  <Select
                    value={selectedMudurluk}
                    onValueChange={(val) => {
                      setSelectedMudurluk(val)
                    }}
                  >
                    <SelectTrigger className="w-72">
                      <SelectValue placeholder="Müdürlük seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        Tümü 
                      </SelectItem>
                      {sortedMudurlukler.map((m: any) => (
                        <SelectItem key={m.mudurluk} value={m.mudurluk}>
                          <div className="flex items-center gap-4 w-full">
                            <span>{m.mudurluk}</span>
                            <Badge className={`text-xs ml-2 ${getAvgBadgeClass(m.averageAiAutomationRate)}`}>
                              %{m.averageAiAutomationRate}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {selectedMudurluk === "all" ? (
                <TaskList
                  persons={allPersons}
                  allPersonsForShared={allPersons}
                />
              ) : (
                <div className="space-y-8">
                  {filteredMudurlukler.map((mudurluk: any, di: number) => (
                    <div key={di} className="space-y-3">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">
                          {mudurluk.mudurluk}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {mudurluk.personCount} Kişi
                          </Badge>
                          <Badge className={getAvgBadgeClass(mudurluk.averageAiAutomationRate)}>
                            <Sparkles className="h-3 w-3 mr-1" />
                            Ort. %{mudurluk.averageAiAutomationRate}
                          </Badge>
                        </div>
                      </div>
                      <TaskList
                        persons={mudurluk.persons}
                        allPersonsForShared={mudurluk.persons}
                      />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <h2 className="mb-4 mt-8 text-lg font-semibold">Departmanlar</h2>
        <div className="flex flex-col gap-6">
          {directorate.departments.map((dept: Department) => (
            <DepartmentCard key={dept.id} dept={dept} avgRate={deptAverages[dept.name]} />
          ))}
        </div>
      </div>
    </div>
  )
}