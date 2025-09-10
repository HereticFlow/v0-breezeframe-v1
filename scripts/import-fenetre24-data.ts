import { supabase } from "../lib/supabase-client"

interface Fenetre24Product {
  id: string
  name: string
  brand: string
  product_type: string
  material: string
  color: string
  dimensions: string
  price_range: string
  features: any
  quality_score: number
  source_url: string
}

export class Fenetre24DataImporter {
  static async importToSupabase(): Promise<void> {
    console.log("🏭 IMPORT DES DONNÉES FENETRE24")
    console.log("=".repeat(40))

    const products: Fenetre24Product[] = [
      {
        id: "f24_001",
        name: "Fenêtre PVC Blanc 2 Vantaux",
        brand: "Fenetre24",
        product_type: "fenetre",
        material: "PVC",
        color: "Blanc",
        dimensions: "120x100cm",
        price_range: "200-400€",
        features: {
          vitrage: "double",
          ouverture: "oscillo-battant",
          isolation: "haute",
          garantie: "10 ans",
        },
        quality_score: 85,
        source_url: "https://www.fenetre24.com/fenetre-pvc-blanc",
      },
      {
        id: "f24_002",
        name: "Porte-Fenêtre Aluminium Gris",
        brand: "Fenetre24",
        product_type: "porte-fenetre",
        material: "Aluminium",
        color: "Gris anthracite",
        dimensions: "215x140cm",
        price_range: "600-900€",
        features: {
          vitrage: "triple",
          ouverture: "coulissant",
          isolation: "très haute",
          seuil: "PMR",
        },
        quality_score: 92,
        source_url: "https://www.fenetre24.com/porte-fenetre-alu",
      },
      {
        id: "f24_003",
        name: "Baie Vitrée Coulissante Bois",
        brand: "Fenetre24",
        product_type: "baie-vitree",
        material: "Bois",
        color: "Chêne naturel",
        dimensions: "300x220cm",
        price_range: "1200-1800€",
        features: {
          vitrage: "triple",
          ouverture: "coulissant-galandage",
          isolation: "premium",
          traitement: "anti-UV",
        },
        quality_score: 95,
        source_url: "https://www.fenetre24.com/baie-vitree-bois",
      },
      {
        id: "f24_004",
        name: "Fenêtre Mixte Bois-Alu",
        brand: "Fenetre24",
        product_type: "fenetre",
        material: "Mixte Bois-Aluminium",
        color: "Bois intérieur / Gris extérieur",
        dimensions: "140x120cm",
        price_range: "800-1200€",
        features: {
          vitrage: "triple",
          ouverture: "oscillo-battant",
          isolation: "premium",
          entretien: "minimal",
        },
        quality_score: 88,
        source_url: "https://www.fenetre24.com/fenetre-mixte",
      },
      {
        id: "f24_005",
        name: "Fenêtre PVC Couleur Sur-Mesure",
        brand: "Fenetre24",
        product_type: "fenetre",
        material: "PVC",
        color: "Personnalisable (RAL)",
        dimensions: "Sur mesure",
        price_range: "300-600€",
        features: {
          vitrage: "double-argon",
          ouverture: "au choix",
          isolation: "haute",
          personnalisation: "complète",
        },
        quality_score: 80,
        source_url: "https://www.fenetre24.com/fenetre-sur-mesure",
      },
    ]

    let successCount = 0
    let errorCount = 0

    for (const product of products) {
      try {
        console.log(`📦 Import: ${product.name}`)

        const { error } = await supabase.from("window_manufacturers").insert(product)

        if (error) {
          throw error
        }

        successCount++
        console.log(`✅ ${product.name} - Importé`)
      } catch (error) {
        errorCount++
        console.error(`❌ Erreur ${product.name}:`, error)
      }
    }

    console.log(`\n📊 RÉSUMÉ FENETRE24:`)
    console.log(`✅ Succès: ${successCount}`)
    console.log(`❌ Erreurs: ${errorCount}`)
    console.log(`📈 Total: ${products.length} produits`)

    // Log de l'import
    await supabase.from("import_logs").insert({
      import_type: "fenetre24_manufacturers",
      status: errorCount === 0 ? "success" : "partial_success",
      records_processed: products.length,
      records_success: successCount,
      records_failed: errorCount,
      duration_ms: 0,
    })
  }
}
