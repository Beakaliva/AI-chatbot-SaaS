"use client"

import ThemeToggle from "./ThemeToggle"
import { useAuthStore } from "@/store/authStore"

interface NavbarProps {
  title: string
}

export default function Navbar({ title }: NavbarProps) {
  const user = useAuthStore((s) => s.user)

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between sticky top-0 z-30
      px-4 lg:px-6
      pl-16 lg:pl-6" // ✅ pl-16 sur mobile pour laisser place au hamburger
    >
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
        {title}
      </h1>

      <div className="flex items-center gap-2">
        <ThemeToggle />

        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          🔔
        </button>

        <div className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center text-violet-700 dark:text-violet-300 font-bold text-sm ml-1">
          {user?.name?.charAt(0).toUpperCase() || "U"}
        </div>
      </div>
    </header>
  )
}
