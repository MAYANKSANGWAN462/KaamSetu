// Purpose: Collects structured job details with category taxonomy, salary UX controls, and location metadata.
// frontend/src/components/hirer/JobForm.jsx

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JOB_CATEGORY_GROUPS, PRICE_PRESETS } from '../../utils/constants';

const InputWrapper = ({ label, hint, children, icon }) => (
  <div className="group">
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
      {icon && <span className="text-base">{icon}</span>}
      {label}
    </label>
    {children}
    {hint && <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">{hint}</p>}
  </div>
);

const baseInput = `w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400 transition-all duration-200`;

const JobForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    locationCity: '',
    latitude: '',
    longitude: '',
    salaryMode: 'fixed',
    salaryFixed: 600,
    salaryMin: 400,
    salaryMax: 1000,
    workersRequired: 1,
    duration: '',
    requiredSkills: ''
  });

  const [activeSection, setActiveSection] = useState(null);

  const recommendedSalary = useMemo(() => {
    if (formData.salaryMode === 'range') {
      return Math.round((Number(formData.salaryMin) + Number(formData.salaryMax)) / 2);
    }
    return Number(formData.salaryFixed || 0);
  }, [formData.salaryMode, formData.salaryMin, formData.salaryMax, formData.salaryFixed]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const selectPreset = (price) => {
    setFormData((prev) => ({ ...prev, salaryMode: 'fixed', salaryFixed: price }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const salary =
      formData.salaryMode === 'range'
        ? { mode: 'range', min: Number(formData.salaryMin), max: Number(formData.salaryMax), recommended: recommendedSalary }
        : { mode: 'fixed', fixed: Number(formData.salaryFixed), recommended: recommendedSalary };

    onSubmit({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      location: {
        city: formData.locationCity,
        latitude: formData.latitude ? Number(formData.latitude) : undefined,
        longitude: formData.longitude ? Number(formData.longitude) : undefined
      },
      salary,
      budget: salary.fixed || salary.recommended,
      workersRequired: Number(formData.workersRequired),
      duration: formData.duration,
      requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

  // Progress — count filled required fields
  const requiredFields = ['title', 'category', 'description', 'locationCity', 'duration'];
  const filledCount = requiredFields.filter(f => formData[f]).length;
  const progress = Math.round((filledCount / requiredFields.length) * 100);

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Progress bar */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Form completion</span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* — Section 1: Basics — */}
      <div className="space-y-4 p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Job Details</p>

        <InputWrapper label="Job Title" icon="📋" hint="Be specific — e.g. 'Experienced Electrician for wiring work'">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={baseInput}
            placeholder="e.g. Need 3 construction workers for site work"
            required
          />
        </InputWrapper>

        <InputWrapper label="Category" icon="🗂️">
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`${baseInput} cursor-pointer`}
            required
          >
            <option value="">Select a category…</option>
            {JOB_CATEGORY_GROUPS.map((group) => (
              <optgroup key={group.group} label={group.group}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </InputWrapper>

        <InputWrapper label="Description" icon="📝" hint="Describe the work in detail — tools needed, experience required, etc.">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`${baseInput} resize-none leading-relaxed`}
            placeholder="Describe what needs to be done, any specific requirements, site conditions…"
            required
          />
        </InputWrapper>
      </div>

      {/* — Section 2: Pricing — */}
      <div className="p-5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/50">
        <p className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">💰 Pricing</p>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 w-fit mb-5">
          {['fixed', 'range'].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, salaryMode: mode }))}
              className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                formData.salaryMode === mode
                  ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {formData.salaryMode === 'fixed' ? (
            <motion.div
              key="fixed"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Quick presets */}
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Quick select</p>
                <div className="flex flex-wrap gap-2">
                  {PRICE_PRESETS.map((price) => (
                    <motion.button
                      key={price}
                      type="button"
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => selectPreset(price)}
                      className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold border transition-all duration-150 ${
                        Number(formData.salaryFixed) === price
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600'
                      }`}
                    >
                      ₹{price}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Slider */}
              <div>
                <input
                  type="range"
                  min="200"
                  max="3000"
                  step="50"
                  name="salaryFixed"
                  value={formData.salaryFixed}
                  onChange={handleChange}
                  className="w-full h-2 rounded-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>₹200</span>
                  <span>₹3,000</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="range"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-2 gap-3"
            >
              <InputWrapper label="Minimum (₹)">
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className={baseInput}
                  placeholder="e.g. 400"
                  required
                />
              </InputWrapper>
              <InputWrapper label="Maximum (₹)">
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className={baseInput}
                  placeholder="e.g. 1000"
                  required
                />
              </InputWrapper>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recommended pill */}
        <motion.div
          key={recommendedSalary}
          initial={{ scale: 0.95, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl"
        >
          <span className="text-emerald-500">✓</span>
          <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            Recommended: ₹{recommendedSalary.toLocaleString('en-IN')}/day
          </span>
        </motion.div>
      </div>

      {/* — Section 3: Workforce & Duration — */}
      <div className="p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">👷 Workforce</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputWrapper label="Workers Required" icon="👥">
            <input
              type="number"
              min="1"
              name="workersRequired"
              value={formData.workersRequired}
              onChange={handleChange}
              className={baseInput}
              required
            />
          </InputWrapper>

          <InputWrapper label="Duration" icon="📅">
            <select
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className={`${baseInput} cursor-pointer`}
              required
            >
              <option value="">Select duration…</option>
              <option value="same-day">Same Day</option>
              <option value="1-3 days">1–3 Days</option>
              <option value="less-than-week">Less Than 1 Week</option>
              <option value="1-2 weeks">1–2 Weeks</option>
              <option value="more-than-2-weeks">More Than 2 Weeks</option>
            </select>
          </InputWrapper>
        </div>
      </div>

      {/* — Section 4: Location — */}
      <div className="p-5 rounded-2xl bg-gray-50/60 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">📍 Location</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <InputWrapper label="City" icon="🏙️">
              <input
                type="text"
                name="locationCity"
                value={formData.locationCity}
                onChange={handleChange}
                className={baseInput}
                placeholder="e.g. Patiala"
                required
              />
            </InputWrapper>
          </div>
          <InputWrapper label="Latitude" hint="Optional">
            <input
              type="number"
              step="any"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className={baseInput}
              placeholder="30.3398"
            />
          </InputWrapper>
          <InputWrapper label="Longitude" hint="Optional">
            <input
              type="number"
              step="any"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className={baseInput}
              placeholder="76.3869"
            />
          </InputWrapper>
        </div>
      </div>

      {/* — Section 5: Skills — */}
      <InputWrapper label="Required Skills" icon="🛠️" hint="Separate each skill with a comma — e.g. wiring, switchboard, maintenance">
        <input
          type="text"
          name="requiredSkills"
          value={formData.requiredSkills}
          onChange={handleChange}
          className={baseInput}
          placeholder="e.g. welding, scaffolding, safety gear"
        />
        {formData.requiredSkills && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {formData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
              <motion.span
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 rounded-full text-xs font-medium"
              >
                {skill}
              </motion.span>
            ))}
          </div>
        )}
      </InputWrapper>

      {/* Submit */}
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.01 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full relative py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 text-white text-base font-bold shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40 hover:shadow-xl hover:shadow-indigo-300 dark:hover:shadow-indigo-900/60 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden"
      >
        {/* Shimmer */}
        {!loading && (
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
        )}
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Posting your job…
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Post Job
          </span>
        )}
      </motion.button>
    </motion.form>
  );
};

export default JobForm;