"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Building2, Users, Maximize2, Minimize2, X, Sparkles } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDirectorateSummary, getDirectorateAiResult } from "@/lib/api"
import type { Directorate } from "@/lib/types"
import { createPortal } from "react-dom"

function getCardColorClass(rate: number): string {
  if (rate >= 70) return "bg-green-200 border-green-500"
  if (rate >= 60) return "bg-green-100 border-green-400"
  if (rate >= 50) return "bg-green-50 border-green-300"
  if (rate > 0) return "bg-green-50 border-green-300"
  return ""
}

function getCardTextClass(rate: number): string {
  if (rate >= 70) return "text-green-900"
  if (rate >= 60) return "text-green-800"
  if (rate >= 50) return "text-green-700"
  if (rate > 0) return "text-green-700"
  return ""
}

function getBadgeClass(rate: number): string {
  if (rate >= 70) return "bg-green-300 text-green-900"
  if (rate >= 60) return "bg-green-200 text-green-900"
  if (rate >= 50) return "bg-green-100 text-green-800"
  if (rate > 0) return "bg-green-100 text-green-800"
  return "bg-gray-100 text-gray-600"
}

function getDeptAiBadgeClass(rate: number): string {
  if (rate >= 70) return "bg-green-200 text-green-800 border-green-400"
  if (rate >= 50) return "bg-blue-100 text-blue-800 border-blue-300"
  if (rate > 0) return "bg-gray-100 text-gray-600 border-gray-300"
  return ""
}

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

