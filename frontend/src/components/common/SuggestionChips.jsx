// Purpose: Reusable single-select suggestion chips with an optional custom-input escape hatch.
// Reduces typing by letting users tap a common option, while still allowing a free-text value.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const OTHER = 'Other'

// Accepts options as plain strings or { value, label } objects.
const normalize = (opt) =>
  typeof opt === 'string' ? { value: opt, label: opt } : opt

const SuggestionChips = ({
  options = [],
  value = '',
  onChange,
  allowCustom = true,
  customPlaceholder = 'Type your own…',
  name,
}) => {
  const items = options.map(normalize)
  // A value that isn't one of the preset options (and isn't empty) is a custom entry.
  const isCustomValue = Boolean(value) && !items.some((o) => o.value === value)
  const [showCustom, setShowCustom] = useState(isCustomValue)

  const selectChip = (option) => {
    // "Other" only opens a free-text field when custom input is permitted;
    // otherwise it is treated as a normal selectable value.
    if (option === OTHER && allowCustom) {
      setShowCustom(true)
      onChange('')
      return
    }
    setShowCustom(false)
    onChange(option)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={name}>
        {items.map(({ value: optValue, label }) => {
          const isOther = optValue === OTHER && allowCustom
          const active = isOther
            ? showCustom || isCustomValue
            : value === optValue
          return (
            <motion.button
              key={optValue}
              type="button"
              whileTap={{ scale: 0.95 }}
              aria-pressed={active}
              onClick={() => selectChip(optValue)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                active
                  ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] border-transparent text-white shadow-sm'
                  : 'bg-[#faf7f2] dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a]'
              }`}
            >
              {label}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence initial={false}>
        {allowCustom && (showCustom || isCustomValue) && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <input
              type="text"
              autoFocus
              value={isCustomValue ? value : ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={customPlaceholder}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-gray-800 dark:text-gray-100 placeholder:text-[#b8a898] dark:placeholder:text-gray-600 outline-none focus:border-[#c8933a] focus:shadow-[0_0_0_3px_rgba(200,147,58,0.15)] transition-all duration-200"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SuggestionChips
