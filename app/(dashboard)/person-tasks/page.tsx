"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ChevronLeft, ChevronRight, Users, Sparkles, Loader2, Maximize2, Minimize2, ExternalLink } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DepartmentBadge } from "@/components/department-badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createPortal } from "react-dom"
import { getPersonAiAnalysis } from "@/lib/api"

const API_BASE = process.env.NEXT_PUBLIC_API_URL!
//const API_BASE="http://localhost:5091/api/Analysis"
const PAGE_SIZE = 16

interface PersonTask {
  sicilNo: string
  adSoyad: string
  mudurluk: string
  birim: string
  anaSorumluluk: string
}

interface PersonGroup {
  adSoyad: string
  sicilNo: string
  mudurluk: string
  birim: string
  gorevler: string[]
}

function getCardColorClass(rate: number): string {
  if (rate >= 70) return "bg-green-200 border-green-500"
  if (rate >= 60) return "bg-green-100 border-green-400"
  if (rate >= 50) return "bg-green-50 border-green-300"
  return "bg-green-50 border-green-300"
}

function getCardTextClass(rate: number): string {
  if (rate >= 70) return "text-green-900"
  if (rate >= 60) return "text-green-800"
  if (rate >= 50) return "text-green-700"
  return "text-green-700"
}

function getBadgeClass(rate: number): string {
  if (rate >= 70) return "bg-green-300 text-green-900 hover:bg-green-300"
  if (rate >= 60) return "bg-green-200 text-green-900 hover:bg-green-200"
  if (rate >= 50) return "bg-green-100 text-green-800 hover:bg-green-100"
  return "bg-green-100 text-green-800 hover:bg-green-100"
}

function parseGorevMaddeler(gorev: string): string[] {
  if (gorev.includes("¤")) {
    const parts = gorev.split("¤").map(s => s.trim()).filter(s => s.length > 2)
    if (parts.length > 1) return parts
  }
  return [gorev]
}

function findSharedPersons(madde: string, currentPerson: PersonGroup, allPersons: PersonGroup[]): PersonGroup[] {
  const key = madde.trim().toLowerCase().slice(0, 40)
  if (key.length < 10) return []
  return allPersons.filter(p => {
    if (p.adSoyad === currentPerson.adSoyad && p.mudurluk === currentPerson.mudurluk) return false
    return p.gorevler.some(g => {
      const maddeler = parseGorevMaddeler(g)
      return maddeler.some(m => m.trim().toLowerCase().slice(0, 40).includes(key.slice(0, 25)))
    })
  }).slice(0, 4)
}

function parsePersonAiResult(data: any) {
  return {
    averageRate: data.averageAiAutomationRate ?? 0,
    generalComment: data.generalComment ?? "",
    taskAnalyses: data.taskAnalyses ?? [],
    fromCache: data.fromCache ?? false,
  }
}

// ✅ Otomasyon oranına göre renk

 function getPairColor(rate: number): { border: string; bg: string; num: string } {
  if (rate >= 70) return { border: "border-l-green-500", bg: "bg-green-200", num: "bg-green-200 text-green-900" }
  if (rate >= 60) return { border: "border-l-green-400", bg: "bg-green-100", num: "bg-green-100 text-green-800" }
  if (rate >= 50) return { border: "border-l-green-300", bg: "bg-green-50", num: "bg-green-50 text-green-700" }
  return { border: "border-l-green-200", bg: "bg-green-50", num: "bg-green-50 text-green-600" }
}


