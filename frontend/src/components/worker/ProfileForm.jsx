// Purpose: Captures worker profile details with structured categories and pricing fields.
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { JOB_CATEGORY_GROUPS } from '../../utils/constants'

const Field = ({ label, icon, children, hint }) => (
  <div className="space-y-1.5">
    <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gray-500 dark:text-gray-400">
      <span className="text-amber-500">{icon}</span>
      {label}
    </label>
    {children}
    {hint && <p className="text-[11px] text-gray-400 dark:text-gray-500">{hint}</p>}
  </div>
)

const inputCls = (focused) =>
  `w-full rounded-xl px-4 py-3 text-sm font-medium
  bg-white/60 dark:bg-white/5
  border-2 transition-all duration-300 outline-none
  text-gray-900 dark:text-gray-100
  placeholder:text-gray-400 dark:placeholder:text-gray-500
  ${focused
    ? 'border-amber-400 dark:border-amber-400 shadow-[0_0_0_4px_rgba(251,191,36,0.1)]'
    : 'border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20'
  }`

const ProfileForm = ({ initialData, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    skills: initialData?.skills?.join(', ') || '',
    category: initialData?.category || '',
    customCategory: initialData?.customCategory || '',
    experience: initialData?.experience || '',
    hourlyRate: initialData?.hourlyRate || '',
    dailyRate: initialData?.dailyRate || '',
    description: initialData?.description || '',
    location: initialData?.location || '',
    ...initialData,
  })
  const [focused, setFocused] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      skills: formData.skills.split(',').map((s) => s.trim()).filter(Boolean),
    })
  }

  const focus = (name) => setFocused(name)
  const blur = () => setFocused(null)

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }}>
        <Field
          label="Skills"
          hint="Separate each skill with a comma"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          }
        >
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            onFocus={() => focus('skills')}
            onBlur={blur}
            placeholder="e.g., Plumbing, Carpentry, Electrical"
            className={inputCls(focused === 'skills')}
            required
          />
        </Field>
      </motion.div>

      {/* Category */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Field
          label="Work Category"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        >
          <div className="relative">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              onFocus={() => focus('category')}
              onBlur={blur}
              className={inputCls(focused === 'category') + ' appearance-none cursor-pointer pr-10'}
              required
            >
              <option value="">Select your work category</option>
              {JOB_CATEGORY_GROUPS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </Field>
      </motion.div>

      {/* Custom Category */}
      <AnimatePresence>
        {formData.category === 'Other' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Field
              label="Custom Category"
              icon={
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            >
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                onFocus={() => focus('customCategory')}
                onBlur={blur}
                placeholder="Describe your work category"
                className={inputCls(focused === 'customCategory')}
                required
              />
            </Field>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experience */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
        <Field
          label="Years of Experience"
          hint="Total years working in this field"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        >
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            onFocus={() => focus('experience')}
            onBlur={blur}
            min="0"
            max="50"
            placeholder="e.g., 5"
            className={inputCls(focused === 'experience')}
            required
          />
        </Field>
      </motion.div>

      {/* Rates */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Hourly Rate (₹)"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          >
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-500">₹</span>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                onFocus={() => focus('hourlyRate')}
                onBlur={blur}
                min="0"
                placeholder="0"
                className={inputCls(focused === 'hourlyRate') + ' pl-8'}
                required
              />
            </div>
          </Field>

          <Field
            label="Daily Rate (₹)"
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
          >
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-amber-500">₹</span>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                onFocus={() => focus('dailyRate')}
                onBlur={blur}
                min="0"
                placeholder="0"
                className={inputCls(focused === 'dailyRate') + ' pl-8'}
                required
              />
            </div>
          </Field>
        </div>
      </motion.div>

      {/* Location */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Field
          label="Location"
          hint="City or area where you work"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        >
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onFocus={() => focus('location')}
              onBlur={blur}
              placeholder="e.g., Amritsar, Punjab"
              className={inputCls(focused === 'location')}
              required
            />
          </div>
        </Field>
      </motion.div>

      {/* About Me */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
        <Field
          label="About Me"
          hint="Tell hirers about your experience and what makes you reliable"
          icon={
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        >
          <div className="relative">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onFocus={() => focus('description')}
              onBlur={blur}
              rows={4}
              placeholder="Describe your experience, work ethic, and the kind of jobs you're best at..."
              className={inputCls(focused === 'description') + ' resize-none leading-relaxed'}
              required
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-gray-300 dark:text-gray-600 font-mono">
              {formData.description.length} chars
            </div>
          </div>
        </Field>
      </motion.div>

      {/* Submit */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="w-full relative overflow-hidden rounded-xl py-3.5 font-semibold text-sm tracking-wide text-white
            bg-gradient-to-r from-amber-500 to-orange-500
            hover:from-amber-400 hover:to-orange-400
            disabled:opacity-60 disabled:cursor-not-allowed
            shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40
            transition-all duration-300"
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.span
                key="saving"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-center gap-2"
              >
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving profile...
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Profile
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </form>
  )
}

export default ProfileForm