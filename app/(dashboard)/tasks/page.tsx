"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ArrowUpDown, ListTodo, ChevronLeft, ChevronRight } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { DepartmentBadge } from "@/components/department-badge"
import { EmptyState } from "@/components/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getUniqueTasks } from "@/lib/api"
import type { UniqueTask } from "@/lib/types"
import { createPortal } from "react-dom"

type SortField = "name" | "frequency"
type SortDirection = "asc" | "desc"

const PAGE_SIZE = 20

function TaskRow({ task }: { task: UniqueTask }) {
const [showPopup, setShowPopup] = useState(false)
const MAX_CHARS = 80

return (
<>
<TableRow className="group cursor-pointer hover:bg-muted/50">
<TableCell className="font-medium align-top max-w-xs">
<span className="block whitespace-normal break-words">
{task.name.slice(0, MAX_CHARS)}
{task.name.length > MAX_CHARS && (
<>
...
<button
onClick={() => setShowPopup(true)}
className="ml-1 text-xs text-primary hover:underline"
>
devamını oku
</button>
</>
)}
</span>
</TableCell>
<TableCell className="align-top">
<div className="flex flex-wrap gap-1.5">
{task.departments.slice(0, 3).map((dept) => (
<DepartmentBadge key={dept} name={dept} />
))}
{task.departments.length > 3 && (
<Badge variant="outline" className="text-xs">
+{task.departments.length - 3}
</Badge>
)}
</div>
</TableCell>
<TableCell className="align-top">
<div className="flex flex-wrap gap-1.5">
{task.persons.slice(0, 3).map((person) => (
<Badge key={person} variant="secondary" className="text-xs">
{person}
</Badge>
))}
{task.persons.length > 3 && (
<Badge variant="outline" className="text-xs">
+{task.persons.length - 3}
</Badge>
)}
</div>
</TableCell>
</TableRow>

{showPopup && typeof window !== "undefined" && createPortal(
<div
className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
onClick={() => setShowPopup(false)}
>
<div
className="bg-white dark:bg-gray-900 w-full max-w-2xl mx-4 rounded-xl shadow-2xl border"
onClick={(e) => e.stopPropagation()}
>
<div className="flex items-center justify-between p-4 border-b">
<h3 className="font-semibold text-base">Görev Detayı</h3>
<button
onClick={() => setShowPopup(false)}
className="text-muted-foreground hover:text-foreground text-lg font-bold"
>
✕
</button>
</div>
<div className="overflow-y-auto max-h-64 p-4">
<ul className="space-y-1">
{task.name
.split(/,\s*-|\.\s*-|;\s*-|,\s*•|\.\s*•|;\s*•/)
.map((item) => item.trim())
.filter((item) => item.length > 0)
.map((item, i) => (
<li key={i} className="text-sm text-muted-foreground leading-relaxed flex gap-2">
<span className="text-primary mt-0.5">•</span>
<span>{item.replace(/^[-•]\s*/, "")}</span>
</li>
))}
</ul>
</div>
<div className="p-4 border-t">
<p className="text-xs font-medium text-muted-foreground mb-2">Departmanlar:</p>
<div className="flex flex-wrap gap-1.5 mb-3">
{task.departments.map((dept) => (
<DepartmentBadge key={dept} name={dept} />
))}
</div>
<p className="text-xs font-medium text-muted-foreground mb-2">Kişiler:</p>
<div className="flex flex-wrap gap-1.5">
{task.persons.map((person) => (
<Badge key={person} variant="secondary" className="text-xs">
{person}
</Badge>
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

export default function TasksPage() {
const [tasks, setTasks] = useState<UniqueTask[]>([])
const [loading, setLoading] = useState(true)
const [searchQuery, setSearchQuery] = useState("")
const [sortField, setSortField] = useState<SortField>("name")
const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
const [currentPage, setCurrentPage] = useState(1)

useEffect(() => {
async function fetchData() {
const data = await getUniqueTasks()
setTasks(data)
setLoading(false)
}
fetchData()
}, [])

const handleSort = (field: SortField) => {
if (sortField === field) {
setSortDirection(sortDirection === "asc" ? "desc" : "asc")
} else {
setSortField(field)
setSortDirection("asc")
}
setCurrentPage(1)
}

const filteredAndSortedTasks = useMemo(() => {
let result = [...tasks]

if (searchQuery) {
const query = searchQuery.toLowerCase()
result = result.filter(
(task) =>
task.name.toLowerCase().includes(query) ||
task.departments.some((dept) => dept.toLowerCase().includes(query)) ||
task.persons.some((person) => person.toLowerCase().includes(query))
)
}

result.sort((a, b) => {
let comparison = 0
if (sortField === "name") {
comparison = a.name.localeCompare(b.name, "tr")
} else if (sortField === "frequency") {
comparison = a.frequency - b.frequency
}
return sortDirection === "asc" ? comparison : -comparison
})

return result
}, [tasks, searchQuery, sortField, sortDirection])

const totalPages = Math.ceil(filteredAndSortedTasks.length / PAGE_SIZE)
const paginatedTasks = filteredAndSortedTasks.slice(
(currentPage - 1) * PAGE_SIZE,
currentPage * PAGE_SIZE
)

if (loading) {
return (
<div>
<AppHeader title="Görevler" description="Departmanlar Arası Görev Analizi" />
<div className="p-6">
<Skeleton className="mb-6 h-10 w-64" />
<Skeleton className="h-96 w-full" />
</div>
</div>
)
}

return (
<div>
<AppHeader title="Görevler" description="Departmanlar Arası Görev Analizi" />
<div className="p-6">
<div className="mb-6 grid gap-4 sm:grid-cols-2">
<div className="rounded-lg border bg-card p-4">
  <p className="text-sm text-muted-foreground">Toplam Görev</p>
  <p className="mt-1 text-2xl font-semibold">
    {new Set(tasks.flatMap(t => t.persons)).size}
  </p>
</div>
<div className="rounded-lg border bg-card p-4">
  <p className="text-sm text-muted-foreground">Filtrelenen</p>
  <p className="mt-1 text-2xl font-semibold">
    {new Set(filteredAndSortedTasks.flatMap(t => t.persons)).size}
  </p>
</div>
</div>

<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
<div className="relative">
<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<Input
type="search"
placeholder="Görev, Departman veya Kişi ara..."
value={searchQuery}
onChange={(e) => {
setSearchQuery(e.target.value)
setCurrentPage(1)
}}
className="w-full pl-9 sm:w-72"
/>
</div>
<div className="flex items-center gap-2 text-sm text-muted-foreground">
<ListTodo className="h-4 w-4" />
<span>{new Set(filteredAndSortedTasks.flatMap(t => t.persons)).size} kişi bulundu</span>
</div>
</div>

<Card>
<CardHeader>
<CardTitle>Görev Analizi</CardTitle>
</CardHeader>
<CardContent>
{filteredAndSortedTasks.length === 0 ? (
<EmptyState
icon={ListTodo}
title="Görev bulunamadi"
description="Arama sorgunuzu degistirmeyi deneyin."
/>
) : (
<>
<Table>
<TableHeader>
<TableRow>
<TableHead className="w-1/3">
<Button
variant="ghost"
onClick={() => handleSort("name")}
className="-ml-4 h-8 font-medium"
>
Görev Adı
<ArrowUpDown className="ml-2 h-4 w-4" />
</Button>
</TableHead>
<TableHead className="w-1/3">Departmanlar</TableHead>
<TableHead className="w-1/3">Kişiler</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{paginatedTasks.map((task) => (
<TaskRow key={task.id} task={task} />
))}
</TableBody>
</Table>

{/* Sayfalama */}
<div className="mt-4 flex items-center justify-between">
<p className="text-sm text-muted-foreground">
Sayfa {currentPage} / {totalPages} — {new Set(filteredAndSortedTasks.flatMap(t => t.persons)).size} Kişi
</p>
<div className="flex items-center gap-2">
<Button
variant="outline"
size="sm"
onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
disabled={currentPage === 1}
>
<ChevronLeft className="h-4 w-4" />
Önceki
</Button>
<Button
variant="outline"
size="sm"
onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
disabled={currentPage === totalPages}
>
Sonraki
<ChevronRight className="h-4 w-4" />
</Button>
</div>
</div>
</>
)}
</CardContent>
</Card>
</div>
</div>
)
}
