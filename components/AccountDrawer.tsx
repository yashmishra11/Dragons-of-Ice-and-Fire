"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AccountDrawer({ isOpen, onClose }: Props) {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [editActualName, setEditActualName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const startEditing = () => {
    setEditActualName(user.actualName || "");
    setEditUsername(user.username || "");
    setEditAge(user.age ? user.age.toString() : "");
    setEditPhone(user.phone || "");
    setEditError(null);
    setEditSuccess(null);
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    setEditSuccess(null);

    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualName: editActualName.trim(),
          username: editUsername.trim(),
          age: parseInt(editAge, 10),
          phone: editPhone.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setEditError(data.error || "Failed to update profile.");
      } else {
        updateUser(data.user);
        setEditSuccess("Citadel records updated successfully!");
        setTimeout(() => {
          setIsEditing(false);
          setEditSuccess(null);
        }, 1200);
      }
    } catch (err) {
      setEditError("Connection error while communicating with the Citadel.");
    } finally {
      setEditLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:justify-end p-4 sm:p-0 bg-black/80 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer / Card Container */}
      <div className="relative w-full max-w-md h-full max-h-[95vh] sm:max-h-full sm:h-screen bg-[#0d0c13] border-l border-amber-900/60 shadow-[-20px_0_50px_rgba(0,0,0,0.8)] flex flex-col z-10 overflow-hidden text-zinc-100 animate-slide-left">
        {/* Valyrian Flame Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-red-600" />

        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600/30 to-amber-950/80 border border-amber-500/50 flex items-center justify-center font-cinzel font-bold text-amber-300 text-lg shadow-inner">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-base text-zinc-100 flex items-center gap-2">
                <span>{user.username}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    user.role === "admin"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50"
                      : "bg-emerald-950/60 text-emerald-300 border border-emerald-700/50"
                  }`}
                >
                  {user.role === "admin" ? "Admin" : "Member"}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 font-sans">
                {user.actualName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {!isEditing ? (
            /* VIEW MODE */
            <>
              {/* Role Highlight Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-amber-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-widest">
                    Citadel Rank
                  </span>
                  <span className="text-lg">
                    {user.role === "admin" ? "👑" : "📜"}
                  </span>
                </div>
                <p className="text-sm font-cinzel font-bold text-zinc-100">
                  {user.role === "admin"
                    ? "High Archmaester (Admin Vault Access)"
                    : "Citadel Scribe (Verified Lore Member)"}
                </p>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {user.role === "admin"
                    ? "You hold supreme editorial authority across dragon archives and lore submissions."
                    : "You are empowered to inspect dragon files and propose corrections to the archmaesters."}
                </p>
              </div>

              {/* Profile Details List */}
              <div className="space-y-3">
                <h3 className="text-xs font-cinzel font-bold text-zinc-400 uppercase tracking-wider">
                  Archival Records
                </h3>

                <div className="divide-y divide-zinc-900/80 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 p-1 text-xs">
                  <div className="flex justify-between py-2.5 px-3">
                    <span className="text-zinc-500 font-cinzel font-semibold">Actual Name</span>
                    <span className="text-zinc-200 font-medium">{user.actualName}</span>
                  </div>

                  <div className="flex justify-between py-2.5 px-3">
                    <span className="text-zinc-500 font-cinzel font-semibold">Username</span>
                    <span className="text-amber-400 font-mono font-medium">@{user.username}</span>
                  </div>

                  <div className="flex justify-between py-2.5 px-3">
                    <span className="text-zinc-500 font-cinzel font-semibold">Age</span>
                    <span className="text-zinc-200">{user.age} Winters</span>
                  </div>

                  <div className="flex justify-between py-2.5 px-3">
                    <span className="text-zinc-500 font-cinzel font-semibold">Raven Address (Email)</span>
                    <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[200px]">
                      {user.email}
                    </span>
                  </div>

                  <div className="flex justify-between py-2.5 px-3">
                    <span className="text-zinc-500 font-cinzel font-semibold">Contact Seal (Phone)</span>
                    <span className="text-zinc-300 font-mono">{user.phone || "None listed"}</span>
                  </div>

                  <div className="flex justify-between py-2.5 px-3">
                    <span className="text-zinc-500 font-cinzel font-semibold">Inscribed On</span>
                    <span className="text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={startEditing}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-cinzel font-bold tracking-wider bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-600/40 hover:border-amber-500/60 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>✍️</span>
                <span>Edit Account Information</span>
              </button>

              {/* Admin Vault Quick Link */}
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-cinzel font-bold tracking-wider bg-gradient-to-r from-amber-600/30 to-red-900/40 hover:from-amber-600/40 hover:to-red-900/60 text-amber-200 border border-amber-500/40 transition-all flex items-center justify-center gap-2 shadow-md"
                >
                  <span>🗝️</span>
                  <span>Enter Archmaester Vault (Admin Dashboard)</span>
                </Link>
              )}
            </>
          ) : (
            /* EDIT MODE */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                <h3 className="text-xs font-cinzel font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>✍️</span> Modify Inscribed Records
                </h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-200"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-cinzel font-semibold text-zinc-400 mb-1">
                  Actual Name
                </label>
                <input
                  type="text"
                  required
                  value={editActualName}
                  onChange={(e) => setEditActualName(e.target.value)}
                  className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 rounded-xl px-3 py-2 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-cinzel font-semibold text-zinc-400 mb-1">
                  Username (Must be unique)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                    @
                  </span>
                  <input
                    type="text"
                    required
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value.replace(/\s+/g, ""))}
                    className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 rounded-xl pl-8 pr-3 py-2 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-cinzel font-semibold text-zinc-400 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    required
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 rounded-xl px-3 py-2 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-cinzel font-semibold text-zinc-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 rounded-xl px-3 py-2 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="bg-zinc-950/60 p-3 rounded-xl border border-zinc-900 text-[11px] text-zinc-400">
                <span>Email Address: </span>
                <span className="text-zinc-200 font-mono">{user.email}</span>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Email changes require raven seal re-verification. Contact the Grand Maester.
                </p>
              </div>

              {editError && (
                <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                  ⚠️ {editError}
                </div>
              )}

              {editSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300">
                  ✨ {editSuccess}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 rounded-xl text-xs text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2 rounded-xl text-xs font-cinzel font-bold bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black transition-all shadow-md disabled:opacity-50"
                >
                  {editLoading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer with Logout */}
        <div className="p-6 border-t border-zinc-800/80 bg-zinc-950/60">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-cinzel font-bold tracking-wider text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 transition-all flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Depart Citadel (Sign Out)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
