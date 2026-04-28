"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, Sparkles, AlertCircle } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { ChatMessage } from "@/components/chat-message"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { sendChatMessage } from "@/lib/api"
import type { ChatMessage as ChatMessageType } from "@/lib/types"

const csvFiles = [
{ label: "IT", value: "IT.csv" },
{ label: "Finans", value: "FINANS.csv" },
{ label: "Genel", value: "GENEL.csv" },
{ label: "HR", value: "HR.csv" },
{ label: "Kalite", value: "KALITE.csv" },
{ label: "Satinalma", value: "SATINALMA.csv" },
{ label: "Satis", value: "SATIS.csv" },
{ label: "Ticari", value: "TICARI.csv" },
{ label: "Uretim", value: "URETIM.csv" },
]

const suggestedQuestions = [
"En cok tekrar eden gorevler nelerdir?",
"Hangi isler RPA ile yapilabilir?",
"Hangi direktorlukte otomasyon potansiyeli yuksek?",
"En yogun mudurluk hangisi?",
"AI ile cozulebilecek gorevleri listele.",
]

export default function ChatbotPage() {
const [messages, setMessages] = useState<ChatMessageType[]>([])
const [input, setInput] = useState("")
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [selectedFile, setSelectedFile] = useState<string>("")
const scrollRef = useRef<HTMLDivElement>(null)
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
if (scrollRef.current) {
scrollRef.current.scrollTop = scrollRef.current.scrollHeight
}
}, [messages])

const handleSend = async (question?: string) => {
const messageText = (question || input).trim()
if (!messageText || isLoading) return

if (!selectedFile) {
setError("Lutfen once bir birim secin.")
return
}

setError(null)

const userMessage: ChatMessageType = {
id: `user-${Date.now()}`,
role: "user",
content: messageText,
timestamp: new Date(),
}

setMessages((prev) => [...prev, userMessage])
setInput("")
setIsLoading(true)

try {
const response = await sendChatMessage(messageText, selectedFile)
const assistantMessage: ChatMessageType = {
id: `assistant-${Date.now()}`,
role: "assistant",
content: response,
timestamp: new Date(),
}
setMessages((prev) => [...prev, assistantMessage])
} catch {
setError("Bir hata olustu. Lutfen tekrar deneyin.")
const errorMessage: ChatMessageType = {
id: `error-${Date.now()}`,
role: "assistant",
content: "Uzgunum, bir hata olustu. Lutfen tekrar deneyin.",
timestamp: new Date(),
}
setMessages((prev) => [...prev, errorMessage])
} finally {
setIsLoading(false)
inputRef.current?.focus()
}
}

const handleKeyDown = (e: React.KeyboardEvent) => {
if (e.key === "Enter" && !e.shiftKey) {
e.preventDefault()
handleSend()
}
}

const clearError = () => setError(null)

return (
<div className="flex h-screen flex-col">
<AppHeader title="Yapay Zeka Asistan" description="Gorev verileriniz hakkinda sorular sorun" />
<div className="flex flex-1 flex-col overflow-hidden p-6">

{/* Birim Seçimi */}
<div className="mb-4 flex items-center gap-3">
<span className="text-sm font-medium text-muted-foreground">Birim Sec:</span>
<Select value={selectedFile} onValueChange={setSelectedFile}>
<SelectTrigger className="w-48">
<SelectValue placeholder="Birim secin..." />
</SelectTrigger>
<SelectContent>
{csvFiles.map((file) => (
<SelectItem key={file.value} value={file.value}>
{file.label}
</SelectItem>
))}
</SelectContent>
</Select>
{selectedFile && (
<span className="text-xs text-muted-foreground">
Secili: {csvFiles.find(f => f.value === selectedFile)?.label}
</span>
)}
</div>

{error && (
<Alert variant="destructive" className="mb-4">
<AlertCircle className="h-4 w-4" />
<AlertDescription className="flex items-center justify-between">
{error}
<Button variant="ghost" size="sm" onClick={clearError}>
Kapat
</Button>
</AlertDescription>
</Alert>
)}

<Card className="flex flex-1 flex-col overflow-hidden">
<CardContent className="flex flex-1 flex-col overflow-hidden p-0">
{messages.length === 0 ? (
<div className="flex flex-1 flex-col items-center justify-center p-8">
<div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
<Bot className="h-10 w-10 text-primary" />
</div>
<h2 className="mt-6 text-2xl font-semibold">Gorev Analizi Asistani</h2>
<p className="mt-2 max-w-md text-center text-muted-foreground">
Once bir birim secin, sonra o birimle ilgili sorularinizi sorun.
</p>
<div className="mt-8 flex flex-wrap justify-center gap-2">
{suggestedQuestions.map((question) => (
<Button
key={question}
variant="outline"
className="h-auto whitespace-normal px-4 py-2.5 text-left transition-all hover:border-primary hover:bg-primary/5"
onClick={() => handleSend(question)}
>
<Sparkles className="mr-2 h-4 w-4 shrink-0 text-primary" />
<span className="text-sm">{question}</span>
</Button>
))}
</div>
</div>
) : (
<div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
<div className="space-y-4 pb-4">
{messages.map((message) => (
<ChatMessage key={message.id} message={message} />
))}
{isLoading && (
<div className="flex gap-3">
<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
<Bot className="h-5 w-5 text-primary" />
</div>
<div className="flex items-center gap-3 rounded-2xl bg-muted px-5 py-3">
<Spinner className="h-4 w-4" />
<span className="text-sm text-muted-foreground">Dusunuyor...</span>
</div>
</div>
)}
</div>
</div>
)}

<div className="border-t border-border p-4">
{messages.length > 0 && (
<div className="mb-3 flex flex-wrap gap-2">
{suggestedQuestions.slice(0, 3).map((question) => (
<Button
key={question}
variant="ghost"
size="sm"
className="h-auto px-3 py-1.5 text-xs"
onClick={() => handleSend(question)}
disabled={isLoading}
>
{question}
</Button>
))}
</div>
)}
<div className="flex gap-2">
<Input
ref={inputRef}
type="text"
placeholder={selectedFile ? "Sorunuzu yazin..." : "Once birim secin..."}
value={input}
onChange={(e) => setInput(e.target.value)}
onKeyDown={handleKeyDown}
disabled={isLoading || !selectedFile}
className="flex-1"
/>
<Button
onClick={() => handleSend()}
disabled={!input.trim() || isLoading || !selectedFile}
size="icon"
className="shrink-0"
>
<Send className="h-4 w-4" />
</Button>
</div>
<p className="mt-3 text-center text-xs text-muted-foreground">
Yanitlar secilen birimin gorev analizi verilerine dayanarak uretilmektedir.
</p>
</div>
</CardContent>
</Card>
</div>
</div>
)
}
