"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

export default function NotFound() {
  const [pos, setPos]         = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  // ✅ Fix — message fixe, pas de Math.random() au rendu initial
  const [msg, setMsg]         = useState("404 — Le bot a mangé cette page 🍽️")

  useEffect(() => {
    setMounted(true)

    // ✅ Math.random() uniquement côté client après montage
    const messages = [
      "Même Claude ne sait pas où est cette page... 🤖",
      "404 — Le bot a mangé cette page 🍽️",
      "GPT-4o cherche aussi... sans succès 😅",
      "Page introuvable. Essayez l'Orange Money ? 🟠",
    ]
    setMsg(messages[Math.floor(Math.random() * messages.length)])

    const handleMouse = (e: MouseEvent) => {
      setPos({
        x: (e.clientX / window.innerWidth  - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden px-6">

      {/* Blobs animés */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={mounted ? { transform: `translate(${pos.x}px, ${pos.y}px)` } : {}}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl transition-transform duration-300 ease-out"
          style={mounted ? { transform: `translate(${-pos.x}px, ${-pos.y}px)` } : {}}
        />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative text-center max-w-lg">

        {/* 404 géant */}
        <div className="relative mb-6">
          <p
            className="text-[10rem] md:text-[14rem] font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #06b6d4, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 0 60px rgba(139, 92, 246, 0.3))",
            }}
          >
            404
          </p>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            🤖
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Page introuvable
        </h1>
        <p className="text-gray-400 mb-2">{msg}</p>
        <p className="text-gray-600 text-sm mb-10">
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-xl shadow-violet-900 flex items-center gap-2"
          >
            🏠 Retour au Dashboard
          </Link>
          <Link
            href="/"
            className="border border-gray-700 hover:border-violet-500 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-xl transition"
          >
            ← Page d'accueil
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500">
          <span>Pages disponibles :</span>
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/bots",      label: "Mes Bots" },
            { href: "/analytics", label: "Analytics" },
            { href: "/pricing",   label: "Pricing" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-violet-400 hover:text-violet-300 hover:underline transition"
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 flex items-center gap-2 opacity-40">
        <div className="w-6 h-6 bg-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs">🤖</span>
        </div>
        <span className="text-white text-sm font-bold">ChatFlow</span>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0px); }
          50%       { transform: translate(-50%, -50%) translateY(-15px); }
        }
      `}</style>
    </div>
  )
}