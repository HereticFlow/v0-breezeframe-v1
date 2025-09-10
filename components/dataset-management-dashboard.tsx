"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  Download,
  CheckCircle,
  AlertCircle,
  Loader2,
  ImageIcon,
  Tags,
  TrendingUp,
  FileText,
  Brain,
} from "lucide-react"

interface DatasetStats {
  total_images: number
  training_ready: number
  excellent_quality: number
  good_quality: number
  unique_sources: number
  avg_quality_score: number
  last_import: string
}

interface ImportResult {
  success: boolean
  message?: string
  error?: string
  timestamp: string
}

export default function DatasetManagementDashboard() {
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [stats, setStats] = useState<DatasetStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Charger les statistiques au démarrage
  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const response = await fetch("/api/dataset-import")
      const result = await response.json()

      if (result.success) {
        setStats(result.statistics)
      }
    } catch (error) {
      console.error("Error loading statistics:", error)
    } finally {
      setLoading(false)
    }
  }

  const runImport = async () => {
    setImporting(true)
    setImportStatus("idle")

    try {
      console.log("🚀 Démarrage de l'import du dataset d'images...")

      const response = await fetch("/api/dataset-import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        setImportStatus("success")
        setImportResult(result)
        console.log("✅ Import réussi:", result)
        // Recharger les statistiques
        await loadStatistics()
      } else {
        setImportStatus("error")
        setImportResult(result)
        console.error("❌ Import échoué:", result)
      }
    } catch (error) {
      setImportStatus("error")
      setImportResult({
        success: false,
        error: error instanceof Error ? error.message : "Network error",
        timestamp: new Date().toISOString(),
      })
      console.error("❌ Erreur réseau:", error)
    } finally {
      setImporting(false)
    }
  }

  const exportDataset = async (format: "csv" | "tensorflow" | "pytorch") => {
    try {
      const response = await fetch(`/api/dataset-import?action=export&format=${format}`)
      const result = await response.json()

      if (result.success) {
        // Créer un blob et télécharger
        const blob = new Blob([JSON.stringify(result.data, null, 2)], {
          type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `dataset_${format}_${Date.now()}.json`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Export error:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#8BD3DD]" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#3A3A3A]">Dataset Management</h1>
          <p className="text-[#3A3A3A] opacity-70">Gestion intelligente du dataset d'images avec labellisation IA</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={runImport}
            disabled={importing}
            className="bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Lancer Import IA
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      {importStatus !== "idle" && (
        <Card className={`border-none ${importStatus === "success" ? "bg-green-50" : "bg-red-50"}`}>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {importStatus === "success" ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <p className={`font-medium ${importStatus === "success" ? "text-green-800" : "text-red-800"}`}>
                  {importStatus === "success" ? "Import réussi!" : "Erreur d'import"}
                </p>
                <p className={`text-sm ${importStatus === "success" ? "text-green-600" : "text-red-600"}`}>
                  {importResult?.message || importResult?.error}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="quality">Qualité</TabsTrigger>
          <TabsTrigger value="labels">Labels IA</TabsTrigger>
          <TabsTrigger value="export">Export ML</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#3A3A3A]">Total Images</CardTitle>
                <ImageIcon className="h-4 w-4 text-[#8BD3DD]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A3A3A]">{stats?.total_images?.toLocaleString() || 0}</div>
                <p className="text-xs text-[#3A3A3A] opacity-70">Images dans le dataset</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#3A3A3A]">Prêt Entraînement</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A3A3A]">{stats?.training_ready?.toLocaleString() || 0}</div>
                <p className="text-xs text-[#3A3A3A] opacity-70">Score qualité ≥ 60%</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#3A3A3A]">Score Moyen</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#F5A623]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A3A3A]">{stats?.avg_quality_score?.toFixed(1) || 0}%</div>
                <p className="text-xs text-[#3A3A3A] opacity-70">Qualité moyenne</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#3A3A3A]">Sources</CardTitle>
                <Database className="h-4 w-4 text-[#8BD3DD]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#3A3A3A]">{stats?.unique_sources || 0}</div>
                <p className="text-xs text-[#3A3A3A] opacity-70">Sites sources</p>
              </CardContent>
            </Card>
          </div>

          {/* Progress Overview */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3A3A3A]">Progression du Dataset</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Images prêtes pour l'entraînement</span>
                  <span>
                    {stats?.training_ready || 0} / {stats?.total_images || 0}
                  </span>
                </div>
                <Progress
                  value={stats?.total_images ? (stats.training_ready / stats.total_images) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Qualité excellente (≥80%)</span>
                  <span>{stats?.excellent_quality || 0}</span>
                </div>
                <Progress
                  value={stats?.total_images ? (stats.excellent_quality / stats.total_images) * 100 : 0}
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quality Tab */}
        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#3A3A3A]">Distribution Qualité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Excellente (80-100%)
                    </Badge>
                    <span className="font-semibold">{stats?.excellent_quality || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge variant="default" className="bg-blue-100 text-blue-800">
                      Bonne (60-79%)
                    </Badge>
                    <span className="font-semibold">{stats?.good_quality || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#3A3A3A]">Critères de Qualité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Image valide (URL/Base64)</span>
                    <Badge variant="outline">30 pts</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Titre descriptif (&gt;10 chars)</span>
                    <Badge variant="outline">25 pts</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Labels riches (≥3 labels)</span>
                    <Badge variant="outline">25 pts</Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>Source fiable (HTTP)</span>
                    <Badge variant="outline">20 pts</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Labels Tab */}
        <TabsContent value="labels" className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3A3A3A] flex items-center">
                <Tags className="w-5 h-5 mr-2" />
                Labels IA Automatiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-[#3A3A3A]">Type de Fenêtre</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">fenetre</Badge>
                    <Badge variant="outline">porte-fenetre</Badge>
                    <Badge variant="outline">baie-vitree</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-[#3A3A3A]">Matériau</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">pvc</Badge>
                    <Badge variant="outline">aluminium</Badge>
                    <Badge variant="outline">bois</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-[#3A3A3A]">Couleur</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">blanc</Badge>
                    <Badge variant="outline">gris</Badge>
                    <Badge variant="outline">noir</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-[#3A3A3A]">Style d'Ouverture</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">coulissant</Badge>
                    <Badge variant="outline">abattant</Badge>
                    <Badge variant="outline">oscillo-battant</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-[#3A3A3A]">Vantaux</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">1-vantail</Badge>
                    <Badge variant="outline">2-vantaux</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-[#3A3A3A]">Source</h4>
                  <div className="space-y-2">
                    <Badge variant="outline">source-leboncoin</Badge>
                    <Badge variant="outline">source-direct-fenetres</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#3A3A3A]">TensorFlow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#3A3A3A] opacity-70 mb-4">
                  Format optimisé pour TensorFlow avec images, labels et features
                </p>
                <Button
                  onClick={() => exportDataset("tensorflow")}
                  className="w-full bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export TensorFlow
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#3A3A3A]">PyTorch</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#3A3A3A] opacity-70 mb-4">
                  Format dataset PyTorch avec targets et features structurés
                </p>
                <Button
                  onClick={() => exportDataset("pytorch")}
                  className="w-full bg-[#EE4C2C] hover:bg-[#EE4C2C]/90 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PyTorch
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-[#3A3A3A]">CSV</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#3A3A3A] opacity-70 mb-4">
                  Format CSV standard pour analyse et visualisation
                </p>
                <Button
                  onClick={() => exportDataset("csv")}
                  className="w-full bg-[#8BD3DD] hover:bg-[#8BD3DD]/90 text-white"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#3A3A3A]">Features ML Incluses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Textuelles:</strong>
                  <ul className="mt-1 space-y-1 text-[#3A3A3A] opacity-70">
                    <li>• Longueur titre</li>
                    <li>• Nombre de mots</li>
                    <li>• Présence dimensions</li>
                    <li>• Mention prix</li>
                  </ul>
                </div>
                <div>
                  <strong>Catégorielles:</strong>
                  <ul className="mt-1 space-y-1 text-[#3A3A3A] opacity-70">
                    <li>• Type fenêtre</li>
                    <li>• Matériau</li>
                    <li>• Couleur</li>
                    <li>• Style ouverture</li>
                  </ul>
                </div>
                <div>
                  <strong>Qualité:</strong>
                  <ul className="mt-1 space-y-1 text-[#3A3A3A] opacity-70">
                    <li>• Score qualité</li>
                    <li>• Prêt entraînement</li>
                    <li>• Source fiabilité</li>
                    <li>• Richesse labels</li>
                  </ul>
                </div>
                <div>
                  <strong>Métadonnées:</strong>
                  <ul className="mt-1 space-y-1 text-[#3A3A3A] opacity-70">
                    <li>• ID unique</li>
                    <li>• URL image</li>
                    <li>• Site source</li>
                    <li>• Date import</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
