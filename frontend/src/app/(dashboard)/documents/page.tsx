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
}

export default function DocumentsPage() {
  const { bots, setBots }     = useBotStore()
  const [docs, setDocs]       = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState<string | null>(null)
  const [selectedBot, setSelectedBot] = useState<string>("")

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
      setDocs((prev) => [{ ...res.data, bot_name: bot?.name }, ...prev])
      toast.success("Document uploadé et traité ! 📄")
    } catch {
      toast.error("Erreur lors de l'upload.")
    } finally {
      setUploading(null)
      e.target.value = ""
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
    done:       { label: "✅ Traité",    color: "green" as const },
    processing: { label: "⏳ En cours",  color: "amber" as const },
    pending:    { label: "🕐 En attente", color: "gray" as const },
    error:      { label: "❌ Erreur",    color: "red" as const },
  }

  return (
    <div className="flex flex-col flex-1">
      <Navbar title="Documents" />

      <div className="p-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Base de connaissances
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {docs.length} document{docs.length > 1 ? "s" : ""} au total
            </p>
          </div>

          {/* Upload */}
          <div className="flex items-center gap-3">
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

            <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition shadow ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
              {uploading ? "⏳ Traitement..." : "📎 Upload PDF"}
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
                disabled={!selectedBot || !!uploading}
              />
            </label>
          </div>
        </div>

        {/* Aucun bot */}
        {!loading && bots.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">🤖</p>
            <p className="text-gray-500">Créez d'abord un bot pour uploader des documents.</p>
          </div>
        )}

        {/* Liste documents */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : docs.length === 0 && bots.length > 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-3">📄</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun document
            </h3>
            <p className="text-gray-500 text-sm">
              Uploadez des PDFs pour enrichir vos chatbots avec vos propres données.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-5">Fichier</div>
              <div className="col-span-3">Bot</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {docs.map((doc) => {
                const s = statusConfig[doc.status]
                return (
                  <div
                    key={doc.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                  >
                    {/* Fichier */}
                    <div className="col-span-5 flex items-center gap-3">
                      <span className="text-2xl">📄</span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>

                    {/* Bot */}
                    <div className="col-span-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        🤖 {doc.bot_name}
                      </span>
                    </div>

                    {/* Statut */}
                    <div className="col-span-2">
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