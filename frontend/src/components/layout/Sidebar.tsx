"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useAuthStore } from "@/store/authStore"
import toast from "react-hot-toast"

const nav = [
  { label: "Dashboard",  href: "/dashboard",  icon: "🏠" },
  { label: "Mes Bots",   href: "/bots",        icon: "🤖" },
  { label: "Documents",  href: "/documents",   icon: "📄" },
  { label: "Analytics",  href: "/analytics",   icon: "📊" },
  { label: "Pricing",    href: "/pricing",     icon: "💳" },
]

const planColors: Record<string, string> = {
  free:     "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  pro:      "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
  business: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
}

interface SidebarProps {
  onClose?: () => void
}

function SidebarContent({ onClose }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    toast.success("Déconnecté avec succès.")
    router.push("/login")
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">🤖</span>
          </div>
          <span className="text-xl font-bold text-violet-600">ChatFlow</span>
        </div>

        {/* Bouton fermer (mobile seulement) */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {nav.map(({ label, href, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition group
                ${active
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-200 dark:shadow-violet-900"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <span className="text-lg">{icon}</span>
              <span>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Plan upgrade banner */}
      {user?.plan === "free" && (
        <div className="mx-4 mb-4">
          <Link
            href="/pricing"
            onClick={onClose}
            className="block bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl p-4 text-white hover:opacity-90 transition"
          >
            <p className="text-sm font-semibold mb-1">⚡ Passer à Pro</p>
            <p className="text-xs text-violet-200">5 bots + messages illimités</p>
            <div className="mt-2 text-xs bg-white/20 rounded-lg px-3 py-1 text-center font-medium">
              À partir de $9.99/mois →
            </div>
          </Link>
        </div>
      )}

      {/* User info */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.name || "Utilisateur"}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planColors[user?.plan || "free"]}`}>
              {user?.plan?.toUpperCase() || "FREE"}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition"
        >
          <span>🚪</span>
          Se déconnecter
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  // ✅ Fermer la sidebar mobile au changement de route
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // ✅ Bloquer le scroll quand la sidebar est ouverte
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <>
      {/* ─── Bouton hamburger (mobile) ─────────────────── */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-violet-600 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* ─── Sidebar Desktop ────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col z-40">
        <SidebarContent />
      </aside>

      {/* ─── Overlay mobile ─────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── Sidebar Mobile ─────────────────────────────── */}
      <aside
        className={`lg:hidden fixed left-0 top-0 h-screen w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}