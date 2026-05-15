const API_BASE = process.env.NEXT_PUBLIC_API_URL!
//const API_BASE ="https://dmz.otokar.com.tr/GorevTnAPI/swagger/index.html"
//const API_BASE = "http://localhost:5091/api/Analysis"

const nameMapping: Record<string, string> = {
  "BT": "BT",
  "ASKERI": "Askeri",
  "FINANS": "Finans",
  "Genel": "Genel Müdürlük",
  "İnsanKaynakları": "İnsanKaynakları",
  "KALITE": "Kalite",
  "Satın Alma": "Satın Alma",
  "Satış": "Satış",
  "Ticari Araçlar": "Ticari Araçlar",
  "Üretim": "Üretim",
}

const reverseNameMapping: Record<string, string> = Object.fromEntries(
  Object.entries(nameMapping).map(([k, v]) => [v, k])
)
//SON DİREKTÖRLÜK VERİLERİ BURADAN GELİYOR .....
export async function getDirectorateAiResult(directorate: string) { 
  const response = await fetch(`${API_BASE}/directorate-ai/${encodeURIComponent(directorate)}`)
  if (!response.ok) return null
  return response.json()
}

// Direktörlük özetleri
export async function getDirectorateSummary() {
  const response = await fetch(`${API_BASE}/summary`)
  if (!response.ok) throw new Error("Direktörlük verileri alınamadı")
  const data = await response.json()

  return data.map((item: any, index: number) => ({
    id: `dir-${index + 1}`,
    name: nameMapping[item.direktorluk] ?? item.direktorluk,
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
export async function getDirectorateTaskAnalysis(directorate: string) {
  const backendDirectorate = reverseNameMapping[directorate] ?? directorate
  const response = await fetch(`${API_BASE}/directorate/${encodeURIComponent(backendDirectorate)}/tasks/ai-analysis`)
  if (!response.ok) throw new Error("Direktörlük görev analizi alınamadı")
  const data = await response.json()
  return data
}

// Direktörlüğe göre AI analizi
export async function getAIAnalysis(directorate: string, department?: string) {
  const backendDirectorate = reverseNameMapping[directorate] ?? directorate

  const url = department
    ? `${API_BASE}/ai-analysis/${encodeURIComponent(backendDirectorate)}?department=${encodeURIComponent(department)}`
    : `${API_BASE}/ai-analysis/${encodeURIComponent(backendDirectorate)}`

  const response = await fetch(url)
  if (!response.ok) throw new Error("AI analizi alınamadı")
  const data = await response.json()

  const analysis = data.analysis ?? data
  

  // projectIdeas array olarak geliyor (yeni format)
  const projectIdeas = Array.isArray(analysis.projectIdeas)
    ? analysis.projectIdeas.map((p: any) => ({
        task: p.task ?? "",
        projectIdea: p.projectIdea ?? "",
        similarProjectName: p.similarProjectName ?? "",
        similarProjectLink: p.similarProjectLink ?? "",
        bestSolution: p.bestSolution ?? "",
        automationRate: p.automationRate ?? 0,
      }))
    : Array.isArray(analysis.projectIdea)
    ? analysis.projectIdea.map((p: any) => ({
        task: p.task ?? "",
        projectIdea: p.projectIdea ?? "",
        similarProjectName: p.similarProjectName ?? "",
        similarProjectLink: p.similarProjectLink ?? "",
        bestSolution: p.bestSolution ?? "",
        automationRate: p.automationRate ?? 0,
      }))
    : []

  return {
    directorate: data.directorate ?? directorate,
    tasks: [{
      task: analysis.task ?? "",
      departments: [],
      bestSolution: analysis.bestSolution ?? "Other",
      automationRate: analysis.automationRate ?? 0,
      recommendation: analysis.recommendation ?? "",
      projectIdea: "",
      similarProjectName: "",
      similarProjectLink: "",
      projectIdeas: projectIdeas,
      responsiblePeople: analysis.responsiblePeople ?? [],
    }]
  }
}

export async function getPersonAiAnalysis(sicilNo: string) {
  const response = await fetch(`${API_BASE}/person/${encodeURIComponent(sicilNo)}/ai-analysis`)
  if (!response.ok) throw new Error("Kişi analizi alınamadı")
  const data = await response.json()
  return data
}

// Unique görevler
export async function getUniqueTasks() {
  const response = await fetch(`${API_BASE}/raw`)
  if (!response.ok) throw new Error("Görev verileri alınamadı")
  const data = await response.json()

  const taskMap = new Map<string, { name: string; departments: string[]; persons: string[]; birim: string }>()

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
      if (person && !existing.persons.includes(person)) existing.persons.push(person)
      if (dept && !existing.departments.includes(dept)) existing.departments.push(dept)
    } else {
      taskMap.set(key, {
        name: record.anaSorumluluk.trim(),
        departments: dept ? [dept] : [],
        persons: person ? [person] : [],
        birim: record.birim?.trim() ?? "",
      })
    }
  })

  return Array.from(taskMap.values()).map((value, i) => ({
    id: `task-${i + 1}`,
    name: value.name,
    departments: value.departments,
    persons: value.persons,
    birim: value.birim, 
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

// Chatbota soru gönder //DBDEKI KISIMLAR ESLESMESI ICIN FONKSIYON EKLEDIK ORNEK Kerem Çelik -> KEREM CELIK
function normalizeName(name: string): string {
  return name
    .toUpperCase()
    .trim()
}

export async function sendChatMessage(
  question: string,
  fileName?: string,
  mudurluk?: string,
  kisi?: string
): Promise<string> {
  try {
    await fetch(`${API_BASE}/index-all-csv`, { method: "POST" })
  } catch {
    console.warn("Index failed, continuing...")
  }

  const response = await fetch(`${API_BASE}/chatbot-ask`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    question: kisi
      ? `${normalizeName(kisi)} için: ${question}`
      : question,
    fileName: fileName ?? null,
    mudurluk: mudurluk ?? null,
    personName: kisi ? normalizeName(kisi) : null,
  }),
})
  if (!response.ok) throw new Error("Chatbot yanıt veremedi")

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
      title: "En Yoğun Direktörlük",
      value: busiestDirectorate.name,
      description: `${new Set(busiestDirectorate.departments.flatMap((d: any) => d.adSoyadlar ?? [])).size} En çok çalışan olan direktörlük`,
      type: "directorate",
    },
    {
      id: "insight-2",
      title: "En Çok Çalışan Olan Müdürlük",
      value: busiestDept.name,
      description: `${new Set(busiestDept.adSoyadlar ?? []).size} kişi ile lider konumda`,
      type: "department",
    },
    {
      id: "insight-3",
      title: "Toplam Direktörlük",
      value: directorates.length.toString(),
      description: "Sistemdeki toplam direktörlük sayısı",
      type: "directorate",
    },
    {
      id: "insight-4",
      title: "Toplam Departman",
      value: allDepartments.length.toString(),
      description: "Tüm Direktörlüklerdeki Toplam Departman Sayısı",
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
        if (person && !existing.persons.includes(person)) existing.persons.push(person)
        if (dept && !existing.departments.includes(dept)) existing.departments.push(dept)
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
      birim: undefined,
      frequency: value.persons.length,
      solutionType: "Other" as const,
      automationRate: 0,
      recommendation: "",
      
    }))

}

