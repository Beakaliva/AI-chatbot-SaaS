interface StatsCardProps {
  label: string
  value: string | number
  icon: string
  color?: string
  sub?: string
}

export default function StatsCard({ label, value, icon, color = "violet", sub }: StatsCardProps) {
  const colors: Record<string, string> = {
    violet: "bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300",
    blue:   "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    green:  "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
    amber:  "bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-300",
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}