// Purpose: Center header pills — worker vs hirer (authenticated only).
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const HeaderModeToggle = () => {
  const { user, switchActiveMode } = useAuth();
  const [busy, setBusy] = useState(false);
  const active = user?.activeMode ?? null;

  const onPick = async (mode) => {
    if (active === mode || busy) return;
    setBusy(true);
    await switchActiveMode(mode);
    setBusy(false);
  };

  if (!user) return null;

  const pill = (mode, label) => {
    const isOn = active === mode;
    return (
      <button
        type="button"
        disabled={busy}
        onClick={() => onPick(mode)}
        className={`rounded-full px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${
          isOn
            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25"
            : "border border-amber-400/60 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-500/10"
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex items-center justify-center gap-2 rounded-full border border-amber-200/60 dark:border-amber-500/25 bg-white/40 p-1 dark:bg-black/20">
      {pill("worker", "Work Mode")}
      {pill("hirer", "Hire Mode")}
    </div>
  );
};

export default HeaderModeToggle;
