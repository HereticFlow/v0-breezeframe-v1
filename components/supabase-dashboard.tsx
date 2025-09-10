"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Database, RefreshCw, CheckCircle, XCircle, ExternalLink, Copy, Play, Eye } from "lucide-react"

interface SupabaseStatus {
  connection: boolean
  tables: Record<
    string,
    {
      exists: boolean
      count: number
      error: string | null
    }
  >
  errors: string[]
  timestamp: string
}

interface ImportResult {
  success: boolean
  message: string
  images_imported?: number
  error?: string
  details?: string
}

export default function SupabaseDashboard() {
  const [status, setStatus] = useState<SupabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [sampleData, setSampleData] = useState<any[]>([])

  const sqlScript = `-- Script SQL pour créer les tables Supabase
-- Copiez et collez ce script dans votre Supabase SQL Editor

-- Create window_analysis table
CREATE TABLE IF NOT EXISTS window_analysis (
    id TEXT PRIMARY KEY,
    user_session TEXT,
    image_url TEXT,
    analysis_data JSONB,
    frontend_validation JSONB,
    processing_time_ms INTEGER,
    quality_score DECIMAL(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create window_manufacturers table
CREATE TABLE IF NOT EXISTS window_manufacturers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand TEXT,
    type TEXT,
    material TEXT,
    color TEXT,
    dimensions TEXT,
    price_range TEXT,
    features JSONB,
    quality_score DECIMAL(3,2),
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create image_dataset table
CREATE TABLE IF NOT EXISTS image_dataset (
    id TEXT PRIMARY KEY,
    image_url TEXT NOT NULL,
    image_base64 TEXT,
    source_url TEXT,
    source_site TEXT,
    title TEXT,
    description TEXT,
    labels JSONB,
    ml_features JSONB,
    quality_score DECIMAL(3,2),
    training_ready BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create import_logs table
CREATE TABLE IF NOT EXISTS import_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_type TEXT,
    status TEXT,
    records_processed INTEGER DEFAULT 0,
    records_success INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    error_details JSONB,
    duration_ms INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create dataset_quick_stats table
CREATE TABLE IF NOT EXISTS dataset_quick_stats (
    id TEXT PRIMARY KEY DEFAULT 'main_stats',
    total_images INTEGER DEFAULT 0,
    training_ready INTEGER DEFAULT 0,
    excellent_quality INTEGER DEFAULT 0,
    good_quality INTEGER DEFAULT 0,
    unique_sources INTEGER DEFAULT 0,
    avg_quality_score INTEGER DEFAULT 0,
    last_import TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_window_analysis_session ON window_analysis(user_session);
CREATE INDEX IF NOT EXISTS idx_manufacturers_type ON window_manufacturers(type);
CREATE INDEX IF NOT EXISTS idx_image_dataset_source ON image_dataset(source_site);
CREATE INDEX IF NOT EXISTS idx_image_dataset_training ON image_dataset(training_ready);

SELECT 'Tables créées avec succès!' as status;`

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/supabase-status")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Erreur récupération status:", error)
    } finally {
      setLoading(false)
    }
  }

  const triggerImport = async () => {
    setImporting(true)
    setImportResult(null)
    try {
      const response = await fetch("/api/force-import", { method: "POST" })
      const result = await response.json()
      setImportResult(result)

      // Rafraîchir le status après import
      setTimeout(fetchStatus, 1000)
    } catch (error) {
      setImportResult({
        success: false,
        message: "Erreur lors de l'import",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      })
    } finally {
      setImporting(false)
    }
  }

  const fetchSampleData = async () => {
    try {
      const response = await fetch("/api/dataset-preview")
      const data = await response.json()
      setSampleData(data.images || [])
    } catch (error) {
      console.error("Erreur récupération données:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Script SQL copié dans le presse-papiers!")
  }

  useEffect(() => {
    fetchStatus()
    fetchSampleData()
  }, [])

  const totalTables = status ? Object.keys(status.tables).length : 0
  const existingTables = status ? Object.values(status.tables).filter((t) => t.exists).length : 0
  const totalRecords = status ? Object.values(status.tables).reduce((sum, t) => sum + t.count, 0) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <Database className="h-8 w-8 text-blue-600" />
            Dashboard Supabase
          </h1>
          <p className="text-gray-600">Gérez vos données et vérifiez le status de votre base de données</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Connexion</p>
                  <p className="text-2xl font-bold">
                    {status?.connection ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Connecté
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="h-4 w-4 mr-1" />
                        Déconnecté
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tables</p>
                  <p className="text-2xl font-bold">
                    {existingTables}/{totalTables}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enregistrements</p>
                  <p className="text-2xl font-bold">{totalRecords.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Dernière MAJ</p>
                  <p className="text-sm font-medium">
                    {status?.timestamp ? new Date(status.timestamp).toLocaleTimeString() : "N/A"}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tables" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="data">Données</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="setup">Setup</TabsTrigger>
          </TabsList>

          {/* Tables Tab */}
          <TabsContent value="tables" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Status des Tables</CardTitle>
                <CardDescription>Vérifiez l'état de vos tables Supabase</CardDescription>
              </CardHeader>
              <CardContent>
                {status?.tables && (
                  <div className="space-y-3">
                    {Object.entries(status.tables).map(([tableName, tableInfo]) => (
                      <div key={tableName} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {tableInfo.exists ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{tableName}</p>
                            {tableInfo.error && <p className="text-sm text-red-600">{tableInfo.error}</p>}
                          </div>
                        </div>
                        <Badge variant={tableInfo.exists ? "default" : "destructive"}>
                          {tableInfo.count} enregistrements
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Aperçu des Données</CardTitle>
                <CardDescription>Visualisez vos données stockées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button onClick={fetchSampleData} variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Actualiser les données
                  </Button>

                  {sampleData.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-medium">Échantillon d'images ({sampleData.length})</h4>
                      <div className="grid gap-2 max-h-64 overflow-y-auto">
                        {sampleData.slice(0, 5).map((item, index) => (
                          <div key={index} className="p-2 border rounded text-sm">
                            <p>
                              <strong>Titre:</strong> {item.title || "N/A"}
                            </p>
                            <p>
                              <strong>Source:</strong> {item.source_site || "N/A"}
                            </p>
                            <p>
                              <strong>Qualité:</strong> {item.quality_score || 0}%
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>Aucune donnée trouvée. Lancez un import pour peupler la base.</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Import Tab */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import de Données</CardTitle>
                <CardDescription>Déclenchez l'import des datasets CSV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={triggerImport} disabled={importing} className="w-full">
                  {importing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Import en cours...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />🚀 DÉCLENCHER L'IMPORT
                    </>
                  )}
                </Button>

                {importResult && (
                  <Alert className={importResult.success ? "border-green-500" : "border-red-500"}>
                    <AlertDescription>
                      <strong>{importResult.success ? "✅ Succès" : "❌ Erreur"}:</strong> {importResult.message}
                      {importResult.images_imported && (
                        <p className="mt-1">Images importées: {importResult.images_imported}</p>
                      )}
                      {importResult.error && <p className="mt-1 text-red-600">Détails: {importResult.error}</p>}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Supabase</CardTitle>
                <CardDescription>Instructions pour configurer votre base de données</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-medium">Étapes de configuration:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Copiez le script SQL ci-dessous</li>
                    <li>
                      Ouvrez votre{" "}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        className="text-blue-600 hover:underline"
                        rel="noreferrer"
                      >
                        Dashboard Supabase
                      </a>
                    </li>
                    <li>Allez dans "SQL Editor"</li>
                    <li>Collez et exécutez le script</li>
                    <li>Revenez ici et cliquez "Actualiser"</li>
                  </ol>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Script SQL</h4>
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard(sqlScript)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copier le Script
                    </Button>
                  </div>
                  <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-x-auto max-h-64">{sqlScript}</pre>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir Supabase Dashboard
                  </Button>
                  <Button variant="outline" onClick={fetchStatus}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Vérifier la Configuration
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
