// Utilities for data export and management

export interface AnalysisData {
  id: string
  created_at: string
  image_url: string
  analysis_data: any
  frontend_validation: any
}

export class DataExportManager {
  // Export all user data as JSON
  static exportAsJSON(analyses: AnalysisData[]): void {
    const exportData = {
      export_date: new Date().toISOString(),
      total_analyses: analyses.length,
      data_format_version: "1.0",
      analyses: analyses.map((analysis) => ({
        id: analysis.id,
        date: analysis.created_at,
        dimensions: analysis.analysis_data.dimensions,
        window_type: analysis.analysis_data.windowType,
        kit_recommendation: analysis.analysis_data.kitRecommendation,
        quality_score: analysis.analysis_data.qualityScore,
        image_url: analysis.image_url,
        technical_data: analysis.analysis_data,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    })

    this.downloadFile(blob, `breezeframe-export-${Date.now()}.json`)
  }

  // Export as CSV for spreadsheet analysis
  static exportAsCSV(analyses: AnalysisData[]): void {
    const headers = [
      "ID",
      "Date",
      "Width (cm)",
      "Height (cm)",
      "Window Type",
      "Kit Recommendation",
      "Quality Score",
      "AI Confidence",
    ]

    const rows = analyses.map((analysis) => [
      analysis.id,
      new Date(analysis.created_at).toLocaleDateString("fr-FR"),
      analysis.analysis_data.dimensions.width,
      analysis.analysis_data.dimensions.height,
      analysis.analysis_data.windowType,
      analysis.analysis_data.kitRecommendation.primary,
      Math.round(analysis.analysis_data.qualityScore * 100) + "%",
      Math.round(analysis.analysis_data.dimensions.confidence * 100) + "%",
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    this.downloadFile(blob, `breezeframe-data-${Date.now()}.csv`)
  }

  // Generate PDF report
  static async generatePDFReport(analyses: AnalysisData[]): Promise<void> {
    // This would integrate with a PDF library like jsPDF
    const reportData = {
      title: "BreezeFrame - Rapport d'Analyses",
      generated_date: new Date().toLocaleDateString("fr-FR"),
      total_analyses: analyses.length,
      summary: {
        avg_width: analyses.reduce((sum, a) => sum + a.analysis_data.dimensions.width, 0) / analyses.length,
        avg_height: analyses.reduce((sum, a) => sum + a.analysis_data.dimensions.height, 0) / analyses.length,
        most_common_kit: this.getMostCommonKit(analyses),
        avg_quality_score: analyses.reduce((sum, a) => sum + a.analysis_data.qualityScore, 0) / analyses.length,
      },
      analyses: analyses,
    }

    // For now, export as JSON (in real implementation, use jsPDF)
    console.log("PDF Report Data:", reportData)
    alert("Génération PDF en cours... (intégration jsPDF à implémenter)")
  }

  // Helper method to download files
  private static downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Get most common kit recommendation
  private static getMostCommonKit(analyses: AnalysisData[]): string {
    const kitCounts = analyses.reduce(
      (counts, analysis) => {
        const kit = analysis.analysis_data.kitRecommendation.primary
        counts[kit] = (counts[kit] || 0) + 1
        return counts
      },
      {} as Record<string, number>,
    )

    return Object.entries(kitCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "solo"
  }
}

// GDPR Compliance utilities
export class GDPRManager {
  // Request all user data (GDPR Article 15)
  static async requestUserData(userSession: string): Promise<any> {
    try {
      const analyses = await windowAnalysisDB.getUserAnalyses(userSession)
      return {
        request_date: new Date().toISOString(),
        user_session: userSession,
        data_categories: {
          window_analyses: analyses.length,
          photos_stored: analyses.length,
          processing_records: analyses.length,
        },
        data: analyses,
        retention_period: "2 years",
        legal_basis: "Legitimate interest for service provision",
      }
    } catch (error) {
      console.error("Error requesting user data:", error)
      throw error
    }
  }

  // Delete all user data (GDPR Article 17)
  static async deleteUserData(userSession: string): Promise<void> {
    try {
      // In real implementation:
      // 1. Delete from window_analysis table
      // 2. Delete photos from Supabase Storage
      // 3. Delete from ai_model_performance table
      // 4. Delete from user_sessions table

      console.log(`Deleting all data for session: ${userSession}`)
      alert("Suppression des données en cours... (implémentation Supabase à finaliser)")
    } catch (error) {
      console.error("Error deleting user data:", error)
      throw error
    }
  }

  // Anonymize user data
  static async anonymizeUserData(userSession: string): Promise<void> {
    try {
      // Replace personal identifiers with anonymous IDs
      // Keep analysis data for model improvement
      console.log(`Anonymizing data for session: ${userSession}`)
    } catch (error) {
      console.error("Error anonymizing user data:", error)
      throw error
    }
  }
}

// Declare the windowAnalysisDB variable
const windowAnalysisDB = {
  getUserAnalyses: async (userSession: string) => {
    // Mock implementation for demonstration purposes
    return [
      {
        id: "1",
        created_at: "2023-01-01T00:00:00Z",
        image_url: "https://example.com/image1.jpg",
        analysis_data: {
          dimensions: { width: 100, height: 200, confidence: 0.9 },
          windowType: "Type A",
          kitRecommendation: { primary: "Kit 1" },
          qualityScore: 0.85,
        },
        frontend_validation: {},
      },
      {
        id: "2",
        created_at: "2023-01-02T00:00:00Z",
        image_url: "https://example.com/image2.jpg",
        analysis_data: {
          dimensions: { width: 150, height: 250, confidence: 0.85 },
          windowType: "Type B",
          kitRecommendation: { primary: "Kit 2" },
          qualityScore: 0.9,
        },
        frontend_validation: {},
      },
    ]
  },
}
