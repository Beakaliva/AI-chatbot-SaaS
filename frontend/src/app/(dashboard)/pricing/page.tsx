"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/layout/Navbar"
import { useAuthStore } from "@/store/authStore"
import api from "@/lib/api"
import toast from "react-hot-toast"

const plans = [
  {
    key:         "free",
    name:        "Free",
    price_usd:   0,
    price_gnf:   0,
    color:       "gray",
    icon:        "🆓",
    description: "Parfait pour tester",
    features: [
      "1 chatbot",
      "Modèle Claude ou GPT",
      "100 messages / mois",
      "Upload PDF (1 doc)",
      "Widget embarquable",
    ],
    limits: [
      "Pas d'analytics avancés",
      "Pas de support prioritaire",
    ]
  },
  {
    key:         "pro",
    name:        "Pro",
    price_usd:   9.99,
    price_gnf:   85000,
    color:       "violet",
    icon:        "⚡",
    description: "Pour les professionnels",
    popular:     true,
    features: [
      "5 chatbots",
      "Claude + GPT au choix",
      "Messages illimités",
      "Upload PDF illimité",
      "Analytics complets",
      "Widget personnalisé",
      "Support email",
    ],
    limits: []
  },
  {
    key:         "business",
    name:        "Business",
    price_usd:   29.99,
    price_gnf:   255000,
    color:       "amber",
    icon:        "🏆",
    description: "Pour les entreprises",
    features: [
      "Bots illimités",
      "Claude + GPT au choix",
      "Messages illimités",
      "Upload PDF illimité",
      "Analytics avancés",
      "Widget personnalisé",
      "API publique complète",
      "Support prioritaire 24/7",
      "Onboarding personnalisé",
    ],
    limits: []
  },
]

