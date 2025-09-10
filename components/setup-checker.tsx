"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react"

interface SetupChecks {
  supabase_connection: boolean
  tables_exist: boolean
  csv_access: boolean
  environment_vars: boolean
}

export default function SetupChecker() {
  const [checks, setChecks] = useState<SetupChecks | null>(null)
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    checkSetup()
  }, [])

  const checkSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/setup-check")
      const result = await response.json()

      if (result.success) {
        setChecks(result.checks)
        setReady(result.ready)
      }
    } catch (error) {
      console.error("Erreur vérification setup:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? <CheckCircle className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-red-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#8BD3DD]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#3A3A3A]">Configuration Setup</h1>
        <p className="text-[#3A3A3A] opacity-70">Vérification de l'environnement BreezeFrame</p>
      </div>

      {/* Status global */}
      <Card className={`border-none ${ready ? "bg-green-50" : "bg-orange-50"}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            {ready ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-orange-600" />
            )}
            <div>
              <h3 className={`font-semibold ${ready ? "text-green-800" : "text-orange-800"}`}>
                {ready ? "✅ Environnement prêt !" : "⚠️ Configuration requise"}
              </h3>
              <p className={`text-sm ${ready ? "text-green-600" : "text-orange-600"}`}>
                {ready ? "Vous pouvez lancer npm run auto-setup" : "Quelques étapes de configuration sont nécessaires"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Détails des vérifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A3A3A] flex items-center">
              {checks && getStatusIcon(checks.supabase_connection)}
              <span className="ml-2">Connexion Supabase</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#3A3A3A] opacity-70">
              {checks?.supabase_connection
                ? "✅ Connexion établie avec Supabase"
                : "❌ Impossible de se connecter à Supabase"}
            </p>
            {!checks?.supabase_connection && (
              <div className="mt-2 text-xs text-red-600">
                Vérifiez vos variables d'environnement SUPABASE_URL et SUPABASE_ANON_KEY
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A3A3A] flex items-center">
              {checks && getStatusIcon(checks.tables_exist)}
              <span className="ml-2">Tables Base de Données</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#3A3A3A] opacity-70">
              {checks?.tables_exist ? "✅ Tables créées et accessibles" : "❌ Tables manquantes"}
            </p>
            {!checks?.tables_exist && (
              <div className="mt-2 text-xs text-red-600">Exécutez les scripts SQL dans Supabase Dashboard</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A3A3A] flex items-center">
              {checks && getStatusIcon(checks.csv_access)}
              <span className="ml-2">Accès aux CSV</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#3A3A3A] opacity-70">
              {checks?.csv_access ? "✅ Fichiers CSV accessibles" : "❌ Impossible d'accéder aux CSV"}
            </p>
            {!checks?.csv_access && <div className="mt-2 text-xs text-red-600">Vérifiez votre connexion internet</div>}
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#3A3A3A] flex items-center">
              {checks && getStatusIcon(checks.environment_vars)}
              <span className="ml-2">Variables d'Environnement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#3A3A3A] opacity-70">
              {checks?.environment_vars ? "✅ Variables configurées" : "❌ Variables manquantes"}
            </p>
            {!checks?.environment_vars && (
              <div className="mt-2 text-xs text-red-600">
                Configurez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={checkSetup}
          variant="outline"
          className="border-[#8BD3DD] text-[#8BD3DD] hover:bg-[#8BD3DD] hover:text-white bg-transparent"
        >
          Revérifier
        </Button>

        {ready && (
          <Button
            className="bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
            onClick={() => window.open("/admin", "_blank")}
          >
            Aller au Dashboard
          </Button>
        )}
      </div>

      {/* Instructions */}
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-[#3A3A3A]">Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-[#3A3A3A]">1. Configuration Supabase</h4>
            <p className="text-sm text-[#3A3A3A] opacity-70">
              Créez un projet Supabase et ajoutez les variables d'environnement dans votre fichier .env.local
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#3A3A3A]">2. Création des Tables</h4>
            <p className="text-sm text-[#3A3A3A] opacity-70">
              Exécutez npm run setup-db pour voir les scripts SQL à copier dans Supabase
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#3A3A3A]">3. Lancement de l'Import</h4>
            <p className="text-sm text-[#3A3A3A] opacity-70">
              Une fois tout configuré, lancez npm run auto-setup pour importer toutes les données
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
