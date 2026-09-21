"use client";

import { useEffect, useRef, useState } from "react";
import type { HubIndexEntry } from "@/lib/types";

interface HubPickerProps {
  hubs: HubIndexEntry[];
  value: string;
  onChange: (hubId: string) => void;
  label: string;
  placeholder: string;
  noResultsText: string;
}

/**
 * Search box for picking a hub, with the full list always visible and
 * scrollable underneath it instead of hidden behind a click, so it reads
 * as "pick from this list" rather than a plain text field. Typing filters
 * the list; the current selection stays marked even with a blank query.
 */
export default function HubPicker({
  hubs,
  value,
  onChange,
  label,
  placeholder,
  noResultsText,
}: HubPickerProps) {
  const sortedHubs = [...hubs].sort((a, b) => a.label.localeCompare(b.label));
  const [query, setQuery] = useState("");
  const selectedRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest" });
  }, []);

  const filtered = sortedHubs.filter((h) =>
    h.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded border border-line-strong bg-white px-4 py-3 text-lg text-ink outline-none transition focus:border-blue"
      />
      <ul className="max-h-60 overflow-auto rounded border border-line-strong bg-white">
        {filtered.length === 0 ? (
          <li className="px-4 py-3 text-sm text-muted">{noResultsText}</li>
        ) : (
          filtered.map((h) => (
            <li key={h.id} ref={h.id === value ? selectedRef : undefined}>
              <button
                type="button"
                onClick={() => onChange(h.id)}
                className={`block w-full px-4 py-3 text-left text-lg transition hover:bg-paper-2 ${
                  h.id === value ? "font-medium text-blue" : "text-ink"
                }`}
              >
                {h.id === value ? `✓ ${h.label}` : h.label}
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
