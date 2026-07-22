import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { workerService } from "../services";
import { useAuth } from "../context/AuthContext";
import { JOB_CATEGORIES, SKILL_LIST, WAGE_UNITS } from "../utils/constants";
import useGeolocation from "../hooks/useGeolocation";
import LocationAutocomplete from "../components/common/LocationAutocomplete";

const stagger = (i) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

const SectionCard = ({ title, children, step }) => (
  <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[#e8dfd0] dark:border-white/8 p-7 shadow-sm">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] flex items-center justify-center text-white text-xs font-black flex-shrink-0">
        {step}
      </div>
      <h2 className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78]">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const Label = ({ children }) => (
  <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#9c8a78] mb-2.5 ml-0.5">
    {children}
  </label>
);

const inputCls = `w-full rounded-2xl px-4 py-3.5 text-sm font-medium
  bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10
  text-gray-800 dark:text-gray-200 placeholder:text-[#b8a898] dark:placeholder:text-gray-600
  outline-none focus:border-[#c8933a] focus:shadow-[0_0_0_3px_rgba(200,147,58,0.15)]
  focus:bg-white dark:focus:bg-white/[0.09] transition-all duration-300`;

const WorkerSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const geo = useGeolocation();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    category: "",
    skills: [],
    bio: "",
    wageAmount: "",
    wageUnit: "daily",
    isAvailable: true,
    locationAddress: "",
    lat: null,
    lng: null,
  });

  const addSkill = (skill) => {
    if (!form.skills.includes(skill))
      setForm((p) => ({ ...p, skills: [...p.skills, skill] }));
  };
  const removeSkill = (skill) =>
    setForm((p) => ({ ...p, skills: p.skills.filter((s) => s !== skill) }));

  const useMyLocation = () => {
    if (geo.latitude && geo.longitude) {
      setForm((p) => ({
        ...p,
        lat: geo.latitude,
        lng: geo.longitude,
        locationAddress: geo.manualLocation || "Current location",
      }));
      toast.success("Location set!");
    } else {
      toast.error("Location not available. Please enable location access.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) {
      toast.error("Please select a category");
      return;
    }
    if (!form.wageAmount || Number(form.wageAmount) <= 0) {
      toast.error("Please enter a valid wage");
      return;
    }

    setLoading(true);
    try {
      await workerService.createWorkerProfile({
        category: form.category,
        skills: form.skills,
        bio: form.bio,
        wage: { amount: Number(form.wageAmount), unit: form.wageUnit },
        isAvailable: form.isAvailable,
        location:
          form.lat && form.lng
            ? { lat: form.lat, lng: form.lng, address: form.locationAddress }
            : undefined,
        serviceAreas: form.locationAddress ? [form.locationAddress] : undefined,
      });
      toast.success("Worker profile saved!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  const categories = JOB_CATEGORIES || [];
  const wageUnits = WAGE_UNITS || ["hourly", "daily", "per job"];

  return (
    <div className="min-h-screen bg-[#faf7f2] dark:bg-[#0e0d0b] pt-24 pb-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <motion.div {...stagger(0)} className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#9c8a78] hover:text-[#c8933a] transition-colors duration-200 mb-4"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c8933a] mb-1">
            Worker Mode
          </p>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">
            Set Up Your Profile
          </h1>
          <p className="text-sm text-[#9c8a78] mt-1">
            Let hirers find you for the right jobs.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <motion.div {...stagger(1)}>
            <SectionCard title="Your Work Category" step="1">
              <Label>Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const val = typeof cat === "string" ? cat : cat.value;
                  const lbl = typeof cat === "string" ? cat : cat.label;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, category: val }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        form.category === val
                          ? "bg-gradient-to-br from-[#d4963e] to-[#b86e2a] border-transparent text-white shadow-sm"
                          : "bg-[#faf7f2] dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a]"
                      }`}
                    >
                      {lbl}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>

          {/* Skills */}
          <motion.div {...stagger(2)}>
            <SectionCard title="Your Skills" step="2">
              <Label>Select Skills (tap to add/remove)</Label>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-[#d4963e]/10 to-[#b86e2a]/10 border border-[#c8933a]/20 text-xs font-semibold text-[#c8933a]"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-[#c8933a]/60 hover:text-red-500 transition-colors duration-150"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {(SKILL_LIST || []).map((skill) => {
                  const selected = form.skills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() =>
                        selected ? removeSkill(skill) : addSkill(skill)
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                        selected
                          ? "bg-gradient-to-br from-[#d4963e] to-[#b86e2a] border-transparent text-white shadow-sm"
                          : "bg-[#faf7f2] dark:bg-white/[0.04] border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a]"
                      }`}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </motion.div>

          {/* Wage */}
          <motion.div {...stagger(3)}>
            <SectionCard title="Your Wage" step="3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (₹)</Label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b8a898] font-bold text-sm pointer-events-none">
                      ₹
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={form.wageAmount}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, wageAmount: e.target.value }))
                      }
                      className={inputCls + " pl-8"}
                      placeholder="500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Per</Label>
                  <div className="flex gap-2">
                    {(wageUnits.length > 0
                      ? wageUnits
                      : ["hourly", "daily", "per job"]
                    ).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() =>
                          setForm((p) => ({ ...p, wageUnit: unit }))
                        }
                        className={`flex-1 py-3.5 rounded-2xl text-xs font-bold capitalize transition-all duration-200 ${
                          form.wageUnit === unit
                            ? "bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white shadow-sm"
                            : "bg-[#faf7f2] dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/50"
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </SectionCard>
          </motion.div>

          {/* Availability */}
          <motion.div {...stagger(4)}>
            <SectionCard title="Availability" step="4">
              <div className="flex gap-3">
                {[
                  { val: true, label: "✅ Available Now" },
                  { val: false, label: "⏸ Not Available" },
                ].map(({ val, label }) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, isAvailable: val }))}
                    className={`flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      form.isAvailable === val
                        ? "bg-gradient-to-br from-[#d4963e] to-[#b86e2a] text-white shadow-md shadow-[#c8833a]/20"
                        : "bg-[#faf7f2] dark:bg-white/[0.04] border border-[#e8dfd0] dark:border-white/10 text-[#9c8a78] hover:border-[#c8933a]/40"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </SectionCard>
          </motion.div>

          {/* Location */}
          <motion.div {...stagger(5)}>
            <SectionCard title="Your Location" step="5">
              <div className="flex gap-3 mb-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={useMyLocation}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#faf7f2] dark:bg-white/[0.06] border border-[#e8dfd0] dark:border-white/10 text-sm font-semibold text-[#9c8a78] hover:border-[#c8933a]/50 hover:text-[#c8933a] transition-all duration-300"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Use My Location
                </motion.button>
                {form.lat && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Location set
                  </span>
                )}
              </div>
              <Label>Area / City</Label>
              <LocationAutocomplete
                value={form.locationAddress}
                onChange={(val) =>
                  setForm((p) => ({ ...p, locationAddress: val }))
                }
                placeholder="e.g. Connaught Place, Delhi"
                icon={false}
                inputClassName={inputCls}
              />
            </SectionCard>
          </motion.div>

          {/* Bio */}
          <motion.div {...stagger(6)}>
            <SectionCard title="About You" step="6">
              <Label>Bio (optional)</Label>
              <div className="relative">
                <textarea
                  value={form.bio}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  rows={4}
                  maxLength={300}
                  className={inputCls + " resize-none"}
                  placeholder="Tell hirers about your experience and what makes you great at your work…"
                />
                <p className="text-[10px] text-[#b8a898] dark:text-gray-600 text-right mt-1">
                  {form.bio.length}/300
                </p>
              </div>
            </SectionCard>
          </motion.div>

          {/* Submit */}
          <motion.div {...stagger(7)}>
            <motion.button
              whileHover={{ scale: 1.01, y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-4 font-bold text-sm text-white bg-gradient-to-br from-[#d4963e] to-[#b86e2a] shadow-lg shadow-[#c8833a]/25 hover:shadow-xl hover:shadow-[#c8833a]/35 transition-all duration-300 disabled:opacity-60"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.span
                    key="l"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2.5"
                  >
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-30"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-80"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving your profile…
                  </motion.span>
                ) : (
                  <motion.span
                    key="s"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2.5"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Save Worker Profile
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default WorkerSetup;
