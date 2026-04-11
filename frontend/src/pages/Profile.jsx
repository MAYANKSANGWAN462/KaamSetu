import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { JOB_CATEGORY_GROUPS } from '../utils/constants'
import { workerService } from '../services'

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] }
})

const Field = ({ label, children }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] dark:text-gray-500 mb-2 ml-0.5">
      {label}
    </label>
    {children}
  </div>
)

const inputCls = (editing) =>
  `w-full rounded-2xl px-4 py-3.5 text-sm font-medium outline-none transition-all duration-300 ${
    editing
      ? 'bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-gray-800 dark:text-gray-200 focus:border-[#c8933a] dark:focus:border-[#c8933a] focus:shadow-[0_0_0_3px_rgba(200,147,58,0.15)] focus:bg-white dark:focus:bg-white/[0.09]'
      : 'bg-transparent border border-transparent text-gray-800 dark:text-gray-200 cursor-default select-none'
  } placeholder:text-[#b8a898] dark:placeholder:text-gray-600`

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    address: user?.address || '',
    bio: user?.bio || '',
    activeMode: user?.activeMode || 'hirer',
    workerCategory: user?.workerProfile?.category || '',
    workerCustomCategory: user?.workerProfile?.customCategory || '',
    profileImage: user?.profileImage || ''
  })

  const workerOptions = useMemo(() => JOB_CATEGORY_GROUPS.flatMap(g => g.options), [])

  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm(p => ({ ...p, profileImage: String(reader.result || '') }))
    reader.readAsDataURL(file)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name, email: form.email, phone: form.phone,
      location: form.location, address: form.address, bio: form.bio,
      activeMode: form.activeMode, profileImage: form.profileImage
    }
    const result = await updateProfile(payload)
    if (result.success && form.activeMode === 'worker' && user?.workerProfile) {
      await workerService.createWorkerProfile({
        ...user.workerProfile,
        category: form.workerCategory || user.workerProfile.category,
        customCategory: form.workerCategory === 'Other' ? form.workerCustomCategory : '',
        serviceAreas: user.workerProfile.serviceAreas || [form.location || user?.location || '']
      })
    }
    setSaving(false)
    if (result.success) {
      setIsEditing(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }
  }

  const initial = (form.name || 'U')[0].toUpperCase()

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-3xl mx-auto px-4">

        {/* Success toast */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-xl shadow-emerald-500/25 text-sm font-semibold"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Profile saved successfully
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div {...stagger(0)} className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">Account</p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">My Profile</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsEditing(p => !p)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 ${
              isEditing
                ? 'bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/40 hover:text-[#c8933a]'
                : 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white shadow-lg shadow-[#c8833a]/25 hover:shadow-[#c8833a]/40'
            }`}
          >
            {isEditing ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Profile
              </>
            )}
          </motion.button>
        </motion.div>

        <form onSubmit={handleSave}>
          {/* Avatar card */}
          <motion.div {...stagger(1)}
            className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm mb-5"
          >
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center shadow-md shadow-[#c8833a]/20">
                  {form.profileImage ? (
                    <img src={form.profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-black text-3xl">{initial}</span>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-white dark:bg-[#1a1208] border border-[#e8dfd0] dark:border-white/10 flex items-center justify-center cursor-pointer shadow-sm hover:border-[#c8933a]/50 transition-colors duration-200">
                    <svg className="w-3.5 h-3.5 text-[#c8933a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input type="file" accept="image/*" onChange={onFileChange} className="hidden" />
                  </label>
                )}
              </div>

              <div>
                <p className="font-black text-xl text-gray-900 dark:text-white">{form.name || 'Your Name'}</p>
                <p className="text-sm text-[#9c8a78] mt-0.5">{form.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    user?.activeMode === 'worker'
                      ? 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      : 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {user?.activeMode || 'No mode set'}
                  </span>
                  {user?.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Personal Info */}
          <motion.div {...stagger(2)}
            className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm mb-5"
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-5">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full Name">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'name' ? 'text-[#c8933a]' : 'text-[#b8a898] dark:text-gray-600'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input type="text" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)}
                    disabled={!isEditing}
                    className={inputCls(isEditing) + ' pl-11'}
                    placeholder="Your full name" />
                </div>
              </Field>

              <Field label="Email Address">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'email' ? 'text-[#c8933a]' : 'text-[#b8a898] dark:text-gray-600'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input type="email" value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                    disabled={!isEditing}
                    className={inputCls(isEditing) + ' pl-11'}
                    placeholder="you@example.com" />
                </div>
              </Field>

              <Field label="Phone Number">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'phone' ? 'text-[#c8933a]' : 'text-[#b8a898] dark:text-gray-600'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)}
                    disabled={!isEditing}
                    className={inputCls(isEditing) + ' pl-11'}
                    placeholder="+91 98765 43210" />
                </div>
              </Field>

              <Field label="City / Area">
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className={`w-4 h-4 transition-colors duration-300 ${focusedField === 'location' ? 'text-[#c8933a]' : 'text-[#b8a898] dark:text-gray-600'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <input type="text" value={form.location}
                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                    onFocus={() => setFocusedField('location')} onBlur={() => setFocusedField(null)}
                    disabled={!isEditing}
                    className={inputCls(isEditing) + ' pl-11'}
                    placeholder="Delhi, Mumbai, Bengaluru…" />
                </div>
              </Field>

              <Field label="Full Address">
                <div className="md:col-span-2 relative">
                  <input type="text" value={form.address}
                    onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                    onFocus={() => setFocusedField('address')} onBlur={() => setFocusedField(null)}
                    disabled={!isEditing}
                    className={inputCls(isEditing)}
                    placeholder="Street, locality, city…" />
                </div>
              </Field>
            </div>
          </motion.div>

          {/* Mode & Worker Settings */}
          <motion.div {...stagger(3)}
            className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm mb-5"
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-5">Mode & Role</h2>

            <Field label="Active Mode">
              <div className="flex gap-3">
                {['worker', 'hirer'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    disabled={!isEditing}
                    onClick={() => isEditing && setForm(p => ({ ...p, activeMode: mode }))}
                    className={`flex-1 py-3 rounded-2xl text-sm font-bold capitalize transition-all duration-300 ${
                      form.activeMode === mode
                        ? 'bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white shadow-md shadow-[#c8833a]/20'
                        : 'bg-[#faf7f2] dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/40'
                    } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {mode === 'worker' ? '👷 Worker' : '🏢 Hirer'}
                  </button>
                ))}
              </div>
            </Field>

            <AnimatePresence>
              {form.activeMode === 'worker' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-4 overflow-hidden"
                >
                  <Field label="Worker Category">
                    <div className="relative">
                      <select
                        value={form.workerCategory}
                        onChange={e => setForm(p => ({ ...p, workerCategory: e.target.value }))}
                        disabled={!isEditing}
                        className={inputCls(isEditing) + ' appearance-none pr-10'}
                      >
                        <option value="">Select a category</option>
                        {workerOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[#b8a898]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </Field>

                  <AnimatePresence>
                    {form.workerCategory === 'Other' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        <Field label="Custom Category">
                          <input type="text" value={form.workerCustomCategory}
                            onChange={e => setForm(p => ({ ...p, workerCustomCategory: e.target.value }))}
                            disabled={!isEditing}
                            className={inputCls(isEditing)}
                            placeholder="Describe your work…" />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Bio */}
          <motion.div {...stagger(4)}
            className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm mb-6"
          >
            <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-5">About You</h2>
            <Field label="Bio / Description">
              <div className="relative">
                <textarea
                  value={form.bio}
                  onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                  onFocus={() => setFocusedField('bio')} onBlur={() => setFocusedField(null)}
                  disabled={!isEditing}
                  rows={4}
                  maxLength={300}
                  className={`${inputCls(isEditing)} resize-none`}
                  placeholder="Tell hirers or workers about yourself…"
                />
                {isEditing && (
                  <p className="text-[10px] text-[#b8a898] dark:text-gray-600 text-right mt-1">
                    {form.bio.length}/300
                  </p>
                )}
              </div>
            </Field>
          </motion.div>

          {/* Save Button */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl py-4 font-bold text-sm text-white bg-gradient-to-br from-[#d4963e] to-[#b86e2a] shadow-lg shadow-[#c8833a]/25 hover:shadow-xl hover:shadow-[#c8833a]/35 transition-all duration-300 disabled:opacity-60"
                >
                  <AnimatePresence mode="wait">
                    {saving ? (
                      <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2.5">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-30" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Saving…
                      </motion.span>
                    ) : (
                      <motion.span key="save" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Profile
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  )
}

export default Profile