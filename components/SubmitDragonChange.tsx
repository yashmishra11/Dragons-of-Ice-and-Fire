"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Dragon } from "@/types/dragon";

type Props = {
  dragon: Dragon;
};

export default function SubmitDragonChange({ dragon }: Props) {
  const { user, role } = useAuth();

  // Strict role check: Admin and Visitor cannot see or access the submit button
  if (role !== "viewer" || !user) {
    return null;
  }

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [form, setForm] = useState<Partial<Dragon>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleChange<K extends keyof Dragon>(key: K, value: Dragon[K]) {
    const trimmed = typeof value === "string" ? value.trim() : value;

    setForm((prev) => {
      if (typeof trimmed === "string" && trimmed === "") {
        const { [key]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [key]: trimmed,
      };
    });
  }

  async function handleSubmit() {
    if (!user) {
      setError("Please log in as a Citadel member to propose a correction.");
      return;
    }

    if (!reason.trim()) {
      setError("Please state a historical rationale / source citation for this correction.");
      return;
    }

    if (Object.keys(form).length === 0) {
      setError("Please fill in at least one field to propose a correction.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dragonId: dragon.id,
          dragonName: dragon.name,
          proposedChanges: form,
          reason: reason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit correction to Citadel.");
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError("Network error communicating with the Citadel archives.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-xl bg-amber-950/30 border border-amber-500/40 p-4 text-sm text-amber-200 flex items-center gap-3 animate-fade-in shadow-xl">
        <span className="text-xl">✨</span>
        <div>
          <p className="font-semibold font-cinzel">Correction Recorded for Archmaester Review</p>
          <p className="text-xs text-amber-300/80 mt-0.5">
            Thank you! Your proposed edit for <span className="font-bold">{dragon.name}</span> has been logged to the review queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-amber-300 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/40 px-3.5 py-2 rounded-xl transition-all shadow-md"
      >
        <span>✍️</span>
        <span>{open ? "Close Correction Form" : "Suggest Lore Correction"}</span>
      </button>

      {open && (
        <div className="mt-4 rounded-2xl border border-amber-900/40 bg-zinc-950 p-5 space-y-4 shadow-2xl backdrop-blur-xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-sm font-bold font-cinzel text-amber-300 flex items-center gap-2">
              <span>📜</span> Propose Revision for {dragon.name}
            </h3>
            {!user && (
              <span className="text-[11px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                Notice: Viewer login required to submit
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="Rider"
              placeholder={dragon.rider || "Enter new rider..."}
              onChange={(v) => handleChange("rider", v)}
            />

            <Field
              label="Colors & Features"
              placeholder={dragon.colors || "Enter colors..."}
              onChange={(v) => handleChange("colors", v)}
            />

            <Field
              label="Hatched Date"
              placeholder={dragon.hatched || "Enter hatched date..."}
              onChange={(v) => handleChange("hatched", v)}
            />

            <Field
              label="Died Date / Status"
              placeholder={dragon.died || "Enter status..."}
              onChange={(v) => handleChange("died", v)}
            />
          </div>

          <TextArea
            label="Description Revision"
            placeholder={dragon.description || "Updated physical description..."}
            onChange={(v) => handleChange("description", v)}
          />

          <TextArea
            label="Historical Chronicle Revision"
            placeholder={dragon.history || "Updated lore history..."}
            onChange={(v) => handleChange("history", v)}
          />

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1 font-cinzel">
              Reason / Source Citation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fire & Blood Chapter 12 states..."
              className="w-full rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/50 p-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
              rows={2}
            />
          </div>

          {error && (
            <div className="text-xs text-red-400 bg-red-950/50 border border-red-900/60 p-2.5 rounded-lg flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-900">
            <button
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="text-xs font-semibold bg-gradient-to-r from-amber-600 to-red-700 hover:from-amber-500 hover:to-red-600 text-white px-4 py-1.5 rounded-lg transition-all shadow-md shadow-amber-900/30 border border-amber-500/30 disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Recording in Vault...</span>
                </>
              ) : (
                <span>Submit to Citadel Review</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  placeholder,
  onChange,
}: {
  label: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-zinc-400 mb-1 font-cinzel">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/50 p-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all"
      />
    </div>
  );
}

function TextArea({
  label,
  placeholder,
  onChange,
}: {
  label: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-zinc-400 mb-1 font-cinzel">{label}</label>
      <textarea
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/50 p-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all"
        rows={3}
      />
    </div>
  );
}
