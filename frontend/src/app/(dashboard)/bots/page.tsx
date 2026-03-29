"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"  
import toast from "react-hot-toast"
import Navbar from "@/components/layout/Navbar"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import BotCard from "@/components/bots/BotCard"
import BotForm from "@/components/bots/BotForm"
import { useBotStore } from "@/store/botStore"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import { Bot } from "@/types"

type SortKey  = "recent" | "name" | "conversations"
type FilterModel = "all" | "claude" | "gpt"
type FilterStatus = "all" | "active" | "inactive"

export default function BotsPage() {
  const { bots, setBots, addBot, updateBot, deleteBot } = useBotStore()
  const user = useAuthStore((s) => s.user)

  const [loading, setLoading]   = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // ─── Filtres ─────────────────────────────────────────────
  const [search, setSearch]           = useState("")
  const [sortKey, setSortKey]         = useState<SortKey>("recent")
  const [filterModel, setFilterModel] = useState<FilterModel>("all")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid")

  // ✅ Charger les bots
  useEffect(() => {
    api.get("/bots/")
      .then((res) => setBots(res.data))
      .finally(() => setLoading(false))
  }, [])

  // ✅ Créer un bot
  const handleCreate = async (data: any) => {
    setCreating(true)
    try {
      const res = await api.post("/bots/", data)
      addBot(res.data)
      setShowModal(false)
      toast.success("Bot créé avec succès ! 🤖")
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la création.")
    } finally {
      setCreating(false)
    }
  }

  // ✅ Supprimer un bot
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce bot ? Cette action est irréversible.")) return
    try {
      await api.delete(`/bots/${id}/`)
      deleteBot(id)
      toast.success("Bot supprimé.")
    } catch {
      toast.error("Erreur lors de la suppression.")
    }
  }

  // ✅ Filtres + tri + recherche
  const filteredBots = useMemo(() => {
    let result = [...bots]

    // Recherche
    if (search.trim()) {
      result = result.filter((b) =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.system_prompt.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Filtre modèle
    if (filterModel !== "all") {
      result = result.filter((b) => b.model === filterModel)
    }

    // Filtre statut
    if (filterStatus === "active")   result = result.filter((b) => b.is_active)
    if (filterStatus === "inactive") result = result.filter((b) => !b.is_active)

    // Tri
    if (sortKey === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sortKey === "recent") {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    }

    return result
  }, [bots, search, filterModel, filterStatus, sortKey])

  const planLimits: Record<string, number> = { free: 1, pro: 5, business: 999 }
  const limit     = planLimits[user?.plan || "free"]
  const canCreate = bots.length < limit
  const hasFilters = search || filterModel !== "all" || filterStatus !== "all"

  const resetFilters = () => {
    setSearch("")
    setFilterModel("all")
    setFilterStatus("all")
    setSortKey("recent")
  }

  return (
    <div className="flex flex-col flex-1">
      <Navbar title="Mes Bots" />

      <div className="p-4 lg:p-6 flex flex-col gap-5">

        {/* ─── Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Mes Chatbots
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {bots.length} bot{bots.length > 1 ? "s" : ""} ·{" "}
              {limit === 999 ? "∞" : `${bots.length}/${limit}`} utilisés
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            disabled={!canCreate}
            className="flex-shrink-0"
          >
            + Nouveau Bot
          </Button>
        </div>

        {/* ─── Limite atteinte ─────────────────────────── */}
        {!canCreate && (
          <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 text-sm">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Limite atteinte — Plan {user?.plan?.toUpperCase()}
              </p>
              <p className="text-amber-600 dark:text-amber-400 text-xs mt-0.5">
                Passez à un plan supérieur pour créer plus de bots.{" "}
                <a href="/pricing" className="underline font-medium">Voir les plans →</a>
              </p>
            </div>
          </div>
        )}

        {/* ─── Barre de recherche + filtres ────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col gap-3">

          {/* Ligne 1 — Recherche + vue */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un bot..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Toggle vue */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition text-sm ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-gray-900 shadow text-violet-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition text-sm ${
                  viewMode === "list"
                    ? "bg-white dark:bg-gray-900 shadow text-violet-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                ≡
              </button>
            </div>
          </div>

          {/* Ligne 2 — Filtres */}
          <div className="flex flex-wrap gap-2 items-center">

            {/* Filtre modèle */}
            <div className="flex gap-1">
              {(["all", "claude", "gpt"] as FilterModel[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterModel(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterModel === m
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {m === "all" ? "Tous les modèles" : m === "claude" ? "🤖 Claude" : "🟢 GPT-4o"}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

            {/* Filtre statut */}
            <div className="flex gap-1">
              {(["all", "active", "inactive"] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    filterStatus === s
                      ? "bg-violet-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {s === "all" ? "Tous" : s === "active" ? "✅ Actifs" : "⏸ Inactifs"}
                </button>
              ))}
            </div>

            <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

            {/* Tri */}
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300 outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="recent">Plus récents</option>
              <option value="name">Nom A→Z</option>
              <option value="conversations">Conversations</option>
            </select>

            {/* Reset filtres */}
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
              >
                ✕ Réinitialiser
              </button>
            )}

            {/* Résultats */}
            <span className="ml-auto text-xs text-gray-400">
              {filteredBots.length} résultat{filteredBots.length > 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* ─── Liste des bots ───────────────────────────── */}
        {loading ? (
          <div className={viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "flex flex-col gap-3"
          }>
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse ${
                viewMode === "grid" ? "h-56" : "h-20"
              }`} />
            ))}
          </div>

        ) : filteredBots.length === 0 && bots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4 animate-bounce">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun bot encore
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm">
              Créez votre premier chatbot en quelques secondes !
            </p>
            <Button onClick={() => setShowModal(true)}>
              + Créer mon premier bot
            </Button>
          </div>

        ) : filteredBots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Aucun résultat
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              Aucun bot ne correspond à vos filtres.
            </p>
            <button
              onClick={resetFilters}
              className="text-violet-600 text-sm font-medium hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>

        ) : viewMode === "grid" ? (
          // ✅ Vue grille
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBots.map((bot) => (
              <BotCard key={bot.id} bot={bot} onDelete={handleDelete} />
            ))}
          </div>

        ) : (
          // ✅ Vue liste
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wide">
              <div className="col-span-4">Bot</div>
              <div className="col-span-2">Modèle</div>
              <div className="col-span-2">Langue</div>
              <div className="col-span-2">Statut</div>
              <div className="col-span-2 text-right">Action</div>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredBots.map((bot) => (
                <div
                  key={bot.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  {/* Bot info */}
                  <div className="col-span-4 flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                      style={{ backgroundColor: bot.color }}
                    >
                      🤖
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{bot.name}</p>
                      <p className="text-xs text-gray-400 truncate">{bot.system_prompt.slice(0, 40)}...</p>
                    </div>
                  </div>

                  {/* Modèle */}
                  <div className="col-span-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      bot.model === "claude"
                        ? "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                        : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    }`}>
                      {bot.model === "claude" ? "Claude" : "GPT-4o"}
                    </span>
                  </div>

                  {/* Langue */}
                  <div className="col-span-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">
                      {bot.language}
                    </span>
                  </div>

                  {/* Statut */}
                  <div className="col-span-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      bot.is_active
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                    }`}>
                      {bot.is_active ? "✅ Actif" : "⏸ Inactif"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2">
                    
                    // ✅ Correction
                        <Link
                        href={`/bots/${bot.id}`}
                        className="text-xs text-violet-600 hover:underline font-medium"
                        >
                        Gérer →
                        </Link>
                    <button
                      onClick={() => handleDelete(bot.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modal création */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Créer un nouveau bot">
        <BotForm onSubmit={handleCreate} loading={creating} submitLabel="Créer le bot" />
      </Modal>
    </div>
  )
}
