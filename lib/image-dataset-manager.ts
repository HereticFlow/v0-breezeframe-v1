import { supabase } from "./supabase-client"

interface CSVRow {
  "YQ4gaf src"?: string
  "EZAeBe href"?: string
  "YQ4gaf src 2"?: string
  guK3rf?: string
  toI8Rb?: string
  // Nouveau schéma DO-Fenetre
  "data image jpg"?: string
  url?: string
  "data image png"?: string
  "description ou marques"?: string
  utilité?: string
}

interface ImageRecord {
  id: string
  image_url: string
  image_base64?: string
  source_url: string
  source_site: string
  title: string
  description: string
  labels: any
  ml_features: any
  quality_score: number
  training_ready: boolean
}

export class ImageDatasetManager {
  private static csvUrls = [
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/google%20%287%29-cRTOh554W2adWby6awWzt6P5vzbdvM.csv",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/google%20%286%29-W2ghVEUG3eCNvdFcqnLI6yffAJPW1L.csv",
    "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/DO-Fenetre-rez-de%20chausse%CC%81-GRMR06Oztn0sjblTfHZUKYKKTypmMv.csv",
  ]

  static async importToSupabase(): Promise<void> {
    console.log("🖼️  DÉMARRAGE DE L'IMPORT DATASET COMPLET")
    console.log("=".repeat(50))

    let totalProcessed = 0
    let totalSuccess = 0
    let totalFailed = 0
    const startTime = Date.now()

    for (let i = 0; i < this.csvUrls.length; i++) {
      const csvUrl = this.csvUrls[i]
      const csvName = csvUrl.includes("DO-Fenetre")
        ? "DO-Fenetre-rez-de-chaussé"
        : csvUrl.includes("google%20%287%29")
          ? "Google-Dataset-7"
          : "Google-Dataset-6"

      console.log(`\n📥 TRAITEMENT CSV ${i + 1}/${this.csvUrls.length}: ${csvName}`)
      console.log(`🔗 URL: ${csvUrl}`)

      try {
        const response = await fetch(csvUrl)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const csvText = await response.text()
        console.log(`📄 Taille CSV: ${Math.round(csvText.length / 1024)}KB`)

        const rows = this.parseCSV(csvText)
        console.log(`✅ CSV parsé: ${rows.length} enregistrements trouvés`)

        let csvSuccess = 0
        let csvFailed = 0

        for (const row of rows) {
          totalProcessed++
          try {
            const imageRecord = await this.processRow(row, csvName)
            if (imageRecord) {
              await this.saveToSupabase(imageRecord)
              totalSuccess++
              csvSuccess++

              if (totalSuccess % 5 === 0) {
                console.log(`📊 Progression globale: ${totalSuccess}/${totalProcessed} images traitées`)
              }
            }
          } catch (error) {
            totalFailed++
            csvFailed++
            console.error(`❌ Erreur ligne ${totalProcessed}:`, error instanceof Error ? error.message : error)
          }
        }

        console.log(`✅ CSV ${csvName} terminé: ${csvSuccess} succès, ${csvFailed} échecs`)
      } catch (error) {
        console.error(`❌ Erreur téléchargement CSV ${csvName}:`, error)
      }
    }

    const duration = Date.now() - startTime
    console.log(`\n🎉 RÉSUMÉ FINAL DE L'IMPORT:`)
    console.log(`=`.repeat(40))
    console.log(`📊 Total traité: ${totalProcessed}`)
    console.log(`✅ Succès: ${totalSuccess}`)
    console.log(`❌ Échecs: ${totalFailed}`)
    console.log(`⏱️  Durée: ${Math.round(duration / 1000)}s`)
    console.log(`📈 Taux de réussite: ${Math.round((totalSuccess / totalProcessed) * 100)}%`)

    // Sauvegarder les logs d'import
    await this.saveImportLog({
      import_type: "image_dataset_complete",
      status: totalFailed === 0 ? "success" : "partial_success",
      records_processed: totalProcessed,
      records_success: totalSuccess,
      records_failed: totalFailed,
      duration_ms: duration,
      details: {
        csv_count: this.csvUrls.length,
        success_rate: Math.round((totalSuccess / totalProcessed) * 100),
      },
    })

    // Générer le résumé du dataset
    await this.generateDatasetSummary()
  }

