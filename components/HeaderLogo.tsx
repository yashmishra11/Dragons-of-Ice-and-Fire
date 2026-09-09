export default function HeaderLogo() {
  return (
    <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
      {/* Ambient Flame Glow Background */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-700 opacity-60 blur-sm group-hover:opacity-90 transition-opacity" />
      
      {/* Medallion Container */}
      <div className="relative w-10 h-10 rounded-full bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-2 border-amber-500/70 p-1 flex items-center justify-center shadow-2xl">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="valyrianGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>

          {/* Medallion Inner Ring */}
          <circle cx="50" cy="50" r="46" stroke="url(#valyrianGold)" strokeWidth="3" strokeDasharray="3 3" opacity="0.6" />

          {/* Wings & Central Dragon Sigil Body */}
          <path
            d="M50 15 C 38 28, 20 25, 12 40 C 22 42, 30 35, 38 46 C 26 50, 18 60, 24 72 C 34 62, 42 66, 50 85 C 58 66, 66 62, 76 72 C 82 60, 74 50, 62 46 C 70 35, 78 42, 88 40 C 80 25, 62 28, 50 15 Z"
            fill="url(#valyrianGold)"
          />

          {/* Left Dragon Head */}
          <path d="M 32 30 Q 22 20 18 28 Q 28 32 36 38 Z" fill="url(#valyrianGold)" />

          {/* Center Dragon Head & Spikes */}
          <path d="M 50 10 Q 50 2 54 8 Q 50 20 46 22 Z" fill="#fff" />
          <path d="M 50 14 Q 44 24 50 32 Q 56 24 50 14 Z" fill="url(#valyrianGold)" />

          {/* Right Dragon Head */}
          <path d="M 68 30 Q 78 20 82 28 Q 72 32 64 38 Z" fill="url(#valyrianGold)" />

          {/* Fiery Eye */}
          <circle cx="50" cy="24" r="2.5" fill="#fef08a" />
        </svg>
      </div>
    </div>
  );
}
