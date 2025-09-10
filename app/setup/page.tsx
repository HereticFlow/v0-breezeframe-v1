import SetupChecker from "@/components/setup-checker"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
            🔧 Configuration BreezeFrame
          </h1>
          <p className="text-[#3A3A3A] opacity-70">Vérification et configuration de l'environnement pour les imports</p>
        </div>

        <SetupChecker />
      </div>
    </div>
  )
}
