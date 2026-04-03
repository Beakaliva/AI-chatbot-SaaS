"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

const features = [
  {
    icon: "🤖",
    title: "4 modèles IA",
    desc: "Claude, GPT-4o, Gemini et LLaMA 3 (Groq). Choisissez le meilleur modèle pour chaque bot.",
    color: "#8b5cf6",
  },
  {
    icon: "📄",
    title: "Base de connaissances",
    desc: "Uploadez vos PDFs, FAQ et pages web. Votre bot répond avec vos propres données.",
    color: "#06b6d4",
  },
  {
    icon: "🔌",
    title: "Widget embarquable",
    desc: "Une ligne de code suffit. Intégrez votre chatbot sur n'importe quel site.",
    color: "#10b981",
  },
  {
    icon: "📊",
    title: "Analytics complets",
    desc: "Conversations, messages, satisfaction. Tout en temps réel sur votre dashboard.",
    color: "#f59e0b",
  },
  {
    icon: "📑",
    title: "Export PDF & Word",
    desc: "Téléchargez vos conversations en PDF ou Word en un clic depuis votre dashboard.",
    color: "#3b82f6",
  },
  {
    icon: "🌍",
    title: "Multilingue",
    desc: "Français, Anglais, Soussou, Pular, Malinké. Parlez la langue de vos clients.",
    color: "#ef4444",
  },
  {
    icon: "💳",
    title: "Paiements africains",
    desc: "Orange Money, PayDunya et CinetPay. Payez en GNF directement depuis votre téléphone.",
    color: "#f97316",
  },
  {
    icon: "🔒",
    title: "Sécurisé & fiable",
    desc: "Authentification JWT, données chiffrées, hébergement sécurisé. Votre vie privée protégée.",
    color: "#64748b",
  },
]

const plans = [
  {
    name: "Free",
    price: "0",
    currency: "$",
    desc: "Pour tester",
    features: ["1 chatbot", "100 messages/mois", "Widget embarquable"],
    cta: "Commencer gratuitement",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: "9.99",
    currency: "$",
    desc: "Pour les pros",
    features: ["5 chatbots", "Messages illimités", "Analytics complets", "Support email"],
    cta: "Choisir Pro",
    href: "/register",
    highlight: true,
  },
  {
    name: "Business",
    price: "29.99",
    currency: "$",
    desc: "Pour les entreprises",
    features: ["Bots illimités", "API complète", "Support 24/7", "Onboarding personnalisé"],
    cta: "Choisir Business",
    href: "/register",
    highlight: false,
  },
]

