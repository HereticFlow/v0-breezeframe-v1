"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  RefreshCw,
  Database,
  ImageIcon,
  CheckCircle,
  TrendingUp,
  Clock,
  BarChart3,
  Activity,
  Loader2,
} from "lucide-react"

interface DatasetStats {
  total_images: number
  training_ready: number
  excellent_quality: number
  good_quality: number
  unique_sources: number
  avg_quality_score: number
  last_import: string | null
  source_distribution: Record<string, number>
  quality_distribution: {
    excellent: number
    good: number
    poor: number
  }
  recent_imports: Array<{
    id: string
    import_type: string
    status: string
    records_processed: number
    records_success: number
    records_failed: number
    created_at: string
  }>
}

export default function DatasetStatsViewer() {
  const [stats, setStats] = useState<DatasetStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  const loadStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)

    try {
      const response = await fetch("/api/dataset-stats")
      const result = await response.json()

      if (result.success) {
        setStats(result.statistics)
        setLastUpdated(new Date().toLocaleString("fr-FR"))
      } else {
        console.error("Erreur lors du chargement des stats:", result.error)
      }
    } catch (error) {
      console.error("Erreur réseau:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#8BD3DD] mx-auto mb-4" />
          <p className="text-[#3A3A3A]">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="border-none shadow-lg">
          <CardContent className="p-6 text-center">
            <Database className="w-12 h-12 text-[#8BD3DD] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#3A3A3A] mb-2">Aucune donnée disponible</h3>
            <p className="text-[#3A3A3A] opacity-70 mb-4">Le dataset semble être vide</p>
            <Button onClick={() => loadStats()} className="bg-[#F5A623] hover:bg-[#F5A623]/90 text-white">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#3A3A3A]">Statistiques Dataset</h1>
          <p className="text-[#3A3A3A] opacity-70">Dernière mise à jour: {lastUpdated}</p>
        </div>
        <Button
          onClick={() => loadStats(true)}
          disabled={refreshing}
          className="bg-[#8BD3DD] hover:bg-[#8BD3DD]/90 text-white"
        >
          {refreshing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Actualisation...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </>
          )}
        </Button>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-lg bg-gradient-to-br from-[#FFF7EB] to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3A3A3A]">Total Images</CardTitle>
            <ImageIcon className="h-5 w-5 text-[#F5A623]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3A3A3A]">{stats.total_images.toLocaleString()}</div>
            <p className="text-xs text-[#3A3A3A] opacity-70 mt-1">Images dans le dataset</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3A3A3A]">Prêt Entraînement</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3A3A3A]">{stats.training_ready.toLocaleString()}</div>
            <p className="text-xs text-[#3A3A3A] opacity-70 mt-1">
              {stats.total_images > 0 ? Math.round((stats.training_ready / stats.total_images) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3A3A3A]">Score Moyen</CardTitle>
            <TrendingUp className="h-5 w-5 text-[#8BD3DD]" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3A3A3A]">{stats.avg_quality_score}%</div>
            <p className="text-xs text-[#3A3A3A] opacity-70 mt-1">Qualité moyenne</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#3A3A3A]">Sources</CardTitle>
            <Database className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#3A3A3A]">{stats.unique_sources}</div>
            <p className="text-xs text-[#3A3A3A] opacity-70 mt-1">Sites sources différents</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="quality">Qualité</TabsTrigger>
          <TabsTrigger value="sources">Sources</TabsTrigger>
          <TabsTrigger value="imports">Imports</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#3A3A3A] flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Progression du Dataset
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Images prêtes pour l'entraînement</span>
                    <span>
                      {stats.training_ready} / {stats.total_images}
                    </span>
                  </div>
                  <Progress
                    value={stats.total_images > 0 ? (stats.training_ready / stats.total_images) * 100 : 0}
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Qualité excellente (≥80%)</span>
                    <span>{stats.excellent_quality}</span>
                  </div>
                  <Progress
                    value={stats.total_images > 0 ? (stats.excellent_quality / stats.total_images) * 100 : 0}
                    className="h-3"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Qualité bonne (60-79%)</span>
                    <span>{stats.good_quality}</span>
                  </div>
                  <Progress
                    value={stats.total_images > 0 ? (stats.good_quality / stats.total_images) * 100 : 0}
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#3A3A3A] flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Informations Générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#3A3A3A] opacity-70">Dernière importation</span>
                  <Badge variant="outline">
                    {stats.last_import ? new Date(stats.last_import).toLocaleDateString("fr-FR") : "Aucune"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#3A3A3A] opacity-70">Images de qualité insuffisante</span>
                  <Badge variant="destructive">{stats.quality_distribution.poor}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[#3A3A3A] opacity-70">Taux de réussite</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {stats.total_images > 0 ? Math.round((stats.training_ready / stats.total_images) * 100) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Qualité */}
        <TabsContent value="quality" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3A3A3A]">Distribution de la Qualité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-2">{stats.quality_distribution.excellent}</div>
                  <div className="text-sm text-green-800">Excellente (≥80%)</div>
                  <div className="text-xs text-green-600 mt-1">
                    {stats.total_images > 0
                      ? Math.round((stats.quality_distribution.excellent / stats.total_images) * 100)
                      : 0}
                    % du total
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{stats.quality_distribution.good}</div>
                  <div className="text-sm text-blue-800">Bonne (60-79%)</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {stats.total_images > 0
                      ? Math.round((stats.quality_distribution.good / stats.total_images) * 100)
                      : 0}
                    % du total
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-2">{stats.quality_distribution.poor}</div>
                  <div className="text-sm text-red-800">Insuffisante (&lt;60%)</div>
                  <div className="text-xs text-red-600 mt-1">
                    {stats.total_images > 0
                      ? Math.round((stats.quality_distribution.poor / stats.total_images) * 100)
                      : 0}
                    % du total
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sources */}
        <TabsContent value="sources" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3A3A3A]">Distribution par Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.source_distribution).map(([source, count]) => (
                  <div key={source} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-[#8BD3DD] rounded-full"></div>
                      <span className="font-medium text-[#3A3A3A]">{source}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-[#3A3A3A] opacity-70">
                        {stats.total_images > 0 ? Math.round((count / stats.total_images) * 100) : 0}%
                      </span>
                      <Badge variant="outline">{count.toLocaleString()}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Imports */}
        <TabsContent value="imports" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3A3A3A] flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Imports Récents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.recent_imports.length > 0 ? (
                <div className="space-y-4">
                  {stats.recent_imports.map((importLog) => (
                    <div key={importLog.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-[#3A3A3A]">{importLog.import_type}</div>
                        <div className="text-sm text-[#3A3A3A] opacity-70">
                          {new Date(importLog.created_at).toLocaleString("fr-FR")}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={importLog.status === "success" ? "default" : "destructive"}
                          className={importLog.status === "success" ? "bg-green-100 text-green-800" : ""}
                        >
                          {importLog.status}
                        </Badge>
                        <div className="text-sm text-[#3A3A3A] opacity-70 mt-1">
                          {importLog.records_success}/{importLog.records_processed} réussis
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-[#8BD3DD] mx-auto mb-4 opacity-50" />
                  <p className="text-[#3A3A3A] opacity-70">Aucun import récent</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
