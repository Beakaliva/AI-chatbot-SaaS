"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import Badge from "@/components/ui/Badge"
import { useBotStore } from "@/store/botStore"
import api from "@/lib/api"
import toast from "react-hot-toast"

interface Doc {
  id: string
  filename: string
  status: "pending" | "processing" | "done" | "error"
  created_at: string
  bot_name?: string
  source?: "pdf" | "url"
  source_url?: string
}

export default function DocumentsPage() {
  const { bots, setBots }         = useBotStore()
  const [docs, setDocs]           = useState<Doc[]>([])
  const [loading, setLoading]     = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [selectedBot, setSelectedBot] = useState<string>("")
  const [urlInput, setUrlInput]     = useState("")
  const [scrapingUrl, setScrapingUrl] = useState(false)
  const [activeTab, setActiveTab]   = useState<"pdf" | "url">("pdf")

  // ✅ Charger les bots
  useEffect(() => {
    api.get("/bots/").then((res) => {
      setBots(res.data)
      if (res.data.length > 0) setSelectedBot(res.data[0].id)
    })
  }, [])

  // ✅ Charger les documents de tous les bots
  useEffect(() => {
    if (bots.length === 0) {
      setLoading(false)
      return
    }
    Promise.all(
      bots.map((bot) =>
        api.get(`/documents/${bot.id}/`).then((res) =>
          res.data.map((d: Doc) => ({ ...d, bot_name: bot.name }))
        )
      )
    ).then((results) => {
      const all = results.flat().sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      setDocs(all)
    }).finally(() => setLoading(false))
  }, [bots])

  // ✅ Upload PDF
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedBot) return
    const formData = new FormData()
    formData.append("file", file)
    setUploading(selectedBot)
    try {
      const res = await api.post(`/documents/${selectedBot}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      const bot = bots.find((b) => b.id === selectedBot)
      setDocs((prev) => [{ ...res.data, bot_name: bot?.name, source: "pdf" }, ...prev])
      toast.success("Document uploadé et traité ! 📄")
    } catch {
      toast.error("Erreur lors de l'upload.")
    } finally {
      setUploading(null)
      e.target.value = ""
    }
  }

  // ✅ Scraper une URL
  const handleScrapeUrl = async () => {
    if (!urlInput.trim() || !selectedBot) return
    setScrapingUrl(true)
    try {
      const res = await api.post(`/documents/${selectedBot}/scrape/`, { url: urlInput })
      const bot = bots.find((b) => b.id === selectedBot)
      setDocs((prev) => [{ ...res.data, bot_name: bot?.name, source: "url" }, ...prev])
      setUrlInput("")
      toast.success("Site web analysé et ajouté ! 🌐")
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors du scraping.")
    } finally {
      setScrapingUrl(false)
    }
  }

  // ✅ Supprimer un document
  const handleDelete = async (doc: Doc) => {
    const bot = bots.find((b) => b.name === doc.bot_name)
    if (!bot) return
    if (!confirm("Supprimer ce document ?")) return
    try {
      await api.delete(`/documents/${bot.id}/${doc.id}/`)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
      toast.success("Document supprimé.")
    } catch {
      toast.error("Erreur lors de la suppression.")
    }
  }

  const statusConfig = {
    done:       { label: "✅ Traité",     color: "green" as const },
    processing: { label: "⏳ En cours",   color: "amber" as const },
    pending:    { label: "🕐 En attente", color: "gray"  as const },
    error:      { label: "❌ Erreur",     color: "red"   as const },
  }

  return (
    <div className="flex flex-col flex-1">
      <Navbar title="Documents" />

      <div className="p-4 lg:p-6 flex flex-col gap-6">

        {/* ─── Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Base de connaissances
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {docs.length} document{docs.length > 1 ? "s" : ""} au total
            </p>
          </div>

          {/* Sélecteur de bot */}
          {bots.length > 0 && (
            <select
              value={selectedBot}
              onChange={(e) => setSelectedBot(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
            >
              {bots.map((bot) => (
                <option key={bot.id} value={bot.id}>{bot.name}</option>
              ))}
            </select>
          )}
        </div>

        {/* ─── Zone d'ajout ────────────────────────────── */}
        {bots.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* Tabs PDF / URL */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setActiveTab("pdf")}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition border-b-2 ${
                  activeTab === "pdf"
                    ? "border-violet-600 text-violet-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                📄 Upload PDF
              </button>
              <button
                onClick={() => setActiveTab("url")}
                className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition border-b-2 ${
                  activeTab === "url"
                    ? "border-cyan-600 text-cyan-600"
                    : "border-transparent text-gray-400 hover:text-gray-600"
                }`}
              >
                🌐 Analyser un site web
              </button>
            </div>

            <div className="p-5">

              {/* Tab PDF */}
              {activeTab === "pdf" && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Uploadez un fichier PDF — FAQ, documentation, catalogue — votre bot apprendra de son contenu.
                  </p>
                  <label className={`cursor-pointer flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-violet-400 rounded-2xl p-10 transition ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                    <span className="text-4xl">📄</span>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {uploading ? "⏳ Traitement en cours..." : "Cliquez ou glissez un PDF ici"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF uniquement · Max 10 MB</p>
                    </div>
                    <span className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-xl transition">
                      {uploading ? "Traitement..." : "Choisir un fichier"}
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleUpload}
                      className="hidden"
                      disabled={!selectedBot || !!uploading}
                    />
                  </label>
                </div>
              )}

              {/* Tab URL */}
              {activeTab === "url" && (
                <div className="flex flex-col gap-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Entrez l'URL d'un site web — page d'accueil, FAQ, page produit — votre bot analysera automatiquement son contenu.
                  </p>

                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🌐</span>
                      <input
                        type="url"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleScrapeUrl()}
                        placeholder="https://monsite.com/faq"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                      />
                    </div>
                    <button
                      onClick={handleScrapeUrl}
                      disabled={!urlInput.trim() || scrapingUrl || !selectedBot}
                      className="px-5 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {scrapingUrl ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                          </svg>
                          Analyse...
                        </>
                      ) : (
                        "🌐 Analyser"
                      )}
                    </button>
                  </div>

                  {/* Exemples */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-400">Exemples :</span>
                    {[
                      "https://monsite.com/faq",
                      "https://monsite.com/a-propos",
                      "https://monsite.com/produits",
                    ].map((ex) => (
                      <button
                        key={ex}
                        onClick={() => setUrlInput(ex)}
                        className="text-xs text-cyan-600 hover:text-cyan-800 hover:underline transition"
                      >
                        {ex}
                      </button>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4 flex gap-3">
                    <span className="text-xl flex-shrink-0">💡</span>
                    <div>
                      <p className="text-sm font-medium text-cyan-800 dark:text-cyan-200">
                        Comment ça marche ?
                      </p>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1 leading-relaxed">
                        On extrait automatiquement le texte du site (titres, paragraphes, FAQ).
                        Ce texte est ensuite injecté dans le contexte de votre bot.
                        Pas besoin d'uploader quoi que ce soit !
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Aucun bot ───────────────────────────────── */}
        {!loading && bots.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🤖</p>
            <p className="text-gray-500">Créez d'abord un bot pour ajouter des documents.</p>
          </div>
        )}

        {/* ─── Liste documents ─────────────────────────── */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : docs.length === 0 && bots.length > 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📂</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun document
            </h3>
            <p className="text-gray-500 text-sm">
              Uploadez un PDF ou analysez un site web pour enrichir votre bot.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-5">Source</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Bot</div>
              <div className="col-span-1">Statut</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {docs.map((doc) => {
                const s      = statusConfig[doc.status]
                const isUrl  = doc.source === "url" || doc.filename?.startsWith("http")
                return (
                  <div
                    key={doc.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    {/* Source */}
                    <div className="col-span-5 flex items-center gap-3">
                      <span className="text-2xl">{isUrl ? "🌐" : "📄"}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    {/* Type */}
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        isUrl
                          ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300"
                          : "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                      }`}>
                        {isUrl ? "🌐 Web" : "📄 PDF"}
                      </span>
                    </div>

                    {/* Bot */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium truncate">
                        🤖 {doc.bot_name}
                      </span>
                    </div>

                    {/* Statut */}
                    <div className="col-span-1">
                      <Badge label={s.label} color={s.color} />
                    </div>

                    {/* Action */}
                    <div className="col-span-2 flex justify-end">
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-sm text-red-400 hover:text-red-600 transition font-medium"
                      >
                        🗑 Supprimer
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}