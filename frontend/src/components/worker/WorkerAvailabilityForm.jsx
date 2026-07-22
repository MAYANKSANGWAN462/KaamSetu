// frontend/src/components/worker/WorkerAvailabilityForm.jsx
// Form for worker to post their availability — saves to WorkerProfile
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CreatableSelect from 'react-select/creatable'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { JOB_CATEGORY_GROUPS } from '../../utils/constants'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const SKILL_OPTIONS = [
  'Welding','Plumbing','Electrical wiring','Carpentry','Painting',
  'Masonry','Scaffolding','Driving','Cooking','Cleaning',
  'Loading/Unloading','Security','Tailoring','Farming','Mechanic',
  'Tiling','Plastering','AC Repair','Gardening','Data Entry',
].map(s => ({ value: s.toLowerCase(), label: s }))

const baseInput = `w-full px-4 py-3 rounded-xl border border-[#e8dfd0] dark:border-white/10
  bg-[#faf7f2] dark:bg-white/[0.06] text-gray-800 dark:text-gray-100 text-sm
  placeholder-gray-400 dark:placeholder-gray-600
  focus:outline-none focus:ring-2 focus:ring-[#c8933a]/30 focus:border-[#c8933a]
  transition-all duration-200`

const Label = ({ children, hint }) => (
  <div className="mb-2">
    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{children}</p>
    {hint && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>}
  </div>
)

