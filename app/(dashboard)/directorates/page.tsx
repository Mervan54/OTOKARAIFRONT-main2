"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight, Building2, Users } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getDirectorateSummary } from "@/lib/api"
import type { Directorate } from "@/lib/types"

export default function DirectoratesPage() {
  const [directorates, setDirectorates] = useState<Directorate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const data = await getDirectorateSummary()
      setDirectorates(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div>
        <AppHeader title="Direktörlükler" description="Tüm Organizasyonel Direktörlükleri görüntüeyiniz" />
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppHeader title="Direktörlükler" description="Tüm Organizasyonel Direktörlükleri Görüntüleyiniz" />
      <div className="p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {directorates.map((directorate) => (
           <Card key={directorate.id} className="group transition-shadow hover:shadow-md flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                 <Badge variant="outline">
  {new Set(directorate.departments.flatMap(d => d.adSoyadlar ?? [])).size} Kişi
</Badge>
                </div>
                <CardTitle className="mt-3 text-lg">{directorate.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{directorate.departmentCount} departman</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {directorate.departments.slice(0, 2).map((dept) => (
                    <Badge key={dept.id} variant="secondary" className="text-xs">
                      {dept.name}
                    </Badge>
                  ))}
                  {directorate.departments.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{directorate.departments.length - 3} daha
                    </Badge>
                  )}
                </div>
                <Link href={`/directorates/${directorate.id}`}>
                  <Button
                    variant="ghost"
                    className="mt-4 w-full justify-between group-hover:bg-primary group-hover:text-primary-foreground"
                  >
                    Detayları Gör
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}