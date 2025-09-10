"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface QuickStats {
  success: boolean
  total_images: number
  samples: Array<{
    id: string
    title: string
    source_site: string
    quality_score: number
    training_ready: boolean
    created_at: string
  }>
  message: string
  error?: string
  debug?: any
}

export default function SimpleStatsDisplay() {
  const [stats, setStats] = useState<QuickStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("🔄 Chargement des statistiques...")

      const response = await fetch("/api/quick-stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("📡 Réponse API:", response.status, response.statusText)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📊 Données reçues:", data)

      setStats(data)
    } catch (error) {
      console.error("❌ Erreur chargement:", error)
      setError(error instanceof Error ? error.message : "Erreur inconnue")
      setStats({
        success: false,
        total_images: 0,
        samples: [],
        message: "Erreur de connexion à l'API",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-none shadow-lg">
          <CardContent className="p-8 text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-[#8BD3DD]" />
            <h2 className="text-xl font-semibold text-[#3A3A3A] mb-2">Chargement des statistiques...</h2>
            <p className="text-[#3A3A3A] opacity-70">Connexion à la base de données</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#3A3A3A]">Statistiques Dataset</h1>
          <p className="text-[#3A3A3A] opacity-70">Vue simplifiée - Diagnostic complet</p>
        </div>
        <Button onClick={loadStats} disabled={loading} className="bg-[#8BD3DD] hover:bg-[#8BD3DD]/90 text-white">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Status Principal */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-[#3A3A3A]">
            {stats?.success ? (
              <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 mr-2 text-red-500" />
            )}
            État du Dataset
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.success ? (
            <div className="space-y-6">
              {/* Résultat principal */}
              <div className="text-center p-8 bg-gradient-to-br from-[#FFF7EB] to-white rounded-lg border-2 border-[#F5A623]/20">
                <div className="text-6xl font-bold text-[#F5A623] mb-4">{stats.total_images.toLocaleString()}</div>
                <div className="text-xl text-[#3A3A3A] font-semibold mb-2">Images dans le dataset</div>
                <Badge
                  variant={stats.total_images > 0 ? "default" : "secondary"}
                  className={stats.total_images > 0 ? "bg-green-100 text-green-800" : ""}
                >
                  {stats.message}
                </Badge>
              </div>

              {/* Échantillons */}
              {stats.total_images > 0 && stats.samples.length > 0 && (
                <div>
                  <h3 className="font-semibold text-[#3A3A3A] mb-4 flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Échantillons d'Images ({stats.samples.length})
                  </h3>
                  <div className="space-y-3">
                    {stats.samples.map((sample, index) => (
                      <div key={sample.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-[#3A3A3A] mb-1">
                              {index + 1}. {sample.title ? sample.title.substring(0, 80) : "Sans titre"}
                              {sample.title && sample.title.length > 80 && "..."}
                            </div>
                            <div className="flex flex-wrap gap-2 text-sm">
                              <Badge variant="outline">{sample.source_site || "Source inconnue"}</Badge>
                              <Badge
                                variant={
                                  sample.quality_score >= 80
                                    ? "default"
                                    : sample.quality_score >= 60
                                      ? "secondary"
                                      : "destructive"
                                }
                                className={
                                  sample.quality_score >= 80
                                    ? "bg-green-100 text-green-800"
                                    : sample.quality_score >= 60
                                      ? "bg-blue-100 text-blue-800"
                                      : ""
                                }
                              >
                                Score: {sample.quality_score}%
                              </Badge>
                              <Badge variant={sample.training_ready ? "default" : "destructive"}>
                                {sample.training_ready ? "✅ Prêt" : "❌ Non prêt"}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-[#3A3A3A] opacity-50 ml-4">
                            {new Date(sample.created_at).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-8 bg-red-50 rounded-lg border-2 border-red-200">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <div className="text-xl font-semibold text-red-800 mb-2">Problème Détecté</div>
              <div className="text-red-600 mb-4">{stats?.error || stats?.message || "Erreur inconnue"}</div>

              {/* Debug info */}
              {stats?.debug && (
                <div className="text-left bg-red-100 p-4 rounded-lg mt-4">
                  <div className="text-sm font-mono text-red-800">
                    <div>
                      <strong>Code:</strong> {stats.debug.code}
                    </div>
                    {stats.debug.details && (
                      <div>
                        <strong>Détails:</strong> {stats.debug.details}
                      </div>
                    )}
                    {stats.debug.hint && (
                      <div>
                        <strong>Conseil:</strong> {stats.debug.hint}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#3A3A3A]">
            {stats?.total_images === 0 ? "Actions Requises" : "Prochaines Étapes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats?.total_images === 0 ? (
              <>
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <span className="w-6 h-6 bg-[#F5A623] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    1
                  </span>
                  <div>
                    <div className="font-medium text-[#3A3A3A]">Vérifier la configuration Supabase</div>
                    <div className="text-sm text-[#3A3A3A] opacity-70">
                      Les variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY sont-elles correctes ?
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <span className="w-6 h-6 bg-[#8BD3DD] text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    2
                  </span>
                  <div>
                    <div className="font-medium text-[#3A3A3A]">Créer les tables Supabase</div>
                    <div className="text-sm text-[#3A3A3A] opacity-70">
                      Exécuter le script SQL pour créer la table image_dataset
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                    3
                  </span>
                  <div>
                    <div className="font-medium text-[#3A3A3A]">Lancer l'import des données</div>
                    <div className="text-sm text-[#3A3A3A] opacity-70">
                      Utiliser l'API /api/dataset-import pour importer les images CSV
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <div className="font-medium text-[#3A3A3A]">Dataset configuré avec succès !</div>
                    <div className="text-sm text-[#3A3A3A] opacity-70">
                      {stats.total_images} images disponibles pour l'entraînement IA
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Info */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Informations de Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-red-700 bg-red-100 p-3 rounded overflow-x-auto">{error}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
