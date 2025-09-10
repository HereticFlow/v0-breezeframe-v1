"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Camera,
  Zap,
  Brain,
  Lightbulb,
  Wind,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Settings,
  Database,
  BarChart3,
} from "lucide-react"

interface HomeScreenProps {
  onNavigate: (screen: string) => void
}

export function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleQuickStart = () => {
    setIsAnimating(true)
    setTimeout(() => {
      onNavigate("photo-capture")
      setIsAnimating(false)
    }, 500)
  }

  const features = [
    {
      icon: <Camera className="h-6 w-6" />,
      title: "Analyse IA",
      description: "Détection automatique des fenêtres avec TensorFlow",
      action: () => onNavigate("photo-capture"),
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Configuration Intelligente",
      description: "Recommandations personnalisées basées sur l'IA",
      action: () => onNavigate("advanced-configurator"),
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Bien-être Lumineux",
      description: "Optimisation de la lumière naturelle",
      action: () => onNavigate("wellness-configuration"),
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Gestion des Données",
      description: "Historique et analyses de vos fenêtres",
      action: () => onNavigate("data-management"),
    },
  ]

  const stats = [
    { label: "Fenêtres Analysées", value: "1,247", icon: <Camera className="h-4 w-4" /> },
    { label: "Configurations Créées", value: "892", icon: <Settings className="h-4 w-4" /> },
    { label: "Économies d'Énergie", value: "23%", icon: <Zap className="h-4 w-4" /> },
    { label: "Satisfaction Client", value: "98%", icon: <Sparkles className="h-4 w-4" /> },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative px-6 py-16 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm">
                <Wind className="h-12 w-12 text-white" />
              </div>
            </div>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">BreezeFrame</h1>

            <p className="mb-8 text-xl text-blue-100 sm:text-2xl">
              Intelligence Artificielle pour l'Analyse et Configuration de Fenêtres
            </p>

            <div className="mb-8 flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Brain className="mr-1 h-3 w-3" />
                IA TensorFlow
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Zap className="mr-1 h-3 w-3" />
                Temps Réel
              </Badge>
              <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                <Shield className="mr-1 h-3 w-3" />
                Sécurisé
              </Badge>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                size="lg"
                className={`bg-white text-blue-600 hover:bg-blue-50 ${isAnimating ? "animate-pulse" : ""}`}
                onClick={handleQuickStart}
              >
                <Play className="mr-2 h-5 w-5" />
                Démarrage Rapide
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => onNavigate("advanced-configurator")}
              >
                <Settings className="mr-2 h-5 w-5" />
                Configuration Avancée
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-4">
                  <div className="mb-2 flex justify-center text-blue-600">{stat.icon}</div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">Fonctionnalités Principales</h2>
            <p className="text-lg text-gray-600">Découvrez toutes les capacités de BreezeFrame</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={feature.action}
              >
                <CardHeader className="text-center">
                  <div className="mb-4 flex justify-center text-blue-600 group-hover:text-blue-700">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                  <div className="mt-4 flex justify-center">
                    <ArrowRight className="h-4 w-4 text-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardContent className="p-8">
              <div className="text-center">
                <h3 className="mb-4 text-2xl font-bold">Prêt à Commencer ?</h3>
                <p className="mb-6 text-blue-100">Analysez votre première fenêtre en moins de 2 minutes</p>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={() => onNavigate("photo-capture")}
                  >
                    <Camera className="mr-2 h-5 w-5" />
                    Capturer une Photo
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                    onClick={() => onNavigate("data-management")}
                  >
                    <BarChart3 className="mr-2 h-5 w-5" />
                    Voir les Données
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-6 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-gray-900">BreezeFrame</span>
              <Badge variant="outline">v2.1.0</Badge>
            </div>
            <div className="flex gap-4">
              <Button variant="ghost" size="sm" onClick={() => onNavigate("data-management")}>
                Données
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("wellness-dashboard")}>
                Bien-être
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onNavigate("advanced-configurator")}>
                Configuration
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
