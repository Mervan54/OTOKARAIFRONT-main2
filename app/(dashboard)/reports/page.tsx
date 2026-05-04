"use client"

import { useState, useEffect } from "react"
import { AppHeader } from "@/components/app-header"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Loader2, Sparkles, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { getDirectorateSummary, getSentenceBasedTasks, getAIAnalysis,  } from "@/lib/api"
import type { Directorate, UniqueTask, AIAnalysisResponse } from "@/lib/types"
import {
BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { createPortal } from "react-dom"

const REPEAT_PAGE_SIZE = 10

function RepeatTaskRow({ task, index }: { task: UniqueTask; index: number }) {
const [showPopup, setShowPopup] = useState(false)
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
<div className="mt-2 flex flex-wrap gap-1">
{task.persons.slice(0, 5).map(p => (
<Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
))}
{task.persons.length > 5 && (
<button
onClick={()=> setShowPopup(true)}
className="text-xs text-primary hover:underline"
>
    +{task.persons.length -5} kişi daha
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
className="bg-white dark:bg-gray-900 w-full max-w-2xl mx-4 rounded-xl shadow-2xl border"
onClick={e => e.stopPropagation()}
>
<div className="flex items-center justify-between p-4 border-b">
<h3 className="font-semibold text-base">Görev Detayı</h3>
<button onClick={() => setShowPopup(false)} className="text-muted-foreground hover:text-foreground text-lg font-bold">✕</button>
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
<div className="flex flex-wrap gap-1.5">
{task.persons.map(p => (
<Badge key={p} variant="secondary" className="text-xs">{p}</Badge>
))}
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

const repeatingTasks = tasks
.filter(t => t.persons.length >= 2)
.sort((a, b) => b.persons.length - a.persons.length)

const filteredTasks = repeatingTasks.filter(t => {
if (!searchQuery) return true
const q = searchQuery.toLowerCase()
return (
t.name.toLowerCase().includes(q) ||
t.persons.some(p => p.toLowerCase().includes(q)) ||
t.departments.some(d => d.toLowerCase().includes(q))
)
})

const dirRepeatData = directorates.map(d => {
  const uniquePersons = new Set(
    d.departments.flatMap(dept => dept.adSoyadlar ?? [])
      .filter(person =>
        tasks.some(t => t.persons.length >= 2 && t.persons.includes(person))
      )
  ).size
  return {
    name: d.name.split(" ")[0],
    tekrarEdenKisi: uniquePersons,
  }
}).sort((a, b) => b.tekrarEdenKisi - a.tekrarEdenKisi)
const radarData = directorates.map(d => ({
name: d.name.split(" ")[0],
Kişi: new Set(d.departments.flatMap(dept => dept.adSoyadlar ?? [])).size,
Departman: d.departments.length,
}))

const totalRepeating = repeatingTasks.length
const mostRepeated = repeatingTasks[0]
const totalAffected = new Set(repeatingTasks.flatMap(t => t.persons)).size
const totalPages = Math.ceil(filteredTasks.length / REPEAT_PAGE_SIZE)
const paginatedTasks = filteredTasks.slice(
(repeatPage - 1) * REPEAT_PAGE_SIZE,
repeatPage * REPEAT_PAGE_SIZE
)

return (
<div>
<AppHeader title="Raporlar ve İstatistikler" description="Görev analizi raporları" />
<div className="p-6 space-y-6">

{/* Özet Kartlar */}
<div className="grid gap-4 sm:grid-cols-3">
<div className="rounded-lg border bg-card p-4">
<p className="text-sm text-muted-foreground">Tekrar Eden Görev Sayısı</p>
<p className="mt-1 text-3xl font-bold text-primary">{totalRepeating}</p>
<p className="mt-1 text-xs text-muted-foreground">2+ kişide ortak olan görevler</p>
</div>
<div className="rounded-lg border bg-card p-4">
<p className="text-sm text-muted-foreground">En Çok Tekrar Eden Görev</p>
<p className="mt-1 text-base font-bold text-primary line-clamp-2">
{mostRepeated?.name.slice(0, 60)}...
</p>
<p className="mt-1 text-xs text-muted-foreground">
{mostRepeated?.persons.length} kişide tekrar ediyor
</p>
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
Her direktörlükte kaç görev 2+ kişide tekrar ediyor
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
<div className="relative mb-4">
<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<Input
placeholder="Görev, kişi veya departman ara..."
value={searchQuery}
onChange={e => { setSearchQuery(e.target.value); setRepeatPage(1) }}
className="pl-9"
/>
</div>
<div className="space-y-3">
{paginatedTasks.map((task, i) => (
<RepeatTaskRow
key={task.id}
task={task}
index={(repeatPage - 1) * REPEAT_PAGE_SIZE + i}
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