  private static parseCSV(csvText: string): CSVRow[] {
    const lines = csvText.split("\n").filter((line) => line.trim())
    if (lines.length < 2) return []

    const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim())
    console.log(`📋 Headers détectés: ${headers.join(", ")}`)

    const rows: CSVRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      if (values.length >= headers.length) {
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] || ""
        })
        rows.push(row as CSVRow)
      }
    }

    return rows
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ""
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        result.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }

    result.push(current.trim())
    return result
  }

  private static async processRow(row: CSVRow, csvSource: string): Promise<ImageRecord | null> {
    // Détection du schéma
    let imageUrl = ""
    let sourceUrl = ""
    let title = ""
    let description = ""

    if (row["data image jpg"]) {
      // Nouveau schéma DO-Fenetre
      imageUrl = row["data image jpg"] || ""
      sourceUrl = row["url"] || ""
      title = row["description ou marques"] || ""
      description = row["utilité"] || title
    } else {
      // Ancien schéma Google
      imageUrl = row["YQ4gaf src"] || row["YQ4gaf src 2"] || ""
      sourceUrl = row["EZAeBe href"] || ""
      title = row["toI8Rb"] || ""
      description = title
    }

    // Validation des données essentielles
    if (!imageUrl || imageUrl.length < 10) {
      return null
    }

    // Labellisation automatique avec IA
    const labels = this.generateLabels(title, description, csvSource)
    const mlFeatures = this.extractMLFeatures(title, description, imageUrl)
    const qualityScore = this.calculateQualityScore(imageUrl, title, sourceUrl, description)

    return {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      image_url: imageUrl,
      image_base64: imageUrl.startsWith("data:") ? imageUrl : undefined,
      source_url: sourceUrl,
      source_site: csvSource,
      title: title,
      description: description,
      labels: labels,
      ml_features: mlFeatures,
      quality_score: qualityScore,
      training_ready: qualityScore >= 60,
    }
  }

  private static generateLabels(title: string, description: string, sourceSite: string): any {
    const text = `${title} ${description}`.toLowerCase()
    const labels: any = {
      source: `source-${sourceSite.toLowerCase().replace(/\s+/g, "-")}`,
      type: [],
      material: [],
      color: [],
      style: [],
      vantaux: [],
      features: [],
      location: [],
      privacy: [],
    }

    // Détection du type
    if (text.includes("porte") && text.includes("fenêtre")) {
      labels.type.push("porte-fenetre")
    } else if (text.includes("fenêtre") || text.includes("fenetre")) {
      labels.type.push("fenetre")
    } else if (text.includes("baie")) {
      labels.type.push("baie-vitree")
    }

    // Détection du matériau
    if (text.includes("pvc")) labels.material.push("pvc")
    if (text.includes("aluminium") || text.includes("alu")) labels.material.push("aluminium")
    if (text.includes("bois")) labels.material.push("bois")
    if (text.includes("acier")) labels.material.push("acier")

    // Détection de la couleur
    if (text.includes("blanc")) labels.color.push("blanc")
    if (text.includes("gris")) labels.color.push("gris")
    if (text.includes("anthracite")) labels.color.push("anthracite")
    if (text.includes("noir")) labels.color.push("noir")
    if (text.includes("beige")) labels.color.push("beige")

    // Détection du style
    if (text.includes("coulissant")) labels.style.push("coulissant")
    if (text.includes("abattant")) labels.style.push("abattant")
    if (text.includes("oscillo")) labels.style.push("oscillo-battant")
    if (text.includes("battant")) labels.style.push("battant")

    // Détection des vantaux
    if (text.includes("2 vantaux") || text.includes("deux vantaux")) {
      labels.vantaux.push("2-vantaux")
    } else if (text.includes("1 vantail") || text.includes("un vantail")) {
      labels.vantaux.push("1-vantail")
    }

    // Détection de la localisation (spécifique au nouveau CSV)
    if (text.includes("rez") && text.includes("chaussée")) {
      labels.location.push("rez-de-chaussee")
    }
    if (text.includes("étage")) labels.location.push("etage")

    // Détection des features de confidentialité
    if (text.includes("intimité") || text.includes("intimite")) {
      labels.privacy.push("intimite")
    }
    if (text.includes("vis-à-vis")) labels.privacy.push("vis-a-vis")

    // Features techniques
    if (text.includes("double vitrage")) labels.features.push("double-vitrage")
    if (text.includes("triple vitrage")) labels.features.push("triple-vitrage")
    if (text.includes("isolation")) labels.features.push("isolation")

    return labels
  }

  private static extractMLFeatures(title: string, description: string, imageUrl: string): any {
    const fullText = `${title} ${description}`
    const features: any = {
      has_dimensions: false,
      has_price: false,
      image_type: "unknown",
      text_length: fullText.length,
      word_count: fullText.split(" ").length,
      has_privacy_keywords: false,
      has_location_keywords: false,
      description_quality: "low",
    }

    // Détection de dimensions
    const dimensionRegex = /\d+\s*[x×]\s*\d+|[0-9]+\s*cm|[0-9]+\s*mm/i
    features.has_dimensions = dimensionRegex.test(fullText)

    // Détection de prix
    const priceRegex = /\d+\s*€|€\s*\d+|\d+\s*euros?/i
    features.has_price = priceRegex.test(fullText)

    // Type d'image
    if (imageUrl.startsWith("data:image/")) {
      const mimeMatch = imageUrl.match(/data:image\/([^;]+)/)
      features.image_type = mimeMatch ? mimeMatch[1] : "base64"
    } else if (imageUrl.includes("http")) {
      features.image_type = "url"
    }

    // Détection mots-clés confidentialité
    const privacyKeywords = ["intimité", "intimite", "vis-à-vis", "préserver", "protéger"]
    features.has_privacy_keywords = privacyKeywords.some((keyword) => fullText.toLowerCase().includes(keyword))

    // Détection mots-clés localisation
    const locationKeywords = ["rez-de-chaussée", "rez de chaussee", "étage", "appartement"]
    features.has_location_keywords = locationKeywords.some((keyword) => fullText.toLowerCase().includes(keyword))

    // Qualité de la description
    if (fullText.length > 100) {
      features.description_quality = "high"
    } else if (fullText.length > 50) {
      features.description_quality = "medium"
    }

    return features
  }

  private static calculateQualityScore(
    imageUrl: string,
    title: string,
    sourceUrl: string,
    description: string,
  ): number {
    let score = 0

    // Score basé sur l'image (30 points max)
    if (imageUrl && imageUrl.length > 10) {
      score += 15
      if (imageUrl.startsWith("http") && !imageUrl.includes("placeholder")) {
        score += 15
      } else if (imageUrl.startsWith("data:image/")) {
        score += 10
      }
    }

    // Score basé sur le titre (25 points max)
    if (title && title.length > 5) {
      score += 10
      if (title.length > 20) score += 10
      if (title.toLowerCase().includes("fenêtre") || title.toLowerCase().includes("fenetre")) {
        score += 5
      }
    }

    // Score basé sur la description (25 points max)
    if (description && description.length > 10) {
      score += 10
      if (description.length > 50) score += 10
      if (description !== title) score += 5 // Bonus si description différente du titre
    }

    // Score basé sur l'URL source (15 points max)
    if (sourceUrl && sourceUrl.startsWith("http")) {
      score += 15
    }

    // Bonus pour la cohérence (5 points max)
    if (title && imageUrl && sourceUrl && description) {
      score += 5
    }

    return Math.min(score, 100)
  }

  private static async saveToSupabase(record: ImageRecord): Promise<void> {
    const { error } = await supabase.from("image_dataset").insert(record)

    if (error) {
      throw new Error(`Erreur Supabase: ${error.message}`)
    }
  }

  private static async saveImportLog(logData: any): Promise<void> {
    try {
      await supabase.from("import_logs").insert(logData)
    } catch (error) {
      console.error("Erreur sauvegarde log:", error)
    }
  }

  private static async generateDatasetSummary(): Promise<void> {
    try {
      console.log("\n📊 GÉNÉRATION DU RÉSUMÉ DATASET...")

      const { data: images, error } = await supabase
        .from("image_dataset")
        .select("labels, quality_score, source_site, training_ready")

      if (error) throw error

      const summary = {
        total_images: images?.length || 0,
        training_ready: images?.filter((img) => img.training_ready).length || 0,
        excellent_quality: images?.filter((img) => img.quality_score >= 80).length || 0,
        good_quality: images?.filter((img) => img.quality_score >= 60 && img.quality_score < 80).length || 0,
        unique_sources: [...new Set(images?.map((img) => img.source_site) || [])].length,
        avg_quality_score: images?.length
          ? Math.round(images.reduce((sum, img) => sum + (img.quality_score || 0), 0) / images.length)
          : 0,
        last_import: new Date().toISOString(),
      }

      // Créer une vue pour les statistiques rapides
      await supabase.from("dataset_quick_stats").upsert(summary)

      console.log(`✅ Résumé généré:`)
      console.log(`   📊 Total images: ${summary.total_images}`)
      console.log(`   🎯 Prêt entraînement: ${summary.training_ready}`)
      console.log(`   ⭐ Qualité excellente: ${summary.excellent_quality}`)
      console.log(`   📈 Score moyen: ${summary.avg_quality_score}%`)
      console.log(`   🌐 Sources uniques: ${summary.unique_sources}`)
    } catch (error) {
      console.error("❌ Erreur génération résumé:", error)
    }
  }

  // Méthodes pour l'API
  static async searchDataset(query: string): Promise<any[]> {
    const { data, error } = await supabase
      .from("image_dataset")
      .select("*")
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(50)

    if (error) throw error
    return data || []
  }

  static async exportForML(format: "tensorflow" | "pytorch" | "csv"): Promise<any> {
    const { data: images, error } = await supabase.from("image_dataset").select("*").eq("training_ready", true)

    if (error) throw error

    switch (format) {
      case "tensorflow":
        return {
          images: images?.map((img) => ({
            id: img.id,
            image_url: img.image_url,
            labels: img.labels,
            features: img.ml_features,
          })),
          metadata: {
            total_samples: images?.length || 0,
            format: "tensorflow",
            export_date: new Date().toISOString(),
          },
        }

      case "pytorch":
        return {
          data: images?.map((img) => ({
            image: img.image_url,
            target: img.labels,
            features: img.ml_features,
          })),
          metadata: {
            dataset_size: images?.length || 0,
            format: "pytorch",
            export_date: new Date().toISOString(),
          },
        }

      case "csv":
      default:
        return {
          records: images?.map((img) => ({
            id: img.id,
            image_url: img.image_url,
            title: img.title,
            description: img.description,
            quality_score: img.quality_score,
            training_ready: img.training_ready,
            source_site: img.source_site,
            labels_json: JSON.stringify(img.labels),
            features_json: JSON.stringify(img.ml_features),
          })),
          metadata: {
            total_records: images?.length || 0,
            format: "csv",
            export_date: new Date().toISOString(),
          },
        }
    }
  }
}
