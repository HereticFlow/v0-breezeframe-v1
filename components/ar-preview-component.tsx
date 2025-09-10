"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Eye, RotateCcw, ZoomIn, ZoomOut, Move3D, Smartphone } from "lucide-react"

interface ARPreviewProps {
  windowData: any
  kitData: any
  onClose: () => void
}

export default function ARPreviewComponent({ windowData, kitData, onClose }: ARPreviewProps) {
  const [arMode, setArMode] = useState<"preview" | "ar" | "vr">("preview")
  const [rotation, setRotation] = useState(0)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Simulated AR/VR rendering
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw window outline
      ctx.strokeStyle = "#F5A623"
      ctx.lineWidth = 3
      ctx.strokeRect(50, 50, 300, 200)

      // Draw BreezeFrame overlay
      ctx.save()
      ctx.translate(200 + position.x, 150 + position.y)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(scale, scale)

      // Panel casings
      ctx.fillStyle = "#8BD3DD"
      ctx.fillRect(-140, -90, 10, 180) // Left casing
      ctx.fillRect(130, -90, 10, 180) // Right casing

      // Foldable panels
      ctx.fillStyle = "rgba(245, 166, 35, 0.3)"
      ctx.fillRect(-130, -80, 125, 160) // Left panel
      ctx.fillRect(5, -80, 125, 160) // Right panel

      // Panel divisions
      ctx.strokeStyle = "#8BD3DD"
      ctx.lineWidth = 1
      for (let i = 1; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(-130 + (i * 125) / 3, -80)
        ctx.lineTo(-130 + (i * 125) / 3, 80)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(5 + (i * 125) / 3, -80)
        ctx.lineTo(5 + (i * 125) / 3, 80)
        ctx.stroke()
      }

      // Rotating stars
      const time = Date.now() * 0.001
      ctx.fillStyle = "#F5A623"
      for (let i = 0; i < 4; i++) {
        const x = -100 + (i % 2) * 200
        const y = -60 + Math.floor(i / 2) * 120

        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(time + i)
        ctx.beginPath()
        for (let j = 0; j < 5; j++) {
          const angle = (j * 4 * Math.PI) / 5
          const radius = j % 2 === 0 ? 8 : 4
          const px = Math.cos(angle) * radius
          const py = Math.sin(angle) * radius
          if (j === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }

      ctx.restore()

      // Draw measurements
      ctx.fillStyle = "#3A3A3A"
      ctx.font = "12px Arial"
      ctx.fillText(`${windowData.dimensions?.width || 120}cm`, 60, 40)
      ctx.fillText(`${windowData.dimensions?.height || 150}cm`, 20, 150)
    }
  }, [rotation, scale, position, windowData])

  // Animation loop for rotating stars
  useEffect(() => {
    const animate = () => {
      if (canvasRef.current) {
        // Redraw canvas with updated rotation
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (ctx) {
          // Trigger re-render
          setRotation((r) => r + 0.1)
        }
      }
      requestAnimationFrame(animate)
    }
    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white border-none shadow-2xl">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#3A3A3A]">Prévisualisation AR/VR</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>

          {/* AR/VR Mode Selector */}
          <div className="flex space-x-2">
            {[
              { id: "preview", name: "2D Preview", icon: Eye },
              { id: "ar", name: "AR Mode", icon: Smartphone },
              { id: "vr", name: "VR Mode", icon: Move3D },
            ].map((mode) => (
              <Button
                key={mode.id}
                variant={arMode === mode.id ? "default" : "outline"}
                size="sm"
                onClick={() => setArMode(mode.id as any)}
                className={arMode === mode.id ? "bg-[#F5A623] text-white" : ""}
              >
                <mode.icon className="w-4 h-4 mr-1" />
                {mode.name}
              </Button>
            ))}
          </div>

          {/* Canvas for AR/VR rendering */}
          <div className="relative bg-gradient-to-br from-[#8BD3DD]/10 to-[#F5A623]/10 rounded-lg p-4">
            <canvas
              ref={canvasRef}
              width={400}
              height={300}
              className="w-full h-64 border border-[#8BD3DD]/30 rounded-lg bg-white"
            />

            {/* AR/VR Overlay Info */}
            <div className="absolute top-6 left-6 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {arMode.toUpperCase()} Mode Active
            </div>

            {/* Kit Info Overlay */}
            <div className="absolute bottom-6 left-6 bg-white/90 p-2 rounded text-xs">
              <p className="font-medium">{kitData?.name || "Solo Kit"}</p>
              <p className="text-[#3A3A3A] opacity-70">
                {windowData.dimensions?.width}×{windowData.dimensions?.height}cm
              </p>
            </div>
          </div>

          {/* AR/VR Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3A3A3A]">Rotation</label>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => setRotation((r) => r - 15)}>
                  <RotateCcw className="w-3 h-3" />
                </Button>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs text-[#3A3A3A] w-8">{Math.round(rotation)}°</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#3A3A3A]">Échelle</label>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}>
                  <ZoomOut className="w-3 h-3" />
                </Button>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="flex-1"
                />
                <Button size="sm" variant="outline" onClick={() => setScale((s) => Math.min(2, s + 0.1))}>
                  <ZoomIn className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* AR/VR Features */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#8BD3DD]/10 rounded-lg">
              <Eye className="w-6 h-6 mx-auto text-[#8BD3DD] mb-1" />
              <p className="text-xs text-[#3A3A3A]">Visualisation 3D</p>
            </div>
            <div className="p-3 bg-[#F5A623]/10 rounded-lg">
              <Move3D className="w-6 h-6 mx-auto text-[#F5A623] mb-1" />
              <p className="text-xs text-[#3A3A3A]">Interaction Temps Réel</p>
            </div>
            <div className="p-3 bg-[#8BD3DD]/10 rounded-lg">
              <Smartphone className="w-6 h-6 mx-auto text-[#8BD3DD] mb-1" />
              <p className="text-xs text-[#3A3A3A]">Compatible Mobile</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-[#8BD3DD] text-[#3A3A3A] hover:bg-[#8BD3DD]/10"
            >
              Fermer
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#F5A623] to-[#8BD3DD] text-white hover:opacity-90"
              onClick={() => {
                // Simulate AR/VR session save
                console.log("AR/VR session saved:", { arMode, rotation, scale, position })
                onClose()
              }}
            >
              Sauvegarder Vue AR
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
