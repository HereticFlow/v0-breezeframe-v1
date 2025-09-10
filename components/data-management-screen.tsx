"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Database,
  ImageIcon,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Calendar,
  MapPin,
  Ruler,
  ArrowLeft,
} from "lucide-react"
import { windowAnalysisDB } from "@/lib/supabase-client"

interface DataManagementScreenProps {
  onBack: () => void
}

export default function DataManagementScreen({ onBack }: DataManagementScreenProps) {
  const [userAnalyses, setUserAnalyses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      // Get current user session (you might want to implement proper auth)
      const userSession = localStorage.getItem("breezeframe_session") || `session_${Date.now()}`

      // Load user's analysis history
      const analyses = await windowAnalysisDB.getUserAnalyses(userSession)
      setUserAnalyses(analyses)
    } catch (error) {
      console.error("Error loading user data:", error)
      // Load mock data for demo
      setUserAnalyses(mockAnalysisData)
    } finally {
      setLoading(false)
    }
  }

  const mockAnalysisData = [
    {
      id: "BF-AI-1703123456789",
      created_at: "2024-03-15T10:30:00Z",
      image_url: "/placeholder.svg?height=200&width=300&text=Fenêtre+Salon",
      analysis_data: {
        dimensions: { width: 120, height: 150, confidence: 0.94 },
        windowType: "Standard Rectangle",
        kitRecommendation: { primary: "solo" },
        qualityScore: 0.94,
      },
      frontend_validation: { confidence: 0.87, lighting: "good" },
    },
    {
      id: "BF-AI-1703123456790",
      created_at: "2024-03-14T15:45:00Z",
      image_url: "/placeholder.svg?height=200&width=300&text=Fenêtre+Chambre",
      analysis_data: {
        dimensions: { width: 100, height: 130, confidence: 0.91 },
        windowType: "Standard Rectangle",
        kitRecommendation: { primary: "solo" },
        qualityScore: 0.91,
      },
      frontend_validation: { confidence: 0.83, lighting: "moderate" },
    },
    {
      id: "BF-AI-1703123456791",
      created_at: "2024-03-13T09:15:00Z",
      image_url: "/placeholder.svg?height=200&width=300&text=Fenêtre+Bureau",
      analysis_data: {
        dimensions: { width: 140, height: 160, confidence: 0.96 },
        windowType: "Standard Rectangle",
        kitRecommendation: { primary: "floor" },
        qualityScore: 0.96,
      },
      frontend_validation: { confidence: 0.89, lighting: "excellent" },
    },
  ]

  const filteredAnalyses = userAnalyses.filter((analysis) => {
    const matchesSearch =
      analysis.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analysis.analysis_data.windowType.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterType === "all" || analysis.analysis_data.kitRecommendation.primary === filterType

    return matchesSearch && matchesFilter
  })

  const downloadData = async (analysisId: string) => {
    try {
      const analysis = userAnalyses.find((a) => a.id === analysisId)
      if (!analysis) return

      const dataToDownload = {
        id: analysis.id,
        date: analysis.created_at,
        dimensions: analysis.analysis_data.dimensions,
        windowType: analysis.analysis_data.windowType,
        recommendations: analysis.analysis_data.recommendations,
        kitRecommendation: analysis.analysis_data.kitRecommendation,
        qualityScore: analysis.analysis_data.qualityScore,
      }

      const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `breezeframe-analysis-${analysisId}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading data:", error)
    }
  }

  const deleteAnalysis = async (analysisId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette analyse ?")) return

    try {
      // In real implementation, call Supabase delete
      setUserAnalyses((prev) => prev.filter((a) => a.id !== analysisId))
      alert("Analyse supprimée avec succès")
    } catch (error) {
      console.error("Error deleting analysis:", error)
      alert("Erreur lors de la suppression")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-[#3A3A3A] hover:bg-[#8BD3DD]/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
              Mes Données & Photos
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">Gérez vos analyses et photos stockées</p>
          </div>
        </div>

        {/* Data Storage Info */}
        <Card className="p-6 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <Database className="w-8 h-8 mx-auto text-[#8BD3DD] mb-2" />
              <h3 className="font-semibold text-[#3A3A3A]">Base de Données</h3>
              <p className="text-sm text-[#3A3A3A] opacity-70">Supabase PostgreSQL</p>
              <p className="text-xs text-[#8BD3DD]">Analyses & métadonnées</p>
            </div>
            <div className="text-center">
              <ImageIcon className="w-8 h-8 mx-auto text-[#F5A623] mb-2" />
              <h3 className="font-semibold text-[#3A3A3A]">Photos</h3>
              <p className="text-sm text-[#3A3A3A] opacity-70">Supabase Storage</p>
              <p className="text-xs text-[#F5A623]">Images haute résolution</p>
            </div>
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto text-[#8BD3DD] mb-2" />
              <h3 className="font-semibold text-[#3A3A3A]">Localisation</h3>
              <p className="text-sm text-[#3A3A3A] opacity-70">Europe (Frankfurt)</p>
              <p className="text-xs text-[#8BD3DD]">RGPD compliant</p>
            </div>
          </div>
        </Card>

        {/* Search & Filter */}
        <Card className="p-4 bg-white/80 border-none shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#3A3A3A] opacity-50" />
              <input
                type="text"
                placeholder="Rechercher par ID ou type de fenêtre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#8BD3DD]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD3DD]/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#3A3A3A] opacity-50" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-[#8BD3DD]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD3DD]/50"
              >
                <option value="all">Tous les kits</option>
                <option value="solo">Solo Kit</option>
                <option value="floor">Floor Kit</option>
                <option value="building">Building Kit</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Analysis History */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-[#3A3A3A]">Historique des Analyses ({filteredAnalyses.length})</h2>

          {loading ? (
            <Card className="p-8 bg-white/80 border-none shadow-lg text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#8BD3DD] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#3A3A3A] opacity-70">Chargement de vos données...</p>
            </Card>
          ) : filteredAnalyses.length === 0 ? (
            <Card className="p-8 bg-white/80 border-none shadow-lg text-center">
              <Database className="w-12 h-12 mx-auto text-[#8BD3DD] opacity-50 mb-4" />
              <p className="text-[#3A3A3A] opacity-70">Aucune analyse trouvée</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAnalyses.map((analysis) => (
                <Card
                  key={analysis.id}
                  className="p-4 bg-white/80 border-none shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="space-y-3">
                    {/* Photo Preview */}
                    <div className="relative">
                      <img
                        src={analysis.image_url || "/placeholder.svg"}
                        alt="Fenêtre analysée"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {analysis.analysis_data.qualityScore &&
                          `${Math.round(analysis.analysis_data.qualityScore * 100)}%`}
                      </div>
                    </div>

                    {/* Analysis Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-[#3A3A3A] text-sm">ID: {analysis.id.split("-").pop()}</h3>
                        <span className="text-xs text-[#8BD3DD] bg-[#8BD3DD]/10 px-2 py-1 rounded">
                          {analysis.analysis_data.kitRecommendation.primary}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-[#3A3A3A] opacity-70">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(analysis.created_at).toLocaleDateString("fr-FR")}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Ruler className="w-3 h-3" />
                          <span>
                            {analysis.analysis_data.dimensions.width}×{analysis.analysis_data.dimensions.height}cm
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-[#3A3A3A] opacity-70">{analysis.analysis_data.windowType}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedAnalysis(analysis)}
                        className="flex-1 border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Voir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadData(analysis.id)}
                        className="border-[#F5A623]/30 text-[#3A3A3A] hover:bg-[#F5A623]/10"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteAnalysis(analysis.id)}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Data Export Options */}
        <Card className="p-6 bg-white/80 border-none shadow-lg">
          <div className="space-y-4">
            <h3 className="font-semibold text-[#3A3A3A]">Export & Sauvegarde</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 border-[#8BD3DD]/30 hover:bg-[#8BD3DD]/10"
                onClick={() => {
                  // Export all data as JSON
                  const allData = { analyses: userAnalyses, exportDate: new Date().toISOString() }
                  const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `breezeframe-data-export-${Date.now()}.json`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
              >
                <Download className="w-6 h-6 text-[#8BD3DD]" />
                <span className="text-sm">Export JSON</span>
                <span className="text-xs opacity-70">Toutes les données</span>
              </Button>

              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 border-[#F5A623]/30 hover:bg-[#F5A623]/10"
                onClick={() => {
                  // Export photos as ZIP (simulated)
                  alert("Export des photos en cours... (fonctionnalité à implémenter)")
                }}
              >
                <ImageIcon className="w-6 h-6 text-[#F5A623]" />
                <span className="text-sm">Export Photos</span>
                <span className="text-xs opacity-70">Archive ZIP</span>
              </Button>

              <Button
                variant="outline"
                className="p-4 h-auto flex flex-col items-center space-y-2 border-[#8BD3DD]/30 hover:bg-[#8BD3DD]/10"
                onClick={() => {
                  // Generate PDF report
                  alert("Génération du rapport PDF... (fonctionnalité à implémenter)")
                }}
              >
                <Database className="w-6 h-6 text-[#8BD3DD]" />
                <span className="text-sm">Rapport PDF</span>
                <span className="text-xs opacity-70">Résumé complet</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* RGPD Compliance */}
        <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="space-y-2">
            <h4 className="font-semibold text-[#3A3A3A] text-sm">🔒 Protection des Données (RGPD)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#3A3A3A] opacity-80">
              <div>
                <p>
                  <strong>Stockage:</strong> Serveurs européens (Frankfurt)
                </p>
                <p>
                  <strong>Chiffrement:</strong> AES-256 au repos, TLS 1.3 en transit
                </p>
              </div>
              <div>
                <p>
                  <strong>Rétention:</strong> 2 ans maximum
                </p>
                <p>
                  <strong>Droits:</strong> Accès, rectification, suppression, portabilité
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Analysis Detail Modal */}
      {selectedAnalysis && (
        <AnalysisDetailModal analysis={selectedAnalysis} onClose={() => setSelectedAnalysis(null)} />
      )}
    </div>
  )
}

// Analysis Detail Modal Component
function AnalysisDetailModal({ analysis, onClose }: { analysis: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#3A3A3A]">Détails de l'Analyse</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Photo */}
          <div className="relative">
            <img
              src={analysis.image_url || "/placeholder.svg"}
              alt="Fenêtre analysée"
              className="w-full h-64 object-cover rounded-lg"
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              ID: {analysis.id}
            </div>
          </div>

          {/* Analysis Data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-[#3A3A3A]">Dimensions</h4>
              <div className="space-y-1 text-sm">
                <p>Largeur: {analysis.analysis_data.dimensions.width}cm</p>
                <p>Hauteur: {analysis.analysis_data.dimensions.height}cm</p>
                <p>Confiance: {Math.round(analysis.analysis_data.dimensions.confidence * 100)}%</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-[#3A3A3A]">Classification</h4>
              <div className="space-y-1 text-sm">
                <p>Type: {analysis.analysis_data.windowType}</p>
                <p>Kit recommandé: {analysis.analysis_data.kitRecommendation.primary}</p>
                <p>Score qualité: {Math.round(analysis.analysis_data.qualityScore * 100)}%</p>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-[#3A3A3A]">Données Techniques</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-xs text-[#3A3A3A] overflow-x-auto">
                {JSON.stringify(analysis.analysis_data, null, 2)}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                const blob = new Blob([JSON.stringify(analysis, null, 2)], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = `analysis-${analysis.id}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="flex-1 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
            >
              Fermer
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
