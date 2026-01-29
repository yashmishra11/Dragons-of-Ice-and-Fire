"use client";

import { useState } from "react";

export default function HistoryToggle({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const toggleText = () => setExpanded(!expanded);

  const displayText = expanded ? text : `${text.slice(0, 200)}...`;

  return (
    <div>
      <p className="text-zinc-300 leading-relaxed">{displayText}</p>
      {text.length > 200 && (
        <button
          onClick={toggleText}
          className="text-blue-500 hover:underline mt-2"
        >
          {expanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
}