function DepartmentPopup({
  directorate,
  deptAnalyses,
  deptTaskCounts,
  onClose,
}: {
  directorate: Directorate
  deptAnalyses: Record<string, any>
  deptTaskCounts: Record<string, number>
  onClose: () => void
}) {
  const [isMaximized, setIsMaximized] = useState(false)

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className={`bg-white dark:bg-gray-900 rounded-xl shadow-2xl border flex flex-col transition-all duration-200 ${
          isMaximized ? "w-full h-full rounded-none" : "w-full max-w-2xl mx-4 max-h-[85vh]"
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <div>
            <h3 className="font-semibold text-base">{directorate.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{directorate.departmentCount} Departman</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMaximized(!isMaximized)} className="text-muted-foreground hover:text-foreground p-1">
              {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {directorate.departments.map((dept) => {
            const deptAvg = deptAnalyses[dept.name] ?? 0
            const personCount = new Set(dept.adSoyadlar ?? []).size
            const taskCount = deptTaskCounts[dept.name] ?? 0
            return (
              <div key={dept.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{dept.name}</p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge variant="secondary" className="text-xs">{personCount} Kişi</Badge>
                    {taskCount > 0 && (
                      <Badge variant="outline" className="text-xs">{taskCount} Görev</Badge>
                    )}
                    {deptAvg > 0 && (
                      <Badge className={`text-xs flex items-center gap-1 ${getBadgeClass(deptAvg)}`}>
                        <Sparkles className="h-3 w-3" />
                        %{deptAvg} AI
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function DirectoratesPage() {
  const [directorates, setDirectorates] = useState<Directorate[]>([])
  const [loading, setLoading] = useState(true)
  const [aiData, setAiData] = useState<Record<string, {
    avg: number
    deptAnalyses: Record<string, number>
    totalTasks: number
    deptTaskCounts: Record<string, number>
  }>>({})
  const [popupDirectorate, setPopupDirectorate] = useState<Directorate | null>(null)

  useEffect(() => {
    async function fetchData() {
      const data = await getDirectorateSummary()
      setDirectorates(data)
      setLoading(false)

      // Görev sayıları dahil tüm veriyi AI sonucundan al
      data.forEach(async (dir: Directorate) => {
        try {
          const birimKodu = dirToBirim[dir.name] ?? dir.name
          const result = await getDirectorateAiResult(birimKodu)
          if (result?.data?.mudurlukler) {
            const deptAnalyses: Record<string, number> = {}
            const deptTaskCounts: Record<string, number> = {}
            let totalTasks = 0

            result.data.mudurlukler.forEach((m: any) => {
              deptAnalyses[m.mudurluk] = m.averageAiAutomationRate

              // Her kişinin görev sayısını topla
              const mudurlukTaskCount = (m.persons ?? []).reduce(
                (acc: number, p: any) => acc + (p.TaskAnalyses?.length ?? 0),
                0
              )
              deptTaskCounts[m.mudurluk] = mudurlukTaskCount
              totalTasks += mudurlukTaskCount
            })

            const avg = result.data.averageAiAutomationRate ?? 0
            setAiData(prev => ({
              ...prev,
              [dir.name]: { avg, deptAnalyses, totalTasks, deptTaskCounts }
            }))
          }
        } catch { }
      })
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div>
        <AppHeader title="Direktörlükler" description="Tüm Organizasyonel Direktörlükleri görüntüleyiniz" />
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHeader title="Direktörlükler" description="Tüm Organizasyonel Direktörlükleri Görüntüleyiniz" />
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {directorates.map((directorate) => {
            const ai = aiData[directorate.name]
            const avg = ai?.avg ?? 0
            const cardBg = avg > 0 ? getCardColorClass(avg) : ""
            const cardText = avg > 0 ? getCardTextClass(avg) : ""
            const personCount = new Set(directorate.departments.flatMap(d => d.adSoyadlar ?? [])).size
            const totalTasks = ai?.totalTasks ?? 0

            return (
              <Card key={directorate.id} className={`group transition-shadow hover:shadow-md flex flex-col border ${cardBg}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant="outline" className={cardText}>{personCount} Kişi</Badge>
                      {avg > 0 && (
                        <Badge className={`text-xs flex items-center gap-1 ${getBadgeClass(avg)}`}>
                          <Sparkles className="h-3 w-3" />
                          %{avg} AI Ort.
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardTitle className={`mt-3 text-lg ${cardText}`}>{directorate.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <div className={`flex items-center gap-2 text-sm ${avg > 0 ? cardText + " opacity-70" : "text-muted-foreground"}`}>
                    <Users className="h-4 w-4" />
                    <span>{directorate.departmentCount} departman</span>
                    {totalTasks > 0 && <span>· {totalTasks} görev</span>}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 flex-1">
                    {directorate.departments.slice(0, 2).map((dept) => {
                      const deptTasks = ai?.deptTaskCounts?.[dept.name] ?? 0
                      const deptAvg = ai?.deptAnalyses?.[dept.name] ?? 0

                      return (
                        <div key={dept.id} className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <Badge variant="secondary" className="text-xs flex-1 justify-start">
                              {dept.name}
                            </Badge>
                            {deptAvg > 0 && (
                              <Badge
                                variant="outline"
                                className={`text-xs shrink-0 flex items-center gap-1 ${getDeptAiBadgeClass(deptAvg)}`}
                              >
                                <Sparkles className="h-2.5 w-2.5" />
                                %{deptAvg}
                              </Badge>
                            )}
                          </div>
                          {deptTasks > 0 && (
                            <span className="text-xs text-muted-foreground ml-1">{deptTasks} görev</span>
                          )}
                        </div>
                      )
                    })}

                    {directorate.departments.length > 2 && (
                      <button
                        onClick={() => setPopupDirectorate(directorate)}
                        className="text-xs text-primary hover:underline text-left"
                      >
                        +{directorate.departments.length - 2} daha
                      </button>
                    )}
                  </div>

                  <Link href={`/directorates/${directorate.id}`}>
                    <Button
                      variant="ghost"
                      className="mt-4 w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Detayları Gör
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {popupDirectorate && typeof window !== "undefined" && (
        <DepartmentPopup
          directorate={popupDirectorate}
          deptAnalyses={aiData[popupDirectorate.name]?.deptAnalyses ?? {}}
          deptTaskCounts={aiData[popupDirectorate.name]?.deptTaskCounts ?? {}}
          onClose={() => setPopupDirectorate(null)}
        />
      )}
    </div>
  )
}