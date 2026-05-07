export interface Department {
  id: string
  name: string
  taskCount: number
  goals: string[]
  skills: string[]
  responsibilities: string[]
  adSoyadlar?: string[]
}

export interface Directorate {
  id: string
  name: string
  totalRecords: number
  departmentCount: number
  departments: Department[]
}

export interface DirectorateSummary {
  id: string
  name: string
  totalRecords: number
  departmentCount: number
}

export type SolutionType = "AI" | "RPA" | "Hybrid" | "Other"

export interface UniqueTask {
  id: string
  name: string
  departments: string[]
  persons: string[]
  frequency: number
  solutionType: SolutionType
  automationRate: number
  recommendation: string
}

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatbotContext {
  totalDirectorates: number
  totalDepartments: number
  totalTasks: number
}

export interface AIInsight {
  id: string
  title: string
  value: string
  description: string
  type: "directorate" | "task" | "department" | "automation"
}

export interface AIAnalysisTask {
  task: string
  departments: string[]
  bestSolution: string
  automationRate: number
  recommendation: string
  projectIdea: string
  similarProjectName: string
  similarProjectLink: string
  projectIdeas?: { task: string; projectIdea: string; similarProjectName: string; similarProjectLink: string  }[]
  responsiblePeople?: { name: string; department: string; reason: string }[]
}

export interface AIAnalysisResponse {
  directorate: string
  tasks: AIAnalysisTask[]
}

export interface ChatbotRequest {
  question: string
}

export interface ChatbotResponse {
  question: string
  answer: string
}
