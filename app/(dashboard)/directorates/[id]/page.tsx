"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Building2, Users, Target, Award, Briefcase, 
  ChevronDown, ChevronUp, Sparkles, Loader2 
} from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DepartmentBadge } from "@/components/department-badge"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { getDirectorateSummary, getAIAnalysis } from "@/lib/api"
import type { Directorate, Department, AIAnalysisResponse } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PageProps {
  params: Promise<{ id: string }>
}

const MAX_VISIBLE_ITEMS = 5

function DepartmentCard({ dept, onAnalyze, isAnalyzing }: { 
  dept: Department
  onAnalyze: () => void
  isAnalyzing: boolean 
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
              <Badge className="mt-2">{new Set(dept.adSoyadlar ?? []).size} Kişi</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onAnalyze()
                }}
                disabled={isAnalyzing}
                className="gap-1.5"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5" />
                )}
                AI Analiz
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
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
  const [analyzingDept, setAnalyzingDept] = useState<string | null>(null)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResponse | null>(null)
  const [showAllPeople, setShowAllPeople] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const data = await getDirectorateSummary()
      const found = data.find((d: any) => d.id === id)
      setDirectorate(found || null)
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleAnalyze = async (deptName: string) => {
    console.log("Directorate name:", directorate?.name)
  console.log("Department name:", deptName)
    if (!directorate) return
    setAnalyzingDept(deptName)
    setShowAllPeople(false)
    try {
      const result = await getAIAnalysis(directorate.name, deptName)
      setAnalysisResult(result)
      setShowAnalysis(true)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setAnalyzingDept(null)
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
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
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

        <div className="grid gap-6 md:grid-cols-2">
          <StatCard title="Toplam Kişi" value={totalPersons} icon={Users} />
          <StatCard title="Departman Sayısı" value={directorate.departmentCount} icon={Building2} />
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
              
  <div className="space-y-4">
    {analysisResult.tasks.map((task, i) => (
      <div key={i} className="space-y-3">
        
        {/* Genel özet */}
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{task.task}</span>
            <Badge variant="outline" className={cn(
              task.bestSolution === "AI" && "bg-purple-100 text-purple-700",
              task.bestSolution === "RPA" && "bg-blue-100 text-blue-700",
              task.bestSolution === "Hybrid" && "bg-emerald-100 text-emerald-700",
            )}>
              {task.bestSolution}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{task.recommendation}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-primary transition-all" style={{ width: `${task.automationRate}%` }} />
            </div>
            <span className="text-xs text-muted-foreground">%{task.automationRate}</span>
          </div>
        </div>

        {/* Her proje önerisini ayrı görev kartı olarak göster */}
        {task.projectIdeas && task.projectIdeas.length > 0 && (
          <div className="space-y-2 ml-4">
            <p className="text-xs font-semibold text-muted-foreground">Proje Önerileri:</p>
            {task.projectIdeas.map((p: any, pi: number) => (
              <div key={pi} className="rounded-lg border bg-card p-4 border-l-4 border-l-primary/40">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{p.projectIdea}</p>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs">
                    Proje {pi + 1}
                  </Badge>
                </div>
                <p className="text-sm text-blue-600 mb-1">💡 {p.projectIdea}</p>
                {p.similarProjectName && p.similarProjectLink && (
                  <a
                    href={p.similarProjectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    🔗 {p.similarProjectName}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Sorumlu Kişiler */}
       {task.responsiblePeople && task.responsiblePeople.length > 0 && (
  <div className="rounded-lg border bg-card p-4">
    <p className="text-xs font-medium text-muted-foreground mb-2">Bu projeyi yapabilecekler:</p>
    <div className="flex flex-wrap gap-2">
      {[...new Map(task.responsiblePeople.map((rp: any) => [rp.name, rp])).values()]
        .slice(0, 4)
        .map((rp: any, ri: number) => (
          <div key={ri} className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">{rp.name}</span>
            <DepartmentBadge name={rp.department} />
          </div>
        ))}
      {[...new Map(task.responsiblePeople.map((rp: any) => [rp.name, rp])).values()].length > 4 && (
        <button
          onClick={() => setShowAllPeople(!showAllPeople)}
          className="text-xs text-primary hover:underline"
        >
          +{[...new Map(task.responsiblePeople.map((rp: any) => [rp.name, rp])).values()].length - 4} daha
        </button>
      )}
    </div>
    {showAllPeople && (
      <div className="mt-2 flex flex-wrap gap-2">
        {[...new Map(task.responsiblePeople.map((rp: any) => [rp.name, rp])).values()]
          .slice(4)
          .map((rp: any, ri: number) => (
            <div key={ri} className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">{rp.name}</span>
              <DepartmentBadge name={rp.department} />
            </div>
          ))}
      </div>
    )}
  </div>
)}

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
              onAnalyze={() => handleAnalyze(dept.name)}
              isAnalyzing={analyzingDept === dept.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}