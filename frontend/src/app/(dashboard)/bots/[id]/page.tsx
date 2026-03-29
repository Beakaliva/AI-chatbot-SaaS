"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import toast from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"
import Modal from "@/components/ui/Modal"
import BotForm from "@/components/bots/BotForm"
import ChatPreview from "@/components/chat/ChatPreview"
import Badge from "@/components/ui/Badge"
import { useBotStore } from "@/store/botStore"
import { Bot, Document } from "@/types"
import api from "@/lib/api"

type Tab = "config" | "documents" | "widget" | "preview" | "stats"

export default function BotDetailPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const { updateBot, deleteBot } = useBotStore()

  const [bot, setBot]             = useState<Bot | null>(null)
  const [docs, setDocs]           = useState<Document[]>([])
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toggling, setToggling]   = useState(false)
  const [showEdit, setShowEdit]   = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>("config")
  const [copied, setCopied]       = useState(false)
  const [botStats, setBotStats]   = useState<any>(null)

  // ✅ Charger bot + documents + stats
  useEffect(() => {
    Promise.all([
      api.get(`/bots/${id}/`),
      api.get(`/documents/${id}/`),
      api.get(`/analytics/${id}/`),
    ]).then(([botRes, docsRes, statsRes]) => {
      setBot(botRes.data)
      setDocs(docsRes.data)
      setBotStats(statsRes.data)
    }).catch(() => {
      toast.error("Bot introuvable.")
      router.push("/bots")
    }).finally(() => setLoading(false))
  }, [id])

  // ✅ Modifier
  const handleUpdate = async (data: any) => {
    setUpdating(true)
    try {
      const res = await api.patch(`/bots/${id}/`, data)
      setBot(res.data)
      updateBot(res.data)
      setShowEdit(false)
      toast.success("Bot mis à jour ✅")
    } catch {
      toast.error("Erreur lors de la mise à jour.")
    } finally {
      setUpdating(false)
    }
  }

  // ✅ Supprimer
  const handleDelete = async () => {
    if (!confirm("Supprimer ce bot définitivement ?")) return
    try {
      await api.delete(`/bots/${id}/`)
      deleteBot(id as string)
      toast.success("Bot supprimé.")
      router.push("/bots")
    } catch {
      toast.error("Erreur.")
    }
  }

  // ✅ Toggle actif/inactif
  const handleToggle = async () => {
    if (!bot) return
    setToggling(true)
    try {
      const res = await api.patch(`/bots/${id}/`, { is_active: !bot.is_active })
      setBot(res.data)
      updateBot(res.data)
      toast.success(res.data.is_active ? "Bot activé ✅" : "Bot désactivé ⏸")
    } catch {
      toast.error("Erreur.")
    } finally {
      setToggling(false)
    }
  }

  // ✅ Upload PDF
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)
    setUploading(true)
    try {
      const res = await api.post(`/documents/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      setDocs((prev) => [res.data, ...prev])
      toast.success("Document uploadé ! 📄")
    } catch {
      toast.error("Erreur upload.")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  // ✅ Supprimer document
  const handleDeleteDoc = async (docId: string) => {
    if (!confirm("Supprimer ce document ?")) return
    try {
      await api.delete(`/documents/${id}/${docId}/`)
      setDocs((prev) => prev.filter((d) => d.id !== docId))
      toast.success("Document supprimé.")
    } catch {
      toast.error("Erreur.")
    }
  }

  // ✅ Copier widget
  const handleCopy = () => {
    navigator.clipboard.writeText(bot?.widget_snippet || "")
    setCopied(true)
    toast.success("Code copié ! 📋")
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <Navbar title="Chargement..." />
        <div className="p-6 flex flex-col gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!bot) return null

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "config",    label: "Configuration", icon: "⚙️" },
    { key: "documents", label: "Documents",      icon: "📄" },
    { key: "widget",    label: "Widget",         icon: "🔌" },
    { key: "preview",   label: "Aperçu Chat",    icon: "💬" },
    { key: "stats",     label: "Stats",          icon: "📊" },
  ]

  const statusConfig = {
    done:       { label: "✅ Traité",     color: "green" as const },
    processing: { label: "⏳ En cours",   color: "amber" as const },
    pending:    { label: "🕐 En attente", color: "gray"  as const },
    error:      { label: "❌ Erreur",     color: "red"   as const },
  }

  return (
    <div className="flex flex-col flex-1">
      <Navbar title={bot.name} />

      <div className="p-4 lg:p-6 flex flex-col gap-5">

        {/* ─── Breadcrumb ──────────────────────────────── */}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/bots" className="hover:text-violet-600 transition">Mes Bots</Link>
          <span>›</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">{bot.name}</span>
        </div>

        {/* ─── Header bot ──────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

          {/* Bandeau coloré */}
          <div className="h-16 relative" style={{ backgroundColor: bot.color + "30" }}>
            <div className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, ${bot.color}22 0px, ${bot.color}22 1px, transparent 0px, transparent 50%)`,
                backgroundSize: "20px 20px"
              }}
            />
          </div>

          <div className="px-6 pb-5">
            {/* Avatar + infos */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-8">
              <div className="flex items-end gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border-4 border-white dark:border-gray-900"
                  style={{ backgroundColor: bot.color }}
                >
                  🤖
                </div>
                <div className="pb-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{bot.name}</h2>
                  <div className="flex flex-wrap gap-2 mt-1.5">
                    <Badge
                      label={bot.model === "claude" ? "Claude" : "GPT-4o"}
                      color={bot.model === "claude" ? "violet" : "green"}
                    />
                    <Badge label={bot.language.toUpperCase()} color="amber" />
                    <Badge
                      label={bot.is_active ? "✅ Actif" : "⏸ Inactif"}
                      color={bot.is_active ? "green" : "gray"}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleToggle}
                  disabled={toggling}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 transition disabled:opacity-50"
                >
                  {toggling ? "⏳" : bot.is_active ? "⏸ Désactiver" : "▶️ Activer"}
                </button>
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 transition"
                >
                  ✏️ Modifier
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
                >
                  🗑 Supprimer
                </button>
              </div>
            </div>

            {/* Mini stats */}
            {botStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                {[
                  { label: "Conversations", value: botStats.conversations?.total || 0, icon: "💬" },
                  { label: "Messages",      value: botStats.messages?.total || 0,       icon: "📨" },
                  { label: "Documents",     value: docs.length,                         icon: "📄" },
                  { label: "Score",         value: botStats.feedback?.score ? `${botStats.feedback.score}%` : "—", icon: "⭐" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.icon} {s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Tabs ────────────────────────────────────── */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.key
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── Onglet Configuration ────────────────────── */}
        {activeTab === "config" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Infos générales */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                ℹ️ Informations générales
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Modèle IA",   value: bot.model === "claude" ? "Claude (Anthropic)" : "GPT-4o (OpenAI)" },
                  { label: "Langue",      value: bot.language.toUpperCase() },
                  { label: "Statut",      value: bot.is_active ? "Actif" : "Inactif" },
                  { label: "Créé le",     value: new Date(bot.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}

                {/* Couleur */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Couleur</span>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: bot.color }} />
                    <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">{bot.color}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Prompt */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  🧠 System Prompt
                </h3>
                <button
                  onClick={() => setShowEdit(true)}
                  className="text-xs text-violet-600 hover:underline font-medium"
                >
                  Modifier ✏️
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 font-mono leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {bot.system_prompt}
              </div>
            </div>

            {/* Widget Key */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                🔑 Widget Key
              </h3>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-400 truncate">
                  {bot.widget_key}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(bot.widget_key)
                    toast.success("Clé copiée !")
                  }}
                  className="px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm transition"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── Onglet Documents ────────────────────────── */}
        {activeTab === "documents" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  📄 Base de connaissances
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {docs.length} document{docs.length > 1 ? "s" : ""} · Le bot utilise ces données pour répondre
                </p>
              </div>
              <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition shadow ${uploading ? "opacity-50 pointer-events-none" : ""}`}>
                {uploading ? "⏳ Traitement..." : "📎 Upload PDF"}
                <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
              </label>
            </div>

            {docs.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl">
                <p className="text-5xl mb-4">📄</p>
                <p className="text-gray-500 font-medium mb-1">Aucun document</p>
                <p className="text-gray-400 text-sm mb-4">
                  Uploadez vos PDFs, FAQ ou documents pour enrichir votre bot
                </p>
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white transition">
                  📎 Choisir un PDF
                  <input type="file" accept=".pdf" onChange={handleUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {docs.map((doc) => {
                  const s = statusConfig[doc.status]
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                        📄
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {doc.filename}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Ajouté le {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <Badge label={s.label} color={s.color} />
                      <button
                        onClick={() => handleDeleteDoc(doc.id)}
                        className="text-red-400 hover:text-red-600 transition text-lg flex-shrink-0"
                      >
                        🗑
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── Onglet Widget ───────────────────────────── */}
        {activeTab === "widget" && (
          <div className="flex flex-col gap-4">

            {/* Code snippet */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                🔌 Code d'intégration
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Copiez ce code et collez-le avant la balise{" "}
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">&lt;/body&gt;</code>
                {" "}de votre site.
              </p>
              <div className="bg-gray-950 rounded-xl p-4 flex items-start justify-between gap-4">
                <code className="text-green-400 text-sm font-mono break-all leading-relaxed">
                  {bot.widget_snippet}
                </code>
                <button
                  onClick={handleCopy}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                  }`}
                >
                  {copied ? "✅ Copié !" : "📋 Copier"}
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                📋 Instructions d'intégration
              </h3>
              <div className="flex flex-col gap-4">
                {[
                  { step: "1", title: "Copiez le code", desc: "Cliquez sur le bouton Copier ci-dessus." },
                  { step: "2", title: "Collez dans votre HTML", desc: "Ajoutez le script avant </body> dans votre fichier HTML." },
                  { step: "3", title: "C'est tout !", desc: "Le widget apparaît automatiquement sur votre site." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compatibilité */}
            <div className="bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-2xl p-5">
              <p className="text-sm font-semibold text-violet-800 dark:text-violet-200 mb-3">
                ✅ Compatible avec
              </p>
              <div className="flex flex-wrap gap-2">
                {["HTML/CSS", "WordPress", "Shopify", "React", "Vue", "Next.js", "Webflow", "Wix"].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 bg-white dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-lg border border-violet-200 dark:border-violet-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── Onglet Aperçu Chat ──────────────────────── */}
        {activeTab === "preview" && (
          <ChatPreview bot={bot} />
        )}

        {/* ─── Onglet Stats ────────────────────────────── */}
        {activeTab === "stats" && botStats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Stats globales */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                📊 Vue d'ensemble
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Conversations total",   value: botStats.conversations?.total || 0,   icon: "💬", color: "violet" },
                  { label: "Cette semaine",          value: botStats.conversations?.last_7d || 0, icon: "📅", color: "blue" },
                  { label: "Messages utilisateurs",  value: botStats.messages?.from_user || 0,    icon: "👤", color: "green" },
                  { label: "Réponses IA",            value: botStats.messages?.from_ai || 0,      icon: "🤖", color: "amber" },
                ].map((s) => {
                  const colors: Record<string, string> = {
                    violet: "bg-violet-50 dark:bg-violet-950 text-violet-600",
                    blue:   "bg-blue-50 dark:bg-blue-950 text-blue-600",
                    green:  "bg-green-50 dark:bg-green-950 text-green-600",
                    amber:  "bg-amber-50 dark:bg-amber-950 text-amber-600",
                  }
                  return (
                    <div key={s.label} className={`${colors[s.color]} rounded-xl p-4`}>
                      <p className="text-2xl font-bold">{s.value}</p>
                      <p className="text-xs opacity-70 mt-0.5">{s.icon} {s.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Satisfaction */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                😊 Satisfaction
              </h3>

              <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#8b5cf6" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - (botStats.feedback?.score || 0) / 100)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                      {botStats.feedback?.score ? `${botStats.feedback.score}%` : "—"}
                    </p>
                    <p className="text-xs text-gray-400">score</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-950 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{botStats.feedback?.likes || 0}</p>
                  <p className="text-xs text-green-600 mt-0.5">👍 Likes</p>
                </div>
                <div className="bg-red-50 dark:bg-red-950 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-red-500">{botStats.feedback?.dislikes || 0}</p>
                  <p className="text-xs text-red-500 mt-0.5">👎 Dislikes</p>
                </div>
              </div>
            </div>

            {/* Activité 7 jours */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                📈 Activité — 7 derniers jours
              </h3>
              <div className="flex items-end gap-2 h-24">
                {(botStats.conversations?.daily || []).map((d: any, i: number) => {
                  const max = Math.max(...(botStats.conversations?.daily || []).map((x: any) => x.count), 1)
                  const h   = Math.max((d.count / max) * 100, 4)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400">{d.count}</span>
                      <div
                        className="w-full rounded-t-lg bg-violet-500 transition-all hover:bg-violet-600"
                        style={{ height: `${h}%` }}
                      />
                      <span className="text-xs text-gray-400">{d.date}</span>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modal modification */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le bot">
        <BotForm
          defaultValues={bot}
          onSubmit={handleUpdate}
          loading={updating}
          submitLabel="Enregistrer les modifications"
        />
      </Modal>
    </div>
  )
}


