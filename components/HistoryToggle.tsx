"use client";

import { useState } from "react";

export default function HistoryToggle({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > 300;
  const displayText = expanded || !isLong ? text : `${text.slice(0, 300)}...`;

  return (
    <div className="space-y-3">
      <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line font-normal">
        {displayText}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/30 px-3 py-1 rounded-lg transition-all"
        >
          {expanded ? (
            <>
              <span>Collapse Chronicle</span>
              <span>↑</span>
            </>
          ) : (
            <>
              <span>Read Full Chronicle ({text.length} chars)</span>
              <span>↓</span>
            </>
          )}
        </button>
      )}
    </div>
  );
}