// Purpose: Text input with filtered city suggestions so users pick a location instead of typing it fully.
// Free text is always allowed; suggestions are a convenience, not a constraint.
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { INDIAN_CITIES } from '../../utils/constants'

const LocationAutocomplete = ({
  value = '',
  onChange,
  placeholder = 'City or area…',
  className = '',
  inputClassName,
  cities = INDIAN_CITIES,
  maxSuggestions = 6,
  icon = true,
}) => {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const wrapRef = useRef(null)

  const query = value.trim().toLowerCase()
  const suggestions = query
    ? cities
        .filter((c) => c.toLowerCase().includes(query) && c.toLowerCase() !== query)
        .slice(0, maxSuggestions)
    : []

  // Close the dropdown when clicking outside.
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  const pick = (city) => {
    onChange(city)
    setOpen(false)
    setActive(-1)
  }

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault()
      pick(suggestions[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const defaultInput = `w-full rounded-2xl px-4 ${icon ? 'pl-11' : ''} py-3.5 text-sm font-medium bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] dark:placeholder:text-gray-600 outline-none focus:border-[#c8933a] focus:shadow-[0_0_0_3px_rgba(200,147,58,0.15)] transition-all duration-200`

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      {icon && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#c8933a]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        aria-autocomplete="list"
        className={inputClassName || defaultInput}
      />

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-30 left-0 right-0 mt-2 py-1.5 rounded-2xl bg-white dark:bg-[#1a1712] border border-[#e8dfd0] dark:border-white/10 shadow-xl shadow-black/5 overflow-hidden max-h-64 overflow-y-auto"
          >
            {suggestions.map((city, i) => (
              <li key={city}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); pick(city) }}
                  onMouseEnter={() => setActive(i)}
                  className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors duration-150 ${
                    i === active
                      ? 'bg-[#c8933a]/10 text-[#c8933a]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-[#faf7f2] dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {city}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LocationAutocomplete
