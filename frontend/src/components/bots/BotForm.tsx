"use client"

import { useForm } from "react-hook-form"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { Bot } from "@/types"

interface BotFormData {
  name: string
  model: "claude" | "gpt"
  system_prompt: string
  language: string
  color: string
}

interface BotFormProps {
  defaultValues?: Partial<Bot>
  onSubmit: (data: BotFormData) => void
  loading: boolean
  submitLabel: string
}

export default function BotForm({ defaultValues, onSubmit, loading, submitLabel }: BotFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<BotFormData>({
    defaultValues: {
      name:          defaultValues?.name || "",
      model:         defaultValues?.model || "claude",
      system_prompt: defaultValues?.system_prompt || "Tu es un assistant utile et professionnel.",
      language:      defaultValues?.language || "fr",
      color:         defaultValues?.color || "#6366f1",
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

      <Input
        label="Nom du bot"
        placeholder="Ex: Assistant Boutique"
        {...register("name", { required: "Nom requis" })}
        error={errors.name?.message}
      />

      {/* Modèle IA */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Modèle IA
        </label>
        <select
          {...register("model")}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="claude">🤖 Claude (Anthropic)</option>
          <option value="gpt">🟢 GPT-4o (OpenAI)</option>
        </select>
      </div>

      {/* Langue */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Langue
        </label>
        <select
          {...register("language")}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500"
        >
          <option value="fr">🇫🇷 Français</option>
          <option value="en">🇬🇧 English</option>
          <option value="so">🇬🇳 Soussou</option>
          <option value="pu">🇬🇳 Pular</option>
          <option value="ma">🇬🇳 Malinké</option>
        </select>
      </div>

      {/* System Prompt */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Instructions du bot (System Prompt)
        </label>
        <textarea
          {...register("system_prompt")}
          rows={4}
          placeholder="Ex: Tu es un assistant pour boutique en ligne. Réponds toujours en français."
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        />
      </div>

      {/* Couleur */}
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Couleur du widget
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            {...register("color")}
            className="w-12 h-10 rounded-lg border border-gray-300 dark:border-gray-700 cursor-pointer"
          />
          <span className="text-sm text-gray-500">Couleur principale du chatbot</span>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>

    </form>
  )
}