// Purpose: Displays and edits complete user profile details including role preference and profile photo.
import { useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { JOB_CATEGORY_GROUPS } from '../utils/constants'
import { workerService } from '../services'

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    address: user?.address || '',
    bio: user?.bio || '',
    preferredMode: user?.preferredMode || 'hirer',
    workerCategory: user?.workerProfile?.category || '',
    workerCustomCategory: user?.workerProfile?.customCategory || '',
    profileImage: user?.profileImage || ''
  })

  const workerOptions = useMemo(() => JOB_CATEGORY_GROUPS.flatMap((group) => group.options), [])

  const onFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profileImage: String(reader.result || '') }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      email: form.email,
      phone: form.phone,
      location: form.location,
      address: form.address,
      bio: form.bio,
      preferredMode: form.preferredMode,
      profileImage: form.profileImage
    }

    const result = await updateProfile(payload)
    if (result.success && form.preferredMode === 'worker' && user?.workerProfile) {
      await workerService.createWorkerProfile({
        ...user.workerProfile,
        category: form.workerCategory || user.workerProfile.category,
        customCategory: form.workerCategory === 'Other' ? form.workerCustomCategory : '',
        serviceAreas: user.workerProfile.serviceAreas || [form.location || user?.location || '']
      })
    }
    if (result.success) {
      setIsEditing(false)
    }
    setSaving(false)
  }

  return (
    <div className="w-full min-h-screen pt-24 pb-10">
      <main className="max-w-screen-lg mx-auto px-4">
        <div className="rounded-2xl bg-white/90 dark:bg-white/10 backdrop-blur-md border border-violet-200/50 dark:border-violet-300/20 p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My Profile</h1>
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-white active:scale-95 transition-transform"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full overflow-hidden bg-violet-100 dark:bg-violet-900/40 border border-violet-200 dark:border-violet-500/40">
                {form.profileImage ? (
                  <img src={form.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-violet-700 dark:text-violet-200 font-semibold">
                    {(form.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {isEditing && (
                <input type="file" accept="image/*" onChange={onFileChange} className="text-sm text-gray-700 dark:text-gray-200" />
              )}
            </div>

            <label className="text-sm text-gray-700 dark:text-gray-200">
              Name
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} disabled={!isEditing} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
            </label>

            <label className="text-sm text-gray-700 dark:text-gray-200">
              Email
              <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} disabled={!isEditing} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
            </label>

            <label className="text-sm text-gray-700 dark:text-gray-200">
              Phone
              <input value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} disabled={!isEditing} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
            </label>

            <label className="text-sm text-gray-700 dark:text-gray-200">
              Location
              <input value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} disabled={!isEditing} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
            </label>

            <label className="text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
              Address
              <input value={form.address} onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))} disabled={!isEditing} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
            </label>

            <label className="text-sm text-gray-700 dark:text-gray-200">
              Role
              <select value={form.preferredMode} onChange={(e) => setForm((prev) => ({ ...prev, preferredMode: e.target.value }))} disabled={!isEditing} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <option value="worker">Worker</option>
                <option value="hirer">Hirer</option>
              </select>
            </label>

            {form.preferredMode === 'worker' && (
              <>
                <label className="text-sm text-gray-700 dark:text-gray-200">
                  Worker Category
                  <select value={form.workerCategory} onChange={(e) => setForm((prev) => ({ ...prev, workerCategory: e.target.value }))} disabled={!isEditing} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                    <option value="">Select category</option>
                    {workerOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                {form.workerCategory === 'Other' && (
                  <label className="text-sm text-gray-700 dark:text-gray-200">
                    Custom Category
                    <input value={form.workerCustomCategory} onChange={(e) => setForm((prev) => ({ ...prev, workerCustomCategory: e.target.value }))} disabled={!isEditing} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
                  </label>
                )}
              </>
            )}

            <label className="text-sm text-gray-700 dark:text-gray-200 md:col-span-2">
              Description
              <textarea value={form.bio} onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))} disabled={!isEditing} rows={4} className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />
            </label>

            {isEditing && (
              <button type="submit" disabled={saving} className="md:col-span-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-white active:scale-95 transition-transform disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            )}
          </form>
        </div>
      </main>
    </div>
  )
}

export default Profile
