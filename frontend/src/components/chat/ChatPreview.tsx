"use client"

import { useState } from "react"
import { Bot, Message } from "@/types"
import api from "@/lib/api"
import toast from "react-hot-toast"

interface ChatPreviewProps {
  bot: Bot
}

export default function ChatPreview({ bot }: ChatPreviewProps) {
  const [messages, setMessages]       = useState<Message[]>([])
  const [input, setInput]             = useState("")
  const [convId, setConvId]           = useState<string | null>(null)
  const [loading, setLoading]         = useState(false)
  const [starting, setStarting]       = useState(false)
  const [started, setStarted]         = useState(false)

  // ✅ Démarrer la conversation
  const handleStart = async () => {
    setStarting(true)
    try {
      const res = await api.post(`/conversations/start/${bot.widget_key}/`)
      setConvId(res.data.id)
      setStarted(true)
    } catch {
      toast.error("Erreur lors du démarrage.")
    } finally {
      setStarting(false)
    }
  }

  // ✅ Envoyer un message
  const handleSend = async () => {
    if (!input.trim() || !convId || loading) return

    const userMsg = input.trim()
    setInput("")

    // Ajouter message utilisateur localement
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: userMsg,
      feedback: null,
      created_at: new Date().toISOString(),
    }])

    setLoading(true)
    try {
      const res = await api.post(`/conversations/chat/${convId}/`, { message: userMsg })
      setMessages((prev) => [...prev, res.data])
    } catch {
      toast.error("Erreur IA.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-4">
      <h3 className="font-semibold text-gray-900 dark:text-white">
        💬 Aperçu du chatbot
      </h3>

      {/* Fenêtre chat */}
      <div
        className="rounded-2xl border-2 overflow-hidden flex flex-col"
        style={{ borderColor: bot.color, minHeight: "400px" }}
      >
        {/* Header widget */}
        <div
          className="px-4 py-3 flex items-center gap-3 text-white"
          style={{ backgroundColor: bot.color }}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            🤖
          </div>
          <div>
            <p className="font-semibold text-sm">{bot.name}</p>
            <p className="text-xs opacity-80">
              {bot.model === "claude" ? "Claude AI" : "GPT-4o"}
            </p>
          </div>
          <div className="ml-auto w-2 h-2 rounded-full bg-green-400" />
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-950 overflow-y-auto max-h-72">
          {!started ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-3">🤖</p>
                <p className="text-gray-500 text-sm mb-4">
                  Testez votre bot en conditions réelles
                </p>
                <button
                  onClick={handleStart}
                  disabled={starting}
                  className="px-4 py-2 rounded-lg text-white text-sm font-medium transition"
                  style={{ backgroundColor: bot.color }}
                >
                  {starting ? "Démarrage..." : "▶️ Démarrer la conversation"}
                </button>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 max-w-xs shadow-sm">
                Bonjour ! Je suis <strong>{bot.name}</strong>. Comment puis-je vous aider ? 👋
              </div>
            </div>
          ) : null}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm max-w-xs shadow-sm ${
                  msg.role === "user"
                    ? "text-white rounded-tr-none"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-tl-none"
                }`}
                style={msg.role === "user" ? { backgroundColor: bot.color } : {}}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        {started && (
          <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Écrivez un message..."
              className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-violet-500 text-gray-900 dark:text-white"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition disabled:opacity-50"
              style={{ backgroundColor: bot.color }}
            >
              ➤
            </button>
          </div>
        )}
      </div>
    </div>
  )
}