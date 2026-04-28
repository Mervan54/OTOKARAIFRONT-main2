const API_BASE = process.env.NEXT_PUBLIC_API_URL!


// Direktörlük özetleri
export async function getDirectorateSummary() {
  const response = await fetch(`${API_BASE}/summary`)
  if (!response.ok) throw new Error("Direktörlük verileri alınamadı")
  const data = await response.json()

  return data.map((item: any, index: number) => ({
    id: `dir-${index + 1}`,
    name: item.direktorluk,
    totalRecords: item.toplamKayitSayisi,
    departmentCount: item.mudurlukSayisi,
    departments: item.mudurlukler.map((dept: any, deptIndex: number) => ({
      id: `dept-${index + 1}-${deptIndex + 1}`,
      name: dept.mudurluk,
      taskCount: dept.kayitSayisi,
      goals: dept.amaclar,
      skills: dept.yetkinlikler,
      responsibilities: dept.anaSorumluluklar,
    })),
  }))
}

// Direktörlüğe göre AI analizi
export async function getAIAnalysis(directorate: string) {
  const response = await fetch(`${API_BASE}/ai-analysis/${encodeURIComponent(directorate)}`)
  if (!response.ok) throw new Error("AI analizi alınamadı")
  const data = await response.json()

  return {
    directorate: data.directortate,
    tasks: (data.tasks ?? []).map((t: any) => ({
      task: t.task,
      departments: t.departments ?? [],
      bestSolution: t.bestSolution ?? "Other",
      automationRate: t.automationRate ?? 0,
      recommendation: t.recommendation ?? "",
      similarProjectName: t.similarProjectName ?? "",
      similarProjectLink: t.similarProjectLink ?? "",
    })),
  }
}

// Unique görevler
export async function getUniqueTasks() {
  const response = await fetch(`${API_BASE}/summary`)
  if (!response.ok) throw new Error("Görev verileri alınamadı")
  const data = await response.json()

  const taskMap = new Map<string, { name: string; departments: string[] }>()

  data.forEach((dir: any) => {
    dir.mudurlukler?.forEach((dept: any) => {
      dept.anaSorumluluklar?.forEach((task: string) => {
        const key = task.trim().toLowerCase()
        if (taskMap.has(key)) {
          taskMap.get(key)!.departments.push(dept.mudurluk)
        } else {
          taskMap.set(key, { name: task.trim(), departments: [dept.mudurluk] })
        }
      })
    })
  })

  return Array.from(taskMap.values()).map((value, i) => ({
    id: `task-${i + 1}`,
    name: value.name,
    departments: [...new Set(value.departments)],
    frequency: value.departments.length,
    solutionType: "Other" as const,
    automationRate: 0,
    recommendation: "",
  }))
}

// CSV dosya listesi
export async function getCsvFiles(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/csv-files`)
  if (!response.ok) throw new Error("CSV dosyaları alınamadı")
  return await response.json()
}

// Chatbota soru gönder
export async function sendChatMessage(question: string, fileName: string): Promise<string> {
  const response = await fetch(`${API_BASE}/chatbot-ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, fileName }),
  })
  console.log("Response status:", response.status)
  
  if (!response.ok) throw new Error("Chatbot yanıt veremedi")
  const data = await response.json()
  console.log("API response:",data)
  return data.answer??""
}

 
 
// AI Insights - direktörlük verilerinden üret
export async function getAIInsights(directorates: any[]): Promise<any[]> {
  if (directorates.length === 0) return []

  const sortedByRecords = [...directorates].sort((a, b) => b.totalRecords - a.totalRecords)
  const busiestDirectorate = sortedByRecords[0]

  const allDepartments = directorates.flatMap((d: any) => d.departments)
  const sortedDepts = [...allDepartments].sort((a: any, b: any) => b.taskCount - a.taskCount)
  const busiestDept = sortedDepts[0]

  return [
    {
      id: "insight-1",
      title: "En Yogun Direktorluk",
      value: busiestDirectorate.name,
      description: `${busiestDirectorate.totalRecords} kayit ile en fazla is yukune sahip`,
      type: "directorate",
    },
    {
      id: "insight-2",
      title: "En Cok Gorev Alan Mudurluk",
      value: busiestDept.name,
      description: `${busiestDept.taskCount} gorev ile lider konumda`,
      type: "department",
    },
    {
      id: "insight-3",
      title: "Toplam Direktorluk",
      value: directorates.length.toString(),
      description: "Sistemdeki toplam direktorluk sayisi",
      type: "directorate",
    },
    {
      id: "insight-4",
      title: "Toplam Departman",
      value: allDepartments.length.toString(),
      description: "Tum direktorluklerdeki departman sayisi",
      type: "department",
    },
  ]
}