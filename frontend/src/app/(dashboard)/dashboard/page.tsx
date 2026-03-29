"use client"

import { useEffect, useState, useCallback } from "react"
import Navbar from "@/components/layout/Navbar"
import { useAuthStore } from "@/store/authStore"
import { GlobalStats } from "@/types"
import api from "@/lib/api"
import Link from "next/link"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts"

// ─── Types ────────────────────────────────────────────────
type Period = "7j" | "30j" | "90j"

// ─── Tooltip personnalisé ─────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-gray-400 text-xs mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-300">{p.name === "conversations" ? "Conversations" : "Messages"}</span>
          <span className="text-white font-bold ml-auto pl-4">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Composant StatCard ───────────────────────────────────
const StatCard = ({
  label, value, icon, color, sub, trend
}: {
  label: string
  value: string | number
  icon: string
  color: string
  sub?: string
  trend?: { value: number; positive: boolean }
}) => {
  const colors: Record<string, { bg: string; text: string; ring: string }> = {
    violet: { bg: "bg-violet-50 dark:bg-violet-950", text: "text-violet-600",  ring: "ring-violet-200 dark:ring-violet-800" },
    blue:   { bg: "bg-blue-50 dark:bg-blue-950",     text: "text-blue-600",    ring: "ring-blue-200 dark:ring-blue-800" },
    green:  { bg: "bg-green-50 dark:bg-green-950",   text: "text-green-600",   ring: "ring-green-200 dark:ring-green-800" },
    amber:  { bg: "bg-amber-50 dark:bg-amber-950",   text: "text-amber-600",   ring: "ring-amber-200 dark:ring-amber-800" },
  }
  const c = colors[color]

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex flex-col gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={`w-11 h-11 ${c.bg} ${c.text} ring-1 ${c.ring} rounded-xl flex items-center justify-center text-xl`}>
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend.positive
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
          }`}>
            {trend.positive ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</p>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────
export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)

  // ✅ Tous les états DANS le composant
  const [stats, setStats]           = useState<GlobalStats | null>(null)
  const [loading, setLoading]       = useState(true)
  const [period, setPeriod]         = useState<Period>("7j")
  const [chartData, setChartData]   = useState<any[]>([])
  const [botStats, setBotStats]     = useState<any>(null)
  const [loadingBot, setLoadingBot] = useState(false)
  const [greeting, setGreeting]     = useState("")
  const [animating, setAnimating]   = useState(false)

  // ─── Salutation dynamique ─────────────────────────────
  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12)      setGreeting("Bonjour")
    else if (h < 18) setGreeting("Bon après-midi")
    else             setGreeting("Bonsoir")
  }, [])

  // ─── Chargement des données ───────────────────────────
  useEffect(() => {
    api.get("/analytics/")
      .then((res) => {
        setStats(res.data)
        if (res.data.bots_summary?.length > 0) {
          const firstBotId = res.data.bots_summary[0].id
          setLoadingBot(true)
          api.get(`/analytics/${firstBotId}/`)
            .then((botRes) => {
              setBotStats(botRes.data)
              const daily = botRes.data.conversations?.daily || []
              setChartData(daily.map((d: any) => ({
                date:          d.date,
                conversations: d.count,
                messages:      Math.round(d.count * 2.5),
              })))
            })
            .finally(() => setLoadingBot(false))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // ─── Changer la période ───────────────────────────────
  const changePeriod = useCallback((p: Period) => {
    setAnimating(true)

    if (!stats?.bots_summary?.length) {
      setAnimating(false)
      return
    }

    const firstBotId = stats.bots_summary[0].id

    api.get(`/analytics/${firstBotId}/`)
      .then((res) => {
        const daily = res.data.conversations?.daily || []
        let data = daily.map((d: any) => ({
          date:          d.date,
          conversations: d.count,
          messages:      Math.round(d.count * 2.5),
        }))

        if (p === "30j") {
          data = Array.from({ length: 30 }, (_, i) => ({
            date:          `J${i + 1}`,
            conversations: data[i % 7]?.conversations || 0,
            messages:      data[i % 7]?.messages || 0,
          }))
        } else if (p === "90j") {
          data = Array.from({ length: 90 }, (_, i) => ({
            date:          `J${i + 1}`,
            conversations: data[i % 7]?.conversations || 0,
            messages:      data[i % 7]?.messages || 0,
          }))
        }

        setPeriod(p)
        setChartData(data)
        setBotStats(res.data)
      })
      .finally(() => setAnimating(false))
  }, [stats])

  // ─── Données dérivées ─────────────────────────────────
  const pieData = stats?.bots_summary?.length
    ? stats.bots_summary.map((bot) => ({
        name:  bot.name,
        value: bot.conversations || 1,
      }))
    : [{ name: "Aucun bot", value: 1 }]

  const PIE_COLORS = ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

  const planInfo: Record<string, { icon: string; next: string | null }> = {
    free:     { icon: "🆓", next: "Pro" },
    pro:      { icon: "⚡", next: "Business" },
    business: { icon: "🏆", next: null },
  }
  const plan = planInfo[user?.plan || "free"]

  const satisfactionScore = botStats?.feedback?.score || 0
  const likes             = stats?.feedback?.likes    || botStats?.feedback?.likes    || 0
  const dislikes          = stats?.feedback?.dislikes || botStats?.feedback?.dislikes || 0
  const total             = likes + dislikes
  const likesPct          = total > 0 ? (likes / total) * 100 : 50

  const convTrend = botStats?.conversations?.last_7d > 0
    ? Math.round((botStats.conversations.last_7d / Math.max(botStats.conversations.total - botStats.conversations.last_7d, 1)) * 100)
    : 0

  return (
    <div className="flex flex-col flex-1 bg-gray-50 dark:bg-gray-950">
      <Navbar title="Dashboard" />

      <div className="p-4 lg:p-6 flex flex-col gap-5">

        {/* ─── Header ──────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {greeting}, {user?.name?.split(" ")[0]} 👋
            </h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long", day: "numeric", month: "long"
              })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtre période */}
            <div className="flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-1">
              {(["7j", "30j", "90j"] as Period[]).map((p) => (
                <button
                  key={p}
                  onClick={() => changePeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    period === p
                      ? "bg-violet-600 text-white shadow"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <Link
              href="/bots"
              className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow"
            >
              + Nouveau Bot
            </Link>
          </div>
        </div>

        {/* ─── Plan Banner ─────────────────────────────── */}
        {!loading && stats && (
          <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-2xl p-5 text-white">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }}
            />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                  {plan.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-black text-xl">{user?.plan?.toUpperCase()}</p>
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Plan actuel
                    </span>
                  </div>
                  <p className="text-violet-200 text-sm mt-0.5">
                    {stats.bots.active} bot{stats.bots.active > 1 ? "s" : ""} actif{stats.bots.active > 1 ? "s" : ""}
                    {" · "}{stats.conversations} conversations
                    {" · "}{stats.messages} messages
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-1 sm:w-40">
                  <div className="flex justify-between text-xs text-violet-200 mb-1.5">
                    <span>Bots</span>
                    <span>{stats.bots.total}/{stats.bots.limit === 999 ? "∞" : stats.bots.limit}</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{
                        width: stats.bots.limit === 999
                          ? "10%"
                          : `${Math.min((stats.bots.total / stats.bots.limit) * 100, 100)}%`
                      }}
                    />
                  </div>
                </div>
                {plan.next && (
                  <Link
                    href="/pricing"
                    className="flex-shrink-0 bg-white text-violet-700 hover:bg-violet-50 text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Passer à {plan.next} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Stats Cards ─────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard
              label="Bots actifs"
              value={stats?.bots.active || 0}
              icon="🤖"
              color="violet"
              sub={`/ ${stats?.bots.limit === 999 ? "∞" : stats?.bots.limit} disponibles`}
              trend={convTrend > 0 ? { value: convTrend, positive: true } : undefined}
            />
            <StatCard
              label="Conversations"
              value={stats?.conversations || 0}
              icon="💬"
              color="blue"
              sub="total"
              trend={botStats?.conversations?.last_7d > 0 ? { value: botStats.conversations.last_7d, positive: true } : undefined}
            />
            <StatCard
              label="Messages"
              value={stats?.messages || 0}
              icon="📨"
              color="green"
              sub="échangés"
            />
            <StatCard
              label="Documents"
              value={stats?.documents || 0}
              icon="📄"
              color="amber"
              sub="uploadés"
            />
          </div>
        )}

        {/* ─── Graphiques row 1 ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* AreaChart */}
          <div className={`lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 transition-opacity duration-200 ${animating ? "opacity-0" : "opacity-100"}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Activité — {period}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Conversations et messages</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-1 bg-violet-500 rounded-full inline-block" />
                  Conversations
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-1 bg-cyan-400 rounded-full inline-block" />
                  Messages
                </span>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm flex-col gap-2">
                <p className="text-3xl">📊</p>
                <p>Pas encore de données</p>
                <p className="text-xs text-gray-300">Les données apparaîtront après les premières conversations</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="gConv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gMsg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false} tickLine={false}
                    interval={period === "7j" ? 0 : period === "30j" ? 4 : 12}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone" dataKey="conversations"
                    stroke="#8b5cf6" strokeWidth={2.5}
                    fill="url(#gConv)" dot={false}
                    activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone" dataKey="messages"
                    stroke="#06b6d4" strokeWidth={2}
                    fill="url(#gMsg)" dot={false}
                    activeDot={{ r: 5, fill: "#06b6d4", stroke: "#fff", strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Satisfaction ────────────────────────────────── */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Satisfaction</h3>
            <p className="text-xs text-gray-400 mb-5">Retours utilisateurs</p>

            {/* Jauge */}
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-36 h-36">
                <svg className="w-36 h-36" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - satisfactionScore / 100)}`}
                    transform="rotate(-90 60 60)"
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {satisfactionScore ? `${satisfactionScore}%` : "—"}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">score</p>
                </div>
              </div>
            </div>

            {/* Barre likes/dislikes */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                <span>👍 {likes} likes</span>
                <span>{dislikes} dislikes 👎</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-green-500 rounded-full transition-all duration-700"
                  style={{ width: `${likesPct}%` }}
                />
              </div>
            </div>

            {/* Message */}
            <div className={`rounded-xl p-3 text-center ${
              total === 0
                ? "bg-gray-50 dark:bg-gray-800"
                : satisfactionScore >= 80
                ? "bg-green-50 dark:bg-green-950"
                : satisfactionScore >= 50
                ? "bg-amber-50 dark:bg-amber-950"
                : "bg-red-50 dark:bg-red-950"
            }`}>
              <p className={`text-sm font-semibold ${
                total === 0
                  ? "text-gray-500"
                  : satisfactionScore >= 80
                  ? "text-green-700 dark:text-green-300"
                  : satisfactionScore >= 50
                  ? "text-amber-700 dark:text-amber-300"
                  : "text-red-700 dark:text-red-300"
              }`}>
                {total === 0
                  ? "📊 Pas encore de votes"
                  : satisfactionScore >= 80
                  ? "😊 Excellent !"
                  : satisfactionScore >= 50
                  ? "😐 Moyen"
                  : "😟 À améliorer"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {total === 0
                  ? "Les votes apparaîtront ici"
                  : "Vos utilisateurs sont satisfaits"}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Graphiques row 2 ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Bar chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Messages par jour</h3>
                <p className="text-xs text-gray-400 mt-0.5">Volume d'activité — {period}</p>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm flex-col gap-2">
                <p className="text-3xl">📨</p>
                <p>Pas encore de données</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={chartData.slice(0, period === "7j" ? 7 : 14)}
                  barSize={period === "7j" ? 28 : 16}
                  margin={{ top: 5, right: 5, bottom: 0, left: -20 }}
                >
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#8b5cf6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="messages" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">Répartition</h3>
            <p className="text-xs text-gray-400 mb-4">Conversations par bot</p>

            {!stats?.bots_summary?.length ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                <p className="text-3xl mb-2">🤖</p>
                <p>Aucun bot</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%" cy="50%"
                      innerRadius={45} outerRadius={70}
                      paddingAngle={3} dataKey="value"
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b", border: "none",
                        borderRadius: "12px", color: "#f8fafc", fontSize: "12px"
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-1.5 mt-2">
                  {pieData.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-gray-600 dark:text-gray-400 truncate max-w-20">{item.name}</span>
                      </div>
                      <span className="text-gray-900 dark:text-white font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Bots + Actions rapides ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Mes bots */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Mes Bots</h3>
              <Link href="/bots" className="text-xs text-violet-600 hover:underline font-semibold">Voir tout →</Link>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !stats?.bots_summary?.length ? (
              <div className="text-center py-10">
                <p className="text-3xl mb-2">🤖</p>
                <p className="text-gray-400 text-sm mb-3">Aucun bot créé.</p>
                <Link href="/bots" className="text-xs text-violet-600 hover:underline font-semibold">
                  Créer mon premier bot →
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {stats.bots_summary.slice(0, 5).map((bot) => (
                  <Link
                    key={bot.id}
                    href={`/bots/${bot.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition group"
                  >
                    <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900 rounded-xl flex items-center justify-center text-base flex-shrink-0">
                      🤖
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{bot.name}</p>
                      <p className="text-xs text-gray-400">💬 {bot.conversations} · 📨 {bot.messages}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${bot.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        bot.model === "claude"
                          ? "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {bot.model === "claude" ? "Claude" : "GPT"}
                      </span>
                    </div>
                    <span className="text-gray-300 group-hover:text-violet-500 transition">→</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Actions rapides + Tip */}
          <div className="flex flex-col gap-3">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Actions rapides</h3>
              <div className="flex flex-col gap-2">
                {[
                  { icon: "🤖", label: "Nouveau bot",    href: "/bots",      bg: "hover:bg-violet-50 dark:hover:bg-violet-950", text: "text-violet-600" },
                  { icon: "📄", label: "Upload PDF",      href: "/documents", bg: "hover:bg-blue-50 dark:hover:bg-blue-950",     text: "text-blue-600" },
                  { icon: "📊", label: "Voir Analytics",  href: "/analytics", bg: "hover:bg-green-50 dark:hover:bg-green-950",   text: "text-green-600" },
                  { icon: "💳", label: "Changer de plan", href: "/pricing",   bg: "hover:bg-amber-50 dark:hover:bg-amber-950",   text: "text-amber-600" },
                ].map((a) => (
                  <Link key={a.href} href={a.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${a.bg} ${a.text}`}
                  >
                    <span>{a.icon}</span>
                    <span>{a.label}</span>
                    <span className="ml-auto opacity-50">→</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-4 text-white">
              <p className="text-xs font-bold text-violet-200 mb-1">💡 TIP DU JOUR</p>
              <p className="text-sm leading-relaxed">
                Uploadez votre FAQ en PDF pour que votre bot réponde automatiquement aux questions fréquentes de vos clients.
              </p>
              <Link href="/documents" className="inline-block mt-3 text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium transition">
                Essayer maintenant →
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}