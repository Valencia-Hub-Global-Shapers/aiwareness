"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ZoomableImage from "@/components/ZoomableImage";
import { loadHubConfig, loadManifest } from "@/lib/hubConfig";
import { getImageUrl } from "@/lib/images";
import { getDictionary } from "@/lib/i18n";
import type { HubConfig, Manifest } from "@/lib/types";

const URL_PATTERN = /(https?:\/\/[^\s)]+)/g;

function LinkedText({ text }: { text: string }) {
  const parts = text.split(URL_PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("http://") || part.startsWith("https://") ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue underline underline-offset-2 hover:text-blue-deep"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function Phase2Page() {
  const router = useRouter();
  const [config, setConfig] = useState<HubConfig | null>(null);
  const [manifest, setManifest] = useState<Manifest | null>(null);
  const [index, setIndex] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [language, setLanguage] = useState<string | null>(null);

  const t = getDictionary(language).phase2;

  useEffect(() => {
    const hub = localStorage.getItem("aiwareness_hub");
    const storedLanguage = localStorage.getItem("aiwareness_language");

    if (!hub || !storedLanguage) {
      router.push("/");
      return;
    }
    setLanguage(storedLanguage);

    Promise.all([loadHubConfig(storedLanguage, hub), loadManifest()])
      .then(([hubConfig, hubManifest]) => {
        setConfig(hubConfig);
        setManifest(hubManifest);
      })
      .catch(() => {
        setLoadError(getDictionary(storedLanguage).phase2.loadError);
      });
  }, [router]);

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-accent-deep">{loadError}</p>
      </main>
    );
  }

  if (!config || !manifest) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted">{t.loading}</p>
      </main>
    );
  }

  const resource = config.phase2[index];
  const manifestEntry = manifest[resource.id];
  const isLast = index === config.phase2.length - 1;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <div className="flex flex-col gap-3">
        <p className="text-sm tabular-nums text-muted">
          {t.trainingLabel} · {String(index + 1).padStart(2, "0")} /{" "}
          {String(config.phase2.length).padStart(2, "0")}
        </p>
        <div className="h-0.5 bg-line">
          <div
            className="h-full bg-blue transition-all"
            style={{ width: `${((index + 1) / config.phase2.length) * 100}%` }}
          />
        </div>
      </div>

      <ZoomableImage
        src={getImageUrl(manifestEntry.file)}
        alt={resource.title}
        resetKey={index}
        className="h-[65vh]"
      />

      <div>
        <span
          className={`text-xs font-medium uppercase tracking-[0.16em] ${
            manifestEntry.is_ai_generated ? "text-accent-deep" : "text-blue"
          }`}
        >
          {manifestEntry.is_ai_generated ? t.aiGenerated : t.realImage}
        </span>
        <h2 className="mt-2 font-display text-3xl leading-tight text-ink">
          {resource.title}
        </h2>
        <p className="mt-3 leading-relaxed text-ink-soft">
          <LinkedText text={resource.explanation} />
        </p>
      </div>

      {isLast ? (
        <Link
          href="/"
          className="rounded bg-blue px-6 py-4 text-center font-medium text-white transition hover:bg-blue-deep"
        >
          {t.finish}
        </Link>
      ) : (
        <button
          onClick={() => setIndex(index + 1)}
          className="rounded bg-blue px-6 py-4 font-medium text-white transition hover:bg-blue-deep"
        >
          {t.next}
        </button>
      )}
    </main>
  );
}
