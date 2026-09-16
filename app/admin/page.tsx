"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dragons from "@/data/dragons.json";
import { Dragon } from "@/types/dragon";
import { DragonChangeSubmission } from "@/types/submission";
import { AdminGuard } from "@/components/AdminGuard";

type SectionTab = "submitted" | "accepted" | "discarded";

function SubmissionCard({
  submission,
  dragons,
  onAcknowledge,
  onDiscard,
  onDeletePermanently,
  actionLoadingId,
}: {
  submission: DragonChangeSubmission;
  dragons: Dragon[];
  onAcknowledge: (id: string) => void;
  onDiscard: (id: string) => void;
  onDeletePermanently: (id: string) => void;
  actionLoadingId: string | null;
}) {
  const dragon =
    dragons.find(
      (d) =>
        d.id.toLowerCase() === submission.dragonId.toLowerCase() ||
        d.name.toLowerCase() === submission.dragonId.toLowerCase()
    ) ?? null;

  const isSubmitted =
    submission.status === "submitted" || submission.status === "pending";
  const isAccepted =
    submission.status === "accepted" || submission.status === "approved";
  const isDiscarded =
    submission.status === "discarded" || submission.status === "rejected";

  const isLoading = actionLoadingId === submission.id;

  const changes = submission.proposedChanges || {};
  const changeEntries = Object.entries(changes);

  const submitterDisplay =
    submission.submittedBy?.username ||
    submission.submittedBy?.actualName ||
    "Citadel Scribe";

  return (
    <div className="bg-[#0d0c13]/90 border border-zinc-800/90 hover:border-amber-900/50 rounded-2xl p-6 shadow-2xl space-y-4 backdrop-blur-xl transition-all">
      {/* Headergf Info000 */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-950/80 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 text-xl shadow-inner font-cinzel">
            🐉
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel font-bold text-lg text-zinc-100">
                {submission.dragonName || (dragon ? dragon.name : `Dragon ID: ${submission.dragonId}`)}
              </h2>
              <span className="text-[10px] text-zinc-500 font-mono">({submission.id})</span>
            </div>
            <p className="text-xs text-zinc-400">
              Submitted by{" "}
              <span className="text-amber-300 font-medium">@{submitterDisplay}</span>{" "}
              <span className="text-zinc-500 font-mono">({submission.submittedBy?.email})</span> •{" "}
              {new Date(submission.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {isSubmitted && (
            <span className="px-3 py-1 rounded-full text-xs font-cinzel font-bold tracking-wider uppercase bg-amber-950/80 text-amber-300 border border-amber-500/50 animate-pulse">
              📜 Submitted (Pending Review)
            </span>
          )}
          {isAccepted && (
            <span className="px-3 py-1 rounded-full text-xs font-cinzel font-bold tracking-wider uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-600/60 shadow-sm">
              ✨ Accepted & Acknowledged
            </span>
          )}
          {isDiscarded && (
            <span className="px-3 py-1 rounded-full text-xs font-cinzel font-bold tracking-wider uppercase bg-zinc-900 text-zinc-400 border border-zinc-700">
              🗑️ Discarded
            </span>
          )}
        </div>
      </div>

      {/* Field Changes Table */}
      <div className="space-y-2">
        <p className="text-[11px] font-cinzel font-bold text-zinc-400 uppercase tracking-wider">
          Proposed Modifications ({changeEntries.length}):
        </p>

        <div className="overflow-x-auto rounded-xl border border-zinc-800/80 bg-zinc-950/60">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-900/90 text-zinc-400 font-cinzel border-b border-zinc-800">
              <tr>
                <th className="p-3 w-1/4">Field</th>
                <th className="p-3 w-3/8">Current Archival Record</th>
                <th className="p-3 w-3/8">Proposed Correction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/80 font-sans">
              {changeEntries.map(([key, val]) => {
                const currentValue = dragon ? (dragon as unknown as Record<string, unknown>)[key] : "Unknown";
                return (
                  <tr key={key} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="p-3 font-semibold text-amber-400 capitalize font-cinzel text-[11px]">
                      {key}
                    </td>
                    <td className="p-3 text-zinc-400 text-xs">
                      {currentValue ? String(currentValue) : <span className="italic text-zinc-600">None / Blank</span>}
                    </td>
                    <td className="p-3 text-emerald-300 bg-emerald-950/15 font-medium text-xs">
                      {String(val)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citation / Rationale */}
      <div className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800/80 text-xs space-y-1">
        <span className="font-cinzel font-bold text-amber-300 block text-[11px]">
          📜 Scholar Citation / Historical Rationale:
        </span>
        <p className="text-zinc-200 italic font-serif leading-relaxed">
          &ldquo;{submission.reason}&rdquo;
        </p>
      </div>

      {/* Accepted note dispatch info */}
      {isAccepted && (
        <div className="flex items-center gap-2 text-xs text-emerald-400/90 bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl">
          <span>💌</span>
          <span>
            Royal raven dispatched! A sweet acknowledgement letter was sent to{" "}
            <strong className="text-emerald-300 font-mono">{submission.submittedBy?.email}</strong>.
          </span>
        </div>
      )}

      {/* Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-zinc-900">
        {dragon ? (
          <Link
            href={`/dragons/${dragon.id}`}
            className="text-xs text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1 font-cinzel"
          >
            <span>Inspect Dragon File</span>
            <span>→</span>
          </Link>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2">
          {/* Action buttons for SUBMITTED cards */}
          {isSubmitted && (
            <>
              <button
                onClick={() => onDiscard(submission.id)}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-cinzel font-bold text-zinc-400 hover:text-red-300 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-800/50 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>🗑️</span>
                <span>Discard</span>
              </button>

              <button
                onClick={() => onAcknowledge(submission.id)}
                disabled={isLoading}
                className="px-5 py-2 rounded-xl text-xs font-cinzel font-bold text-white bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 hover:from-amber-500 hover:to-emerald-500 transition-all shadow-lg shadow-amber-950/40 border border-amber-400/40 disabled:opacity-50 flex items-center gap-1.5"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Dispatching Raven...</span>
                  </>
                ) : (
                  <>
                    <span>⚔️</span>
                    <span>Acknowledge & Accept</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Action buttons for DISCARDED cards */}
          {isDiscarded && (
            <button
              onClick={() => onDeletePermanently(submission.id)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-cinzel font-bold text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-800/50 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <span>❌</span>
              <span>Permanently Delete</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<DragonChangeSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<SectionTab>("submitted");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch real submissions from /api/submissions
  async function loadSubmissions() {
    try {
      const res = await fetch("/api/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSubmissions();
  }, []);

  // Action: Acknowledge & Accept
  async function handleAcknowledge(id: string) {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/submissions/${id}/acknowledge`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setToastMessage(`⚠️ Error: ${data.error || "Failed to acknowledge"}`);
      } else {
        // Update local state: move to accepted
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "accepted" } : s))
        );
        setToastMessage(
          `✨ Contribution acknowledged! A sweet royal thank-you letter was dispatched to ${data.submission?.submittedBy?.email || "the contributor"}.`
        );
      }
    } catch {
      setToastMessage("⚠️ Network error while dispatching acknowledgment raven.");
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 6000);
    }
  }

  // Action: Discard
  async function handleDiscard(id: string) {
    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/submissions/${id}/discard`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        setToastMessage(`⚠️ Error: ${data.error || "Failed to discard"}`);
      } else {
        // Update local state: move to discarded
        setSubmissions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: "discarded" } : s))
        );
        setToastMessage("🗑️ Submission discarded and moved to the Discarded section.");
      }
    } catch {
      setToastMessage("⚠️ Network error while discarding submission.");
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  }

  // Action: Permanently Delete
  async function handleDeletePermanently(id: string) {
    if (!confirm("Are you sure you want to permanently erase this submission from the archives?")) {
      return;
    }

    setActionLoadingId(id);
    try {
      const res = await fetch(`/api/submissions/${id}/delete`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setToastMessage(`⚠️ Error: ${data.error || "Failed to delete"}`);
      } else {
        // Remove completely from list
        setSubmissions((prev) => prev.filter((s) => s.id !== id));
        setToastMessage("❌ Submission permanently erased from the Citadel archives.");
      }
    } catch {
      setToastMessage("⚠️ Network error while erasing submission.");
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  }

  // Filter submissions by the 3 core sections requested
  const submittedItems = submissions.filter(
    (s) => s.status === "submitted" || s.status === "pending"
  );
  const acceptedItems = submissions.filter(
    (s) => s.status === "accepted" || s.status === "approved"
  );
  const discardedItems = submissions.filter(
    (s) => s.status === "discarded" || s.status === "rejected"
  );

  const currentDisplayList =
    activeTab === "submitted"
      ? submittedItems
      : activeTab === "accepted"
      ? acceptedItems
      : discardedItems;

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#08070b] text-white px-4 sm:px-8 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium font-cinzel flex items-center gap-1 transition-colors"
                >
                  <span>←</span>
                  <span>Back to Realm Map</span>
                </Link>
                <span className="text-zinc-600">•</span>
                <span className="text-xs text-zinc-400 uppercase tracking-widest font-cinzel font-semibold">
                  Citadel Archmaester Vault
                </span>
              </div>
              <h1 className="text-3xl font-cinzel font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-red-400 mt-1">
                Lore Review Dashboard
              </h1>
              <p className="text-xs text-zinc-400 mt-1">
                Review proposed chronicle revisions from verified Citadel scribes and members.
              </p>
            </div>

            {/* Section Tabs: Submitted, Accepted, Discarded */}
            <div className="flex items-center gap-1.5 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800 shadow-xl">
              <button
                onClick={() => setActiveTab("submitted")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold transition-all ${
                  activeTab === "submitted"
                    ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black shadow-lg shadow-amber-950/40"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <span>📜 Submitted</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === "submitted"
                      ? "bg-black/40 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {submittedItems.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("accepted")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold transition-all ${
                  activeTab === "accepted"
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-950/40"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <span>✨ Accepted</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === "accepted"
                      ? "bg-black/40 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {acceptedItems.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("discarded")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold transition-all ${
                  activeTab === "discarded"
                    ? "bg-zinc-700 text-white shadow-lg"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <span>🗑️ Discarded</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    activeTab === "discarded"
                      ? "bg-black/40 text-white"
                      : "bg-zinc-800 text-zinc-300"
                  }`}
                >
                  {discardedItems.length}
                </span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="bg-gradient-to-r from-amber-950/90 to-zinc-950 border border-amber-500/50 p-4 rounded-2xl text-xs text-amber-200 flex items-center justify-between shadow-2xl animate-fade-in">
              <span>{toastMessage}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-zinc-400 hover:text-white ml-3 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Submissions Cards List */}
          {loading ? (
            <div className="text-center py-24 space-y-3">
              <div className="w-10 h-10 border-2 border-amber-600/30 border-t-amber-400 rounded-full animate-spin mx-auto" />
              <p className="text-xs font-cinzel text-zinc-400 tracking-widest uppercase">
                Consulting Citadel Scrolls...
              </p>
            </div>
          ) : currentDisplayList.length === 0 ? (
            <div className="text-center py-20 bg-zinc-950/60 rounded-3xl border border-zinc-900 space-y-3 shadow-inner">
              <span className="text-4xl block">
                {activeTab === "submitted"
                  ? "📜"
                  : activeTab === "accepted"
                  ? "👑"
                  : "🗑️"}
              </span>
              <h3 className="text-zinc-200 font-cinzel font-bold text-base">
                No suggestions in the &ldquo;{activeTab}&rdquo; section
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                {activeTab === "submitted"
                  ? "All proposed dragon corrections have been reviewed by the Archmaesters."
                  : activeTab === "accepted"
                  ? "No contributions have been acknowledged yet."
                  : "No discarded submissions in the archives."}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {currentDisplayList.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  dragons={dragons as Dragon[]}
                  onAcknowledge={handleAcknowledge}
                  onDiscard={handleDiscard}
                  onDeletePermanently={handleDeletePermanently}
                  actionLoadingId={actionLoadingId}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </AdminGuard>
  );
}