const WorkerAvailabilityForm = ({ existingProfile, onSuccess, onCancel }) => {
  const { user } = useAuth()

  const [form, setForm] = useState({
    category:          existingProfile?.category || '',
    bio:               existingProfile?.bio || '',
    yearsOfExperience: existingProfile?.yearsOfExperience || 0,
    wageAmount:        existingProfile?.wage?.amount || 0,
    wageUnit:          existingProfile?.wage?.unit || 'daily',
    locationAddress:   existingProfile?.location?.address || '',
    availabilityDays:  existingProfile?.availability?.days || [],
    availabilityNote:  existingProfile?.availability?.note || '',
    isAvailable:       existingProfile?.isAvailable ?? true,
    skills: (existingProfile?.skills || []).map(s => ({ value: s.toLowerCase(), label: s })),
  })
  const [saving, setSaving] = useState(false)

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const toggleDay = (day) => {
    set('availabilityDays',
      form.availabilityDays.includes(day)
        ? form.availabilityDays.filter(d => d !== day)
        : [...form.availabilityDays, day]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.category) { toast.error('Please select a work category'); return }
    if (!form.locationAddress.trim()) { toast.error('Please enter your location'); return }
    if (form.wageAmount <= 0) { toast.error('Please enter your expected wage'); return }

    setSaving(true)
    try {
      const payload = {
        category:          form.category,
        bio:               form.bio,
        yearsOfExperience: Number(form.yearsOfExperience),
        wage:              { amount: Number(form.wageAmount), unit: form.wageUnit },
        location:          { address: form.locationAddress },
        availabilityDays:  form.availabilityDays,
        availabilityNote:  form.availabilityNote,
        isAvailable:       form.isAvailable,
        skills:            form.skills.map(s => s.label),
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/workers/profile`,
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
      toast.success('Your availability post is live!')
      onSuccess?.()
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#e8dfd0] dark:border-white/8 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a]">Worker Post</p>
          <h2 className="text-lg font-black text-gray-900 dark:text-white mt-0.5">Post Your Availability</h2>
        </div>
        <button onClick={onCancel}
          className="w-8 h-8 rounded-xl border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center text-[#9c8a78] hover:text-[#c8933a] hover:border-[#c8933a]/40 transition-all duration-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">

        {/* ── SECTION 1: What you do ── */}
        <div className="space-y-4 p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">What You Do</p>

          {/* Category */}
          <div>
            <Label>Work Category</Label>
            <select
              value={form.category}
              onChange={e => set('category', e.target.value)}
              className={`${baseInput} cursor-pointer`}
              required
            >
              <option value="">Select your type of work…</option>
              {JOB_CATEGORY_GROUPS.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Skills */}
          <div>
            <Label hint="Type a skill and press Enter, or pick from suggestions">Your Skills</Label>
            <CreatableSelect
              isMulti isClearable
              placeholder="e.g. welding, scaffolding…"
              value={form.skills}
              onChange={val => set('skills', val || [])}
              options={SKILL_OPTIONS}
              styles={{
                control: (base, state) => ({
                  ...base, borderRadius: '0.75rem',
                  borderColor: state.isFocused ? '#c8933a' : '#e8dfd0',
                  boxShadow: state.isFocused ? '0 0 0 3px rgba(200,147,58,0.15)' : 'none',
                  backgroundColor: 'transparent', padding: '2px 4px', fontSize: '0.875rem',
                  '&:hover': { borderColor: '#c8933a' },
                }),
                multiValue: base => ({ ...base, backgroundColor: 'rgba(200,147,58,0.12)', borderRadius: '0.5rem', border: '1px solid rgba(200,147,58,0.3)' }),
                multiValueLabel: base => ({ ...base, color: '#c8933a', fontWeight: '600', fontSize: '0.75rem' }),
                multiValueRemove: base => ({ ...base, color: '#c8933a', borderRadius: '0 0.5rem 0.5rem 0', '&:hover': { backgroundColor: 'rgba(200,147,58,0.2)', color: '#b86e2a' } }),
                menu: base => ({ ...base, borderRadius: '0.75rem', border: '1px solid #e8dfd0', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }),
                option: (base, state) => ({ ...base, fontSize: '0.875rem', backgroundColor: state.isSelected ? 'rgba(200,147,58,0.15)' : state.isFocused ? 'rgba(200,147,58,0.07)' : 'transparent', color: state.isSelected ? '#b86e2a' : 'inherit' }),
                placeholder: base => ({ ...base, color: '#9c8a78', fontSize: '0.875rem' }),
                input: base => ({ ...base, fontSize: '0.875rem' }),
              }}
            />
          </div>

          {/* Years of experience */}
          <div>
            <Label>Years of Experience</Label>
            <div className="flex items-center gap-4">
              <input
                type="range" min="0" max="30" step="1"
                value={form.yearsOfExperience}
                onChange={e => set('yearsOfExperience', e.target.value)}
                className="flex-1 h-2 rounded-full accent-amber-600 cursor-pointer"
              />
              <div className="w-16 flex-shrink-0">
                <div className="px-3 py-2 rounded-xl border border-[#e8dfd0] dark:border-white/10 bg-[#faf7f2] dark:bg-white/[0.06] text-center">
                  <span className="text-sm font-black text-[#c8933a]">{form.yearsOfExperience}</span>
                  <span className="text-[10px] text-[#9c8a78] block">yrs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <Label hint="Tell hirers about your experience, work style, or past projects (max 500 chars)">Short Bio</Label>
            <textarea
              rows={3}
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
              maxLength={500}
              placeholder="e.g. Experienced electrician with 8 years in residential and commercial wiring. Reliable, punctual, and safety-conscious…"
              className={`${baseInput} resize-none leading-relaxed`}
            />
            <p className="text-right text-[10px] text-gray-400 mt-1">{form.bio.length}/500</p>
          </div>
        </div>

        {/* ── SECTION 2: Wage ── */}
        <div className="p-5 rounded-2xl bg-amber-50/40 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/40">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#c8933a] mb-4">💰 Expected Wage</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label>Amount (₹)</Label>
              <input
                type="number" min="0" step="50"
                value={form.wageAmount}
                onChange={e => set('wageAmount', e.target.value)}
                className={baseInput}
                placeholder="e.g. 700"
                required
              />
            </div>
            <div className="w-36 flex-shrink-0">
              <Label>Per</Label>
              <select
                value={form.wageUnit}
                onChange={e => set('wageUnit', e.target.value)}
                className={`${baseInput} cursor-pointer`}
              >
                <option value="hourly">Hour</option>
                <option value="daily">Day</option>
                <option value="job">Job</option>
              </select>
            </div>
          </div>
          {form.wageAmount > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <span className="text-emerald-500 text-sm">✓</span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                ₹{Number(form.wageAmount).toLocaleString('en-IN')} / {form.wageUnit === 'hourly' ? 'hour' : form.wageUnit === 'daily' ? 'day' : 'job'}
              </span>
            </div>
          )}
        </div>

        {/* ── SECTION 3: Availability ── */}
        <div className="p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">📅 Availability</p>

          {/* Available toggle */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-white dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/8">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Currently Available</p>
              <p className="text-xs text-[#9c8a78]">Hirers can see and contact you</p>
            </div>
            <button
              type="button"
              onClick={() => set('isAvailable', !form.isAvailable)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
                form.isAvailable ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                form.isAvailable ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Days */}
          <div className="mb-4">
            <Label hint="Select all days you are available to work">Available Days</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 ${
                    form.availabilityDays.includes(day)
                      ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white border-transparent shadow-sm'
                      : 'bg-white dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/10 text-gray-600 dark:text-gray-400 hover:border-[#c8933a]/50'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Availability note */}
          <div>
            <Label hint="Any specific timing, notice period, or conditions">Additional Note (optional)</Label>
            <input
              type="text"
              value={form.availabilityNote}
              onChange={e => set('availabilityNote', e.target.value)}
              maxLength={200}
              placeholder="e.g. Available from next week, need 1 day notice"
              className={baseInput}
            />
          </div>
        </div>

        {/* ── SECTION 4: Location ── */}
        <div className="p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">📍 Your Location</p>
          <Label hint="City or area where you can work">Location / City</Label>
          <input
            type="text"
            value={form.locationAddress}
            onChange={e => set('locationAddress', e.target.value)}
            placeholder="e.g. Ludhiana, Punjab"
            className={baseInput}
            required
          />
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl border border-[#e8dfd0] dark:border-white/10 text-sm font-bold text-[#9c8a78] hover:border-[#c8933a]/40 hover:text-[#c8933a] transition-all duration-200"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.01 }}
            whileTap={{ scale: saving ? 1 : 0.98 }}
            className="flex-[2] py-3.5 rounded-2xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white text-sm font-bold shadow-lg shadow-[#c8833a]/25 hover:shadow-xl hover:shadow-[#c8833a]/40 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Posting…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Post My Availability
              </span>
            )}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default WorkerAvailabilityForm