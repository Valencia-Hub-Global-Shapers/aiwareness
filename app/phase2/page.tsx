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
            className="text-signal underline"
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
        <p className="text-alert">{loadError}</p>
      </main>
    );
  }

  if (!config || !manifest) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-mute">{t.loading}</p>
      </main>
    );
  }

  const resource = config.phase2[index];
  const manifestEntry = manifest[resource.id];
  const isLast = index === config.phase2.length - 1;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-12">
      <p className="font-mono text-sm text-mute">
        {t.trainingLabel} · {index + 1} / {config.phase2.length}
      </p>

      <ZoomableImage
        src={getImageUrl(manifestEntry.file)}
        alt={resource.title}
        resetKey={index}
        className="h-[65vh]"
      />

      <div>
        <span
          className={`font-mono text-xs uppercase tracking-wide ${
            manifestEntry.is_ai_generated ? "text-alert" : "text-signal"
          }`}
        >
          {manifestEntry.is_ai_generated ? t.aiGenerated : t.realImage}
        </span>
        <h2 className="font-display text-2xl">{resource.title}</h2>
        <p className="mt-2 text-paper/90">
          <LinkedText text={resource.explanation} />
        </p>
      </div>

      {isLast ? (
        <Link
          href="/"
          className="rounded-xl bg-signal px-6 py-4 text-center font-display text-lg text-ink transition hover:opacity-90"
        >
          {t.finish}
        </Link>
      ) : (
        <button
          onClick={() => setIndex(index + 1)}
          className="rounded-xl bg-signal px-6 py-4 font-display text-lg text-ink transition hover:opacity-90"
        >
          {t.next}
        </button>
      )}
    </main>
  );
}
