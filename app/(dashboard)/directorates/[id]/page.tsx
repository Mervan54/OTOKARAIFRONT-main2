"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Building2, Users, Target, Award, Briefcase, 
  ChevronDown, ChevronUp, Sparkles, Loader2, ExternalLink
} from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DepartmentBadge } from "@/components/department-badge"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getDirectorateSummary, getDirectorateTaskAnalysis } from "@/lib/api"
import type { Directorate, Department } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

const MAX_VISIBLE_ITEMS = 5

function getAiRateBadgeClass(rate: number): string {
  if (rate >= 70) return "bg-red-50 text-red-700 border-red-200"
  if (rate >= 60) return "bg-green-50 text-green-700 border-green-200"
  if (rate >= 50) return "bg-blue-100 text-blue-700 border-blue-200"
  return "bg-blue-50 text-blue-600 border-blue-100"
}

function getAvgBadgeClass(rate: number): string {
  if (rate >= 70) return "bg-red-100 text-red-800"
  if (rate >= 60) return "bg-green-100 text-green-800"
  if (rate >= 50) return "bg-blue-100 text-blue-800"
  return "bg-gray-100 text-gray-700"
}

function calcDeptAverage(tasks: any[]): number {
  if (!tasks || tasks.length === 0) return 0
  const total = tasks.reduce((acc, t) => acc + (t.aiSupportRate ?? 0), 0)
  return Math.round(total / tasks.length)
}

function DepartmentCard({ dept, avgRate }: { 
  dept: Department
  avgRate?: number
}) {
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
                {avgRate !== undefined && (
                  <Badge className={getAvgBadgeClass(avgRate)}>
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
                <Target className="h-4 w-4" />
                Amaclar
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
                  {showAllGoals ? "Daha az goster" : `+${dept.goals.length - MAX_VISIBLE_ITEMS} daha goster`}
                </Button>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Award className="h-4 w-4" />
                Yetkinlikler
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
                  {showAllSkills ? "Daha az goster" : `+${dept.skills.length - MAX_VISIBLE_ITEMS} daha goster`}
                </Button>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                Ana Sorumluluklar
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
                  {showAllResp ? "Daha az goster" : `+${dept.responsibilities.length - MAX_VISIBLE_ITEMS} daha goster`}
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

  const deptAverages: Record<string, number> = {}
  if (analysisResult?.data?.departments) {
    analysisResult.data.departments.forEach((dept: any) => {
      deptAverages[dept.department] = calcDeptAverage(dept.tasks)
    })
  }

  const allTasks = analysisResult?.data?.departments?.flatMap((d: any) => d.tasks ?? []) ?? []
  const overallAvg = calcDeptAverage(allTasks)

  useEffect(() => {
    async function fetchData() {
      const data = await getDirectorateSummary()
      const found = data.find((d: any) => d.id === id)
      setDirectorate(found || null)
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleAnalyze = async () => {
    if (!directorate) return
    setIsAnalyzing(true)
    try {
      const result = await getDirectorateTaskAnalysis(directorate.name)
      setAnalysisResult(result)
      setShowAnalysis(true)
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
        <AppHeader title="Bulunamadi" />
        <div className="flex flex-col items-center justify-center p-12">
          <Building2 className="h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Direktörlük bulunamadı</h2>
          <p className="mt-2 text-muted-foreground">Aradığınız direktörluk mevcut değil.</p>
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

        {/* StatCards + AI Analiz butonu üstte */}
        <div className="grid gap-6 md:grid-cols-2">
          <StatCard title="Toplam Kişi" value={totalPersons} icon={Users} />
          <StatCard title="Departman Sayısı" value={directorate.departmentCount} icon={Building2} />
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="gap-1.5"
          >
            {isAnalyzing ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Analiz ediliyor...</>
            ) : analysisResult ? (
              <><Sparkles className="h-3.5 w-3.5" /> Yeniden Analiz Et</>
            ) : (
              <><Sparkles className="h-3.5 w-3.5" /> AI Analiz</>
            )}
          </Button>
        </div>

        {/* AI Analysis Result */}
        {showAnalysis && analysisResult && (
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  AI Analiz Sonuçları
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAnalysis(false)}>
                  Kapat
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysisResult?.data?.departments?.map((dept: any, di: number) => (
                  <div key={di} className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground border-b pb-1 flex items-center justify-between">
                      <span>{dept.department}</span>
                      <Badge className={getAvgBadgeClass(calcDeptAverage(dept.tasks))}>
                        Ort. %{calcDeptAverage(dept.tasks)}
                      </Badge>
                    </h3>
                    <div className="space-y-2">
                      {dept.tasks?.map((task: any, ti: number) => (
                        <div key={ti} className="rounded-lg border bg-card p-3 border-l-4 border-l-primary/40">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{task.taskSummary}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">📁 {task.department}</p>
                            </div>
                            <Badge variant="outline" className={`text-xs shrink-0 ${getAiRateBadgeClass(task.aiSupportRate)}`}>
                              %{task.aiSupportRate}
                            </Badge>
                          </div>
                          <div className="mb-1.5">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full bg-primary transition-all" style={{ width: `${task.aiSupportRate}%` }} />
                            </div>
                          </div>
                          {task.projectIdea && (
                            <p className="text-xs text-blue-600 mb-1">💡 {task.projectIdea}</p>
                          )}
                          {task.similarProjectName && task.similarProjectName !== "Not Found" && (
                            <a
                              href={task.similarProjectLink && task.similarProjectLink !== "Not Found" ? task.similarProjectLink : "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                            >
                              <ExternalLink className="h-3 w-3 shrink-0" />
                              {task.similarProjectName}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <h2 className="mb-4 mt-8 text-lg font-semibold">Departmanlar</h2>
        <div className="flex flex-col gap-6">
          {directorate.departments.map((dept: Department) => (
            <DepartmentCard
              key={dept.id}
              dept={dept}
              avgRate={deptAverages[dept.name]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}