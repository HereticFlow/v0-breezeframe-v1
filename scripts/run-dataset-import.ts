import { ImageDatasetManager } from "../lib/image-dataset-manager"

async function runDatasetImport() {
  console.log("🚀 LANCEMENT DE L'IMPORT DATASET")
  console.log("=".repeat(40))

  try {
    await ImageDatasetManager.importToSupabase()
    console.log("\n🎉 Import dataset terminé avec succès!")
  } catch (error) {
    console.error("\n❌ Erreur lors de l'import dataset:", error)
    process.exit(1)
  }
}

// Exécution
runDatasetImport()
