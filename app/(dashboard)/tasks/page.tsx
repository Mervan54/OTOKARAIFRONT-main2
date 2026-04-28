"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, ArrowUpDown, ListTodo } from "lucide-react"
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
import type { UniqueTask, SolutionType } from "@/lib/types"
import { createPortal } from "react-dom"

type SortField = "name" | "frequency"
type SortDirection = "asc" | "desc"

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
<h3 className="font-semibold text-base">Gorev Detayi</h3>
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
<div className="flex flex-wrap gap-1.5">
{task.departments.map((dept) => (
<DepartmentBadge key={dept} name={dept} />
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
}

const filteredAndSortedTasks = useMemo(() => {
let result = [...tasks]

if (searchQuery) {
const query = searchQuery.toLowerCase()
result = result.filter(
(task) =>
task.name.toLowerCase().includes(query) ||
task.departments.some((dept) => dept.toLowerCase().includes(query))
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

if (loading) {
return (
<div>
<AppHeader title="Benzersiz Gorevler" description="Departmanlar arasi gorev analizi" />
<div className="p-6">
<Skeleton className="mb-6 h-10 w-64" />
<Skeleton className="h-96 w-full" />
</div>
</div>
)
}

return (
<div>
<AppHeader title="Benzersiz Gorevler" description="Departmanlar arasi gorev analizi" />
<div className="p-6">
<div className="mb-6 grid gap-4 sm:grid-cols-2">
<div className="rounded-lg border bg-card p-4">
<p className="text-sm text-muted-foreground">Toplam Gorev</p>
<p className="mt-1 text-2xl font-semibold">{tasks.length}</p>
</div>
<div className="rounded-lg border bg-card p-4">
<p className="text-sm text-muted-foreground">Filtrelenen</p>
<p className="mt-1 text-2xl font-semibold">{filteredAndSortedTasks.length}</p>
</div>
</div>

<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
<div className="relative">
<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
<Input
type="search"
placeholder="Gorev veya departman ara..."
value={searchQuery}
onChange={(e) => setSearchQuery(e.target.value)}
className="w-full pl-9 sm:w-72"
/>
</div>
<div className="flex items-center gap-2 text-sm text-muted-foreground">
<ListTodo className="h-4 w-4" />
<span>{filteredAndSortedTasks.length} gorev bulundu</span>
</div>
</div>

<Card>
<CardHeader>
<CardTitle>Gorev Analizi</CardTitle>
</CardHeader>
<CardContent>
{filteredAndSortedTasks.length === 0 ? (
<EmptyState
icon={ListTodo}
title="Gorev bulunamadi"
description="Arama sorgunuzu degistirmeyi deneyin."
/>
) : (
<Table>
<TableHeader>
<TableRow>
<TableHead className="w-1/2">
<Button
variant="ghost"
onClick={() => handleSort("name")}
className="-ml-4 h-8 font-medium"
>
Gorev Adi
<ArrowUpDown className="ml-2 h-4 w-4" />
</Button>
</TableHead>
<TableHead className="w-1/2">Departmanlar</TableHead>
</TableRow>
</TableHeader>
<TableBody>
{filteredAndSortedTasks.map((task) => (
<TaskRow key={task.id} task={task} />
))}
</TableBody>
</Table>
)}
</CardContent>
</Card>
</div>
</div>
)}
