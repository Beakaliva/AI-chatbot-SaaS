interface BadgeProps {
  label: string
  color?: "violet" | "green" | "amber" | "gray" | "red"
}

export default function Badge({ label, color = "gray" }: BadgeProps) {
  const colors = {
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300",
    green:  "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    amber:  "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    gray:   "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    red:    "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300",
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${colors[color]}`}>
      {label}
    </span>
  )
}