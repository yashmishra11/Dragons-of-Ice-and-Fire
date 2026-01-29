"use client";

import { useState } from "react";
import dragons from "@/data/dragons.json";
import { submissions as initialSubmissions } from "@/data/submissions";
import { Dragon } from "@/types/dragon";
import { DragonChangeSubmission } from "@/types/submission";
import { AdminGuard } from "@/components/AdminGuard";

function SubmissionCard({
  submission,
  dragons,
  onApprove,
  onReject,
}: {
  submission: DragonChangeSubmission;
  dragons: Dragon[];
  onApprove: () => void;
  onReject: () => void;
}) {
  const dragon = dragons.find((d) => d.id === submission.dragonId) ?? null;
  const isPending = submission.status === "pending";

  return (
    <div className="p-4 bg-zinc-900 rounded-md border border-zinc-800">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="font-semibold">Submission {submission.id}</h2>
          {dragon && (
            <p className="text-sm text-zinc-400">Dragon: {dragon.name}</p>
          )}
        </div>

        <span className="text-sm text-zinc-400">{submission.status}</span>
      </div>

      <pre className="mt-3 text-sm text-zinc-400 overflow-x-auto">
        {JSON.stringify(submission.proposedChanges, null, 2)}
      </pre>

      <p className="mt-2 text-sm text-zinc-500">
        Reason: {submission.reason}
      </p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={onApprove}
          disabled={!isPending}
          className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
        >
          Approve
        </button>

        <button
          onClick={onReject}
          disabled={!isPending}
          className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
        >
          Reject
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [submissions, setSubmissions] =
    useState<DragonChangeSubmission[]>(initialSubmissions);

  function updateStatus(id: string, status: "approved" | "rejected") {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, reviewedAt: new Date().toISOString() }
          : s
      )
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-black text-white px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">Admin Review Dashboard</h1>

        <div className="space-y-6">
          {submissions.length === 0 && (
            <p className="text-zinc-400">No pending submissions.</p>
          )}

          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              dragons={dragons as Dragon[]}
              onApprove={() => updateStatus(submission.id, "approved")}
              onReject={() => updateStatus(submission.id, "rejected")}
            />
          ))}
        </div>
      </main>
    </AdminGuard>
  );
}
