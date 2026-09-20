"use client";

import { useState } from "react";
import { getDictionary } from "@/lib/i18n";

const CORRECT = "🟩";
const INCORRECT = "🟥";
const PER_ROW = 5;

/**
 * Mensaje al estilo Wordle: solo puntuación y cuadrados de acierto/fallo,
 * sin revelar qué imágenes eran ni ningún dato personal.
 */
function buildShareText(
  answers: boolean[],
  invite: string,
  url: string
): string {
  const score = answers.filter(Boolean).length;
  const squares = answers.map((ok) => (ok ? CORRECT : INCORRECT));
  const rows: string[] = [];
  for (let i = 0; i < squares.length; i += PER_ROW) {
    rows.push(squares.slice(i, i + PER_ROW).join(""));
  }
  return [`AIwareness ${score}/${answers.length}`, ...rows, "", invite, url].join(
    "\n"
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Contextos sin Clipboard API (p. ej. http o navegadores antiguos).
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

interface ShareResultsProps {
  answers: boolean[];
  language?: string | null;
}

export default function ShareResults({ answers, language }: ShareResultsProps) {
  const t = getDictionary(language).results;
  const [copied, setCopied] = useState(false);

  const text = buildShareText(answers, t.shareInvite, window.location.origin);

  async function handleCopy() {
    if (await copyToClipboard(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section className="rounded border border-line-strong bg-white p-5">
      <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
        {t.shareTitle}
      </h2>
      <p className="mt-4 whitespace-pre-line break-words text-lg leading-snug text-ink">
        {text}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-blue px-4 py-3 text-center font-medium text-white transition hover:bg-blue-deep"
        >
          {t.shareWhatsapp}
        </a>
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="rounded border border-line-strong px-4 py-3 text-ink transition hover:border-ink"
        >
          {copied ? t.shareCopied : t.shareCopy}
        </button>
      </div>
    </section>
  );
}
