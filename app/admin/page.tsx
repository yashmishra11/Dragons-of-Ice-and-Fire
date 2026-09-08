"use client";

import { useState } from "react";
import Link from "next/link";
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
  const dragon = dragons.find((d) => d.id === submission.dragonId || d.name.toLowerCase() === submission.dragonId.toLowerCase()) ?? null;
  const isPending = submission.status === "pending";

  const changes = submission.proposedChanges || {};
  const changeEntries = Object.entries(changes);

  return (
    <div className="bg-zinc-950/80 border border-zinc-800/80 hover:border-amber-900/40 rounded-2xl p-6 shadow-xl space-y-4 backdrop-blur-md transition-all">
      {/* Header info */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-950/60 border border-amber-600/40 flex items-center justify-center font-bold text-amber-400 font-cinzel">
            🐉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel font-bold text-lg text-zinc-100">
                {dragon ? dragon.name : `Dragon ID: ${submission.dragonId}`}
              </h2>
              <span className="text-xs text-zinc-500 font-mono">({submission.id})</span>
            </div>
            <p className="text-xs text-zinc-400">
              Submitted by <span className="text-amber-300 font-medium">{submission.submittedBy?.email || "Anonymous"}</span> • {new Date(submission.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            submission.status === "pending"
              ? "bg-amber-950/80 text-amber-300 border border-amber-700/60 animate-pulse"
              : submission.status === "approved"
              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
              : "bg-rose-950/80 text-rose-300 border border-rose-700/60"
          }`}
        >
          {submission.status}
        </span>
      </div>

      {/* Field Changes Table */}
      <div className="space-y-2">
        <p className="text-xs font-cinzel font-bold text-zinc-400 uppercase tracking-wider">
          Proposed Modifications ({changeEntries.length}):
        </p>

        <div className="overflow-x-auto rounded-xl border border-zinc-900 bg-zinc-900/40">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-zinc-400 font-cinzel border-b border-zinc-800">
              <tr>
                <th className="p-2.5">Field</th>
                <th className="p-2.5">Current Archival Value</th>
                <th className="p-2.5">Proposed Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-sans">
              {changeEntries.map(([key, val]) => {
                const currentValue = dragon ? (dragon as any)[key] : "Unknown";
                return (
                  <tr key={key} className="hover:bg-zinc-900/50">
                    <td className="p-2.5 font-semibold text-amber-400 capitalize">{key}</td>
                    <td className="p-2.5 text-zinc-400 max-w-xs truncate">{currentValue || "None / Blank"}</td>
                    <td className="p-2.5 text-emerald-300 bg-emerald-950/20 font-medium max-w-xs truncate">{String(val)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reason section */}
      <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80 text-xs">
        <span className="font-cinzel font-semibold text-amber-300">Citation / Rationale: </span>
        <span className="text-zinc-300 italic">{submission.reason}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-900">
        {dragon && (
          <Link
            href={`/dragons/${dragon.id}`}
            className="text-xs text-zinc-400 hover:text-amber-300 transition-colors"
          >
            Inspect Dragon File →
          </Link>
        )}

        <div className="flex gap-2">
          <button
            onClick={onApprove}
            disabled={!isPending}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white transition-all shadow-md shadow-emerald-900/20"
          >
            Approve Revision
          </button>

          <button
            onClick={onReject}
            disabled={!isPending}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white transition-all shadow-md shadow-rose-900/20"
          >
            Reject Revision
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [submissions, setSubmissions] =
    useState<DragonChangeSubmission[]>(initialSubmissions);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function updateStatus(id: string, status: "approved" | "rejected") {
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status, reviewedAt: new Date().toISOString() }
          : s
      )
    );

    setToastMessage(`Submission ${id} marked as ${status}.`);
    setTimeout(() => setToastMessage(null), 4000);
  }

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === "all") return true;
    return s.status === statusFilter;
  });

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const approvedCount = submissions.filter((s) => s.status === "approved").length;
  const rejectedCount = submissions.filter((s) => s.status === "rejected").length;

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#08070b] text-white px-4 sm:px-8 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="text-xs text-amber-400 hover:underline font-medium"
                >
                  ← Back to Map
                </Link>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest font-cinzel">
                  Citadel Archmaester Vault
                </span>
              </div>
              <h1 className="text-3xl font-cinzel font-bold text-amber-200 mt-1">
                Admin Review Dashboard
              </h1>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-full border border-zinc-800 text-xs">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-amber-500 text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  statusFilter === "pending"
                    ? "bg-amber-500 text-black font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  statusFilter === "approved"
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Approved ({approvedCount})
              </button>
              <button
                onClick={() => setStatusFilter("rejected")}
                className={`px-3 py-1 rounded-full font-medium transition-all ${
                  statusFilter === "rejected"
                    ? "bg-rose-600 text-white font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Rejected ({rejectedCount})
              </button>
            </div>
          </div>

          {/* Toast Notice */}
          {toastMessage && (
            <div className="bg-amber-950/80 border border-amber-500/50 p-3 rounded-xl text-xs text-amber-200 flex items-center justify-between shadow-xl animate-fade-in">
              <span>✨ {toastMessage}</span>
              <button onClick={() => setToastMessage(null)} className="text-zinc-400 hover:text-white">✕</button>
            </div>
          )}

          {/* Submissions List */}
          <div className="space-y-6">
            {filteredSubmissions.length === 0 && (
              <div className="text-center py-16 bg-zinc-950/40 rounded-2xl border border-zinc-900 space-y-2">
                <span className="text-4xl">📜</span>
                <p className="text-zinc-400 font-cinzel font-semibold text-sm">
                  No submissions found for status "{statusFilter}"
                </p>
              </div>
            )}

            {filteredSubmissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                dragons={dragons as Dragon[]}
                onApprove={() => updateStatus(submission.id, "approved")}
                onReject={() => updateStatus(submission.id, "rejected")}
              />
            ))}
          </div>

        </div>
      </main>
    </AdminGuard>
  );
}
