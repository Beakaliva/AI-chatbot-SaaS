"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const router    = useRouter()
  const setUser   = useAuthStore((s) => s.setUser)
  const setTokens = useAuthStore((s) => s.setTokens)
  const [loading, setLoading]   = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setLoading(true)
    try {
      const res = await api.post("/users/login/", data)
      setTokens(res.data.access, res.data.refresh)
      const me = await api.get("/users/me/")
      setUser(me.data)
      toast.success(`Bienvenue ${me.data.name} ! 👋`)
      router.push("/dashboard")
    } catch {
      toast.error("Email ou mot de passe incorrect.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">

      {/* Mobile logo */}
      <div className="flex lg:hidden items-center gap-2 mb-8">
        <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
          <span className="text-white">🤖</span>
        </div>
        <span className="text-xl font-bold text-violet-600">ChatFlow</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Bon retour ! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Connectez-vous pour gérer vos chatbots.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Adresse email
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
            <input
              type="email"
              placeholder="vous@exemple.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                placeholder:text-gray-400
                focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                ${errors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-200 dark:border-gray-700"
                }`}
              {...register("email", {
                required: "Email requis",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Email invalide" }
              })}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              ⚠️ {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mot de passe
            </label>
            <button type="button" className="text-xs text-violet-600 hover:underline">
              Mot de passe oublié ?
            </button>
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm outline-none transition
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white
                placeholder:text-gray-400
                focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                ${errors.password
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-200 dark:border-gray-700"
                }`}
              {...register("password", { required: "Mot de passe requis" })}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              ⚠️ {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-violet-200 dark:shadow-violet-900 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Connexion en cours...
            </>
          ) : (
            "Se connecter →"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">ou</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Orange Money badge */}
        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">🟠</span>
          <div>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              Orange Money accepté
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400">
              Payez en GNF directement depuis votre téléphone
            </p>
          </div>
        </div>

      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-violet-600 font-semibold hover:underline">
          S'inscrire gratuitement
        </Link>
      </p>

      {/* Back to home */}
      <div className="text-center mt-4">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}