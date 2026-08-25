"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ImageCard from "@/components/ImageCard";
import { saveAttempt, flushPendingAttempts } from "@/lib/pendingAttempts";
import { sampleHubImages } from "@/lib/sampling";
import { loadHubConfig, loadManifest } from "@/lib/hubConfig";
import { getImageUrl } from "@/lib/images";
import { getDictionary } from "@/lib/i18n";
import type { Attempt, HubConfig, ResolvedImage } from "@/lib/types";

interface Participant {
  id: string;
  hub: string;
  language: string;
  country: string;
  birthYear: number;
}

function readParticipant(): Participant | null {
  const id = localStorage.getItem("aiwareness_participant_id");
  const hub = localStorage.getItem("aiwareness_hub");
  const language = localStorage.getItem("aiwareness_language");
  const country = localStorage.getItem("aiwareness_country");
  const birthYear = localStorage.getItem("aiwareness_birth_year");

  if (!id || !hub || !language || !country || !birthYear) {
    return null;
  }

  return { id, hub, language, country, birthYear: Number(birthYear) };
}

export default function Phase1Page() {
  const router = useRouter();
  const [config, setConfig] = useState<HubConfig | null>(null);
  const [images, setImages] = useState<ResolvedImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<"simple" | "digital">("digital");
  const [results, setResults] = useState<Attempt[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loadError, setLoadError] = useState("");

  const t = getDictionary(participant?.language).phase1;

  useEffect(() => {
    const found = readParticipant();
    if (!found) {
      router.push("/");
      return;
    }
    setParticipant(found);
    setMode(
      (localStorage.getItem("aiwareness_mode") as "simple" | "digital") ||
        "digital"
    );

    // Reintenta cualquier "attempt" que no se pudiera guardar en una
    // sesión anterior (ver lib/pendingAttempts.ts).
    flushPendingAttempts();

    // Carga el config.json del hub elegido en el onboarding y el banco
    // de imágenes compartido, ambos como assets estáticos servidos por
    // Next.js (ver scripts/copy-locales-to-public.js).
    Promise.all([
      loadHubConfig(found.language, found.hub),
      loadManifest(),
    ])
      .then(([hubConfig, manifest]) => {
        setConfig(hubConfig);
        setImages(sampleHubImages(hubConfig, manifest));
      })
      .catch(() => {
        setLoadError(getDictionary(found.language).phase1.loadError);
      });
  }, [router]);

  async function handleAnswer(answeredAiGenerated: boolean) {
    if (!participant || !config || images.length === 0) return;

    const question = images[currentIndex];
    const correct = answeredAiGenerated === question.is_ai_generated;

    const attempt: Attempt = {
      participant_id: participant.id,
      hub: config.hub,
      country: participant.country,
      birth_year: participant.birthYear,
      phase: 1,
      image_id: question.id,
      answered_ai_generated: answeredAiGenerated,
      correct,
    };

    const nextResults = [...results, attempt];
    setResults(nextResults);

    // Guardado silencioso, sin bloquear el flujo ni mostrar feedback. En
    // modo solo-interfaz (sin Supabase configurado) se omite; si el
    // insert falla, se encola para reintentar (ver lib/pendingAttempts.ts).
    saveAttempt(attempt);

    if (currentIndex + 1 < images.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      sessionStorage.setItem(
        "aiwareness_results",
        JSON.stringify(nextResults)
      );
      sessionStorage.setItem("aiwareness_images", JSON.stringify(images));
      router.push("/results");
    }
  }

  if (loadError) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-alert">{loadError}</p>
      </main>
    );
  }

  if (images.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-mute">{t.preparing}</p>
      </main>
    );
  }

  const question = images[currentIndex];

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <ImageCard
        imageUrl={getImageUrl(question.file)}
        index={currentIndex}
        total={images.length}
        mode={mode}
        language={participant?.language}
        onAnswer={handleAnswer}
      />
    </main>
  );
}
