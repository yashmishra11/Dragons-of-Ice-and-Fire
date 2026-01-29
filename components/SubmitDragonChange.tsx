"use client";

import { useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Dragon } from "../types/dragon";

type Props = {
  dragon: Dragon;
};

export default function SubmitDragonChange({ dragon }: Props) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [form, setForm] = useState<Partial<Dragon>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function handleChange<K extends keyof Dragon>(key: K, value: Dragon[K]) {
    const trimmed =
      typeof value === "string" ? value.trim() : value;

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

  function handleSubmit() {
    if (!user) {
      setError("Please log in to submit a correction.");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for the change.");
      return;
    }

    if (Object.keys(form).length === 0) {
      setError("Please fill at least one field to suggest a change.");
      return;
    }

    const submission = {
      id: crypto.randomUUID(),
      type: "edit-dragon",
      dragonId: dragon.id,
      proposedChanges: form,
      reason: reason.trim(),
      submittedBy: {
        userId: user.id,
        email: user.email,
      },
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    console.log("SUBMISSION:", submission);

    setSubmitted(true);
    setError(null);
  }

  if (submitted) {
    return (
      <div className="mt-6 rounded-lg bg-zinc-900 p-4 text-sm text-zinc-300">
        Thank you! Your suggestion has been submitted for review.
      </div>
    );
  }

  return (
    <div className="mt-10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-zinc-400 hover:text-white transition"
      >
        Submit a correction
      </button>

      {open && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-white">
            Suggest a correction
          </h3>

          <Field
            label="Rider"
            placeholder={dragon.rider ?? ""}
            onChange={(v) => handleChange("rider", v)}
          />

          <Field
            label="Colors"
            placeholder={dragon.colors ?? ""}
            onChange={(v) => handleChange("colors", v)}
          />

          <Field
            label="Hatched"
            placeholder={dragon.hatched ?? ""}
            onChange={(v) => handleChange("hatched", v)}
          />

          <Field
            label="Died"
            placeholder={dragon.died ?? ""}
            onChange={(v) => handleChange("died", v)}
          />

          <TextArea
            label="Description"
            placeholder={dragon.description ?? ""}
            onChange={(v) => handleChange("description", v)}
          />

          <TextArea
            label="History"
            placeholder={dragon.history ?? ""}
            onChange={(v) => handleChange("history", v)}
          />

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Reason for change *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded bg-zinc-900 border border-zinc-800 p-2 text-sm text-white"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            className="text-sm bg-white text-black px-3 py-1.5 rounded hover:bg-zinc-200 transition"
          >
            Submit for review
          </button>
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
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded bg-zinc-900 border border-zinc-800 p-2 text-sm text-white"
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
      <label className="block text-xs text-zinc-400 mb-1">{label}</label>
      <textarea
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded bg-zinc-900 border border-zinc-800 p-2 text-sm text-white"
        rows={4}
      />
    </div>
  );
}
