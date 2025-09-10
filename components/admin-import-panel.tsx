"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Database, Download, CheckCircle, AlertCircle, Loader2 } from "lucide-react"

export default function AdminImportPanel() {
  const [importing, setImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<"idle" | "success" | "error">("idle")
  const [importResult, setImportResult] = useState<any>(null)

  const runImport = async () => {
    setImporting(true)
    setImportStatus("idle")

    try {
      console.log("Démarrage de l'import Fenetre24...")

      const response = await fetch("/api/import-fenetre24", {
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
      } else {
        setImportStatus("error")
        setImportResult(result)
        console.error("❌ Import échoué:", result)
      }
    } catch (error) {
      setImportStatus("error")
      setImportResult({ error: error.message })
      console.error("❌ Erreur réseau:", error)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card className="p-6 bg-white border-none shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Database className="w-6 h-6 text-[#8BD3DD]" />
            <div>
              <h2 className="text-xl font-bold text-[#3A3A3A]">Import Fenetre24</h2>
              <p className="text-sm text-[#3A3A3A] opacity-70">
                Importer les données fabricants depuis le CSV Fenetre24
              </p>
            </div>
          </div>

          {/* Import Button */}
          <Button
            onClick={runImport}
            disabled={importing}
            className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90 disabled:opacity-50"
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Lancer l'Import CSV
              </>
            )}
          </Button>

          {/* Status Display */}
          {importStatus === "success" && (
            <Card className="p-4 bg-green-50 border border-green-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Import réussi!</p>
                  <p className="text-sm text-green-600">Données Fenetre24 importées dans Supabase</p>
                </div>
              </div>
              {importResult && (
                <div className="mt-3 p-3 bg-green-100 rounded text-sm">
                  <pre className="text-green-800 overflow-x-auto">{JSON.stringify(importResult, null, 2)}</pre>
                </div>
              )}
            </Card>
          )}

          {importStatus === "error" && (
            <Card className="p-4 bg-red-50 border border-red-200">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Erreur d'import</p>
                  <p className="text-sm text-red-600">Vérifiez la console pour plus de détails</p>
                </div>
              </div>
              {importResult && (
                <div className="mt-3 p-3 bg-red-100 rounded text-sm">
                  <pre className="text-red-800 overflow-x-auto">{JSON.stringify(importResult, null, 2)}</pre>
                </div>
              )}
            </Card>
          )}

          {/* Instructions */}
          <Card className="p-4 bg-[#8BD3DD]/10 border-none">
            <div className="space-y-2">
              <h4 className="font-semibold text-[#3A3A3A] text-sm">📋 Instructions</h4>
              <div className="text-xs text-[#3A3A3A] opacity-80 space-y-1">
                <p>1. Cliquez sur "Lancer l'Import CSV"</p>
                <p>2. L'import télécharge automatiquement le CSV depuis Vercel Blob</p>
                <p>3. Les données sont parsées et insérées dans Supabase</p>
                <p>4. Les fabricants deviennent disponibles dans l'analyse IA</p>
              </div>
            </div>
          </Card>

          {/* CSV Info */}
          <Card className="p-4 bg-[#F5A623]/10 border-none">
            <div className="space-y-2">
              <h4 className="font-semibold text-[#3A3A3A] text-sm">📊 Source CSV</h4>
              <div className="text-xs text-[#3A3A3A] opacity-80 space-y-1">
                <p>
                  <strong>URL:</strong> hebbkx1anhila5yf.public.blob.vercel-storage.com/fenetre24-*.csv
                </p>
                <p>
                  <strong>Colonnes:</strong> Fabricant, URL, Catégorie Produit
                </p>
                <p>
                  <strong>Destination:</strong> Supabase table `window_manufacturers`
                </p>
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  )
}
