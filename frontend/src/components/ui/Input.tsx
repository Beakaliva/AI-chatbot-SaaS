import { InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-white
            placeholder:text-gray-400
            focus:ring-2 focus:ring-violet-500
            ${error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 dark:border-gray-700"
            }`}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }
)

Input.displayName = "Input"
export default Input