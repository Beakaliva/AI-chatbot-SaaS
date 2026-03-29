import { create } from "zustand"
import { Bot } from "@/types"

interface BotState {
  bots: Bot[]
  selectedBot: Bot | null
  setBots: (bots: Bot[]) => void
  addBot: (bot: Bot) => void
  updateBot: (bot: Bot) => void
  deleteBot: (id: string) => void
  selectBot: (bot: Bot | null) => void
}

export const useBotStore = create<BotState>((set) => ({
  bots:        [],
  selectedBot: null,

  setBots:    (bots) => set({ bots }),
  selectBot:  (bot)  => set({ selectedBot: bot }),
  addBot:     (bot)  => set((s) => ({ bots: [bot, ...s.bots] })),
  updateBot:  (bot)  => set((s) => ({
    bots: s.bots.map((b) => (b.id === bot.id ? bot : b))
  })),
  deleteBot:  (id)   => set((s) => ({
    bots: s.bots.filter((b) => b.id !== id)
  })),
}))