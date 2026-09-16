import Image from "next/image";

export default function HeaderLogo() {
  return (
    <div className="relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
      {/* Ambient Flame & Frost Glow Background */}
      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-indigo-500 opacity-70 blur-sm group-hover:opacity-100 transition-opacity" />
      
      {/* Medallion Container */}
      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-amber-400/90 shadow-[0_0_16px_rgba(245,158,11,0.6)] bg-black flex items-center justify-center">
        <Image
          src="/logo-emblem.png"
          alt="Dragons of Ice & Fire Crest"
          width={48}
          height={48}
          priority
          className="w-full h-full object-cover object-center scale-105"
        />
      </div>
    </div>
  );
}
