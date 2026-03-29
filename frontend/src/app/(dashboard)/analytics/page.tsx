"use client"

import { useEffect, useState } from "react"
import Navbar from "@/components/layout/Navbar"
import StatsCard from "@/components/analytics/StatsCard"
import { GlobalStats } from "@/types"
import api from "@/lib/api"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from "recharts"

export default function AnalyticsPage() {
  const [stats, setStats]     = useState<GlobalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBot, setSelectedBot] = useState<string>("all")
  const [botStats, setBotStats]       = useState<any>(null)

  useEffect(() => {
    api.get("/analytics/")
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false))
  }, [])

  // ✅ Charger stats d'un bot spécifique
  useEffect(() => {
    if (selectedBot === "all") {
      setBotStats(null)
      return
    }
    api.get(`/analytics/${selectedBot}/`).then((res) => setBotStats(res.data))
  }, [selectedBot])

  const scoreColor = (score: number | null) => {
    if (!score) return "gray"
    if (score >= 80) return "text-green-500"
    if (score >= 50) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="flex flex-col flex-1">
      <Navbar title="Analytics" />

      <div className="p-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Statistiques
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Vue d'ensemble de vos chatbots
            </p>
          </div>

          {/* Sélecteur de bot */}
          <select
            value={selectedBot}
            onChange={(e) => setSelectedBot(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="all">Tous les bots</option>
            {stats?.bots_summary.map((bot) => (
              <option key={bot.id} value={bot.id}>{bot.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* ─── Stats globales ─── */}
            {selectedBot === "all" && stats && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    label="Total Bots"
                    value={stats.bots.total}
                    icon="🤖"
                    color="violet"
                    sub={`${stats.bots.active} actifs`}
                  />
                  <StatsCard
                    label="Conversations"
                    value={stats.conversations}
                    icon="💬"
                    color="blue"
                  />
                  <StatsCard
                    label="Messages"
                    value={stats.messages}
                    icon="📨"
                    color="green"
                  />
                  <StatsCard
                    label="Documents"
                    value={stats.documents}
                    icon="📄"
                    color="amber"
                  />
                </div>

                {/* Feedback global */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Score satisfaction */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      😊 Satisfaction utilisateurs
                    </h3>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-green-500">
                          {stats.feedback.likes}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">👍 Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-3xl font-bold text-red-500">
                          {stats.feedback.dislikes}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">👎 Dislikes</p>
                      </div>
                      <div className="text-center">
                        {(() => {
                          const total = stats.feedback.likes + stats.feedback.dislikes
                          const score = total > 0
                            ? Math.round((stats.feedback.likes / total) * 100)
                            : null
                          return (
                            <>
                              <p className={`text-3xl font-bold ${scoreColor(score)}`}>
                                {score !== null ? `${score}%` : "—"}
                              </p>
                              <p className="text-sm text-gray-500 mt-1">Score</p>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Tableau des bots */}
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      🤖 Performance par bot
                    </h3>
                    <div className="flex flex-col gap-2">
                      {stats.bots_summary.map((bot) => (
                        <div
                          key={bot.id}
                          className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${bot.is_active ? "bg-green-500" : "bg-gray-400"}`} />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                              {bot.name}
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-500">
                            <span>💬 {bot.conversations}</span>
                            <span>📨 {bot.messages}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Graphique barres */}
                {stats.bots_summary.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
                      📊 Conversations par bot
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.bots_summary}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="conversations" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}

            {/* ─── Stats d'un bot spécifique ─── */}
            {selectedBot !== "all" && botStats && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatsCard
                    label="Conversations"
                    value={botStats.conversations.total}
                    icon="💬"
                    color="blue"
                    sub={`${botStats.conversations.last_7d} cette semaine`}
                  />
                  <StatsCard
                    label="Messages"
                    value={botStats.messages.total}
                    icon="📨"
                    color="green"
                    sub={`${botStats.messages.from_user} utilisateurs`}
                  />
                  <StatsCard
                    label="👍 Likes"
                    value={botStats.feedback.likes}
                    icon="👍"
                    color="violet"
                  />
                  <StatsCard
                    label="Score"
                    value={botStats.feedback.score !== null ? `${botStats.feedback.score}%` : "—"}
                    icon="⭐"
                    color="amber"
                  />
                </div>

                {/* Graphique 7 jours */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-6">
                    📈 Conversations — 7 derniers jours
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={botStats.conversations.daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={{ fill: "#8b5cf6", r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Messages breakdown */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    📨 Répartition des messages
                  </h3>
                  <div className="flex gap-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-violet-600">
                        {botStats.messages.from_user}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">👤 Utilisateurs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {botStats.messages.from_ai}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">🤖 IA</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {botStats.messages.total}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">📊 Total</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
