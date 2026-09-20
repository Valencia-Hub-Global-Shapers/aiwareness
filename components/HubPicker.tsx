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

/** Searchable dropdown for picking a hub, sorted alphabetically by label. */
export default function HubPicker({
  hubs,
  value,
  onChange,
  label,
  placeholder,
  noResultsText,
}: HubPickerProps) {
  const sortedHubs = [...hubs].sort((a, b) => a.label.localeCompare(b.label));
  const selected = sortedHubs.find((h) => h.id === value);
  const [query, setQuery] = useState(selected?.label ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selected?.label ?? "");
  }, [selected?.label]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery(selected?.label ?? "");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected?.label]);

  const filtered = sortedHubs.filter((h) =>
    h.label.toLowerCase().includes(query.trim().toLowerCase())
  );

  function selectHub(h: HubIndexEntry) {
    onChange(h.id);
    setQuery(h.label);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      <span className="text-sm font-medium text-ink">{label}</span>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        className="rounded border border-line-strong bg-white px-4 py-3 text-lg text-ink outline-none transition focus:border-blue"
      />
      {open && (
        <ul className="absolute top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded border border-line-strong bg-white">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-muted">{noResultsText}</li>
          ) : (
            filtered.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  onClick={() => selectHub(h)}
                  className={`block w-full px-4 py-3 text-left text-lg transition hover:bg-paper-2 ${
                    h.id === value ? "font-medium text-blue" : "text-ink"
                  }`}
                >
                  {h.label}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
