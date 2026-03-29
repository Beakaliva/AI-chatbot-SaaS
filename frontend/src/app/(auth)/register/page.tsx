"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"

interface RegisterForm {
  name: string
  email: string
  password: string
  confirm: string
  terms: boolean
}

const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: "", color: "" }
  let score = 0
  if (password.length >= 6)  score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++

  const levels = [
    { score: 0, label: "",           color: "" },
    { score: 1, label: "Très faible", color: "bg-red-500" },
    { score: 2, label: "Faible",      color: "bg-orange-500" },
    { score: 3, label: "Moyen",       color: "bg-yellow-500" },
    { score: 4, label: "Fort",        color: "bg-green-500" },
    { score: 5, label: "Très fort",   color: "bg-emerald-500" },
  ]
  return levels[Math.min(score, 5)]
}

export default function RegisterPage() {
  const router    = useRouter()
  const setUser   = useAuthStore((s) => s.setUser)
  const setTokens = useAuthStore((s) => s.setTokens)

  const [loading, setLoading]         = useState(false)
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword]       = useState("")

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()
  const strength = getPasswordStrength(password)

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true)
    try {
      const res = await api.post("/users/register/", {
        name:     data.name,
        email:    data.email,
        password: data.password,
      })
      setTokens(res.data.access, res.data.refresh)
      setUser(res.data.user)
      toast.success("Compte créé avec succès ! Bienvenue 🎉")
      router.push("/dashboard")
    } catch (err: any) {
      const msg = err.response?.data?.email?.[0] || "Erreur lors de l'inscription."
      toast.error(msg)
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
          Créer un compte 🚀
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Commencez gratuitement, sans carte bancaire.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Nom */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nom complet
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
            <input
              type="text"
              placeholder="BEAVOGUI Kaliva"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400
                focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                ${errors.name ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
              {...register("name", { required: "Nom requis", minLength: { value: 2, message: "Minimum 2 caractères" } })}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500">⚠️ {errors.name.message}</p>}
        </div>

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
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400
                focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                ${errors.email ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
              {...register("email", {
                required: "Email requis",
                pattern: { value: /^\S+@\S+\.\S+$/, message: "Email invalide" }
              })}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500">⚠️ {errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Mot de passe
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
            <input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm outline-none transition
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400
                focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                ${errors.password ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
              {...register("password", {
                required: "Mot de passe requis",
                minLength: { value: 6, message: "Minimum 6 caractères" },
                onChange: (e) => setPassword(e.target.value)
              })}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPass ? "🙈" : "👁️"}
            </button>
          </div>

          {/* Indicateur force */}
          {password && (
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i <= (strength.score) ? strength.color : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">{strength.label}</p>
            </div>
          )}
          {errors.password && <p className="text-xs text-red-500">⚠️ {errors.password.message}</p>}
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border text-sm outline-none transition
                bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400
                focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                ${errors.confirm ? "border-red-400" : "border-gray-200 dark:border-gray-700"}`}
              {...register("confirm", {
                required: "Confirmation requise",
                validate: (v) => v === watch("password") || "Les mots de passe ne correspondent pas"
              })}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showConfirm ? "🙈" : "👁️"}
            </button>
          </div>
          {errors.confirm && <p className="text-xs text-red-500">⚠️ {errors.confirm.message}</p>}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            className="mt-0.5 w-4 h-4 accent-violet-600 cursor-pointer"
            {...register("terms", { required: "Veuillez accepter les conditions" })}
          />
          <label htmlFor="terms" className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
            J'accepte les{" "}
            <span className="text-violet-600 hover:underline cursor-pointer">conditions d'utilisation</span>
            {" "}et la{" "}
            <span className="text-violet-600 hover:underline cursor-pointer">politique de confidentialité</span>
          </label>
        </div>
        {errors.terms && <p className="text-xs text-red-500 -mt-2">⚠️ {errors.terms.message}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition shadow-lg shadow-violet-200 dark:shadow-violet-900 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Création en cours...
            </>
          ) : (
            "Créer mon compte gratuitement 🚀"
          )}
        </button>

        {/* Free badge */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
          <span>✅ 100% gratuit</span>
          <span>🔒 Données sécurisées</span>
          <span>🟠 Orange Money</span>
        </div>

      </form>

      {/* Footer */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-violet-600 font-semibold hover:underline">
          Se connecter
        </Link>
      </p>

      <div className="text-center mt-4">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition">
          ← Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}

