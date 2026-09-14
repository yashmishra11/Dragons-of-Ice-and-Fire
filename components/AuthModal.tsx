"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";

type Props = {
  isOpen: boolean;
  initialTab?: "login" | "signup";
  onClose: () => void;
};

export default function AuthModal({ isOpen, initialTab = "login", onClose }: Props) {
  const { login, updateUser } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(initialTab);

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign up state
  const [actualName, setActualName] = useState("");
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [otp, setOtp] = useState("");

  // OTP sending state
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Signup submission state
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);

  useEffect(() => {
    setTab(initialTab);
    setLoginError(null);
    setSignupError(null);
  }, [initialTab, isOpen]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  if (!isOpen) return null;

  // Real-time password validations
  const isMinLength = signupPassword.length >= 6;
  const isAlphanumericOnly =
    /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]+$/.test(signupPassword);

  const containsActualName = (() => {
    if (!actualName.trim() || !signupPassword) return false;
    const lowerPass = signupPassword.toLowerCase();
    const parts = actualName
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((p) => p.length >= 2);
    return parts.some((part) => lowerPass.includes(part));
  })();

  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes("@")) {
      setSignupError("Please provide a valid email before sending a raven.");
      return;
    }

    setSendingOtp(true);
    setSignupError(null);
    setOtpNotice(null);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSignupError(data.error || "Failed to dispatch raven seal.");
      } else {
        setOtpSent(true);
        setOtpCountdown(60); // 60s cooldown
        setOtpNotice(
          "Raven dispatched! Your 6-digit Citadel verification seal was sent to your email (and logged in the server terminal)."
        );
      }
    } catch (err) {
      setSignupError("Failed to reach Citadel raven rookery.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    const result = await login(loginIdentifier.trim(), loginPassword);
    setLoginLoading(false);

    if (result.success) {
      onClose();
    } else {
      setLoginError(result.error || "Authentication failed. Check your scrolls.");
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError(null);

    if (!isMinLength) {
      setSignupError("Password must be at least 6 characters.");
      return;
    }
    if (!isAlphanumericOnly) {
      setSignupError("Password must contain both letters and numbers (alphanumeric only).");
      return;
    }
    if (containsActualName) {
      setSignupError("Password cannot contain your actual name.");
      return;
    }
    if (!otp.trim()) {
      setSignupError("Please enter the 6-digit verification seal from your email.");
      return;
    }

    setSignupLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actualName: actualName.trim(),
          username: username.trim(),
          age: parseInt(age, 10),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password: signupPassword,
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSignupError(data.error || "Failed to inscribe account in Citadel scrolls.");
      } else {
        setSignupSuccess(true);
        updateUser(data.user);
        setTimeout(() => {
          onClose();
          setSignupSuccess(false);
        }, 1400);
      }
    } catch (err) {
      setSignupError("Error connecting to Citadel servers.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-[#0d0c13] border border-amber-900/60 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden transition-all text-zinc-100 max-h-[92vh] flex flex-col">
        {/* Antique Glow Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-red-600" />

        {/* Top Header Bar */}
        <div className="p-5 pb-3 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-950/80 border border-amber-600/50 flex items-center justify-center text-amber-400 text-lg shadow-inner">
              🛡️
            </div>
            <div>
              <h2 className="font-cinzel font-bold text-lg text-amber-300 tracking-wide">
                Citadel Gateway
              </h2>
              <p className="text-[10px] text-zinc-400 font-cinzel tracking-widest uppercase">
                Dragons of Ice & Fire Lore Archive
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 flex items-center justify-center transition-all"
            aria-label="Close Gateway"
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex p-2 bg-zinc-950/80 border-b border-zinc-900 gap-2">
          <button
            onClick={() => {
              setTab("login");
              setLoginError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-cinzel font-bold tracking-wider transition-all ${
              tab === "login"
                ? "bg-gradient-to-r from-amber-600/30 to-amber-900/40 text-amber-300 border border-amber-500/50 shadow-md"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
            }`}
          >
            ⚔️ Enter the Citadel (Log In)
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setSignupError(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-cinzel font-bold tracking-wider transition-all ${
              tab === "signup"
                ? "bg-gradient-to-r from-amber-600/30 to-amber-900/40 text-amber-300 border border-amber-500/50 shadow-md"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent"
            }`}
          >
            📜 Inscribe Account (Sign Up)
          </button>
        </div>

        {/* Content Area with custom scroll */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* ================= LOGIN FORM ================= */}
          {tab === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Enter your unique Citadel username (or email) and your secret passphrase to access the realm archives.
              </p>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-zinc-300 mb-1">
                  Username or Email
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                    👤
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DragonRider or maester@citadel.edu"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-cinzel font-semibold text-zinc-300 mb-1">
                  Passphrase (Password)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                    🗝️
                  </span>
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="Enter your passphrase..."
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-10 py-2.5 focus:outline-none transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
                  >
                    {showLoginPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
                  <span className="text-sm">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-cinzel font-bold tracking-wider bg-gradient-to-r from-amber-600 via-amber-500 to-red-700 hover:from-amber-500 hover:to-red-600 text-white transition-all shadow-lg shadow-amber-950/40 border border-amber-500/40 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loginLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Scrolls...</span>
                  </>
                ) : (
                  <span>Unseal the Citadel Gateway</span>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="text-xs text-amber-400/80 hover:text-amber-300 underline font-cinzel"
                >
                  New to Westeros lore? Inscribe an account here →
                </button>
              </div>
            </form>
          )}

          {/* ================= SIGN UP FORM ================= */}
          {tab === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              {signupSuccess ? (
                <div className="py-8 text-center space-y-3 animate-fade-in">
                  <div className="text-4xl">👑</div>
                  <h3 className="font-cinzel text-lg font-bold text-amber-300">
                    Citadel Scrolls Inscribed!
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Welcome to the Citadel. You now hold Member rank with lore suggestion privileges.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Actual Name */}
                    <div>
                      <label className="block text-[11px] font-cinzel font-semibold text-zinc-300 mb-1">
                        Actual Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aegon Targaryen"
                        value={actualName}
                        onChange={(e) => setActualName(e.target.value)}
                        className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-inner"
                      />
                    </div>

                    {/* Display Username */}
                    <div>
                      <label className="block text-[11px] font-cinzel font-semibold text-zinc-300 mb-1">
                        Username (Unique) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">
                          @
                        </span>
                        <input
                          type="text"
                          required
                          placeholder="e.g. DragonRider"
                          value={username}
                          onChange={(e) => setUsername(e.target.value.replace(/\s+/g, ""))}
                          className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl pl-7 pr-3 py-2 focus:outline-none transition-all shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Age */}
                    <div>
                      <label className="block text-[11px] font-cinzel font-semibold text-zinc-300 mb-1">
                        Age (Years) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        required
                        placeholder="e.g. 25"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-inner"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[11px] font-cinzel font-semibold text-zinc-300 mb-1">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +1 555 0199"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-inner"
                      />
                      <span className="text-[9px] text-zinc-500 block mt-0.5">
                        Recorded in vault only. No SMS dispatched.
                      </span>
                    </div>
                  </div>

                  {/* Email & OTP Request */}
                  <div>
                    <label className="block text-[11px] font-cinzel font-semibold text-zinc-300 mb-1">
                      Email (Requires Raven Verification) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        placeholder="e.g. scribe@citadel.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl px-3 py-2 focus:outline-none transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || otpCountdown > 0}
                        className="px-3 py-2 rounded-xl text-xs font-cinzel font-bold bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-600/40 disabled:opacity-50 transition-all whitespace-nowrap shadow-sm"
                      >
                        {sendingOtp ? (
                          "Dispatching..."
                        ) : otpCountdown > 0 ? (
                          `Resend (${otpCountdown}s)`
                        ) : (
                          "Send Raven OTP"
                        )}
                      </button>
                    </div>

                    {otpNotice && (
                      <p className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
                        <span>🕊️</span>
                        <span>{otpNotice}</span>
                      </p>
                    )}
                  </div>

                  {/* 6-Digit OTP input */}
                  {otpSent && (
                    <div className="p-3 bg-amber-950/20 border border-amber-700/40 rounded-xl space-y-1 animate-fade-in">
                      <label className="block text-[11px] font-cinzel font-semibold text-amber-300">
                        Enter 6-Digit Royal Seal (OTP) *
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.trim())}
                        className="w-full bg-zinc-950 border border-amber-500/50 text-center tracking-[8px] text-base font-bold text-amber-300 rounded-lg py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner"
                      />
                      <p className="text-[10px] text-zinc-400 text-center">
                        Check your inbox or the server terminal for the 6-digit seal code.
                      </p>
                    </div>
                  )}

                  {/* Password Field & Rules */}
                  <div>
                    <label className="block text-[11px] font-cinzel font-semibold text-zinc-300 mb-1">
                      Set Passphrase (Password) *
                    </label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        required
                        placeholder="Alphanumeric (e.g. ValyrianSteel99)"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="w-full bg-zinc-900/90 border border-zinc-800 focus:border-amber-500/70 text-xs text-zinc-100 placeholder-zinc-500 rounded-xl px-3 pr-12 py-2 focus:outline-none transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-200"
                      >
                        {showSignupPassword ? "Hide" : "Show"}
                      </button>
                    </div>

                    {/* Live Password Rules Feedback */}
                    <div className="mt-2 space-y-1 bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900 text-[10px]">
                      <p className="font-cinzel text-zinc-400 font-bold uppercase tracking-wider mb-1">
                        Citadel Security Requirements:
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className={isMinLength ? "text-emerald-400" : "text-zinc-500"}>
                          {isMinLength ? "✓" : "○"}
                        </span>
                        <span className={isMinLength ? "text-emerald-300" : "text-zinc-400"}>
                          At least 6 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={isAlphanumericOnly ? "text-emerald-400" : "text-zinc-500"}>
                          {isAlphanumericOnly ? "✓" : "○"}
                        </span>
                        <span className={isAlphanumericOnly ? "text-emerald-300" : "text-zinc-400"}>
                          Alphanumeric only (must contain both letters and numbers)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={
                            actualName.trim().length >= 2 && containsActualName
                              ? "text-red-400"
                              : "text-emerald-400"
                          }
                        >
                          {actualName.trim().length >= 2 && containsActualName ? "✕" : "✓"}
                        </span>
                        <span
                          className={
                            actualName.trim().length >= 2 && containsActualName
                              ? "text-red-300"
                              : "text-zinc-400"
                          }
                        >
                          Cannot contain your actual name ({actualName.trim() || "name"})
                        </span>
                      </div>
                    </div>
                  </div>

                  {signupError && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300 flex items-start gap-2">
                      <span className="text-sm">⚠️</span>
                      <span>{signupError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={signupLoading || !otpSent}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-cinzel font-bold tracking-wider bg-gradient-to-r from-amber-600 via-amber-500 to-red-700 hover:from-amber-500 hover:to-red-600 text-white transition-all shadow-lg shadow-amber-950/40 border border-amber-500/40 disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                  >
                    {signupLoading ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Inscribing Citadel Registry...</span>
                      </>
                    ) : (
                      <span>🛡️ Inscribe Citadel Membership</span>
                    )}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