const stats = [
  { value: "10K+", label: "Messages traités" },
  { value: "500+", label: "Bots créés" },
  { value: "99.9%", label: "Disponibilité" },
  { value: "4.9★", label: "Satisfaction" },
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [dark, setDark]         = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark")
    setDark(!dark)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white overflow-x-hidden">

      {/* ─── Navbar ─────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800"
          : "bg-transparent"
      }`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🤖</span>
            </div>
            <span className="text-xl font-bold text-violet-600">ChatFlow</span>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#features" className="hover:text-violet-600 transition">Fonctionnalités</a>
            <a href="#pricing"  className="hover:text-violet-600 transition">Tarifs</a>
            <a href="#faq"      className="hover:text-violet-600 transition">FAQ</a>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {dark ? "☀️" : "🌙"}
            </button>
            <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-violet-600 transition">
              Connexion
            </Link>
            <Link href="/register" className="bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium px-4 py-2 rounded-xl transition shadow">
              Commencer gratuitement →
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">

        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-400/20 dark:bg-violet-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/20 dark:bg-cyan-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-400/10 dark:bg-pink-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-950 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            Conçu pour la Guinée 🇬🇳 et l'Afrique
          </div>

          {/* Titre */}
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Créez des{" "}
            <span className="bg-gradient-to-r from-violet-600 to-cyan-500 bg-clip-text text-transparent">
              chatbots IA
            </span>
            <br />en quelques minutes
          </h1>

          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Intégrez un assistant intelligent sur votre site web.
            Alimentez-le avec vos documents. Payez en GNF avec Orange Money.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-violet-600 hover:bg-violet-700 text-white font-semibold px-8 py-4 rounded-2xl text-lg transition shadow-xl shadow-violet-200 dark:shadow-violet-900"
            >
              Commencer gratuitement 🚀
            </Link>
            <Link
              href="/login"
              className="border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-violet-400 font-medium px-8 py-4 rounded-2xl text-lg transition"
            >
              Voir la démo →
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-sm text-gray-400">
            ✅ Gratuit pour commencer · Pas de carte bancaire · Orange Money accepté
          </p>

          {/* Widget preview */}
          <div className="mt-16 relative max-w-sm mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              {/* Header */}
              <div className="bg-violet-600 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">🤖</div>
                <div>
                  <p className="text-white text-sm font-semibold">Assistant ChatFlow</p>
                  <p className="text-violet-200 text-xs">En ligne · Claude AI</p>
                </div>
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
              </div>
              {/* Messages */}
              <div className="p-4 flex flex-col gap-3 bg-gray-50 dark:bg-gray-950 min-h-32">
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-sm max-w-xs">
                    Bonjour ! Comment puis-je vous aider ? 👋
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-violet-600 rounded-2xl rounded-tr-none px-4 py-2 text-sm text-white max-w-xs">
                    Quels sont vos tarifs ?
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 text-sm text-gray-700 dark:text-gray-300 shadow-sm max-w-xs">
                    Nous avons 3 plans : Free, Pro à 9.99$/mois et Business à 29.99$/mois. 😊
                  </div>
                </div>
              </div>
              {/* Input */}
              <div className="p-3 flex gap-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm text-gray-400">
                  Écrivez un message...
                </div>
                <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center text-white text-xs">➤</div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              LIVE ✓
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────── */}
      <section className="py-16 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold text-violet-600 mb-1">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-6xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
              Une plateforme complète pour créer, déployer et analyser vos chatbots IA.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: f.color + "20" }}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comment ça marche ──────────────────────────── */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              En 3 étapes simples, votre chatbot est en ligne.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Créez votre bot", desc: "Donnez-lui un nom, choisissez l'IA et rédigez ses instructions.", icon: "🤖" },
              { step: "02", title: "Enrichissez-le", desc: "Uploadez vos PDFs, FAQ et documents. Il apprend de vos données.", icon: "📄" },
              { step: "03", title: "Déployez-le", desc: "Copiez une ligne de code et intégrez-le sur votre site en 30 secondes.", icon: "🚀" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-violet-600 font-mono text-sm font-bold mb-2">{item.step}</div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Des tarifs simples et transparents</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Commencez gratuitement. Payez en USD ou en GNF avec Orange Money 🟠
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 flex flex-col gap-5 ${
                  plan.highlight
                    ? "bg-violet-600 text-white ring-4 ring-violet-200 dark:ring-violet-900 scale-105"
                    : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                      ⭐ Populaire
                    </span>
                  </div>
                )}

                <div>
                  <h3 className={`text-xl font-bold ${plan.highlight ? "text-white" : ""}`}>{plan.name}</h3>
                  <p className={`text-sm ${plan.highlight ? "text-violet-200" : "text-gray-500"}`}>{plan.desc}</p>
                </div>

                <div className="flex items-end gap-1">
                  <span className={`text-4xl font-bold ${plan.highlight ? "text-white" : ""}`}>
                    {plan.price === "0" ? "Gratuit" : `${plan.currency}${plan.price}`}
                  </span>
                  {plan.price !== "0" && (
                    <span className={`text-sm mb-1 ${plan.highlight ? "text-violet-200" : "text-gray-400"}`}>/mois</span>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm">
                      <span className={plan.highlight ? "text-violet-200" : "text-green-500"}>✓</span>
                      <span className={plan.highlight ? "text-violet-100" : "text-gray-600 dark:text-gray-400"}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.href}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition ${
                    plan.highlight
                      ? "bg-white text-violet-600 hover:bg-violet-50"
                      : "bg-violet-600 hover:bg-violet-700 text-white"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-6">

          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Questions fréquentes</h2>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { q: "Puis-je utiliser ChatFlow sans carte bancaire ?", a: "Oui ! Le plan Free est disponible sans carte. Pour les plans payants, vous pouvez payer avec Orange Money en GNF." },
              { q: "Orange Money est-il disponible en Guinée ?", a: "Oui, ChatFlow accepte Orange Money Guinea. Vous pouvez payer en Francs Guinéens (GNF) directement depuis votre téléphone." },
              { q: "Comment intégrer le chatbot sur mon site ?", a: "Copiez simplement la balise script depuis votre dashboard et collez-la dans le body de votre site. C'est tout !" },
              { q: "Mes données sont-elles sécurisées ?", a: "Oui. Toutes les données sont chiffrées et hébergées de façon sécurisée. Nous ne vendons jamais vos données." },
              { q: "Puis-je changer de plan à tout moment ?", a: "Absolument. Upgradez ou downgradez votre plan à tout moment depuis votre dashboard." },
            ].map((item) => (
              <div key={item.q} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">❓ {item.q}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ──────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">
              Prêt à créer votre premier chatbot ?
            </h2>
            <p className="text-violet-200 text-lg mb-8">
              Rejoignez des centaines d'entreprises qui font confiance à ChatFlow.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-violet-600 hover:bg-violet-50 font-bold px-8 py-4 rounded-2xl text-lg transition shadow-xl"
            >
              Commencer gratuitement → 🚀
            </Link>
            <p className="mt-4 text-violet-300 text-sm">
              Aucune carte bancaire requise · Orange Money accepté 🟠
            </p>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────── */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs">🤖</span>
            </div>
            <span className="font-bold text-violet-600">ChatFlow</span>
            <span className="text-gray-400 text-sm ml-2">© 2026 — Fait avec ❤️ depuis Conakry 🇬🇳</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
            <Link href="/login"    className="hover:text-violet-600 transition">Connexion</Link>
            <Link href="/register" className="hover:text-violet-600 transition">S'inscrire</Link>
            <a href="#features"    className="hover:text-violet-600 transition">Fonctionnalités</a>
            <a href="#pricing"     className="hover:text-violet-600 transition">Tarifs</a>
          </div>
        </div>
      </footer>

    </div>
  )
}