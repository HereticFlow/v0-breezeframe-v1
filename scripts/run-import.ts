// Script Node.js pour exécuter l'import directement
import { Fenetre24DataImporter } from "./import-fenetre24-data"

async function runImport() {
  console.log("🚀 Démarrage de l'import Fenetre24...")

  try {
    await Fenetre24DataImporter.importToSupabase()
    console.log("✅ Import terminé avec succès!")
  } catch (error) {
    console.error("❌ Erreur lors de l'import:", error)
  }
}

// Exécuter l'import
runImport()