export default function PricingPage() {
  const router  = useRouter()
  const user    = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const [currency, setCurrency]   = useState<"usd" | "gnf">("usd")
  const [provider, setProvider]   = useState<"stripe" | "orange">("stripe")
  const [loading, setLoading]     = useState<string | null>(null)
  const [phone, setPhone]         = useState("")
  const [showPhone, setShowPhone] = useState<string | null>(null)

  // ✅ Paiement Stripe
  const handleStripe = async (plan: string) => {
    setLoading(plan)
    try {
      const res = await api.post("/payments/stripe/checkout/", { plan })
      window.location.href = res.data.checkout_url
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur Stripe.")
    } finally {
      setLoading(null)
    }
  }

  // ✅ Init Orange Money
  const handleOrangeMoney = async (plan: string) => {
    if (!phone.trim()) {
      toast.error("Entrez votre numéro Orange Money.")
      return
    }
    setLoading(plan)
    try {
      const res = await api.post("/payments/orange/init/", { plan, phone })
      toast.success("Instructions de paiement envoyées ! 📱")
      console.log(res.data)
      setShowPhone(null)
      setPhone("")
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur Orange Money.")
    } finally {
      setLoading(null)
    }
  }

  const handleSubscribe = (plan: string) => {
    if (plan === "free") return
    if (provider === "stripe") {
      handleStripe(plan)
    } else {
      setShowPhone(plan)
    }
  }

  const colorStyles: Record<string, string> = {
    gray:   "border-gray-200 dark:border-gray-700",
    violet: "border-violet-500 ring-2 ring-violet-500",
    amber:  "border-amber-400 ring-2 ring-amber-400",
  }

  const btnStyles: Record<string, string> = {
    gray:   "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200",
    violet: "bg-violet-600 hover:bg-violet-700 text-white shadow",
    amber:  "bg-amber-500 hover:bg-amber-600 text-white shadow",
  }

  return (
    <div className="flex flex-col flex-1">
      <Navbar title="Pricing" />

      <div className="p-6 flex flex-col gap-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Choisissez votre plan
          </h2>
          <p className="text-gray-500 mt-2">
            Commencez gratuitement, évoluez quand vous voulez.
          </p>

          {/* Plan actuel */}
          {user?.plan && (
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 rounded-full text-sm text-violet-700 dark:text-violet-300 font-medium">
              ✅ Plan actuel : <strong>{user.plan.toUpperCase()}</strong>
            </div>
          )}
        </div>

        {/* Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">

          {/* Devise */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setCurrency("usd")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currency === "usd"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
                  : "text-gray-500"
              }`}
            >
              💵 USD
            </button>
            <button
              onClick={() => setCurrency("gnf")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                currency === "gnf"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
                  : "text-gray-500"
              }`}
            >
              🇬🇳 GNF
            </button>
          </div>

          {/* Provider */}
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setProvider("stripe")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                provider === "stripe"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
                  : "text-gray-500"
              }`}
            >
              💳 Carte (Stripe)
            </button>
            <button
              onClick={() => setProvider("orange")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                provider === "orange"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow"
                  : "text-gray-500"
              }`}
            >
              🟠 Orange Money
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {plans.map((plan) => {
            const isCurrent = user?.plan === plan.key
            const price     = currency === "usd" ? plan.price_usd : plan.price_gnf
            const currency_ = currency === "usd" ? "$" : "GNF"

            return (
              <div
                key={plan.key}
                className={`relative bg-white dark:bg-gray-900 rounded-2xl border p-6 flex flex-col gap-5 ${colorStyles[plan.color]}`}
              >
                {/* Badge populaire */}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                      ⭐ Le plus populaire
                    </span>
                  </div>
                )}

                {/* Header plan */}
                <div>
                  <div className="text-3xl mb-2">{plan.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                </div>

                {/* Prix */}
                <div>
                  {price === 0 ? (
                    <p className="text-4xl font-bold text-gray-900 dark:text-white">
                      Gratuit
                    </p>
                  ) : (
                    <div className="flex items-end gap-1">
                      <p className="text-4xl font-bold text-gray-900 dark:text-white">
                        {currency === "usd"
                          ? `$${price}`
                          : `${price.toLocaleString("fr-FR")} GNF`
                        }
                      </p>
                      <span className="text-gray-400 mb-1 text-sm">/mois</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="flex flex-col gap-2 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-green-500 font-bold">✓</span>
                      {f}
                    </div>
                  ))}
                  {plan.limits.map((l) => (
                    <div key={l} className="flex items-center gap-2 text-sm text-gray-400">
                      <span className="font-bold">✗</span>
                      {l}
                    </div>
                  ))}
                </div>

                {/* Bouton */}
                <button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={isCurrent || loading === plan.key || plan.key === "free"}
                  className={`w-full py-3 rounded-xl font-medium text-sm transition disabled:opacity-60 disabled:cursor-not-allowed ${btnStyles[plan.color]}`}
                >
                  {isCurrent
                    ? "✅ Plan actuel"
                    : loading === plan.key
                    ? "⏳ Traitement..."
                    : plan.key === "free"
                    ? "Plan gratuit"
                    : provider === "stripe"
                    ? "💳 Payer avec Stripe"
                    : "🟠 Payer avec Orange Money"
                  }
                </button>

                {/* Orange Money phone input */}
                {showPhone === plan.key && (
                  <div className="flex flex-col gap-2 mt-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Ex: 622000000"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button
                      onClick={() => handleOrangeMoney(plan.key)}
                      disabled={loading === plan.key}
                      className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition"
                    >
                      {loading === plan.key ? "⏳ Traitement..." : "Confirmer le paiement"}
                    </button>
                    <button
                      onClick={() => setShowPhone(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 text-center"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto w-full">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
            Questions fréquentes
          </h3>
          <div className="flex flex-col gap-3">
            {[
              {
                q: "Puis-je changer de plan à tout moment ?",
                a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment."
              },
              {
                q: "Orange Money est-il disponible en Guinée ?",
                a: "Oui ! Orange Money Guinée est disponible et facturé en GNF."
              },
              {
                q: "Mes données sont-elles sécurisées ?",
                a: "Oui, toutes les données sont chiffrées et hébergées de façon sécurisée."
              },
              {
                q: "Y a-t-il une période d'essai ?",
                a: "Le plan Free est disponible sans limite de temps. Pas besoin de carte bancaire."
              },
            ].map((item) => (
              <div
                key={item.q}
                className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4"
              >
                <p className="font-medium text-gray-900 dark:text-white text-sm">❓ {item.q}</p>
                <p className="text-gray-500 text-sm mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
