"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, Check, Zap, Sun, Settings, Sparkles, Wind, Home } from "lucide-react"

interface AdvancedWindowConfiguratorProps {
  onNext: (config: any) => void
  onBack: () => void
  onSkip: () => void
}

export default function AdvancedWindowConfigurator({ onNext, onBack, onSkip }: AdvancedWindowConfiguratorProps) {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
  const [opacity, setOpacity] = useState([75])
  const [panelConfiguration, setPanelConfiguration] = useState("2x2")
  const [smartGlassEnabled, setSmartGlassEnabled] = useState(false)
  const [autoTinting, setAutoTinting] = useState(true)
  const [energyMode, setEnergyMode] = useState("eco")

  const windowSystems = [
    {
      id: "adjustable-panels",
      name: "Adjustable Panel System",
      description: "Multi-directional glass panels with custom positioning",
      image: "/images/window-system-1.jpeg",
      price: 199,
      features: ["4-panel configuration", "Individual panel control", "Weather-resistant seals"],
      icon: Settings,
    },
    {
      id: "smart-glass",
      name: "Smart Glass Technology",
      description: "Electronically controlled transparency and tinting",
      image: "/images/smart-glass-diagram.jpeg",
      price: 299,
      features: ["Variable opacity", "UV protection", "Energy efficient"],
      icon: Zap,
    },
    {
      id: "fabric-integration",
      name: "Integrated Fabric System",
      description: "Motorized fabric panels with your custom designs",
      image: "/images/window-system-3.jpeg",
      price: 149,
      features: ["Motorized operation", "Custom fabric printing", "Light filtering"],
      icon: Wind,
    },
  ]

  const getSystemPrice = () => {
    const system = windowSystems.find((s) => s.id === selectedSystem)
    return system ? system.price : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-[#3A3A3A] hover:bg-[#8BD3DD]/10">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
              Advanced Systems
            </h1>
            <p className="text-sm text-[#3A3A3A] opacity-70">Optional upgrades for your frame</p>
          </div>
        </div>

        {/* Skip Option */}
        <Card className="p-4 bg-gradient-to-r from-[#8BD3DD]/10 to-[#F5A623]/10 border-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-[#8BD3DD]" />
              <span className="text-sm text-[#3A3A3A]">Keep it simple with standard frame</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              className="border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
            >
              Skip
            </Button>
          </div>
        </Card>

        {/* System Selection */}
        <div className="space-y-4">
          <h3 className="font-semibold text-[#3A3A3A]">Choose Your Upgrade</h3>
          {windowSystems.map((system) => {
            const IconComponent = system.icon
            return (
              <Card
                key={system.id}
                className={`p-4 cursor-pointer transition-all duration-300 border-2 ${
                  selectedSystem === system.id
                    ? "border-[#F5A623] bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 shadow-lg"
                    : "border-transparent bg-white/80 hover:bg-white/90 hover:shadow-md"
                }`}
                onClick={() => setSelectedSystem(system.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedSystem === system.id ? "bg-[#F5A623]" : "bg-[#8BD3DD]/20"
                        }`}
                      >
                        <IconComponent
                          className={`w-5 h-5 ${selectedSystem === system.id ? "text-white" : "text-[#8BD3DD]"}`}
                        />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#3A3A3A]">{system.name}</h4>
                        <p className="text-2xl font-bold text-[#F5A623]">+${system.price}</p>
                      </div>
                    </div>
                    {selectedSystem === system.id && <Check className="w-6 h-6 text-[#F5A623]" />}
                  </div>

                  <img
                    src={system.image || "/placeholder.svg"}
                    alt={system.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />

                  <p className="text-sm text-[#3A3A3A] opacity-70">{system.description}</p>

                  <div className="flex flex-wrap gap-1">
                    {system.features.map((feature) => (
                      <span key={feature} className="px-2 py-1 text-xs bg-[#8BD3DD]/20 text-[#3A3A3A] rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Smart Glass Controls */}
        {selectedSystem === "smart-glass" && (
          <Card className="p-4 bg-white/80 border-none shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#F5A623]" />
                <h3 className="font-semibold text-[#3A3A3A]">Smart Glass Settings</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-[#3A3A3A] mb-2 block">
                    Default Opacity: {opacity[0]}%
                  </label>
                  <Slider value={opacity} onValueChange={setOpacity} max={100} min={10} step={5} className="w-full" />
                  <div className="flex justify-between text-xs text-[#3A3A3A] opacity-60 mt-1">
                    <span>Clear</span>
                    <span>Private</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-3 bg-[#8BD3DD]/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Sun className="w-4 h-4 text-[#F5A623]" />
                      <span className="text-sm text-[#3A3A3A]">Auto-tinting</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAutoTinting(!autoTinting)}
                      className={`h-6 w-10 p-0 ${autoTinting ? "bg-[#F5A623]" : "bg-gray-300"} rounded-full`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          autoTinting ? "translate-x-2" : "-translate-x-2"
                        }`}
                      />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#8BD3DD]/10 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#8BD3DD]" />
                      <span className="text-sm text-[#3A3A3A]">Smart mode</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSmartGlassEnabled(!smartGlassEnabled)}
                      className={`h-6 w-10 p-0 ${smartGlassEnabled ? "bg-[#8BD3DD]" : "bg-gray-300"} rounded-full`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full transition-transform ${
                          smartGlassEnabled ? "translate-x-2" : "-translate-x-2"
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-[#3A3A3A] mb-2 block">Energy Mode</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["eco", "comfort", "performance"].map((mode) => (
                      <Button
                        key={mode}
                        variant="outline"
                        size="sm"
                        onClick={() => setEnergyMode(mode)}
                        className={`capitalize ${
                          energyMode === mode
                            ? "bg-[#8BD3DD]/20 border-[#8BD3DD] text-[#3A3A3A]"
                            : "border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                        }`}
                      >
                        {mode}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Panel Configuration */}
        {selectedSystem === "adjustable-panels" && (
          <Card className="p-4 bg-white/80 border-none shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-[#8BD3DD]" />
                <h3 className="font-semibold text-[#3A3A3A]">Panel Configuration</h3>
              </div>

              <div>
                <label className="text-sm font-medium text-[#3A3A3A] mb-2 block">Layout Options</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "2x2", name: "2×2 Grid", desc: "Four equal panels" },
                    { id: "1x4", name: "1×4 Strip", desc: "Four horizontal panels" },
                    { id: "3x1", name: "3×1 Wide", desc: "Three vertical panels" },
                    { id: "custom", name: "Custom", desc: "Design your own" },
                  ].map((config) => (
                    <Button
                      key={config.id}
                      variant="outline"
                      onClick={() => setPanelConfiguration(config.id)}
                      className={`h-auto p-3 flex flex-col items-start ${
                        panelConfiguration === config.id
                          ? "bg-[#8BD3DD]/20 border-[#8BD3DD] text-[#3A3A3A]"
                          : "border-[#8BD3DD]/30 text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
                      }`}
                    >
                      <span className="font-medium">{config.name}</span>
                      <span className="text-xs opacity-70">{config.desc}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#F5A623]/10 rounded-lg">
                <p className="text-sm text-[#3A3A3A]">
                  <strong>Selected:</strong> {panelConfiguration.toUpperCase()} layout with individual panel control
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Fabric Integration Settings */}
        {selectedSystem === "fabric-integration" && (
          <Card className="p-4 bg-white/80 border-none shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Wind className="w-5 h-5 text-[#8BD3DD]" />
                <h3 className="font-semibold text-[#3A3A3A]">Fabric System Options</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-[#8BD3DD]/10 rounded-lg">
                  <h4 className="font-medium text-[#3A3A3A] mb-1">Motorized Operation</h4>
                  <p className="text-sm text-[#3A3A3A] opacity-70">
                    Remote control and smartphone app integration included
                  </p>
                </div>

                <div className="p-3 bg-[#F5A623]/10 rounded-lg">
                  <h4 className="font-medium text-[#3A3A3A] mb-1">Custom Design Printing</h4>
                  <p className="text-sm text-[#3A3A3A] opacity-70">
                    Your selected design will be printed on premium fabric panels
                  </p>
                </div>

                <div className="p-3 bg-[#8BD3DD]/10 rounded-lg">
                  <h4 className="font-medium text-[#3A3A3A] mb-1">Light Filtering</h4>
                  <p className="text-sm text-[#3A3A3A] opacity-70">Adjustable light control from 10% to 95% opacity</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Pricing Summary */}
        {selectedSystem && (
          <Card className="p-4 bg-gradient-to-r from-[#F5A623]/10 to-[#8BD3DD]/10 border-none">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#3A3A3A]">System Upgrade:</span>
                <span className="text-2xl font-bold text-[#3A3A3A]">+${getSystemPrice()}</span>
              </div>
              <p className="text-xs text-[#3A3A3A] opacity-60">Includes installation, setup, and 2-year warranty</p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {selectedSystem ? (
            <Button
              onClick={() =>
                onNext({
                  system: selectedSystem,
                  price: getSystemPrice(),
                  settings: {
                    opacity: selectedSystem === "smart-glass" ? opacity[0] : null,
                    autoTinting: selectedSystem === "smart-glass" ? autoTinting : null,
                    smartMode: selectedSystem === "smart-glass" ? smartGlassEnabled : null,
                    energyMode: selectedSystem === "smart-glass" ? energyMode : null,
                    panelConfig: selectedSystem === "adjustable-panels" ? panelConfiguration : null,
                  },
                })
              }
              className="w-full py-3 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
            >
              Add {windowSystems.find((s) => s.id === selectedSystem)?.name} (+${getSystemPrice()})
            </Button>
          ) : (
            <Button
              onClick={onSkip}
              variant="outline"
              className="w-full py-3 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
            >
              Continue Without Upgrade
            </Button>
          )}
        </div>

        <p className="text-xs text-[#3A3A3A] opacity-60 text-center">
          All advanced systems include professional installation and smart home integration
        </p>
      </div>
    </div>
  )
}
