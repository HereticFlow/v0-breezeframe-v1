"use client"

import AdminImportPanel from "@/components/admin-import-panel"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7EB] to-[#F5F5DC] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#3A3A3A]" style={{ fontFamily: "Playfair Display, serif" }}>
            Administration BreezeFrame
          </h1>
          <p className="text-[#3A3A3A] opacity-70">Gestion des imports et données</p>
        </div>

        <AdminImportPanel />
      </div>
    </div>
  )
}
