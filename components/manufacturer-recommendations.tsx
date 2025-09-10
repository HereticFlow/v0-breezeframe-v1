"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExternalLink, Star, MapPin, Package, Search, Filter } from "lucide-react"
import { Fenetre24DataImporter } from "@/scripts/import-fenetre24-data"

interface ManufacturerRecommendationsProps {
  windowData: any
  onClose: () => void
}

export default function ManufacturerRecommendations({ windowData, onClose }: ManufacturerRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    loadRecommendations()
  }, [windowData])

  const loadRecommendations = async () => {
    try {
      setLoading(true)

      // Get AI-powered manufacturer recommendations
      const aiRecommendations = await Fenetre24DataImporter.getManufacturerRecommendations(windowData)

      // Add compatibility scores based on window analysis
      const scoredRecommendations = aiRecommendations.map((manufacturer) => ({
        ...manufacturer,
        compatibility_score: calculateCompatibilityScore(manufacturer, windowData),
        match_reasons: generateMatchReasons(manufacturer, windowData),
      }))

      // Sort by compatibility score
      scoredRecommendations.sort((a, b) => b.compatibility_score - a.compatibility_score)

      setRecommendations(scoredRecommendations)
    } catch (error) {
      console.error("Error loading recommendations:", error)
      // Load mock data for demo
      setRecommendations(mockRecommendations)
    } finally {
      setLoading(false)
    }
  }

  const calculateCompatibilityScore = (manufacturer: any, windowData: any): number => {
    let score = 50 // Base score

    // Window type matching
    if (manufacturer.product_category?.toLowerCase().includes("fenêtre")) {
      score += 20
    }

    // Size compatibility
    const { width, height } = windowData.dimensions
    if (width >= 100 && width <= 200 && height >= 120 && height <= 180) {
      score += 15 // Standard sizes
    }

    // Quality indicators
    if (manufacturer.manufacturer_url && manufacturer.manufacturer_url.includes("https")) {
      score += 10
    }

    // Category relevance
    const category = manufacturer.product_category?.toLowerCase() || ""
    if (category.includes("poignée") || category.includes("accessoire")) {
      score += 5
    }

    return Math.min(100, score)
  }

  const generateMatchReasons = (manufacturer: any, windowData: any): string[] => {
    const reasons = []

    if (manufacturer.product_category?.toLowerCase().includes("fenêtre")) {
      reasons.push("Spécialiste fenêtres")
    }

    if (windowData.dimensions.width <= 150) {
      reasons.push("Compatible taille standard")
    }

    if (manufacturer.metadata?.data_quality === "excellent") {
      reasons.push("Données vérifiées")
    }

    return reasons
  }

  const mockRecommendations = [
    {
      id: "hoppe_1",
      manufacturer_name: "Hoppe",
      manufacturer_url: "https://www.fenetre24.com/info/fabricants/fenetres/poignees-hoppe.php",
      product_category: "Poignées de fenêtre, poignées de porte",
      compatibility_score: 95,
      match_reasons: ["Spécialiste accessoires", "Compatible BreezeFrame", "Qualité premium"],
    },
    {
      id: "roto_1",
      manufacturer_name: "Roto",
      manufacturer_url: "https://www.fenetre24.com/info/fabricants/fenetres/roto.php",
      product_category: "Ferrures de fenêtre, systèmes d'ouverture",
      compatibility_score: 88,
      match_reasons: ["Systèmes d'ouverture", "Compatible dimensions", "Innovation technique"],
    },
    {
      id: "siegenia_1",
      manufacturer_name: "Siegenia",
      manufacturer_url: "https://www.fenetre24.com/info/fabricants/fenetres/siegenia.php",
      product_category: "Ferrures, systèmes de ventilation",
      compatibility_score: 82,
      match_reasons: ["Systèmes ventilation", "Qualité allemande", "Compatible modulaire"],
    },
  ]

  const filteredRecommendations = recommendations.filter((rec) => {
    const matchesSearch =
      rec.manufacturer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.product_category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || rec.product_category.toLowerCase().includes(selectedCategory)

    return matchesSearch && matchesCategory
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl bg-white border-none shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#3A3A3A]">Fabricants Recommandés</h3>
              <p className="text-sm text-[#3A3A3A] opacity-70">
                Basé sur votre analyse: {windowData.dimensions?.width}×{windowData.dimensions?.height}cm
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#3A3A3A] opacity-50" />
              <input
                type="text"
                placeholder="Rechercher fabricants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[#8BD3DD]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD3DD]/50"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#3A3A3A] opacity-50" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-[#8BD3DD]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BD3DD]/50"
              >
                <option value="all">Toutes catégories</option>
                <option value="poignée">Poignées</option>
                <option value="ferrure">Ferrures</option>
                <option value="fenêtre">Fenêtres</option>
                <option value="accessoire">Accessoires</option>
              </select>
            </div>
          </div>

          {/* Recommendations */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-[#8BD3DD] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#3A3A3A] opacity-70">Analyse des fabricants compatibles...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-[#3A3A3A] opacity-70">
                {filteredRecommendations.length} fabricant(s) compatible(s) trouvé(s)
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRecommendations.map((manufacturer) => (
                  <Card
                    key={manufacturer.id}
                    className="p-4 bg-white border border-[#8BD3DD]/20 hover:shadow-lg transition-shadow"
                  >
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#3A3A3A] text-lg">{manufacturer.manufacturer_name}</h4>
                          <p className="text-sm text-[#3A3A3A] opacity-70">{manufacturer.product_category}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-[#F5A623]" />
                            <span className="font-bold text-[#F5A623]">{manufacturer.compatibility_score}%</span>
                          </div>
                          <p className="text-xs text-[#3A3A3A] opacity-60">Compatibilité</p>
                        </div>
                      </div>

                      {/* Compatibility Score Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${manufacturer.compatibility_score}%` }}
                        ></div>
                      </div>

                      {/* Match Reasons */}
                      <div className="flex flex-wrap gap-1">
                        {manufacturer.match_reasons?.map((reason: string, index: number) => (
                          <span key={index} className="px-2 py-1 text-xs bg-[#8BD3DD]/20 text-[#3A3A3A] rounded-full">
                            {reason}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(manufacturer.manufacturer_url, "_blank")}
                          className="flex-1 border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Voir Produits
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
                          onClick={() => {
                            // Add to BreezeFrame recommendations
                            console.log("Adding manufacturer to BreezeFrame config:", manufacturer)
                            alert(`${manufacturer.manufacturer_name} ajouté aux recommandations BreezeFrame!`)
                          }}
                        >
                          <Package className="w-3 h-3 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Data Source Info */}
          <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-[#8BD3DD]" />
              <div>
                <p className="text-sm font-medium text-[#3A3A3A]">Données Fenetre24.com</p>
                <p className="text-xs text-[#3A3A3A] opacity-70">
                  Base de données intégrée avec {recommendations.length} fabricants européens
                </p>
              </div>
            </div>
          </Card>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
          >
            Fermer les Recommandations
          </Button>
        </div>
      </Card>
    </div>
  )
}