function PersonPopup({
  person, aiData, allPersons, onClose
}: {
  person: PersonGroup
  aiData: any | null
  allPersons: PersonGroup[]
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
            <h3 className="font-semibold text-base">{person.adSoyad}</h3>
            <div className="flex items-center gap-2 mt-1">
              <DepartmentBadge name={person.mudurluk} />
              <span className="text-xs text-muted-foreground">{person.birim}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {aiData && (
              <Badge className={getBadgeClass(aiData.averageRate)}>
                %{aiData.averageRate} Otomasyon
              </Badge>
            )}
            <button onClick={() => setIsMaximized(!isMaximized)} className="text-muted-foreground hover:text-foreground p-1">
              {isMaximized ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg font-bold p-1">✕</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Görevler */}
          <div>
            <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
              Görevler ({person.gorevler.length})
            </h4>
            <div className="space-y-3">
              {person.gorevler.map((gorev, gi) => {
                const maddeler = parseGorevMaddeler(gorev)
                // AI analizindeki aynı index'in oranına göre renk
  
               return (
 
                <div key={gi} className="rounded-lg border p-3">
                    {maddeler.length > 1 ? (
                      <ul className="space-y-2">
                        {maddeler.map((madde, mi) => {
                          const sharedPersons = findSharedPersons(madde, person, allPersons)
                          return (
                            <li key={mi} className="space-y-1">
                              <div className="flex gap-2 text-sm text-muted-foreground">
                                <span className="text-primary shrink-0 font-bold">{mi + 1}.</span>
                                <span>{madde}</span>
                              </div>
                              {sharedPersons.length > 0 && (
                                <div className="ml-5 flex flex-wrap gap-1 items-center">
                                  <span className="text-xs text-muted-foreground">👥 Ortak:</span>
                                  {sharedPersons.map(sp => (
                                    <div key={`${sp.adSoyad}-${sp.mudurluk}`} className="flex items-center gap-1">
                                      <span className="text-xs text-muted-foreground">{sp.adSoyad}</span>
                                      <DepartmentBadge name={sp.mudurluk} />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">{gorev}</p>
                        {(() => {
                          const sharedPersons = findSharedPersons(gorev, person, allPersons)
                          return sharedPersons.length > 0 ? (
                            <div className="flex flex-wrap gap-1 items-center mt-1">
                              <span className="text-xs text-muted-foreground">👥 Ortak:</span>
                              {sharedPersons.map(sp => (
                                <div key={`${sp.adSoyad}-${sp.mudurluk}`} className="flex items-center gap-1">
                                  <span className="text-xs text-muted-foreground">{sp.adSoyad}</span>
                                  <DepartmentBadge name={sp.mudurluk} />
                                </div>
                              ))}
                            </div>
                          ) : null
                        })()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI Analiz Sonucu */}
          {aiData && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Analiz Sonucu
              </h4>

              {aiData.generalComment && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 mb-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{aiData.generalComment}</p>
                </div>
              )}

              <div className="space-y-3">
                {aiData.taskAnalyses.map((t: any, i: number) => {
                  const color = getPairColor(t.aiAutomationRate)
                  return (
                    <div key={i} className="flex gap-2">
                      <div className="shrink-0 flex flex-col items-center pt-1">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${color.num}`}>
                          {i + 1}
                        </div>
                      </div>
                      <div className={`flex-1 rounded-lg border-l-4 border p-3 ${color.border} ${color.bg}`}>
                        <div className="flex items-start justify-between mb-1 gap-2">
                          <p className="text-xs font-medium text-muted-foreground line-clamp-2 flex-1">{t.task}</p>
                          <div className="flex items-center gap-1 shrink-0">
                            <Badge variant="outline" className="text-xs whitespace-nowrap">{t.bestSolution}</Badge>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">%{t.aiAutomationRate}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{t.recommendation}</p>
                        {t.projectIdea && (
                          <div className="mb-1">
                            <p className="text-xs text-blue-600">💡 {t.projectIdea}</p>
                            {t.projectLink && t.projectLink !== "" && (
                              <a
                                href={t.projectLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-primary hover:underline mt-0.5"
                              >
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                {t.projectLink}
                              </a>
                            )}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-primary transition-all" style={{ width: `${t.aiAutomationRate}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}

function PersonCard({
  person,
  allPersons,
  isAnalyzing,
  canAnalyze,
  onAnalyze,
  aiData,
  forceOpen,
  onPopupClose,
}: {
  person: PersonGroup
  allPersons: PersonGroup[]
  isAnalyzing: boolean
  canAnalyze: boolean
  onAnalyze: () => void
  aiData: any | null
  forceOpen?: boolean
  onPopupClose?: () => void
}) {
  const [showPopup, setShowPopup] = useState(false)
  const toplamMadde = person.gorevler.reduce((acc, g) => acc + parseGorevMaddeler(g).length, 0)
  const MAX_GOREV = 3

  useEffect(() => {
    if (forceOpen) setShowPopup(true)
  }, [forceOpen])

  const cardBg = aiData ? getCardColorClass(aiData.averageRate) : ""
  const cardText = aiData ? getCardTextClass(aiData.averageRate) : ""

  return (
    <>
      <Card className={`flex flex-col border ${aiData ? cardBg : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className={`text-sm truncate ${cardText}`}>{person.adSoyad}</CardTitle>
              <div className="mt-1">
                <DepartmentBadge name={person.mudurluk} />
              </div>
              <p className={`mt-1 text-xs truncate ${aiData ? cardText + " opacity-70" : "text-muted-foreground"}`}>{person.birim}</p>
            </div>
          </div>
          <div className="flex gap-1 mt-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">{toplamMadde} Görev</Badge>
            {aiData && (
              <Badge className={`text-xs ${getBadgeClass(aiData.averageRate)}`}>
                %{aiData.averageRate} AI
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3">
          <div className="space-y-1.5 overflow-hidden">
            {person.gorevler.slice(0, MAX_GOREV).map((gorev, i) => {
              const maddeler = parseGorevMaddeler(gorev)
              return (
                <div key={i} className={`flex gap-2 text-xs ${aiData ? cardText + " opacity-80" : "text-muted-foreground"}`}>
                  <span className="text-primary shrink-0 font-bold mt-0.5">{i + 1}.</span>
                  <span className="line-clamp-2">
                    {maddeler.length > 1 ? `${maddeler[0].slice(0, 80)}...` : gorev.slice(0, 80)}{gorev.length > 80 ? "..." : ""}
                  </span>
                </div>
              )
            })}
            {person.gorevler.length > MAX_GOREV && (
              <button onClick={() => setShowPopup(true)} className="text-xs text-primary hover:underline ml-4">
                +{person.gorevler.length - MAX_GOREV} görev daha
              </button>
            )}
          </div>

          <div className="flex gap-2 mt-auto">
            <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={onAnalyze} disabled={isAnalyzing || !canAnalyze || !!aiData}>
              {isAnalyzing ? (
                <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Analiz...</>
              ) : aiData ? (
                <><Sparkles className="mr-1 h-3 w-3" /> Tamam</>
              ) : !canAnalyze ? (
                <><Loader2 className="mr-1 h-3 w-3" /> Bekliyor...</>
              ) : (
                <><Sparkles className="mr-1 h-3 w-3" /> AI Analiz</>
              )}
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowPopup(true)}>
              Detay
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPopup && typeof window !== "undefined" && (
        <PersonPopup
          person={person}
          aiData={aiData}
          allPersons={allPersons}
          onClose={() => {
            setShowPopup(false)
            onPopupClose?.()
          }}
        />
      )}
    </>
  )
}

export default function PersonTasksPage() {
  const [allRecords, setAllRecords] = useState<PersonTask[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBirim, setSelectedBirim] = useState("all")
  const [selectedDept, setSelectedDept] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [analyzingPersonKey, setAnalyzingPersonKey] = useState<string | null>(null)
  const [aiResults, setAiResults] = useState<Record<string, any>>({})
  const [openPopupKey, setOpenPopupKey] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const rawRes = await fetch(`${API_BASE}/raw`)
      const raw = await rawRes.json()
      setAllRecords(raw.map((r: any) => ({
        sicilNo: r.sicilNo ?? "",
        adSoyad: r.ad_soyad ?? "",
        mudurluk: r.mudurluk ?? "",
        birim: r.birim ?? "",
        anaSorumluluk: r.anaSorumluluk ?? "",
      })))
      setLoading(false)
    }
    fetchData()
  }, [])

  const personGroups = useMemo(() => {
    const map = new Map<string, PersonGroup>()
    allRecords.forEach(record => {
      if (!record.adSoyad || !record.anaSorumluluk) return
      const key = `${record.adSoyad}-${record.mudurluk}`
      if (map.has(key)) {
        const existing = map.get(key)!
        if (!existing.gorevler.includes(record.anaSorumluluk)) {
          existing.gorevler.push(record.anaSorumluluk)
        }
      } else {
        map.set(key, {
          adSoyad: record.adSoyad,
          sicilNo: record.sicilNo,
          mudurluk: record.mudurluk,
          birim: record.birim,
          gorevler: [record.anaSorumluluk],
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.adSoyad.localeCompare(b.adSoyad, "tr"))
  }, [allRecords])

  const birims = useMemo(() => {
    return [...new Set(personGroups.map(p => p.birim).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "tr", { sensitivity: "base" })
    )
  }, [personGroups])

  const departments = useMemo(() => {
    const filtered = selectedBirim === "all" ? personGroups : personGroups.filter(p => p.birim === selectedBirim)
    return [...new Set(filtered.map(p => p.mudurluk).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, "tr", { sensitivity: "base" })
    )
  }, [personGroups, selectedBirim])

  const filteredPersons = useMemo(() => {
    let result = [...personGroups]
    if (selectedBirim !== "all") result = result.filter(p => p.birim === selectedBirim)
    if (selectedDept !== "all") result = result.filter(p => p.mudurluk === selectedDept)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.adSoyad.toLowerCase().includes(q) ||
        p.mudurluk.toLowerCase().includes(q) ||
        p.birim.toLowerCase().includes(q) ||
        p.gorevler.some(g => g.toLowerCase().includes(q))
      )
    }
    return result
  }, [personGroups, selectedBirim, selectedDept, searchQuery])

  const totalPages = Math.ceil(filteredPersons.length / PAGE_SIZE)
  const paginatedPersons = filteredPersons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  useEffect(() => {
    async function fetchPageAnalyses() {
      const toFetch = paginatedPersons.filter(p =>
        p.sicilNo && !aiResults[`${p.adSoyad}-${p.mudurluk}`]
      )
      await Promise.all(
        toFetch.map(async (person) => {
          try {
            const data = await getPersonAiAnalysis(person.sicilNo)
            const parsed = parsePersonAiResult(data)
            const key = `${person.adSoyad}-${person.mudurluk}`
            setAiResults(prev => ({ ...prev, [key]: parsed }))
          } catch {
            // Analiz yoksa sessizce geç
          }
        })
      )
    }
    if (paginatedPersons.length > 0 && !loading) {
      fetchPageAnalyses()
    }
  }, [paginatedPersons, loading])

  const handleBirimChange = (val: string) => {
    setSelectedBirim(val)
    setSelectedDept("all")
    setCurrentPage(1)
  }

  const handleAnalyze = async (person: PersonGroup) => {
    const key = `${person.adSoyad}-${person.mudurluk}`
    if (analyzingPersonKey !== null || aiResults[key]) return

    setAnalyzingPersonKey(key)
    try {
      try {
        await fetch(`${API_BASE}/index-all-csv`, { method: "POST" })
      } catch { }

      const data = await getPersonAiAnalysis(person.sicilNo)
      const parsed = parsePersonAiResult(data)
      setAiResults(prev => ({ ...prev, [key]: parsed }))
      setOpenPopupKey(key)
    } catch (err) {
      console.error("Kişi analizi hatası:", err)
    } finally {
      setAnalyzingPersonKey(null)
    }
  }

  if (loading) {
    return (
      <div>
        <AppHeader title="Kişi Görev Analizi" description="Kişi bazlı görev ve otomasyon analizi" />
        <div className="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      </div>
    )
  }

  const totalDepts = new Set(personGroups.map(p => p.mudurluk)).size

  return (
    <div>
      <AppHeader title="Kişi Görev Analizi" description="Kişi bazlı görev ve otomasyon analizi" />
      <div className="p-6 space-y-6">

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Toplam Çalışan</p>
            <p className="mt-1 text-3xl font-bold text-primary">
              {new Set(filteredPersons.map(p => p.adSoyad)).size}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm text-muted-foreground">Toplam Departman</p>
            <p className="mt-1 text-3xl font-bold text-primary">{totalDepts}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={selectedBirim} onValueChange={handleBirimChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Birim seç..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Birimler</SelectItem>
              {["Askeri", "BT", "Finans", "Genel", "İnsanKaynakları", "Kalite", "SatınAlma", "Satış", "TicariAraçlar", "Üretim"].map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDept} onValueChange={(val) => { setSelectedDept(val); setCurrentPage(1) }} disabled={selectedBirim === "all"}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Departman seç..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Departmanlar</SelectItem>
              {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Kişi, departman veya görev ara..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1) }}
              className="pl-9"
            />
          </div>
        </div>

        {analyzingPersonKey && (
          <div className="rounded-lg border bg-amber-50 border-amber-200 p-3 text-sm text-amber-700 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analiz devam ediyor... Tamamlanana kadar diğer analizler bekleyecek.
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {paginatedPersons.map((person) => {
            const key = `${person.adSoyad}-${person.mudurluk}`
            return (
              <PersonCard
                key={key}
                person={person}
                allPersons={personGroups}
                isAnalyzing={analyzingPersonKey === key}
                canAnalyze={analyzingPersonKey === null}
                onAnalyze={() => handleAnalyze(person)}
                aiData={aiResults[key] ?? null}
                forceOpen={openPopupKey === key}
                onPopupClose={() => setOpenPopupKey(null)}
              />
            )
          })}
        </div>

        {filteredPersons.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <Users className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium">Kişi bulunamadı</p>
            <p className="mt-2 text-sm text-muted-foreground">Arama veya filtreleri değiştirin</p>
          </div>
        )}

        {filteredPersons.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Sayfa {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
                Önceki
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                Sonraki
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}