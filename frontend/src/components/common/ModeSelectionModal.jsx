// Purpose: One-time full-screen mode choice for new users (activeMode null).
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const ModeSelectionModal = () => {
  const { switchActiveMode } = useAuth();
  const [pending, setPending] = useState(null);

  const choose = async (mode) => {
    setPending(mode);
    const result = await switchActiveMode(mode);
    setPending(null);
    if (!result?.success) {
      alert("Failed to set mode. Please try again.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-md px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mode-modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl border border-[#c8933a]/40 bg-white dark:bg-[#16161f] p-8 shadow-2xl shadow-[#c8933a]/10">
        <h1
          id="mode-modal-title"
          className="text-center text-2xl font-semibold text-white"
        >
          How do you want to use the platform today?
        </h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          You can switch anytime from the header.
        </p>
        <div className="mt-8 flex flex-col gap-4">
          <button
            type="button"
            disabled={!!pending}
            onClick={() => choose("worker")}
            className="rounded-xl bg-gradient-to-br from-[#d4963e] to-[#b86e2a] px-6 py-4 text-lg font-semibold text-white transition hover:brightness-110 disabled:opacity-50 shadow-lg shadow-[#c8933a]/25"
          >
            {pending === "worker" ? "Saving…" : "I Need Work"}
          </button>
          <button
            type="button"
            disabled={!!pending}
            onClick={() => choose("hirer")}
            className="rounded-xl border-2 border-[#c8933a] px-6 py-4 text-lg font-semibold text-[#c8933a] transition hover:bg-[#c8933a]/10 disabled:opacity-50"
          >
            {pending === "hirer" ? "Saving…" : "I Need to Hire"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionModal;
