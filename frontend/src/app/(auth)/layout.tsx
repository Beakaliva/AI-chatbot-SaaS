export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">

      {/* Gauche — Visuel */}
      <div className="hidden lg:flex flex-col justify-between bg-violet-600 p-12 relative overflow-hidden">

        {/* Blobs décoratifs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-violet-500/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/40 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <span className="text-white text-2xl font-bold">ChatFlow</span>
        </div>

        {/* Contenu central */}
        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Créez des chatbots IA<br />
            <span className="text-violet-200">en quelques minutes</span>
          </h2>

          {/* Témoignages */}
          <div className="flex flex-col gap-4">
            {[
              { text: "ChatFlow a transformé notre service client. Nos clients adorent !", author: "Mamadou D.", role: "CEO, BoutiqueGN" },
              { text: "Simple, rapide et Orange Money accepté. Parfait pour la Guinée !", author: "Fatoumata B.", role: "Directrice, EduGN" },
            ].map((t) => (
              <div key={t.author} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <p className="text-violet-100 text-sm italic mb-3">"{t.text}"</p>
                <div>
                  <p className="text-white text-sm font-semibold">{t.author}</p>
                  <p className="text-violet-300 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative grid grid-cols-3 gap-4">
          {[
            { value: "500+", label: "Bots créés" },
            { value: "10K+", label: "Messages" },
            { value: "99.9%", label: "Disponibilité" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-violet-300 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Droite — Formulaire */}
      <div className="flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
        {children}
      </div>

    </div>
  )
}