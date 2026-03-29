"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"
import Sidebar from "@/components/layout/Sidebar"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const logout  = useAuthStore((s) => s.logout)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = Cookies.get("access_token")
    if (!token) {
      router.push("/login")
      return
    }
    api.get("/users/me/")
      .then((res) => {
        setUser(res.data)
        setReady(true)
      })
      .catch(() => {
        logout()
        router.push("/login")
      })
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl">🤖</span>
          </div>
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      {/* ✅ lg:ml-64 — margin seulement sur desktop */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {children}
      </main>
    </div>
  )
}