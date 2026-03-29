"use client"

import Link from "next/link"
import Badge from "@/components/ui/Badge"
import { Bot } from "@/types"

interface BotCardProps {
  bot: Bot
  onDelete: (id: string) => void
}

export default function BotCard({ bot, onDelete }: BotCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg shadow"
            style={{ backgroundColor: bot.color }}
          >
            🤖
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{bot.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Créé le {new Date(bot.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <Badge
          label={bot.is_active ? "Actif" : "Inactif"}
          color={bot.is_active ? "green" : "gray"}
        />
      </div>

      {/* Badges */}
      <div className="flex gap-2 flex-wrap">
        <Badge
          label={bot.model === "claude" ? "Claude" : "GPT-4o"}
          color={bot.model === "claude" ? "violet" : "green"}
        />
        <Badge label={bot.language.toUpperCase()} color="amber" />
      </div>

      {/* System prompt preview */}
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
        {bot.system_prompt}
      </p>

      {/* Widget snippet */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
        {bot.widget_snippet}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => onDelete(bot.id)}
          className="text-xs text-red-500 hover:text-red-700 font-medium transition"
        >
          🗑 Supprimer
        </button>
        <Link
          href={`/bots/${bot.id}`}
          className="text-xs text-violet-600 hover:text-violet-800 font-medium transition"
        >
          ⚙️ Gérer →
        </Link>
      </div>

    </div>
  )
}