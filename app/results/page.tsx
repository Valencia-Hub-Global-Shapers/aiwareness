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
        <p className="text-mute">{t.loading}</p>
      </main>
    );
  }

  const correctCount = results.filter((r) => r.correct).length;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-6 py-12">
      <header>
        <p className="font-mono text-sm uppercase tracking-widest text-signal">
          {t.title}
        </p>
        <h1 className="font-display text-4xl">
          {correctCount} / {results.length}
        </h1>
        <p className="mt-2 text-mute">{t.description}</p>
      </header>

      <ul className="flex flex-col gap-3">
        {results.map((r, i) => {
          const question = images[i];
          return (
            <li
              key={question.id}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                r.correct ? "border-signal/40" : "border-alert/40"
              }`}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                <Image
                  src={getImageUrl(question.file)}
                  alt=""
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-sm">
                <p className="text-paper">
                  {question.is_ai_generated ? t.wasAiGenerated : t.wasReal}
                </p>
                <p className={r.correct ? "text-signal" : "text-alert"}>
                  {r.correct ? t.correct : t.incorrect}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-3">
        <Link
          href="/phase2"
          className="rounded-xl bg-signal px-6 py-4 text-center font-display text-lg text-ink transition hover:opacity-90"
        >
          {t.learnMore}
        </Link>
        <Link
          href="/"
          className="rounded-xl border border-mute/40 px-6 py-4 text-center text-mute transition hover:border-paper"
        >
          {t.backHome}
        </Link>
      </div>
    </main>
  );
}
