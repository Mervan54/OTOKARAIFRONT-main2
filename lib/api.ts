//const API_BASE = "http://localhost:5091/api/Analysis"
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
      adSoyadlar: dept.adSoyadlar ?? [],
    })),
  }))
}

// Direktörlüğe göre AI analizi
export async function getAIAnalysis(directorate: string) {
  const response = await fetch(`${API_BASE}/ai-analysis/${encodeURIComponent(directorate)}`)
  if (!response.ok) throw new Error("AI analizi alınamadı")
  const data = await response.json()

  const analysis = data.analysis

  return {
    directorate: data.directorate ?? directorate,
    tasks: analysis ? [{
      task: analysis.task ?? "",
      departments: [],
      bestSolution: analysis.bestSolution ?? "Other",
      automationRate: analysis.automationRate ?? 0,
      recommendation: analysis.recommendation ?? "",
      projectIdea: analysis.projectIdea ?? "",
      similarProjectName: analysis.similarProjectName ?? "",
      similarProjectLink: analysis.similarProjectLink ?? "",
      responsiblePeople: analysis.responsiblePeople ?? [],
    }] : [],
  }
}

// Unique görevler
export async function getUniqueTasks() {
  const response = await fetch(`${API_BASE}/raw`)
  if (!response.ok) throw new Error("Görev verileri alınamadı")
  const data = await response.json()

  const taskMap = new Map<string, { name: string; departments: string[]; persons: string[] }>()

  data.forEach((record: any) => {
    if (!record.anaSorumluluk) return

    const key = record.anaSorumluluk
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[.,;:!?]/g, "")
      .replace(/\r\n|\r|\n/g, " ")

    const person = record.ad_soyad?.trim() ?? ""
    const dept = record.mudurluk?.trim() ?? ""

    if (taskMap.has(key)) {
      const existing = taskMap.get(key)!
      if (person && !existing.persons.includes(person)) {
        existing.persons.push(person)
      }
      if (dept && !existing.departments.includes(dept)) {
        existing.departments.push(dept)
      }
    } else {
      taskMap.set(key, {
        name: record.anaSorumluluk.trim(),
        departments: dept ? [dept] : [],
        persons: person ? [person] : [],
      })
    }
  })

  return Array.from(taskMap.values()).map((value, i) => ({
    id: `task-${i + 1}`,
    name: value.name,
    departments: value.departments,
    persons: value.persons,
    frequency: value.persons.length,
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
export async function sendChatMessage(question: string, fileName?: string): Promise<string> {
  try {
    await fetch(`${API_BASE}/index-all-csv`, { 
      method: "POST",
    })
  } catch {
    console.warn("Index failed, continuing...")
  }

  const response = await fetch(`${API_BASE}/chatbot-ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      question, 
      fileName: fileName ?? null 
    }),
  })
  
  if (!response.ok) throw new Error("Chatbot yan?t veremedi")
  
  const text = await response.text()

  try {
    const data = JSON.parse(text)
    if (typeof data === 'string') return data
    return data.answer ?? data.response ?? data.result ?? data.message ?? text
  } catch {
    return text
  }
}


// AI Insights - direktörlük verilerinden üret
export async function getAIInsights(directorates: any[]): Promise<any[]> {
  if (directorates.length === 0) return []

  const sortedByRecords = [...directorates].sort((a, b) => b.totalRecords - a.totalRecords)
  const busiestDirectorate = sortedByRecords[0]

  const allDepartments = directorates.flatMap((d: any) => d.departments)
  const sortedDepts = [...allDepartments].sort((a: any, b: any) =>
    new Set(b.adSoyadlar ?? []).size - new Set(a.adSoyadlar ?? []).size
  )
  const busiestDept = sortedDepts[0]

  return [
    {
      id: "insight-1",
      title: "En Yogun Direktorluk",
      value: busiestDirectorate.name,
      description: `${new Set(busiestDirectorate.departments.flatMap((d: any) => d.adSoyadlar ?? [])).size} kişi ile en fazla iş yüküne sahip`,
      type: "directorate",
    },
    {
      id: "insight-2",
      title: "En Çok Görev Alan Müdürlük",
      value: busiestDept.name,
      description: `${new Set(busiestDept.adSoyadlar ?? []).size} kişi ile lider konumda`,
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

// Cümle bazlı görev analizi (Raporlar sayfası için)
export async function getSentenceBasedTasks() {
  const response = await fetch(`${API_BASE}/raw`)
  if (!response.ok) throw new Error("Görev verileri alınamadı")
  const data = await response.json()

  const sentenceMap = new Map<string, { sentence: string; persons: string[]; departments: string[] }>()

  data.forEach((record: any) => {
    if (!record.anaSorumluluk) return

    const person = record.ad_soyad?.trim() ?? ""
    const dept = record.mudurluk?.trim() ?? ""

    const sentences = record.anaSorumluluk
      .split(/\d+\.\s+/)
      .map((s: string) => s.trim().replace(/\.,\s*$/, "").trim())
      .filter((s: string) => s.length > 10)

    sentences.forEach((sentence: string) => {
      const key = sentence.toLowerCase().replace(/\s+/g, " ").trim()
      if (sentenceMap.has(key)) {
        const existing = sentenceMap.get(key)!
        if (person && !existing.persons.includes(person)) {
          existing.persons.push(person)
        }
        if (dept && !existing.departments.includes(dept)) {
          existing.departments.push(dept)
        }
      } else {
        sentenceMap.set(key, {
          sentence: sentence,
          persons: person ? [person] : [],
          departments: dept ? [dept] : [],
        })
      }
    })
  })

  return Array.from(sentenceMap.values())
    .filter(v => v.persons.length >= 2)
    .sort((a, b) => b.persons.length - a.persons.length)
    .map((value, i) => ({
      id: `sentence-${i + 1}`,
      name: value.sentence,
      departments: value.departments,
      persons: value.persons,
      frequency: value.persons.length,
      solutionType: "Other" as const,
      automationRate: 0,
      recommendation: "",
    }))
}
