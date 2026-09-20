"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getDictionary } from "@/lib/i18n";
import { getImageUrl } from "@/lib/images";
import type { Attempt, ResolvedImage } from "@/lib/types";

export default function ResultsPage() {
  const [results, setResults] = useState<Attempt[]>([]);
  const [images, setImages] = useState<ResolvedImage[] | null>(null);
  const [language, setLanguage] = useState<string | null>(null);

  const t = getDictionary(language).results;

  useEffect(() => {
    const storedResults = sessionStorage.getItem("aiwareness_results");
    const storedImages = sessionStorage.getItem("aiwareness_images");
    const storedLanguage = localStorage.getItem("aiwareness_language");
    if (storedResults) setResults(JSON.parse(storedResults));
    if (storedImages) setImages(JSON.parse(storedImages));
    if (storedLanguage) setLanguage(storedLanguage);
  }, []);

  if (!images) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">{t.loading}</p>
      </main>
    );
  }

  const correctCount = results.filter((r) => r.correct).length;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-10 px-6 py-10">
      <header className="border-b border-line pb-8">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">
          {t.title}
        </p>
        <h1 className="mt-4 font-display text-7xl leading-none tabular-nums text-ink">
          {correctCount}
          <span className="text-muted"> / {results.length}</span>
        </h1>
        <p className="mt-4 text-ink-soft">{t.description}</p>
      </header>

      <ul>
        {results.map((r, i) => {
          const question = images[i];
          return (
            <li
              key={question.id}
              className="flex items-center gap-4 border-b border-line py-3"
            >
              <span className="w-6 text-sm tabular-nums text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-paper-2">
                <Image
                  src={getImageUrl(question.file)}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <p className="flex-1 text-sm text-ink">
                {question.is_ai_generated ? t.wasAiGenerated : t.wasReal}
              </p>
              <p
                className={`text-sm font-medium ${
                  r.correct ? "text-blue" : "text-accent-deep"
                }`}
              >
                {r.correct ? t.correct : t.incorrect}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3">
        <Link
          href="/phase2"
          className="rounded bg-blue px-6 py-4 text-center font-medium text-white transition hover:bg-blue-deep"
        >
          {t.learnMore}
        </Link>
        <Link
          href="/"
          className="rounded border border-line-strong px-6 py-4 text-center text-ink transition hover:border-ink"
        >
          {t.backHome}
        </Link>
      </div>
    </main>
  );
}
