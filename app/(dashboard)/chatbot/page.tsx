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
import { sendChatMessage, getDirectorateAiResult } from "@/lib/api"
import type { ChatMessage as ChatMessageType } from "@/lib/types"

const csvFiles = [
  { label: "Askeri", value: "Askeri.csv", birimKodu: "Askeri" },
  { label: "BT", value: "BT.csv", birimKodu: "BT" },
  { label: "Finans", value: "Finans.csv", birimKodu: "Finans" },
  { label: "Genel", value: "Genel.csv", birimKodu: "Genel Müdürlük" },
  { label: "İnsan Kaynakları", value: "İnsanKaynakları.csv", birimKodu: "İnsanKaynakları" },
  { label: "Kalite", value: "Kalite.csv", birimKodu: "Kalite" },
  { label: "Satın Alma", value: "SatınAlma.csv", birimKodu: "SatınAlma" },
  { label: "Satış", value: "Satış.csv", birimKodu: "Satış" },
  { label: "Ticari Araçlar", value: "TicariAraçlar.csv", birimKodu: "TicariAraçlar" },
  { label: "Üretim", value: "Üretim.csv", birimKodu: "Üretim" },
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
  const [inputError, setInputError] = useState(false)

  const [mudurlukler, setMudurlukler] = useState<string[]>([])
  const [selectedMudurluk, setSelectedMudurluk] = useState<string>("")
  const [kisiler, setKisiler] = useState<string[]>([])
  const [selectedKisi, setSelectedKisi] = useState<string>("")
  const [aiData, setAiData] = useState<any>(null)
  const [aiDataLoading, setAiDataLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (!selectedFile) {
      setMudurlukler([])
      setSelectedMudurluk("")
      setKisiler([])
      setSelectedKisi("")
      setAiData(null)
      return
    }

    async function fetchAiData() {
      setAiDataLoading(true)
      setSelectedMudurluk("")
      setSelectedKisi("")
      setMudurlukler([])
      setKisiler([])
      try {
        const birimKodu = csvFiles.find(f => f.value === selectedFile)?.birimKodu ?? selectedFile
        const result = await getDirectorateAiResult(birimKodu)
        if (result?.data?.mudurlukler) {
          setAiData(result.data)
          const mdList = result.data.mudurlukler
            .map((m: any) => m.mudurluk)
            .sort((a: string, b: string) => a.localeCompare(b, "tr"))
          setMudurlukler(mdList)
        }
      } catch { }
      finally {
        setAiDataLoading(false)
      }
    }
    fetchAiData()
  }, [selectedFile])

  useEffect(() => {
    if (!aiData) return
    setSelectedKisi("")
    if (!selectedMudurluk || selectedMudurluk === "all") {
      // Müdürlük seçili değilse kişi combobox'ı boş — zorunlu
      setKisiler([])
    } else {
      const mudurlukData = aiData.mudurlukler.find((m: any) => m.mudurluk === selectedMudurluk)
      const mdKisiler = (mudurlukData?.persons ?? [])
        .map((p: any) => p.FullName)
        .filter(Boolean)
      setKisiler([...new Set<string>(mdKisiler)].sort((a, b) => a.localeCompare(b, "tr")))
    }
  }, [selectedMudurluk, aiData])

  const handleSend = async (question?: string) => {
    const messageText = (question || input).trim()
    if (!messageText || isLoading) return

    if (!selectedFile) {
      setError("Lutfen önce bir birim secin.")
      return
    }

    if (!question && messageText.length < 30) {
      setInputError(true)
      return
    }

    setInputError(false)
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
      const response = await sendChatMessage(
        messageText,
        selectedFile || undefined,
        selectedMudurluk || undefined,
        selectedKisi || undefined
      )
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

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {/* 1. Birim */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground shrink-0">Birim:</span>
            <Select value={selectedFile} onValueChange={setSelectedFile}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Birim seçin..." />
              </SelectTrigger>
              <SelectContent>
                {csvFiles.map((file) => (
                  <SelectItem key={file.value} value={file.value}>
                    {file.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 2. Müdürlük */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground shrink-0">Müdürlük:</span>
            <Select
              value={selectedMudurluk}
              onValueChange={setSelectedMudurluk}
              disabled={!selectedFile || aiDataLoading || mudurlukler.length === 0}
            >
              <SelectTrigger className="w-56">
                <SelectValue placeholder={aiDataLoading ? "Yükleniyor..." : "Seçin..."} />
              </SelectTrigger>
              <SelectContent>
                {mudurlukler.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 3. Kişi — sadece müdürlük seçiliyse aktif */}
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium shrink-0 ${!selectedMudurluk ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
              Kişi:
            </span>
            <Select
              value={selectedKisi}
              onValueChange={setSelectedKisi}
              disabled={!selectedMudurluk || aiDataLoading || kisiler.length === 0}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={!selectedMudurluk ? "Önce birim ve müdürlük seçin" : "Tümü"} />
              </SelectTrigger>
              <SelectContent>
                {kisiler.map((k) => (
                  <SelectItem key={k} value={k}>{k}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFile && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => {
                setSelectedFile("")
                setSelectedMudurluk("")
                setSelectedKisi("")
                setMudurlukler([])
                setKisiler([])
                setAiData(null)
              }}
            >
              Filtreyi Temizle
            </Button>
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
                <h2 className="mt-6 text-2xl font-semibold">Görev Analizi Asistanı</h2>
                <p className="mt-2 max-w-md text-center text-muted-foreground">
                  Önce bir birim seçin, o birimle ilgili sorularınızı sorun.
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
              <div className="flex flex-col gap-1">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    type="text"
                    placeholder={selectedFile ? "Sorunuzu açıklayıcı bir şekilde yazın... (en az 30 karakter)" : "Önce birim seçin..."}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      if (e.target.value.trim().length >= 30) setInputError(false)
                    }}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || !selectedFile}
                    className={`flex-1 ${inputError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                {selectedFile && (
                  <div className="flex justify-between text-xs px-1">
                    <span className={inputError ? "text-red-500" : "text-muted-foreground"}>
                      {inputError && input.trim().length < 30 ? "En az 30 karakter giriniz" : ""}
                    </span>
                    <span className={input.trim().length >= 30 ? "text-green-600" : "text-muted-foreground"}>
                      {input.trim().length} / 30
                    </span>
                  </div>
                )}
              </div>
              <p className="mt-3 text-center text-xs font-bold">
                Yanıtlar seçilen birimin görev analizi verilerine dayanarak üretilmektedir.
                <span className="text-red-500 font-bold"> Chatbot'un hafızası bulunmamaktadır.</span>
                AI hata yapabilir. Lütfen kritik kararlar için doğrulama yapın.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}